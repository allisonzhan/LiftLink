import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

const fitnessTags = ['Bodybuilding', 'Powerlifting', 'Pilates', 'Cardio', 'General fitness'];
const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
const genders = ['Male', 'Female', 'Non-binary'];

const mockNames = [
  { name: 'Alex Johnson', displayName: 'Alex' },
  { name: 'Sam Martinez', displayName: 'Sam' },
  { name: 'Jordan Taylor', displayName: 'Jordan' },
  { name: 'Casey Williams', displayName: 'Casey' },
  { name: 'Morgan Davis', displayName: 'Morgan' },
  { name: 'Riley Brown', displayName: 'Riley' },
  { name: 'Taylor Anderson', displayName: 'Taylor' },
  { name: 'Jamie Wilson', displayName: 'Jamie' },
  { name: 'Avery Moore', displayName: 'Avery' },
  { name: 'Quinn Jackson', displayName: 'Quinn' },
];

const mockBios = [
  'Looking for a workout buddy to stay motivated! Love early morning sessions.',
  'Powerlifting enthusiast seeking a training partner. Intermediate level.',
  'New to the gym, would love someone to show me the ropes!',
  'Cardio and strength training. Available most evenings.',
  'Bodybuilding focused, looking for someone with similar goals.',
  'General fitness and staying active. Flexible schedule.',
  'Pilates and yoga enthusiast. Looking for accountability partner.',
  'Advanced lifter, happy to help beginners or train with experienced lifters.',
  'Just want to stay in shape and have fun while working out!',
  'Training for a competition, need a serious partner.',
];

const universities = ['vt', 'gmu', 'nvcc', 'uva', 'jmu', 'vcu'];

const gymLocations = [
  'Campus Recreation Center',
  'Student Fitness Center',
  'Main Gym - Building A',
  'Athletic Complex',
  'Wellness Center',
];

const universityGymLocations: Record<string, string[]> = {
  'vt': ['McComas Hall', 'War Memorial Gym', 'VT Rec Sports'],
  'gmu': ['Aquatic and Fitness Center', 'Skyline Fitness', 'GMU Recreation'],
  'nvcc': ['NVCC Fitness Center', 'Campus Gym', 'Student Recreation'],
  'uva': ['Memorial Gymnasium', 'Aquatic & Fitness Center', 'UVA Rec'],
  'jmu': ['University Recreation Center', 'Urec', 'JMU Fitness'],
  'vcu': ['Cary Street Gym', 'VCU Recreation Center', 'Rams Recreation'],
};

const workoutTitles = [
  'Morning Cardio Session',
  'Leg Day Workout',
  'Upper Body Strength Training',
  'Full Body Circuit',
  'HIIT Training Session',
  'Powerlifting Session',
  'Bodybuilding Workout',
  'Pilates Class',
  'Evening Gym Session',
  'Weekend Workout',
];

