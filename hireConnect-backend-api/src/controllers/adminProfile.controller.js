import { prisma } from "../prisma/prismaClient.js";
import { getAdminProfile, upsertAdminProfile } from "../prisma/userService.js";

export const fetchAdminProfile = async (req, res) => {
  try {
    const profile = await getAdminProfile(req.user.id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Admin profile not found" });
    }

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Fetch admin profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const profile = await upsertAdminProfile(req.user.id, {
      position: req.body.position,
      can_manage_users: req.body.can_manage_users,
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Update admin profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const updated = await prisma.admin.update({
      where: { user_id: req.user.id },
      data: { avatar: avatarPath },
    });

    res.json({ success: true, avatar: avatarPath });
  } catch (error) {
    console.error("Upload Admin Avatar Error:", error);
    res.status(500).json({ success: false, message: "Avatar upload failed" });
  }
};
