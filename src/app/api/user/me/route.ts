import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(session.userId) },
      {
        projection: {
          password: 0,
          linkedin_access_token: 0,
          linkedin_person_urn: 0,
        },
      },
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check LinkedIn token expiration
    if (
      user.linkedin_token_expires_at &&
      new Date(user.linkedin_token_expires_at) < new Date()
    ) {
      // Return 401 to force frontend to redirect to login
      return NextResponse.json(
        { message: "LinkedIn session expired. Please log in again." },
        { status: 401 },
      );
    }

    // Calculate 3-day rolling quota
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentPosts = await db
      .collection("posts")
      .find({
        user_id: new ObjectId(session.userId),
        created_at: { $gte: threeDaysAgo },
      })
      .sort({ created_at: 1 })
      .toArray();

    const used = recentPosts.length;
    const limit = 3;
    let next_reset_at = null;

    if (used >= limit) {
      // The oldest post in the 3-day window dictates when the next slot opens
      const oldestPostTime = new Date(recentPosts[0].created_at).getTime();
      next_reset_at = new Date(
        oldestPostTime + 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
    }

    const quota = { used, limit, next_reset_at };

    // Get total counts for UI tabs
    const [pendingCount, doneCount] = await Promise.all([
      db.collection("posts").countDocuments({
        user_id: new ObjectId(session.userId),
        status: "pending",
      }),
      db.collection("posts").countDocuments({
        user_id: new ObjectId(session.userId),
        status: "done",
      }),
    ]);

    const postCounts = {
      pending: pendingCount,
      done: doneCount,
    };

    return NextResponse.json({ user, quota, postCounts });
  } catch (error) {
    console.error("User me error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
