const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = [
  {
    username: 'Alice',
    email: 'alice@demo.com',
    password: 'password123',
    avatar: 'A',
    status: 'Hey there! I am Alice ',
  },
  {
    username: 'Bob',
    email: 'bob@demo.com',
    password: 'password123',
    avatar: 'B',
    status: 'Available for chat! ',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User "${userData.username}" already exists, skipping...`);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.username} (${userData.email})`);
      }
    }

    console.log('\nSeed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('  Alice: alice@demo.com / password123');
    console.log('  Bob:   bob@demo.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error(' Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
