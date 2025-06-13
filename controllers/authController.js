import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createUser, getUserByEmail,
  createOTP,
  setResetOtp, resetPassword
} from '../model/userModel.js';
import { generateOTP } from '../utils/Otpgenerator.js';
import { sendOTPEmail}  from '../utils/mailer.js';
import { client } from '../config/connectDb.js';
import { registerValidator } from '../utils/validation.js';


export const register = async (req, res) => {
  const {error}=registerValidator.validate(req.body);
  if (error) {
return res.status(400).json({
 success: false, message: error.details[0].message });
}
const { name, email, password } = req.body;
try {
const existingUser = await getUserByEmail(email);
if (existingUser) { 
return res.status(409).json({ 
   success: false, message: 'User already exists' });
 }
    const user = await createUser({ name, email, password }); 
   const otp = await createOTP(email); 
   await sendOTPEmail(email, otp); 
    const expiresAt = Date.now() + 10 * 60 * 1000; 
   await client.query( `UPDATE users SET verify_otp = $1, verify_otp_expire_at = $2 WHERE email = $3`, 
  [otp, expiresAt, email] ); 
   const token = jwt.sign({ id: user.id },
   process.env.JWT_SECRET, { expiresIn: '3d' }); 
  res.cookie('token', token, { 
httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000,
secure: process.env.NODE_ENV === 'production',
sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',}
  ); 
 return res.status(201).json({
 success: true, message: 'User registered. OTP sent to email.', user, }
     ); 
  } catch (err) {
 console.error('Registration error:', err);
  return res.status(500).json(
   { success: false, message: 'Server error' });
      }
      };

      
export const verifyEmail = async (req, res) => {
const { email, otp } = req.body;
if (!email || !otp)
return res.status(400).json({ success: false, message: 'Email or OTP is required' });

try {
const result = await client.query(
'SELECT verify_otp, verify_otp_expire_at FROM users WHERE email = $1',
[email]
);

if (result.rows.length === 0)
return res.status(400).json({ success: false, message: 'User not found' });

const user = result.rows[0];

if (user.verify_otp !== otp) {
return res.status(400).json({ success: false, message: 'Invalid OTP' });
}

const now = Date.now();
const expiresAt = Number(user.verify_otp_expire_at);

if (now > expiresAt) {
return res.status(400).json({ success: false, message: 'OTP has expired' });
}

await client.query('UPDATE users SET is_account_verified = true WHERE email = $1', [email]);
await client.query('UPDATE users SET verify_otp = NULL, verify_otp_expire_at = 0 WHERE email = $1', [email]);

return res.status(200).json({ success: true, message: 'Account verified successfully' });

} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: 'Server error' });
}
};



export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(String(password), String(user.password));

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '3d' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .status(200)
      .json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          verified: user.is_account_verified,
        }
      });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// logout
export const logout = async (req, res) => {

    try {
       res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged out" }); 
    } catch (error) {
       return res.status(500).json({ success: false, message: error.message });
    }
    
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    
    try {
        const user = await getUserByEmail(email);
        if (!user) return res.status(400).json({ success: false, message: "No user found" });
        
        const otp = generateOTP();
        const expireAt = Math.floor(Date.now() / 1000) + 5 * 60;
        await setResetOtp(email, otp, expireAt);
        await sendOTPEmail(email, otp);
        
        res.json({ success: true, message: "Reset OTP sent to email" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reset password
export const resetPasswordController = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing details" });
    }
    
    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        const user = await resetPassword(email, otp, hashed);
        
        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        
        res.json({ success: true, message: "Password reset successfully" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resendOtp = async (req, res) => { 
  const { email } = req.body;
 if (!email) {return res.status(400).json({ success: false, message: 'Email is required' });
 }
try { 
  const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];
if (!user) {return res.status(404).json({ success: false, message: 'User not found' }

);}

if (user.is_account_verified) { 
  return res.status(400).json({
     success: false, message: 'Account is already verified' }); 
    }

const otp = await createOTP(email);
   await sendOTPEmail(email, otp);
 const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins in ms
 await client.query(`UPDATE users SET verify_otp = $1, verify_otp_expire_at = $2 WHERE email = $3`,  [otp, expiresAt, email] );
 res.status(200).json({
  success: true,  message: 'OTP resent successfully', });

} catch (err) {
   console.error('Error resending OTP:', err); 
   res.status(500).json({ success: false, message: 'Server error' }); }
};



