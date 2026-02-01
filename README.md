# LiftLink - Gym Buddy Finder for College Students

A web-based MVP that helps college students find gym buddies on their campus for workouts or general fitness connections.

## Features

- ✅ College email (.edu) authentication with email verification
- ✅ User profiles with fitness preferences and experience levels
- ✅ Browse and filter student profiles
- ✅ Create and browse gym session posts
- ✅ Express interest and request to join sessions
- ✅ Profile management
- ✅ Access control for unverified users

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- .edu email address for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LiftLink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/liftlink"
JWT_SECRET="your-secret-key-change-in-production"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── profiles/    # Profile browsing
│   │   ├── gym-sessions/# Gym session CRUD
│   │   ├── interest/    # Interest requests
│   │   └── profile/     # User profile management
│   ├── app/             # Main application (protected)
│   ├── auth/            # Authentication pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/          # React components
├── lib/                # Utility functions
│   ├── auth.ts         # Authentication helpers
│   ├── prisma.ts       # Prisma client
│   └── utils.ts        # General utilities
└── prisma/
    └── schema.prisma   # Database schema
```

## Database Schema

- **User**: User accounts with profile information
- **GymPost**: Gym session posts created by users
- **InterestRequest**: Requests between users (profiles or gym sessions)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify` - Verify email
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles` - Browse profiles with filters

### Gym Sessions
- `GET /api/gym-sessions` - List gym sessions
- `POST /api/gym-sessions` - Create gym session
- `GET /api/gym-sessions/[id]` - Get session details
- `PUT /api/gym-sessions/[id]` - Update session
- `DELETE /api/gym-sessions/[id]` - Delete session

### Interest Requests
- `POST /api/interest` - Express interest
- `GET /api/interest?type=sent|received` - Get requests
- `PUT /api/interest/[id]` - Accept/reject request

### Profile
- `GET /api/profile` - Get own profile
- `PUT /api/profile` - Update profile

## Future Enhancements

- Email notification service integration (SendGrid, Resend, etc.)
- SMS notifications
- In-app notifications
- AI-based gym buddy recommendations
- Calendar syncing
- Group chats
- Streaks & accountability tracking

## License

MIT

