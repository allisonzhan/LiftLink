# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   
   Create a PostgreSQL database and update your `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/liftlink"
   JWT_SECRET="your-secret-key-change-in-production"
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up with a `.edu` email address
   - For MVP testing, you can manually verify accounts by updating the database:
     ```sql
     UPDATE "User" SET verified = true WHERE email = 'your-email@university.edu';
     ```

## Email Verification (MVP)

For the MVP, email verification is set up but email sending is not implemented. To test:

1. Sign up with a `.edu` email
2. Check the signup response for the `verificationToken` (in development only)
3. Use the verification endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify \
     -H "Content-Type: application/json" \
     -d '{"token": "your-verification-token"}'
   ```

Or manually verify in the database as shown above.

## Production Setup

For production deployment:

1. Set up a proper email service (SendGrid, Resend, etc.)
2. Add email sending logic in the signup route
3. Update `JWT_SECRET` to a secure random string
4. Set `NODE_ENV=production`
5. Configure proper CORS and security headers

## Database Management

- View database: `npx prisma studio`
- Create migration: `npx prisma migrate dev --name migration-name`
- Reset database: `npx prisma migrate reset`

