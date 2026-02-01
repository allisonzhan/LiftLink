// Email service using Nodemailer (works with Gmail and other SMTP providers)
// To use Gmail:
// 1. Enable 2-Step Verification on your Google account
// 2. Generate an App Password: https://myaccount.google.com/apppasswords
// 3. Add SMTP settings to your .env file

import nodemailer from 'nodemailer';

// Create transporter if SMTP is configured
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Gmail-specific settings
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    })
  : null;

export async function sendVerificationEmail(email: string, code: string) {
  // If SMTP is not configured, log the verification code for development
  if (!transporter || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email service not configured. Verification code:', code);
    console.log('⚠️  To enable email sending, add SMTP settings to your .env file:');
    console.log('⚠️  SMTP_HOST=smtp.gmail.com');
    console.log('⚠️  SMTP_PORT=587');
    console.log('⚠️  SMTP_USER=your-email@gmail.com');
    console.log('⚠️  SMTP_PASS=your-app-password');
    console.log('⚠️  SMTP_FROM=LiftLink <your-email@gmail.com>');
    return { success: false, error: 'Email service not configured' };
  }

  console.log('📧 Attempting to send verification email to:', email);
  console.log('📧 Verification code:', code);

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify your LiftLink account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Welcome to LiftLink!</h1>
          <p>Thanks for signing up. Please verify your email address to get started.</p>
          <div style="background-color: #fff7ed; border: 2px solid #f97316; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Your verification code is:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 4px;">${code}</p>
          </div>
          <p>Enter this code on the verification page to complete your registration.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't create an account with LiftLink, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully via SMTP! Message ID:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Error sending email via SMTP:', error);
    return { success: false, error };
  }
}

export async function sendRequestNotificationEmail(
  receiverEmail: string,
  senderName: string,
  requestType: 'profile' | 'gym-session',
  gymSessionTitle?: string
) {
  // If SMTP is not configured, log for development
  if (!transporter || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email service not configured. Request notification would be sent to:', receiverEmail);
    return { success: false, error: 'Email service not configured' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const requestTypeText = requestType === 'gym-session' ? 'gym session' : 'profile';
  const gymSessionInfo = requestType === 'gym-session' && gymSessionTitle
    ? `<p style="margin: 10px 0; padding: 12px; background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px;">
         <strong>Gym Session:</strong> ${gymSessionTitle}
       </p>`
    : '';

  console.log('📧 Attempting to send request notification email to:', receiverEmail);

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: receiverEmail,
      subject: `${senderName} sent you a request on LiftLink`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">🐱 LiftLink</h1>
          </div>
          
          <div style="background-color: #fff7ed; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #f97316; margin-top: 0;">New Request Received!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>${senderName}</strong> has sent you a request${requestType === 'gym-session' ? ' to join their gym session' : ' to connect'}.
            </p>
            ${gymSessionInfo}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/app/requests" 
               style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              View Request
            </a>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Log in to your LiftLink account to accept or decline the request. You can also view all your requests in the Requests section.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated notification from LiftLink. If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `,
    });

    console.log('✅ Request notification email sent successfully! Message ID:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Error sending request notification email:', error);
    return { success: false, error };
  }
}

