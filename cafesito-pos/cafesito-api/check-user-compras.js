import mongoose from 'mongoose';
import User from './src/models/User.js';

const urlLocal = 'mongodb://localhost:27017/cafeteria_pos';

async function test() {
  try {
    await mongoose.connect(urlLocal);
    console.log('Connected to DB');

    const client = await User.findOne({ email: 'julio@gmail.com' });
    if (client) {
      console.log('Julio Ramirez - comprasRealizadas:', client.comprasRealizadas);
    } else {
      console.log('Julio Ramirez not found');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
