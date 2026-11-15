import * as analyticsService from '../services/analytics.service.js';

export async function getAdminAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getAdminAnalytics();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClientDashboardStats(req, res, next) {
  try {
    const stats = await analyticsService.getClientDashboardStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFreelancerDashboardStats(req, res, next) {
  try {
    const stats = await analyticsService.getFreelancerDashboardStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshMaterializedViews(req, res, next) {
  try {
    const result = await analyticsService.refreshMaterializedViews();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
