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
    const userId = req.user?.id;
    const files = req.files?.attachments || [];
    const {
      title,
      description,
      responsibilities,
      requirements,
      currency,
      min_budget,
      max_budget,
      skills = []
    } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!title || !min_budget || !currency) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const project = await createProject({
      title,
      description,
      responsibilities,
      requirements,
      currency,
      min_budget,
      max_budget,
      skills
    }, userId, files);

    return res.status(201).json({ success: true, project });

  } catch (error) {
    console.error("Project creation error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
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
    const{id} = req.params;

    if (!id || !userId){
      return res.status(400).json({
        success: false,
        message: "missing user id or project id"
      });
    }
    const updated = await updateProject(req.params.id, userId, req.body);

    if (!updated)
      return res.status(403).json({
        success: false,
        message: "Not authorized or project not found",
      });

    return res.status(200).json({ success: true, msg :"project updated successfully", project: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE PROJECT
export const deleteProjectController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if(!id || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing user id or project id"
      });
    }
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
