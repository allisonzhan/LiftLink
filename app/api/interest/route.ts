import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/utils';
import { sendRequestNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const createInterestSchema = z.object({
  receiverId: z.string().optional(),
  gymPostId: z.string().optional(),
}).refine(data => data.receiverId || data.gymPostId, {
  message: "Either receiverId or gymPostId must be provided",
});

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
    const data = createInterestSchema.parse(body);

    // Check if request already exists
    const existingRequest = await prisma.interestRequest.findFirst({
      where: {
        senderId: user.id,
        receiverId: data.receiverId || undefined,
        gymPostId: data.gymPostId || undefined,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already sent a request' },
        { status: 400 }
      );
    }

    let receiverId: string | null = null;

    // Get current user's university
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

    if (data.gymPostId) {
      // Get the creator of the gym post
      const gymPost = await prisma.gymPost.findUnique({
        where: { id: data.gymPostId },
        include: {
          creator: {
            select: { id: true, university: true },
          },
        },
      });

      if (!gymPost) {
        return NextResponse.json(
          { error: 'Gym session not found' },
          { status: 404 }
        );
      }

      // Verify same university
      if (gymPost.creator.university !== currentUser.university) {
        return NextResponse.json(
          { error: 'You can only request to join sessions from your university' },
          { status: 403 }
        );
      }

      receiverId = gymPost.creatorId;
    } else if (data.receiverId) {
      // Verify receiver is from same university
      const receiver = await prisma.user.findUnique({
        where: { id: data.receiverId },
        select: { id: true, university: true },
      });

      if (!receiver) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (receiver.university !== currentUser.university) {
        return NextResponse.json(
          { error: 'You can only express interest in users from your university' },
          { status: 403 }
        );
      }

      receiverId = data.receiverId;
    }

    if (!receiverId || receiverId === user.id) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get sender and receiver info for email notification
    const [sender, receiver, gymPost] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { displayName: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: { email: true },
      }),
      data.gymPostId
        ? prisma.gymPost.findUnique({
            where: { id: data.gymPostId },
            select: { title: true },
          })
        : null,
    ]);

    const interestRequest = await prisma.interestRequest.create({
      data: {
        senderId: user.id,
        receiverId,
        gymPostId: data.gymPostId || null,
        status: 'pending',
      },
    });

    // Send email notification to receiver
    if (receiver && receiver.email && sender) {
      const senderName = sender.displayName || sender.name || 'Someone';
      const requestType = data.gymPostId ? 'gym-session' : 'profile';
      const gymSessionTitle = gymPost?.title;

      console.log('📧 Sending request notification email to:', receiver.email);
      const emailResult = await sendRequestNotificationEmail(
        receiver.email,
        senderName,
        requestType,
        gymSessionTitle
      );

      if (!emailResult.success) {
        console.error('❌ Failed to send request notification email:', emailResult.error);
        // Don't fail the request creation if email fails
      } else {
        console.log('✅ Request notification email sent successfully!');
      }
    }

    return NextResponse.json(interestRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating interest request:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

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
    const type = searchParams.get('type'); // 'sent' or 'received'

    if (type === 'sent') {
      const requests = await prisma.interestRequest.findMany({
        where: { senderId: user.id },
        include: {
          receiver: {
            select: {
              id: true,
              displayName: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
          gymPost: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(requests);
    } else {
      const requests = await prisma.interestRequest.findMany({
        where: { receiverId: user.id },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
          gymPost: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error('Error fetching interest requests:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

