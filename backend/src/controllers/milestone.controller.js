import * as milestoneService from '../services/milestone.service.js';

export async function create(req, res, next) {
  try {
    const milestone = await milestoneService.createMilestone(req.user.id, req.params.contractId, req.body);
    res.status(201).json({
      success: true,
      message: 'Milestone created successfully.',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
}

export async function fundEscrow(req, res, next) {
  try {
    const result = await milestoneService.fundMilestoneEscrow(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function submitWork(req, res, next) {
  try {
    const { submissionNotes } = req.body;
    const milestone = await milestoneService.submitMilestoneWork(req.user.id, req.params.id, submissionNotes);
    res.status(200).json({
      success: true,
      message: 'Milestone work submitted for client review.',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
}

export async function approve(req, res, next) {
  try {
    const milestone = await milestoneService.approveMilestone(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Milestone approved. Ready for payment release.',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
}

export async function reject(req, res, next) {
  try {
    const { reason } = req.body;
    const milestone = await milestoneService.rejectMilestone(req.user.id, req.params.id, reason || 'Changes requested');
    res.status(200).json({
      success: true,
      message: 'Milestone rejected and sent back for revision.',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
}

export async function releasePayment(req, res, next) {
  try {
    const result = await milestoneService.releasePayment(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
