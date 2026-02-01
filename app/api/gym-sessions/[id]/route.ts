import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';
import { arrayToJson, jsonToArray } from '@/lib/json-helpers';
import { z } from 'zod';

const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  workoutType: z.array(z.string()).optional(),
  gymLocation: z.string().min(1).optional(),
  dateTime: z.string().optional(),
  partySize: z.number().min(1).max(5).optional(),
  genderPreference: z.string().nullable().optional(),
  experiencePreference: z.string().nullable().optional(),
  sameGenderOnly: z.boolean().optional(),
  additionalNotes: z.string().nullable().optional(),
});

export async function GET(
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

    const session = await prisma.gymPost.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            displayName: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Convert JSON string to array for response
    const sessionWithArray = {
      ...session,
      workoutType: jsonToArray(session.workoutType),
    };

    return NextResponse.json(sessionWithArray);
  } catch (error) {
    console.error('Error fetching gym session:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

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

    const session = await prisma.gymPost.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateSessionSchema.parse(body);

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.workoutType) updateData.workoutType = arrayToJson(data.workoutType);
    if (data.gymLocation) updateData.gymLocation = data.gymLocation;
    if (data.dateTime) {
      // Parse datetime-local as local time (not UTC)
      const dateTimeString = data.dateTime;
      const [datePart, timePart] = dateTimeString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      updateData.dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    }
    if (data.partySize) updateData.partySize = data.partySize;
    if (data.genderPreference !== undefined) updateData.genderPreference = data.genderPreference;
    if (data.experiencePreference !== undefined) updateData.experiencePreference = data.experiencePreference;
    if (data.additionalNotes !== undefined) updateData.additionalNotes = data.additionalNotes;

    const updatedSession = await prisma.gymPost.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: {
          select: {
            displayName: true,
            name: true,
          },
        },
      },
    });

    // Convert JSON string to array for response
    const sessionWithArray = {
      ...updatedSession,
      workoutType: jsonToArray(updatedSession.workoutType),
    };

    return NextResponse.json(sessionWithArray);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating gym session:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const session = await prisma.gymPost.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.gymPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting gym session:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

