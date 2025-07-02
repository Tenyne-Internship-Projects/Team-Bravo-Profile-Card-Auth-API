import prisma from "../../prisma/client.js";

// Create Project
export const createProject = async (data) => {
    return await prisma.project.create({
        data
    });
};

// Get All Projects (with optional filters, search, pagination)
export const getAllProjects = async (filters) => {
    const { search, minBudget, maxBudget, page = 1, limit = 10 } = filters;

    const where = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (minBudget || maxBudget) {
        where.budget = {};
        if (minBudget) where.budget.gte = parseFloat(minBudget);
        if (maxBudget) where.budget.lte = parseFloat(maxBudget);
    }

    const projects = await prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.project.count({ where });

    return { projects, total };
};

// Get a single project
export const getProjectById = async (id) => {
    return await prisma.project.findUnique({
        where: { id: parseInt(id) }
    });
};

// Update project
export const updateProject = async (id, data) => {
    return await prisma.project.update({
        where: { id: parseInt(id) },
        data,
    });
};

// Delete project
export const deleteProject = async (id) => {
    return await prisma.project.delete({
        where: { id: parseInt(id) }
    });
};
