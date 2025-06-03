import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../server/mongodb';
import { Comment } from '../../../server/models/Comment';
import { auth } from '../../../server/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tierId = searchParams.get('tierId');
  const classmateName = searchParams.get('classmateName');

  // Validate required parameters
  if (!tierId || !classmateName) {
    return NextResponse.json(
      { error: 'tierId and classmateName are required' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const comments = await Comment.find({ 
      tierId, 
      classmateName 
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name')
    .limit(100); // Limit number of comments returned

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { text: string; tierId: string; classmateName: string };
    const { text, tierId, classmateName } = body;

    if (!text || !tierId || !classmateName) {
      return NextResponse.json(
        { error: 'text, tierId, and classmateName are required' },
        { status: 400 }
      );
    }

    // Simple text sanitization - remove HTML tags and trim
    const sanitizedText = text.replace(/<[^>]*>?/gm, '').trim();
    if (!sanitizedText) {
      return NextResponse.json(
        { error: 'Comment text cannot be empty' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const comment = await Comment.create({
      content: sanitizedText,
      createdBy: session.user.id,
      tierId,
      classmateName,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
