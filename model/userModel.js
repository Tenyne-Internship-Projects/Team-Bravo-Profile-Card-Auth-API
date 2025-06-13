import dotenv from 'dotenv';
import { client } from '../config/connectDb.js';
import bcrypt from 'bcrypt';
dotenv.config();

export const createUser = async ({ name, email, password }) => {
  const hashed = await bcrypt.hash(password, 10);
  const res = await client.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, is_account_verified',
    [name, email, hashed]
  );
  return res.rows[0];
};

export const getUserByEmail = async (email) => {
  try {
    const res = await client.query(
      'SELECT id, name, email, password, is_account_verified FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.error('Error getUserByEmail:', err);
    throw err;
  }
};

export const setVerifyOtp = async (email, otp, expireAt) => {
  const res = await client.query(
    `UPDATE users SET verify_otp=$1, verify_otp_expire_at=$2, updated_at=NOW() WHERE email=$3 RETURNING *`,
    [otp, expireAt, email]
  );
  return res.rows[0];
};

export const createOTP = async ( email ) => {
  let otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  await client.query(
    'INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)',
    [email, otp, expiry]
  );
  return otp
};

export const verifyUserAccount = async (email, otp) => {
  const res = await client.query(
    `UPDATE users SET is_account_verified=TRUE, verify_otp='', verify_otp_expire_at=0, updated_at=NOW()
     WHERE email=$1 AND verify_otp=$2 AND verify_otp_expire_at > EXTRACT(EPOCH FROM NOW())
     RETURNING *`,
    [email, otp]
  );
  return res.rows[0];
};

export const setResetOtp = async (email, otp, expireAt) => {
  const res = await client.query(
    `UPDATE users SET reset_otp=$1, reset_otp_expire_at=$2, updated_at=NOW() WHERE email=$3 RETURNING *`,
    [otp, expireAt, email]
  );
  return res.rows[0];
};

export const resetPassword = async (email, otp, newPassword) => {
  const res = await client.query(
    `UPDATE users SET password=$1, reset_otp='', reset_otp_expire_at=0, updated_at=NOW()
     WHERE email=$2 AND reset_otp=$3 AND reset_otp_expire_at > EXTRACT(EPOCH FROM NOW())
     RETURNING *`,
    [newPassword, email, otp]
  );
  return res.rows[0];
};
