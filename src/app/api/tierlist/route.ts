import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { auth } from '../../../server/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classmateName = searchParams.get('classmateName') ?? '';

  try {
    const { data: tierList, error } = await supabase
      .from('tier_lists')
      .select(`
        *,
        users:created_by(name)
      `)
      .eq('classmate_name', classmateName)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return NextResponse.json(tierList ?? { tiers: [], bin: [] });
  } catch (error) {
    console.error('Error fetching tier list:', error);
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

    const body = await request.json() as { 
      tiers: Array<{ name: string; items: string[] }>; 
      bin: string[];
      classmateName: string;
    };
    const { tiers, bin, classmateName } = body;

    if (!tiers || !bin || !classmateName) {
      return NextResponse.json(
        { error: 'tiers, bin, and classmateName are required' },
        { status: 400 }
      );
    }

    // Validate tiers
    if (!tiers.every(tier => tier.name && Array.isArray(tier.items))) {
      return NextResponse.json(
        { error: 'Invalid tier format' },
        { status: 400 }
      );
    }

    const { data: tierList, error } = await supabase
      .from('tier_lists')
      .insert({
        tiers,
        bin,
        classmate_name: classmateName,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(tierList);
  } catch (error) {
    console.error('Error creating tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classmateName = searchParams.get('classmateName') ?? '';

    const { error } = await supabase
      .from('tier_lists')
      .delete()
      .eq('classmate_name', classmateName)
      .eq('created_by', session.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
