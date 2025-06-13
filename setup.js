import { client } from './config/connectDb.js';
import { otpSchema, userSchema } from './schema/userSchema.js';
import { profileSchema } from './schema/userSchema.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    await client.connect();
    await client.query(userSchema);
    console.log(' Users table created');
    await client.query(profileSchema);
    console.log('Profiles table created');
    await client.query(otpSchema);
    console.log('OTP table created');
  } catch (err) {
    console.error('Setup error:', err.message);
  } finally {
    await client.end();
    process.exit();
  }
})();
