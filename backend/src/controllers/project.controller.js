import * as projectService from '../services/project.service.js';
import * as matchingService from '../services/matching.service.js';

export async function create(req, res, next) {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Project posted successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const result = await projectService.getProjects(req.query);
    res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const project = await projectService.getProjectById(req.params.id, currentUserId);
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClientProjects(req, res, next) {
  try {
    const status = req.query.status || null;
    const projects = await projectService.getClientProjects(req.user.id, status);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await projectService.updateProject(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSmartMatches(req, res, next) {
  try {
    const matches = await matchingService.getMatchingFreelancers(req.params.id);
    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
}
