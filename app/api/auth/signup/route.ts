import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateVerificationCode, verifyEmailDomain, extractUniversityFromEmail } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.string(),
  age: z.number().min(18).max(120),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, gender, age } = signupSchema.parse(body);

    // Validate email domain
    if (!verifyEmailDomain(email)) {
      return NextResponse.json(
        { error: 'Please use a valid .edu email address' },
        { status: 400 }
      );
    }

    // Extract university from email
    const university = extractUniversityFromEmail(email);
    if (!university) {
      return NextResponse.json(
        { error: 'Could not determine university from email domain' },
        { status: 400 }
      );
    }

    // Age is already validated by Zod schema (min 18, max 120)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const verificationCode = generateVerificationCode();

    // Auto-verify only if explicitly set in environment
    // Set AUTO_VERIFY=true in .env to skip email verification (for testing only)
    const AUTO_VERIFY = process.env.AUTO_VERIFY === 'true';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        gender,
        age,
        university,
        verificationToken: AUTO_VERIFY ? null : verificationCode, // Don't store code if auto-verifying
        verified: AUTO_VERIFY, // Auto-verify in development
        experienceLevel: 'Beginner', // Default
      },
    });

    if (AUTO_VERIFY) {
      console.log('✅ Auto-verification enabled - user verified automatically');
      return NextResponse.json(
        { 
          message: 'Account created and verified successfully!',
          userId: user.id,
          verified: true,
        },
        { status: 201 }
      );
    }

    // Send verification email (only if not auto-verifying)
    console.log('📧 Sending verification email to:', user.email);
    const emailResult = await sendVerificationEmail(user.email, verificationCode);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send verification email:', emailResult.error);
      console.error('📋 Verification code (for manual use):', verificationCode);
      // Still return success, but log the error
    } else {
      console.log('✅ Verification email sent successfully!');
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully. Please check your email for the verification code.',
        userId: user.id,
        // Only return code in development for testing
        ...(process.env.NODE_ENV === 'development' && { verificationCode }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}

