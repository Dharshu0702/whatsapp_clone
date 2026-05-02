const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixDuplicateChats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to:', mongoose.connection.name);

    const Chat = require('./models/Chat');
    const Message = require('./models/Message');
    const User = require('./models/User');

    const chats = await Chat.find({}).populate('participants', 'username').lean();

    console.log(`\nTotal chats: ${chats.length}\n`);
    chats.forEach((c, i) => {
      const names = c.participants.map(p => p.username).join(' & ');
      console.log(`${i + 1}. Chat ${c._id} — ${names} (updated: ${new Date(c.updatedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })})`);
    });

    const chatMap = new Map();
    const duplicates = [];

    for (const chat of chats) {
      const key = chat.participants.map(p => p._id.toString()).sort().join('-');
      if (chatMap.has(key)) {
        duplicates.push({ keep: chatMap.get(key), remove: chat });
      } else {
        chatMap.set(key, chat);
      }
    }

    if (duplicates.length === 0) {
      console.log('\nNo duplicate chats found.');
      process.exit(0);
      return;
    }

    console.log(`\nFound ${duplicates.length} duplicate chat(s):`);
    for (const dup of duplicates) {
      const keepMsgCount = await Message.countDocuments({ chat: dup.keep._id });
      const removeMsgCount = await Message.countDocuments({ chat: dup.remove._id });

      console.log(`\n  KEEP:   ${dup.keep._id} (${keepMsgCount} messages)`);
      console.log(`  REMOVE: ${dup.remove._id} (${removeMsgCount} messages)`);

      if (removeMsgCount > 0) {
        await Message.updateMany(
          { chat: dup.remove._id },
          { $set: { chat: dup.keep._id } }
        );
        console.log(`  -> Moved ${removeMsgCount} messages to kept chat`);
      }

      await Chat.deleteOne({ _id: dup.remove._id });
      console.log(`  -> Deleted duplicate chat`);
    }

    console.log('\nDone! Duplicates fixed.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixDuplicateChats();
