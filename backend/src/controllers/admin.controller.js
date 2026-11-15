import * as adminService from '../services/admin.service.js';

export async function getUsers(req, res, next) {
  try {
    const data = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      data: data.users,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function suspend(req, res, next) {
  try {
    const { reason } = req.body;
    const result = await adminService.suspendUser(req.user.id, req.params.id, reason || 'Administrative compliance suspension');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function activate(req, res, next) {
  try {
    const result = await adminService.activateUser(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const data = await adminService.getAuditLogs(req.query);
    res.status(200).json({
      success: true,
      data: data.logs,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await adminService.getCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await adminService.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSkills(req, res, next) {
  try {
    const skills = await adminService.getSkills();
    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSkill(req, res, next) {
  try {
    const { name, slug, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name and categoryId are required.' });
    }
    const skill = await adminService.createSkill({ name, slug, categoryId });
    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req, res, next) {
  try {
    const data = await adminService.getAllProjectsAdmin(req.query);
    res.status(200).json({
      success: true,
      data: data.projects,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    const result = await adminService.updateProjectStatusAdmin(req.user.id, req.params.id, status, reason);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