async function main() {
  console.log('🌱 Seeding database with mock data...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.interestRequest.deleteMany();
  await prisma.gymPost.deleteMany();
  await prisma.user.deleteMany();

  // Create mock users for each university
  console.log('👥 Creating mock users...');
  const users = [];
  const defaultPassword = await hashPassword('password123'); // All mock users use this password

  let userIndex = 0;
  for (const university of universities) {
    // Create 3-4 users per university
    const usersPerUniversity = 3 + Math.floor(Math.random() * 2);
    
    for (let j = 0; j < usersPerUniversity && userIndex < mockNames.length; j++) {
      const nameData = mockNames[userIndex];
      const gender = genders[userIndex % genders.length];
      const age = 18 + Math.floor(Math.random() * 7); // Ages 18-24
      const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
      
      // Random fitness tags (1-3 tags per user)
      const numTags = Math.floor(Math.random() * 3) + 1;
      const userTags = [...fitnessTags]
        .sort(() => Math.random() - 0.5)
        .slice(0, numTags);
      const fitnessTagsJson = JSON.stringify(userTags);

      // Create university-specific email
      const universityDomains: Record<string, string> = {
        'vt': 'vt.edu',
        'gmu': 'gmu.edu',
        'nvcc': 'nvcc.edu',
        'uva': 'uva.edu',
        'jmu': 'jmu.edu',
        'vcu': 'vcu.edu',
      };

      // Generate mock additional info
      const mockPrs: Record<string, string> = {};
      const mockPreferredTimes: string[] = [];

      // Add PRs for some users (especially intermediate/advanced)
      if (experienceLevel !== 'Beginner' && Math.random() > 0.3) {
        const prExercises = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-ups'];
        const numPrs = Math.floor(Math.random() * 3) + 1;
        const selectedExercises = [...prExercises]
          .sort(() => Math.random() - 0.5)
          .slice(0, numPrs);
        
        selectedExercises.forEach(exercise => {
          if (exercise === 'Bench Press') {
            mockPrs[exercise] = `${Math.floor(Math.random() * 100) + 135} lbs`;
          } else if (exercise === 'Squat') {
            mockPrs[exercise] = `${Math.floor(Math.random() * 150) + 185} lbs`;
          } else if (exercise === 'Deadlift') {
            mockPrs[exercise] = `${Math.floor(Math.random() * 200) + 225} lbs`;
          } else if (exercise === 'Overhead Press') {
            mockPrs[exercise] = `${Math.floor(Math.random() * 60) + 95} lbs`;
          } else if (exercise === 'Pull-ups') {
            mockPrs[exercise] = `${Math.floor(Math.random() * 15) + 5} reps`;
          }
        });
      }

      // Add preferred times for most users
      const timeOptions = [
        'Morning (6-9 AM)',
        'Mid-morning (9-12 PM)',
        'Afternoon (12-5 PM)',
        'Evening (5-8 PM)',
        'Late evening (8-10 PM)',
      ];
      const numTimes = Math.floor(Math.random() * 2) + 1;
      const selectedTimes = [...timeOptions]
        .sort(() => Math.random() - 0.5)
        .slice(0, numTimes);
      mockPreferredTimes.push(...selectedTimes);

      const additionalInfo = {
        prs: mockPrs,
        preferredTimes: mockPreferredTimes,
      };

      const additionalInfoJson = JSON.stringify(additionalInfo);

      const user = await prisma.user.create({
        data: {
          email: `user${userIndex + 1}@${universityDomains[university] || 'university.edu'}`,
          passwordHash: defaultPassword,
          name: nameData.name,
          displayName: nameData.displayName,
          gender,
          age,
          university,
          experienceLevel,
          fitnessTags: fitnessTagsJson,
          bio: mockBios[userIndex],
          additionalInfo: additionalInfoJson,
          verified: true, // All mock users are verified
          verificationToken: null,
        },
      });
      users.push(user);
      console.log(`✅ Created user: ${user.displayName || user.name} (${user.email}) - ${university.toUpperCase()}`);
      userIndex++;
    }
  }

  // Create mock gym sessions (grouped by university)
  console.log('🏋️  Creating mock gym sessions...');
  const now = new Date();
  
  // Group users by university
  const usersByUniversity: Record<string, typeof users> = {};
  for (const user of users) {
    if (!usersByUniversity[user.university]) {
      usersByUniversity[user.university] = [];
    }
    usersByUniversity[user.university].push(user);
  }

  let sessionCount = 0;
  for (const university of universities) {
    const universityUsers = usersByUniversity[university] || [];
    if (universityUsers.length === 0) continue;

    // Create 2-3 sessions per university
    const sessionsPerUniversity = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < sessionsPerUniversity && sessionCount < 20; i++) {
      const creator = universityUsers[Math.floor(Math.random() * universityUsers.length)];
      const daysFromNow = Math.floor(Math.random() * 14); // Sessions in next 2 weeks
      const hours = 6 + Math.floor(Math.random() * 14); // Between 6 AM and 8 PM
      const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() + daysFromNow);
      sessionDate.setHours(hours, minutes, 0, 0);

      const numWorkoutTypes = Math.floor(Math.random() * 2) + 1;
      const workoutTypes = [...fitnessTags]
        .sort(() => Math.random() - 0.5)
        .slice(0, numWorkoutTypes);
      const workoutTypesJson = JSON.stringify(workoutTypes);

      const partySize = Math.floor(Math.random() * 3) + 2; // 2-4 people
      const hasGenderPreference = Math.random() > 0.7; // 30% chance
      const hasExperiencePreference = Math.random() > 0.6; // 40% chance

      // Get university-specific gym location
      const universityLocations = universityGymLocations[university] || gymLocations;
      const gymLocation = universityLocations[Math.floor(Math.random() * universityLocations.length)];

      const session = await prisma.gymPost.create({
        data: {
          creatorId: creator.id,
          title: workoutTitles[Math.floor(Math.random() * workoutTitles.length)],
          workoutType: workoutTypesJson,
          gymLocation,
          dateTime: sessionDate,
          partySize,
          genderPreference: hasGenderPreference ? genders[Math.floor(Math.random() * genders.length)] : null,
          experiencePreference: hasExperiencePreference 
            ? experienceLevels[Math.floor(Math.random() * experienceLevels.length)] 
            : null,
          additionalNotes: Math.random() > 0.5 
            ? 'Looking forward to a great workout! Bring water and a towel.' 
            : null,
          university,
        },
      });
      console.log(`✅ Created gym session: ${session.title} by ${creator.displayName || creator.name} (${university.toUpperCase()})`);
      sessionCount++;
    }
  }

  console.log('✨ Seeding complete!');
  console.log(`📊 Created:`);
  console.log(`   - ${users.length} users across ${universities.length} universities`);
  console.log(`   - ${await prisma.gymPost.count()} gym sessions`);
  console.log('\n🔑 All mock users have password: password123');
  console.log('\n📧 University-specific emails:');
  for (const university of universities) {
    const universityUsers = users.filter(u => u.university === university);
    if (universityUsers.length > 0) {
      console.log(`   ${university.toUpperCase()}: ${universityUsers.map(u => u.email).join(', ')}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

