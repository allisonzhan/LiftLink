import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';
import { arrayToJson, jsonToArray, jsonContainsAny } from '@/lib/json-helpers';
import { z } from 'zod';

const createSessionSchema = z.object({
  title: z.string().min(1),
  workoutType: z.array(z.string()),
  gymLocation: z.string().min(1),
  dateTime: z.string(),
  partySize: z.number().min(1).max(5),
  genderPreference: z.string().nullable().optional(),
  experiencePreference: z.string().nullable().optional(),
  sameGenderOnly: z.boolean().optional(),
  additionalNotes: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.verified) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const workoutType = searchParams.getAll('workoutType');
    const genderPreference = searchParams.get('genderPreference');
    const experiencePreference = searchParams.get('experiencePreference');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Get current user's university, gender, and visibility preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { university: true, gender: true, viewSameGenderOnly: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use current local time for comparison (not UTC)
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1); // Allow sessions up to 1 minute ago (buffer)
    
    const where: any = {
      university: currentUser.university, // Only show sessions from same university
    };

    // Set up date filter
    if (dateFrom || dateTo) {
      // If date filters are provided, parse them as local time
      where.dateTime = {};
      if (dateFrom) {
        // Parse dateFrom as local time (format: "2024-01-31" or "2024-01-31T14:30")
        const fromDate = dateFrom.includes('T') 
          ? (() => {
              const [datePart, timePart] = dateFrom.split('T');
              const [year, month, day] = datePart.split('-').map(Number);
              const [hours = 0, minutes = 0] = (timePart || '').split(':').map(Number);
              return new Date(year, month - 1, day, hours, minutes);
            })()
          : (() => {
              const [year, month, day] = dateFrom.split('-').map(Number);
              return new Date(year, month - 1, day, 0, 0);
            })();
        where.dateTime.gte = fromDate;
      } else {
        // If no dateFrom, still filter out past sessions
        where.dateTime.gte = now;
      }
      if (dateTo) {
        // Parse dateTo as local time
        const toDate = dateTo.includes('T')
          ? (() => {
              const [datePart, timePart] = dateTo.split('T');
              const [year, month, day] = datePart.split('-').map(Number);
              const [hours = 23, minutes = 59] = (timePart || '').split(':').map(Number);
              return new Date(year, month - 1, day, hours, minutes);
            })()
          : (() => {
              const [year, month, day] = dateTo.split('-').map(Number);
              return new Date(year, month - 1, day, 23, 59, 59);
            })();
        where.dateTime.lte = toDate;
      }
    } else {
      // Default: only show future sessions (using local time)
      where.dateTime = { gte: now };
    }

    if (genderPreference) {
      where.genderPreference = genderPreference;
    }

    if (experiencePreference) {
      where.experiencePreference = experiencePreference;
    }

    // Filter sessions based on sameGenderOnly requirement
    // If a session has sameGenderOnly=true, only show it to users of the same gender as the creator
    let sessions = await prisma.gymPost.findMany({
      where,
      include: {
        creator: {
          select: {
            displayName: true,
            name: true,
            gender: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    // Filter by workoutType if specified (SQLite doesn't support array queries)
    if (workoutType.length > 0) {
      sessions = sessions.filter(session => 
        jsonContainsAny(session.workoutType, workoutType)
      );
    }

    // Filter sessions based on gender visibility settings
    sessions = sessions.filter(session => {
      // If user has viewSameGenderOnly enabled, only show sessions from same gender creators
      if (currentUser.viewSameGenderOnly) {
        if (session.creator.gender !== currentUser.gender) {
          return false;
        }
      }
      
      // If session has sameGenderOnly=true, only show to users of same gender as creator
      if (session.sameGenderOnly) {
        return session.creator.gender === currentUser.gender;
      }
      
      return true;
    });

    // Convert JSON strings to arrays for response
    const sessionsWithArrays = sessions.map(session => ({
      ...session,
      workoutType: jsonToArray(session.workoutType),
    }));

    return NextResponse.json(sessionsWithArrays);
  } catch (error) {
    console.error('Error fetching gym sessions:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.verified) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createSessionSchema.parse(body);

    // Get user's university
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { university: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the dateTime - datetime-local gives us local time without timezone
    // We need to treat it as local time, not convert to UTC
    // Format: "2024-01-31T14:30" (local time, no timezone)
    const dateTimeString = data.dateTime; // e.g., "2024-01-31T14:30"
    const [datePart, timePart] = dateTimeString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Create date in local timezone (not UTC)
    const sessionDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    console.log('📅 Input dateTime string:', dateTimeString);
    console.log('📅 Parsed as local time:', sessionDateTime.toString());
    console.log('📅 ISO string (UTC):', sessionDateTime.toISOString());
    console.log('📅 Current time:', new Date().toString());
    console.log('📅 Session is in future?', sessionDateTime > new Date());

    const session = await prisma.gymPost.create({
      data: {
        creatorId: user.id,
        title: data.title,
        workoutType: arrayToJson(data.workoutType),
        gymLocation: data.gymLocation,
        dateTime: sessionDateTime,
        partySize: data.partySize,
        genderPreference: data.genderPreference || null,
        experiencePreference: data.experiencePreference || null,
        sameGenderOnly: data.sameGenderOnly || false,
        additionalNotes: data.additionalNotes || null,
        university: currentUser.university,
      },
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
      ...session,
      workoutType: jsonToArray(session.workoutType),
    };

    console.log('✅ Session created successfully:', sessionWithArray.id);
    console.log('✅ Session university:', sessionWithArray.university);
    console.log('✅ Session dateTime:', sessionWithArray.dateTime);

    return NextResponse.json(sessionWithArray, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating gym session:', error);
    console.error('Session data attempted:', data);
    return NextResponse.json(
      { error: 'An error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

