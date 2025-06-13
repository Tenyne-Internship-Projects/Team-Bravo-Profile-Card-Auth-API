import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export const client = new Client({
   connectionString: process.env.DB_URL, 
   ssl: { rejectUnauthorized: false }
   }
  );
   
   export async function connectDB() {
     try { 
      await client.connect();
       console.log('Connected to DB'); 
      } catch (err) { 
        console.error('DB connection error', err.stack); 
        process.exit(1); 
    } }