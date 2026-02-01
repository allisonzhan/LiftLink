# Email Service Options for LiftLink

## Current Setup: Resend ✅ (Recommended for MVP)

**Status:** Already configured and working!

**Pros:**
- Free tier: 3,000 emails/month
- Simple API
- No domain verification needed for testing
- Fast setup
- Good deliverability

**Cons:**
- Uses `onboarding@resend.dev` for testing (need to verify domain for production)

**Setup:** Already done! Just add your API key to `.env`

---

## Option 1: SendGrid

**Free tier:** 100 emails/day forever

**Pros:**
- Very reliable
- Good analytics
- Industry standard

**Cons:**
- Lower free tier than Resend
- Need to verify sender email

**Setup:**
1. Sign up at https://sendgrid.com
2. Create API key
3. Install: `npm install @sendgrid/mail`
4. Add to `.env`: `SENDGRID_API_KEY="your-key"`
5. Replace import in `app/api/auth/signup/route.ts`:
   ```ts
   import { sendVerificationEmail } from '@/lib/email-sendgrid';
   ```

---

## Option 2: Nodemailer (Gmail/Outlook/SMTP)

**Free tier:** Depends on provider (Gmail: 500/day)

**Pros:**
- Works with any email provider
- Use your existing email
- Free with Gmail/Outlook

**Cons:**
- Need to set up app passwords
- Gmail has daily limits
- More complex setup

**Setup:**
1. Install: `npm install nodemailer`
2. For Gmail: Create app password (https://myaccount.google.com/apppasswords)
3. Add to `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@yourdomain.com
   ```
4. Replace import in `app/api/auth/signup/route.ts`:
   ```ts
   import { sendVerificationEmail } from '@/lib/email-nodemailer';
   ```

---

## Option 3: AWS SES

**Free tier:** 62,000 emails/month (first year), then pay-as-you-go

**Pros:**
- Very cheap ($0.10 per 1,000 emails)
- Highly scalable
- Great for production

**Cons:**
- More complex setup
- Need AWS account
- Account starts in sandbox mode

**Best for:** Production at scale

---

## Recommendation

**For MVP/Testing:** Stick with **Resend** (current setup)
- Already configured
- Easiest to use
- Good free tier

**For Production:** 
- If staying small: Keep Resend
- If scaling: Consider AWS SES
- If you have existing email infrastructure: Use Nodemailer

---

## Current Implementation

Your current setup sends a **6-digit verification code** via email, and users enter it on the `/auth/verify` page. This is exactly what you asked for!

The code is:
- Generated as a 6-digit number
- Sent via Resend email service
- Entered on LiftLink verification page
- Verified server-side

**No changes needed** - it's already working as you described! 🎉

