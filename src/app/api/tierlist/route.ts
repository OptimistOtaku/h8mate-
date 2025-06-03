import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../server/mongodb';
import { TierList } from '../../../server/models/TierList';
import { auth } from '../../../server/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classmateName = searchParams.get('classmateName') ?? '';

  try {
    await connectToDatabase();
    const tierList = await TierList.findOne({ classmateName })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');

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

    await connectToDatabase();
    const tierList = await TierList.create({
      tiers,
      bin,
      classmateName,
      createdBy: session.user.id,
    });

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

    await connectToDatabase();
    await TierList.deleteMany({ classmateName, createdBy: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
