// Alternative email service using SendGrid
// To use this, install: npm install @sendgrid/mail
// And replace the import in app/api/auth/signup/route.ts

import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  SendGrid not configured. Verification code:', code);
    return { success: false, error: 'Email service not configured' };
  }

  const msg = {
    to: email,
    from: 'noreply@yourdomain.com', // Must be verified in SendGrid
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
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid!');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending email via SendGrid:', error);
    return { success: false, error };
  }
}

