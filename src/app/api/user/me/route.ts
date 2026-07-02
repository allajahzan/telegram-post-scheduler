import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.userId) },
      { 
        projection: { 
          password: 0, 
          linkedin_access_token: 0, 
          linkedin_token_expires_at: 0,
          linkedin_person_urn: 0
        } 
      }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User me error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
