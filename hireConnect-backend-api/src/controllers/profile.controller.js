import fs from "fs";
import path from "path";
import { prisma } from "../prisma/prismaClient.js";
import {
  createProfile as createProfileService,
  getProfileByUserId,
  updateProfileByUserId,
  deleteProfileByUserId,
  getAllProfiles as fetchProfiles,
  updateAvailability as updateAvailabilityService,
} from "../prisma/profileService.js";

import {
  createProfileValidator,
  updateProfileValidator,
  searchProfilesValidator,
  uploadFilesValidator,
} from "../utils/validator.js";

// Create a new profile
export const createProfile = async (req, res) => {
  const { error } = createProfileValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const userId = req.user.id;

    const profile = await createProfileService({
      ...req.body,
      user_id: userId,
    });

    return res.status(201).json({ success: true, profile });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("user_id")) {
      return res.status(400).json({
        success: false,
        message: "A profile already exists for this user.",
      });
    }

    console.error("Error creating profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating profile" });
  }
};

// Get profile
// controllers/profile.controller.js

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // Sanitize skills and tools into string arrays (if stored as CSV strings)
    const parsedProfile = {
      ...profile,
      skills: profile.skills
        ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tools: profile.tools
        ? profile.tools.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    res.json({ success: true, profile: parsedProfile });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: "Error getting profile" });
  }
};


// Update profile
export const updateProfile = async (req, res) => {
  const { error } = updateProfileValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  try {
    const userId = req.user.id;

    const updated = await updateProfileByUserId(userId, req.body); // 🔄 Clean abstraction

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

//     Get all user profiles
export const getAllProfiles = async (req, res) => {
  try {
    const { search, country, city, skills, page = 1, limit = 10 } = req.query;

    const filters = {};

    if (search) {
      filters.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { skills: { contains: search, mode: "insensitive" } },
        { tools: { contains: search, mode: "insensitive" } },
      ];
    }

    if (country) filters.country = country;
    if (city) filters.city = city;
    if (skills) {
      filters.skills = {
        contains: skills,
        mode: "insensitive",
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [profiles, totalResults] = await Promise.all([
      prisma.profile.findMany({
        where: filters,
        skip,
        take,
        orderBy: { created_at: "desc" },
      }),
      prisma.profile.count({ where: filters }),
    ]);

    res.status(200).json({
      success: true,
      results: profiles,
      totalResults,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(totalResults / limit),
    });
  } catch (error) {
    console.error("Get all profiles error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No avatar file uploaded",
      });
    }

    const baseURL = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const avatarUrl = `${baseURL}/uploads/avatars/${req.file.filename}`;
 


    const updatedProfile = await prisma.profile.update({
      where: { user_id: userId },
      data: { avatar_url: avatarUrl },
    });

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar_url: avatarUrl,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
    });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No documents uploaded" });
    }

    // Map new file paths
    const newUrls = files.map((file) => `/uploads/documents/${file.filename}`);

    // Fetch existing documents
    const existingProfile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!existingProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

 //  Construct full URLs for each uploaded file
    const baseURL = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const urls = files.map((file) => `${baseURL}/uploads/documents/${file.filename}`);

    // Append new documents to existing ones
    const updatedDocuments = (existingProfile.documents || []).concat(newUrls);

    // Update profile with combined documents array
    await prisma.profile.update({
      where: { user_id: userId },
      data: { documents: updatedDocuments, updated_at: new Date() },
    });

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      documents: updatedDocuments,
    });
  } catch (err) {
    console.error("Document upload error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteDocument = async (req, res) => {
  const userId = req.user.id;
  const { filename } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const updatedDocs = profile.documents.filter(
      (doc) => !doc.endsWith(filename)
    );

    await prisma.profile.update({
      where: { user_id: userId },
      data: { documents: updatedDocs, updated_at: new Date() },
    });

    // Delete the actual file from the filesystem
    const docPath = path.join("uploads", "documents", filename);
    fs.unlink(docPath, (err) => {
      if (err) console.warn("File deletion failed:", err.message);
    });

    return res.status(200).json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error("Document deletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    await deleteProfileByUserId(userId);
    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting profile" });
  }
};

export const updateAvailability = async (req, res) => {
  const userId = req.user?.id;
  const { availability } = req.body;

  if (!availability) {
    return res
      .status(400)
      .json({ success: false, message: "Availability status required" });
  }

  try {
    await updateAvailabilityService(userId, availability);
    res.status(200).json({ success: true, message: "Availability updated" });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
