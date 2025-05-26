import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../server/mongodb';
import TierList from '../../../server/models/TierList';

export async function GET() {
  try {
    await connectToDatabase();
    // Get the most recent tier list
    const tierList = await TierList.findOne().sort({ lastUpdated: -1 });
    return NextResponse.json(tierList || { tiers: [], bin: [] });
  } catch (error) {
    console.error('Error fetching tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { tiers, bin } = body;
    
    // Validate tiers and bin
    if (!Array.isArray(tiers) || !Array.isArray(bin)) {
      return NextResponse.json({ error: 'Tiers and bin must be arrays' }, { status: 400 });
    }

    // Validate each tier
    for (const tier of tiers) {
      if (!tier.id || !Array.isArray(tier.items)) {
        return NextResponse.json({ error: 'Each tier must have an id and items array' }, { status: 400 });
      }
    }

    // Create new tier list entry
    const tierList = new TierList({
      tiers,
      bin,
      lastUpdated: new Date()
    });

    await tierList.save();
    return NextResponse.json(tierList);
  } catch (error) {
    console.error('Error saving tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    // Delete all tier lists
    await TierList.deleteMany({});
    return NextResponse.json({ message: 'All tier lists reset successfully' });
  } catch (error) {
    console.error('Error resetting tier lists:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
