 import multer from 'multer';
 import path from 'path';
 import fs from 'fs';
 import { client } from '../config/connectDb.js';


const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

 const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
  const ext = path.extname(file.originalname);
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  cb(null, uniqueName);
}
});

const upload = multer({ storage });

export const uploadAvatar = upload.single('avatar');

export const updateAvatar = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) 
    return res.status(401).json({
     success: false,
      message: 'Unauthorized' 
    });
const filePath = req.file?.path;
if (!filePath) 
  return res.status(400).json({ 
success: false, 
message: 'No file uploade'}
);

try {
  await client.query( `UPDATE profiles SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
     [filePath, userId]);
return res.status(200).json({ 
  success: true,
   message: 'Avatar uploaded successfully',
    avatar_url: filePath})
    ;} catch (err) {
      console.error('Avatar upload error:', err);
      return res.status(500).json({
     success: false, 
     message: 'Server error' });
    }
  };