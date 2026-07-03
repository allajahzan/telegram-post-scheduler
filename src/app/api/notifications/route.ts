import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const db = await getDb();
    
    // Total count for pagination
    const totalCount = await db.collection("notifications").countDocuments({
      user_id: new ObjectId(session.userId)
    });

    // Aggregation with lookup to get post title
    const notifications = await db.collection("notifications").aggregate([
      { $match: { user_id: new ObjectId(session.userId) } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "posts",
          localField: "post_id",
          foreignField: "_id",
          as: "post"
        }
      },
      {
        $unwind: {
          path: "$post",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          post_id: 1,
          type: 1,
          title: 1,
          message: 1,
          is_read: 1,
          created_at: 1,
          post_title: "$post.title"
        }
      }
    ]).toArray();

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Mark all notifications as read
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    
    await db.collection("notifications").updateMany(
      { user_id: new ObjectId(session.userId), is_read: false },
      { $set: { is_read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
