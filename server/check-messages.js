const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to:', mongoose.connection.name);
    
    const Message = require('./models/Message');
    const messages = await Message.find({}).sort({ createdAt: 1 }).lean();
    
    console.log(`\nTotal messages in DB: ${messages.length}\n`);
    messages.forEach((msg, i) => {
      const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`${i + 1}. [${time}] "${msg.content}" (sender: ${msg.sender})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkMessages();
