import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../server/mongodb';
import TierList from '../../../server/models/TierList';

export async function GET() {
  try {
    console.log('Fetching tier list...');
    await connectToDatabase();
    // Get the most recent tier list
    const tierList = await TierList.findOne().sort({ lastUpdated: -1 });
    console.log('Tier list fetched successfully:', tierList ? 'Found' : 'Not found');
    return NextResponse.json(tierList || { tiers: [], bin: [] });
  } catch (error) {
    console.error('Error fetching tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Saving tier list...');
    await connectToDatabase();
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      console.error('Invalid request body:', body);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { tiers, bin } = body;
    
    // Validate tiers and bin
    if (!Array.isArray(tiers) || !Array.isArray(bin)) {
      console.error('Invalid tiers or bin:', { tiers, bin });
      return NextResponse.json({ error: 'Tiers and bin must be arrays' }, { status: 400 });
    }

    // Validate each tier
    for (const tier of tiers) {
      if (!tier.id || !Array.isArray(tier.items)) {
        console.error('Invalid tier structure:', tier);
        return NextResponse.json({ error: 'Each tier must have an id and items array' }, { status: 400 });
      }
    }

    // Create new tier list entry
    const tierList = new TierList({
      tiers,
      bin,
      lastUpdated: new Date()
    });

    console.log('Saving tier list to database...');
    await tierList.save();
    console.log('Tier list saved successfully');
    return NextResponse.json(tierList);
  } catch (error) {
    console.error('Error saving tier list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('Resetting tier list...');
    await connectToDatabase();
    // Delete all tier lists
    const result = await TierList.deleteMany({});
    console.log('Tier lists reset successfully:', result);
    return NextResponse.json({ message: 'All tier lists reset successfully' });
  } catch (error) {
    console.error('Error resetting tier lists:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
