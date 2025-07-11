import {
  getClientProfileByUserId,
  updateClientProfileByUserId,
} from "../prisma/userService.js";
import { prisma } from "../prisma/prismaClient.js";

export const getClientProfile = async (req, res) => {
  try {
    const profile = await getClientProfileByUserId(req.user.id, req.body);
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found" });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error("Get Client Profile Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

export const updateClientProfile = async (req, res) => {
  try {
    const updated = await updateClientProfileByUserId(req.user.id, req.body);
    res.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update Client Profile Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

export const uploadClientLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const logoPath = `/uploads/${req.file.filename}`;

    const updated = await prisma.client.update({
      where: { user_id: req.user.id },
      data: { logo: logoPath },
    });

    res.json({ success: true, logo: logoPath });
  } catch (error) {
    console.error("Upload Client Logo Error:", error);
    res.status(500).json({ success: false, message: "Logo upload failed" });
  }
};
