import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.verified) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Count pending received requests
    const pendingCount = await prisma.interestRequest.count({
      where: {
        receiverId: user.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ count: pendingCount });
  } catch (error) {
    console.error('Error fetching request count:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

