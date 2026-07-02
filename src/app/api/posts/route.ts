import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { PostDocument } from '@/types';
import { validateAndTransformImageUrl } from '@/lib/validation';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const posts = await db.collection<PostDocument>('posts')
      .find({ user_id: new ObjectId(session.userId) })
      .sort({ date: 1, time: 1 }) // Sort by date then time ascending
      .toArray();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { date, time, title, description, image_url, generate_image, prompt } = await request.json();

    if (!date || !time || !title || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let finalImageUrl = image_url || '';
    if (finalImageUrl) {
      const validation = validateAndTransformImageUrl(finalImageUrl);
      if (!validation.isValid) {
        return NextResponse.json({ message: validation.reason }, { status: 400 });
      }
      finalImageUrl = validation.finalUrl;
    }

    const db = await getDb();
    
    // Critical Logic: Enforce 3-post limit
    const postCount = await db.collection<PostDocument>('posts').countDocuments({ user_id: new ObjectId(session.userId) });
    
    if (postCount >= 3) {
      return NextResponse.json(
        { message: 'You can only have 3 posts at a time. Delete or update an existing post first.' }, 
        { status: 400 }
      );
    }

    const newPost: PostDocument = {
      user_id: new ObjectId(session.userId),
      date,
      time,
      title,
      description,
      image_url: finalImageUrl,
      generate_image: generate_image || false,
      prompt: prompt || '',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection<PostDocument>('posts').insertOne(newPost);
    
    return NextResponse.json({ 
      success: true, 
      post: { ...newPost, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
