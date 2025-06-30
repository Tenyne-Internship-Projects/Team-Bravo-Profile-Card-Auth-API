import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService
} from '../prisma/projectService.js';

export const createProject = async (req, res) => {
  try {
    const project = await createProjectService(req.body, req.user.id);
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await getAllProjectsService();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const updated = await updateProjectService(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(403).json({ success: false, message: 'Unauthorized or project not found' });
    }
    res.json({ success: true, project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const deleted = await deleteProjectService(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(403).json({ success: false, message: 'Unauthorized or project not found' });
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};