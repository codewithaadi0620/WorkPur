import * as proposalService from '../services/proposal.service.js';

export async function submit(req, res, next) {
  try {
    const proposal = await proposalService.submitProposal(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully.',
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFreelancerProposals(req, res, next) {
  try {
    const proposals = await proposalService.getFreelancerProposals(req.user.id);
    res.status(200).json({
      success: true,
      data: proposals,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectProposals(req, res, next) {
  try {
    const proposals = await proposalService.getProposalsForProject(req.user.id, req.params.projectId);
    res.status(200).json({
      success: true,
      data: proposals,
    });
  } catch (error) {
    next(error);
  }
}

export async function accept(req, res, next) {
  try {
    const result = await proposalService.acceptProposal(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function reject(req, res, next) {
  try {
    const result = await proposalService.rejectProposal(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
