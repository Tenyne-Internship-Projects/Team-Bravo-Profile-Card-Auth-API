import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../prisma/projectService.js";

// CREATE PROJECT
export const createProjectController = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files?.attachments || [];

    const project = await createProject(req.body, userId, files);

    return res.status(201).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL PROJECTS
export const getProjectsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, skills, min, max } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      keyword,
      skills: skills ? skills.split(",") : undefined,
      min,
      max,
    };

    const result = await getAllProjects(filters);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET PROJECT BY ID
export const getProjectByIdController = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project)
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PROJECT
export const updateProjectController = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await updateProject(req.params.id, userId, req.body);

    if (!updated)
      return res.status(403).json({
        success: false,
        message: "Not authorized or project not found",
      });

    return res.status(200).json({ success: true, project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE PROJECT
export const deleteProjectController = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await deleteProject(req.params.id, userId);

    if (!deleted)
      return res.status(403).json({
        success: false,
        message: "Not authorized or project not found",
      });

    return res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
