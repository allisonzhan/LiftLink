import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';
import { z } from 'zod';

const updateInterestSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.verified) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interestRequest = await prisma.interestRequest.findUnique({
      where: { id: params.id },
      include: {
        sender: {
          select: {
            email: true,
            phoneNumber: true,
            displayName: true,
            name: true,
          },
        },
      },
    });

    if (!interestRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (interestRequest.receiverId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateInterestSchema.parse(body);

    const updatedRequest = await prisma.interestRequest.update({
      where: { id: params.id },
      data: { status: data.status },
      include: {
        sender: {
          select: {
            email: true,
            phoneNumber: true,
            displayName: true,
            name: true,
          },
        },
      },
    });

    // If accepted, send contact information via email
    if (data.status === 'accepted') {
      // TODO: Send email with contact information
      // For MVP, we'll return the contact info in the response
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating interest request:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

