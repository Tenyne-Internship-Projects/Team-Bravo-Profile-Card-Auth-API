import { prisma } from "./prismaClient.js";

// Create a new project
export const createProject = async (req, res) => {
  const { title, description, skills_required, budget, category, technologies } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        skills_required,
        budget,
        category,
        technologies,
        created_by: req.user.id,
      },
    });
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a project
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, skills_required, budget, category, technologies } = req.body;

  try {
    const existing = await prisma.project.findUnique({ where: { id: Number(id) } });

    if (!existing || existing.created_by !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    const updated = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        title, description, skills_required, budget, category, technologies,
        updated_at: new Date(),
      },
    });

    res.json({ success: true, project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.project.findUnique({ where: { id: Number(id) } });

    if (!existing || existing.created_by !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    await prisma.project.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};