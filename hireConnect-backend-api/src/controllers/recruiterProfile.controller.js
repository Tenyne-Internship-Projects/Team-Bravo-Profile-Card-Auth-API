import { prisma } from "../prisma/prismaClient.js";
import multer from "multer";
import {
  getRecruiterProfile,
  upsertRecruiterProfile,
  updateRecruiterProfileByUserId,
} from "../prisma/userService.js";

const upload = multer({ dest: "uploads/" });

// GET /api/recruiter-profile
export const fetchRecruiterProfile = async (req, res) => {
  try {
    const profile = await getRecruiterProfile(req.user.id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Recruiter profile not found" });
    }

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Fetch recruiter profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/recruiter-profile (Full save / upsert)
export const saveRecruiterProfile = async (req, res) => {
  try {
    const profile = await upsertRecruiterProfile(req.user.id, {
      agency_name: req.body.agency_name,
      position: req.body.position,
      company_size: req.body.company_size,
      verified: req.body.verified,
      description: req.body.description,
      location: req.body.location,
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Upsert recruiter profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/recruiter-profile (Partial update)
export const updateRecruiterProfile = async (req, res) => {
  try {
    const profile = await updateRecruiterProfileByUserId(req.user.id, req.body);
    res.json({ success: true, profile });
  } catch (err) {
    console.error("Partial update recruiter profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadRecruiterAssets = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.files || (!req.files.logo && !req.files.avatar)) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const updateData = {};
    if (req.files.logo) {
      updateData.logo = `/uploads/${req.files.logo[0].filename}`;
    }
    if (req.files.avatar) {
      updateData.avatar = `/uploads/${req.files.avatar[0].filename}`;
    }

    const updated = await prisma.recruiter.update({
      where: { user_id: userId },
      data: updateData,
    });

    res.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Recruiter upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};
