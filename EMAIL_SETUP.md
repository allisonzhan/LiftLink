# Email Verification Setup

## Quick Setup with Resend (Recommended)

Resend offers a free tier with 3,000 emails/month - perfect for MVP testing!

### Step 1: Get a Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to **API Keys** in the dashboard
4. Click **Create API Key**
5. Give it a name (e.g., "LiftLink Development")
6. Copy the API key

### Step 2: Add to Your .env File

Add your Resend API key to your `.env` file:

```env
RESEND_API_KEY="re_your_api_key_here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Step 3: Verify Your Domain (Optional for Production)

For production, you'll want to verify your own domain:
1. Go to **Domains** in Resend dashboard
2. Add your domain
3. Add the DNS records they provide
4. Update the `from` field in `lib/email.ts` to use your domain

For development/testing, you can use `onboarding@resend.dev` (already configured).

## Testing Without Email Service

If you don't want to set up Resend right now, the app will:
- Still create accounts
- Log the verification link to the console (check your terminal)
- You can manually visit the verification link

The verification link format is:
```
http://localhost:3000/auth/verify?token=YOUR_TOKEN
```

## Manual Verification (Alternative)

You can also manually verify users in the database:

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Find your user in the User table
3. Set `verified` to `true`
4. Clear the `verificationToken` field

Or use SQL:
```sql
UPDATE User SET verified = true, verificationToken = NULL WHERE email = 'your-email@university.edu';
```

## Troubleshooting

### Emails not sending?
- Check that `RESEND_API_KEY` is set in your `.env` file
- Make sure you've restarted your dev server after adding the key
- Check the terminal/console for error messages
- Verify your Resend API key is active in the Resend dashboard

### Verification link not working?
- Make sure `NEXT_PUBLIC_BASE_URL` matches your actual URL
- For production, use your actual domain (e.g., `https://yourdomain.com`)
- Check that the token hasn't expired (they don't expire, but check for typos)

