import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';
import { jsonToArray, jsonContainsAny } from '@/lib/json-helpers';

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
    const gender = searchParams.get('gender');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const experienceLevel = searchParams.get('experienceLevel');
    const fitnessTags = searchParams.getAll('fitnessTags');

    // Get current user's gender and preferences for filtering
    const currentUserData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gender: true, viewSameGenderOnly: true },
    });

    // Get current user's university
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { university: true, gender: true },
    });

    if (!currentUser || !currentUserData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const where: any = {
      verified: true,
      id: { not: user.id }, // Exclude current user
      university: currentUser.university, // Only show users from same university
    };

    // Apply same-gender filter if user has viewSameGenderOnly enabled
    if (currentUserData.viewSameGenderOnly) {
      where.gender = currentUser.gender;
    }

    if (gender) {
      where.gender = gender;
    }

    if (ageMin || ageMax) {
      where.age = {};
      if (ageMin) where.age.gte = parseInt(ageMin);
      if (ageMax) where.age.lte = parseInt(ageMax);
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    // Note: SQLite doesn't support array queries, so we'll filter in memory

    let profiles = await prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        name: true,
        gender: true,
        age: true,
        experienceLevel: true,
        fitnessTags: true,
        bio: true,
        additionalInfo: true,
        profilePhoto: true,
        showProfileToSameGenderOnly: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter by fitnessTags if specified (SQLite doesn't support array queries)
    if (fitnessTags.length > 0) {
      profiles = profiles.filter(profile => 
        jsonContainsAny(profile.fitnessTags, fitnessTags)
      );
    }

    // Filter profiles based on showProfileToSameGenderOnly setting
    // If a profile has showProfileToSameGenderOnly=true, only show it to users of the same gender
    const filteredProfiles = profiles.filter(profile => {
      if (profile.showProfileToSameGenderOnly) {
        // Need to get the profile owner's gender
        // Since we're already filtering, we need to check this in memory
        // We'll need to include gender in the select
        return profile.gender === currentUser.gender;
      }
      return true;
    });

    // Convert JSON strings to arrays/objects for response
    const profilesWithArrays = filteredProfiles.map(profile => ({
      ...profile,
      fitnessTags: jsonToArray(profile.fitnessTags),
      additionalInfo: profile.additionalInfo ? JSON.parse(profile.additionalInfo) : null,
    }));

    return NextResponse.json(profilesWithArrays);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

