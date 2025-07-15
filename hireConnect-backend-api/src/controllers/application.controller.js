import {applyToProjectService} from '../prisma/applicationService.js';

export const applyToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const application = await applyToProjectService(
      projectId,
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, application });
  } catch (err) {
    const status = err.message.includes("already applied") ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};
