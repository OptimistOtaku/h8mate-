import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
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
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:created_by(name)
      `)
      .eq('tier_id', tierId)
      .eq('classmate_name', classmateName)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json(comments || []);
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

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content: sanitizedText,
        created_by: session.user.id,
        tier_id: tierId,
        classmate_name: classmateName,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
