import { client } from '../config/connectDb.js';



export async function createProf(userId, fullName, username, bio, state, email, phone, github, portfolio, country, skills, avatar_url, tools) {
  const res = await client.query(
    `INSERT INTO profiles (user_id, fullName, username, email, phone, github, portfolio, bio, country, state, skills, avatar_url, tools) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [userId, fullName, username, email, phone, github, portfolio, bio, country, state, skills, avatar_url, tools]
  );
  return res.rows[0];
}

export async function getProfileByUserId(userId) {
  const res = await client.query('SELECT * FROM profiles WHERE user_id=$1', [userId]);
  return res.rows[0];
}

export async function updateProf(userId, fullName, username, email, phone, github, portfolio, bio, country, state, skills, avatar_url, tools) {
  const res = await client.query(
    `UPDATE profiles SET fullName=$1, username=$2, email=$3 phone=$4, github=$5, portfolio=$6, bio=$7 country=$8, state=$9, skills=$10, avatar_url=$11, tools=$12,updated_at=NOW() WHERE user_id=$13 RETURNING *`,
    [fullName, username, email, phone, github, portfolio, bio, country, state, skills, avatar_url, tools,  userId]
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

