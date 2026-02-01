// Alternative email service using Nodemailer (works with any SMTP provider)
// To use this, install: npm install nodemailer
// Works with Gmail, Outlook, custom SMTP servers, etc.

import nodemailer from 'nodemailer';

// Configure your SMTP settings in .env:
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your-email@gmail.com
// SMTP_PASS=your-app-password
// SMTP_FROM=noreply@yourdomain.com

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('⚠️  SMTP not configured. Verification code:', code);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify your LiftLink account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Welcome to LiftLink!</h1>
          <p>Thanks for signing up. Please verify your email address to get started.</p>
          <div style="background-color: #f3f4f6; border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Your verification code is:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">${code}</p>
          </div>
          <p>Enter this code on the verification page to complete your registration.</p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully via Nodemailer! Message ID:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Error sending email via Nodemailer:', error);
    return { success: false, error };
  }
}

