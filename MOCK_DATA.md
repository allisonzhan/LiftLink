# Mock Data Guide

## Quick Start

Run the seed script to populate your database with mock profiles and gym sessions:

```bash
npm run seed
```

This will create:
- **10 mock users** with various profiles
- **15 gym sessions** with different workout types and schedules
- All users are **pre-verified** and ready to use

## Mock User Credentials

All mock users share the same password for easy testing:

- **Password:** `password123`
- **Emails:** 
  - `user1@university.edu` through `user10@university.edu`

## Mock User Profiles

The seed script creates diverse profiles with:
- Different genders (Male, Female, Non-binary)
- Ages 18-24
- Various experience levels (Beginner, Intermediate, Advanced)
- Different fitness tags (Bodybuilding, Powerlifting, Pilates, Cardio, General fitness)
- Unique bios and display names

## Mock Gym Sessions

The seed script creates gym sessions with:
- Various workout types
- Different gym locations
- Sessions scheduled over the next 2 weeks
- Different party sizes (2-4 people)
- Some with gender/experience preferences
- Random additional notes

## Resetting Mock Data

To clear and reseed the database:

```bash
npm run seed
```

**Warning:** This will delete ALL existing data (users, gym sessions, interest requests) and replace it with fresh mock data.

## Customizing Mock Data

Edit `prisma/seed.ts` to:
- Change the number of users/sessions
- Modify names, bios, or other attributes
- Adjust date ranges for gym sessions
- Add more variety to the data

## Testing with Mock Data

1. **View Profiles:** Log in and browse the Profiles tab - you'll see all 10 mock users
2. **View Gym Sessions:** Check the Gym Sessions tab - you'll see 15 upcoming sessions
3. **Test Filtering:** Try different filters to see how they work
4. **Test Interest:** Express interest in profiles or request to join sessions
5. **Create Your Own:** Sign up with your own account to interact with mock users

## Notes

- All mock users are already verified (no email verification needed)
- Mock users won't receive notifications (they're just for display)
- You can log in as any mock user to test different perspectives
- Mock data is perfect for UI/UX testing and demos

