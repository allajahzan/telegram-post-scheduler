import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-internal-secret');
    if (!process.env.INTERNAL_API_SECRET || secret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, post_id, type, title, message } = await request.json();

    const db = await getDb();

    await db.collection('notifications').insertOne({
      user_id: user_id ? new ObjectId(user_id) : null,
      post_id: post_id ? new ObjectId(post_id) : null,
      type,
      title,
      message,
      is_read: false,
      created_at: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Internal notification creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
