import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../prisma/prismaClient.js";

// Ensure upload directories exist
const baseUploadDir = "./uploads";
const documentDir = `${baseUploadDir}/documents`;
const avatarDir = `${baseUploadDir}/avatars`;

[baseUploadDir, documentDir, avatarDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isDoc =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const uploadPath = isDoc ? documentDir : avatarDir;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // preserves .jpg, .png, etc.
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedDocTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedImageTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
  ];

  if (
    allowedDocTypes.includes(file.mimetype) ||
    allowedImageTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP formats are allowed"
      ),
      false
    );
  }
};

// Upload config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware exports
export const uploadAvatar = upload.single("avatar");
export const parseDocumentFiles = upload.array("documents", 5);

// Avatar upload controller
export const updateAvatar = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const filePath = req.file?.path;
  if (!filePath) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const relativePath = filePath
    .replace(/^.*?uploads[\\/]/, "uploads/")
    .replace(/\\/g, "/");

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    await prisma.profile.update({
      where: { user_id: userId },
      data: {
        avatar_url: relativePath,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar_url: relativePath,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
