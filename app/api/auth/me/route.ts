import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { jsonToArray } from '@/lib/json-helpers';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        gender: true,
        age: true,
        university: true,
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

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert JSON strings to arrays/objects for response
    const userWithArray = {
      ...fullUser,
      fitnessTags: jsonToArray(fullUser.fitnessTags),
      additionalInfo: fullUser.additionalInfo ? JSON.parse(fullUser.additionalInfo) : null,
    };

    return NextResponse.json(userWithArray);
}

