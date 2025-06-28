import { prisma } from "./prismaClient.js";

//  Create new profile
export async function createProfile(data) {
  return await prisma.profile.create({ data });
}

//  Get profile by user ID
export async function getProfileByUserId(userId) {
  return await prisma.profile.findUnique({
    where: { user_id: userId },
  });
}

//  Update profile by merging old + new data
export async function updateProfileByUserId(userId, newData) {
  const existing = await getProfileByUserId(userId);
  if (!existing) throw new Error("Profile not found");

  const safe = (newVal, oldVal) => newVal ?? oldVal;

  return await prisma.profile.update({
    where: { user_id: userId },
    data: {
      fullName: safe(newData.fullName, existing.fullName),
      username: safe(newData.username, existing.username),
      email: safe(newData.email, existing.email),
      phone: safe(newData.phone, existing.phone),
      github: safe(newData.github, existing.github),
      linkedin: safe(newData.linkedin, existing.linkedin),
      portfolio: safe(newData.portfolio, existing.portfolio),
      bio: safe(newData.bio, existing.bio),
      country: safe(newData.country, existing.country),
      state: safe(newData.state, existing.state),
      skills: safe(newData.skills, existing.skills),
      avatar_url: safe(newData.avatar_url, existing.avatar_url),
      tools: safe(newData.tools, existing.tools),
      documents: safe(newData.documents, existing.documents),
      availability: safe(newData.availability, existing.availability),
      updated_at: new Date(),
    },
  });
}

// Delete profile
export async function deleteProfileByUserId(userId) {
  return await prisma.profile.delete({
    where: { user_id: userId },
  });
}

//  Get all profiles
export async function getAllProfiles() {
  return await prisma.profile.findMany({
    orderBy: { created_at: "desc" },
  });
}

//  Update availability only
export async function updateAvailability(userId, availability) {
  return await prisma.profile.update({
    where: { user_id: userId },
    data: {
      availability,
      updated_at: new Date(),
    },
  });
}
