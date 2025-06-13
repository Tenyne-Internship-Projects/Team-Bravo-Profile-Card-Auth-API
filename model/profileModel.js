import { client } from '../config/connectDb.js';



export async function createProf(userId, fullName, bio, city, email, phone, country, skills, avatar_url) {
  const res = await client.query(
    `INSERT INTO profiles (user_id, fullName, email, phone, bio, country, city, skills, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [userId, fullName, email, phone, bio, country, city, skills, avatar_url]
  );
  return res.rows[0];
}

export async function getProfileByUserId(userId) {
  const res = await client.query('SELECT * FROM profiles WHERE user_id=$1', [userId]);
  return res.rows[0];
}

export async function updateProf(userId, fullName, email, phone, bio, country, city, skills, avatar_url) {
  const res = await client.query(
    `UPDATE profiles SET fullName=$1, email=$2, phone=$3, bio=$4, country=$5, city=$6, skills=$7, avatar_url=$8, updated_at=NOW() WHERE user_id=$9 RETURNING *`,
    [fullName, email, phone, bio, country, city, skills, avatar_url,  userId]
  );
  return res.rows[0];
}

export async function deleteProfileByUserId(userId) {
  const res = await client.query(
    'DELETE FROM profiles WHERE user_id=$1 RETURNING *',
    [userId]
  );
  return res.rows[0];
}

