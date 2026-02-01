import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';
import { arrayToJson, jsonToArray } from '@/lib/json-helpers';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  name: z.string().optional(),
  bio: z.string().max(200).optional().nullable(),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  fitnessTags: z.array(z.string()).optional(),
  phoneNumber: z.string().optional().nullable(),
  profilePhoto: z.string().nullable().optional(),
  showProfileToSameGenderOnly: z.boolean().optional(),
  viewSameGenderOnly: z.boolean().optional(),
  additionalInfo: z.object({
    prs: z.record(z.string()).optional(),
    preferredTimes: z.array(z.string()).optional(),
  }).optional().nullable(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        gender: true,
        age: true,
        experienceLevel: true,
        fitnessTags: true,
        bio: true,
        additionalInfo: true,
        profilePhoto: true,
        verified: true,
        phoneNumber: true,
        showProfileToSameGenderOnly: true,
        viewSameGenderOnly: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Convert JSON strings to arrays/objects for response
    const profileWithArray = {
      ...profile,
      fitnessTags: jsonToArray(profile.fitnessTags),
      additionalInfo: profile.additionalInfo ? JSON.parse(profile.additionalInfo) : null,
    };

    return NextResponse.json(profileWithArray);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: data.displayName,
        name: data.name,
        bio: data.bio,
        experienceLevel: data.experienceLevel,
        fitnessTags: data.fitnessTags ? arrayToJson(data.fitnessTags) : undefined,
        phoneNumber: data.phoneNumber,
        profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : undefined,
        showProfileToSameGenderOnly: data.showProfileToSameGenderOnly !== undefined ? data.showProfileToSameGenderOnly : undefined,
        viewSameGenderOnly: data.viewSameGenderOnly !== undefined ? data.viewSameGenderOnly : undefined,
        additionalInfo: data.additionalInfo ? JSON.stringify(data.additionalInfo) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        gender: true,
        age: true,
        experienceLevel: true,
        fitnessTags: true,
        bio: true,
        additionalInfo: true,
        profilePhoto: true,
        verified: true,
        phoneNumber: true,
        showProfileToSameGenderOnly: true,
        viewSameGenderOnly: true,
      },
    });

    // Convert JSON strings to arrays/objects for response
    const profileWithArray = {
      ...updatedProfile,
      fitnessTags: jsonToArray(updatedProfile.fitnessTags),
      additionalInfo: updatedProfile.additionalInfo ? JSON.parse(updatedProfile.additionalInfo) : null,
    };

    return NextResponse.json(profileWithArray);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

