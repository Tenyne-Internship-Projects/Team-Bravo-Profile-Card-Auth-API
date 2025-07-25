import { prisma } from "../prisma/prismaClient.js"; // Adjust path if needed
import fs from "fs";
import path from "path";

// ATTACHMENT HELPER
const storeAttachments = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/${file.filename}`);
};

// CREATE PROJECT
export const createProject = async (data, userId, files) => {
  const attachments = storeAttachments(files);

  //  Normalize skills to always be an array
  let normalizedSkills = [];
  if (Array.isArray(data.skills)) {
    normalizedSkills = data.skills;
  } else if (typeof data.skills === "string") {
    normalizedSkills = [data.skills];
  }

  return prisma.project.create({
    data: {
      title: data.title,
      description: data.description || "",
      responsibilities: data.responsibilities || "",
      requirements: data.requirements || "",
      skills: normalizedSkills,
      min_budget: Number(data.min_budget),
      max_budget: Number(data.max_budget),
      currency: data.currency || "USD",
      attachments,
      posted_by_id: userId,
    },
  });
};

//  GET ALL PROJECTS
// SERVICE: GET ALL PROJECTS
export const getAllProjects = async ({
  keyword,
  skills,
  min,
  max,
  location,
  page = 1,
  limit = 10,
}) => {
  const where = {
    AND: [
      keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: "insensitive" } },
              { description: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {},
      skills?.length ? { skills: { hasSome: skills } } : {},
      location
        ? {
            location: { contains: location, mode: "insensitive" },
          }
        : {},
      min ? { min_budget: { gte: min } } : {},
      max ? { max_budget: { lte: max } } : {},
    ],
  };

  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    success: true,
    projects,
    pagination: {
      total,
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET SINGLE PROJECT BY ID
export const getProjectById = async (id) => {
  return prisma.project.findUnique({
    where: { id: Number(id) },
    include: {
      applications: true,
      favorites: true,
    },
  });
};

// UPDATE PROJECT
export const updateProject = async (id, userId, data) => {
  const existing = await prisma.project.findUnique({
    where: { id: Number(id) },
  });

  if (!existing || existing.posted_by_id !== userId) return null;

  return prisma.project.update({
    where: { id: Number(id) },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
};

// DELETE PROJECT
export const deleteProject = async (id, userId) => {
  const existing = await prisma.project.findUnique({
    where: { id: Number(id) },
  });

  if (!existing || existing.posted_by_id !== userId) return null;

  await prisma.project.delete({
    where: { id: Number(id) },
  });

  return true;
};
