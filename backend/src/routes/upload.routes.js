import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '../config/database.js';

const router = Router();

// Upload attachment for a project
router.post('/attachment/:projectId', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Verify ownership if client
    if (req.user.role === 'CLIENT' && project.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add attachments to this project.' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const attachment = await prisma.project_attachments.create({
      data: {
        project_id: projectId,
        file_name: req.file.originalname,
        file_path: filePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
      },
    });


    res.status(201).json({
      success: true,
      message: 'Attachment uploaded successfully.',
      data: attachment,
    });
  } catch (error) {
    next(error);
  }
});

// Retrieve attachments for a project
router.get('/attachment/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const attachments = await prisma.project_attachments.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    next(error);
  }
});

// Upload profile avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar image uploaded.' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await prisma.users.update({
      where: { id: req.user.id },
      data: { avatar_url: avatarUrl },
    });

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully.',
      avatarUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
