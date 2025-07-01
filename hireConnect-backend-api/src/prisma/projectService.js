import { prisma } from './prismaClient.js';
import fs from 'fs';
import path from 'path';

const storeAttachments = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => `/uploads/${file.filename}`);
};


export const createProjectService = async (data, userId, files) => {
  const attachments = storeAttachments(files);

  return prisma.project.create({
    data: {
      title: data.title,
      description: data.description || '',
      responsibilities: data.responsibilities || '',
      requirements: data.requirements || '',
      skills: data.skills || [],
      min_budget: Number(data.min_budget),
      max_budget: Number(data.max_budget),
      currency: data.currency || 'USD',
      attachments,
      posted_by_id: userId
    }
  });
};

export const getAllProjectsService = async (filters, page = 1, limit = 10) => {
      const { keyword, 
        skills, 
        min,
        max } = filters;
      const where = {AND: [keyword ? {OR: [{ title: 
        { contains: keyword,
           mode: 'insensitive' } },
        { description: { contains: keyword, 
          mode: 'insensitive' } 
      },
    ]} : {},skills?.length ? { skills: { hasSome: skills } } : {},min ? { min_budget: { gte: parseInt(min) } } : {},max ? { max_budget: { lte: parseInt(max) } } : {},]};
    const [projects, total] = await Promise.all([prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },}),
      prisma.project.count({ where })]);
      return {success: true,
        pagination: {total,page,totalPages: Math.ceil(total / limit),},projects,
    };
  };

export const getProjectByIdService = async (id) => {
  return prisma.project.findUnique({
    where: { id: Number(id) },
    include: {
      applications: true,
      favorites: true
    }
  });
};

export const updateProjectService = async (id, userId, data) => {
      const existing = await prisma.project.findUnique({ where: { id: Number(id) } });
      if (!existing || existing.posted_by_id !== userId) return null;
      return prisma.project.update({
        where: { id: Number(id) },
        data: {...data,
        updated_at: new Date(),}
      });
    };

  export const deleteProjectService = async (id, userId) => {
  const existing = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.posted_by_id !== userId) return null;
  await prisma.project.delete({ where: { id: Number(id) } })
  ;return true;
 };

    
