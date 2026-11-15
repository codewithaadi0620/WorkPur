import { prisma, query } from '../config/database.js';

export async function submitProposal(freelancerId, { projectId, coverLetter, proposedAmount, estimatedDays }) {
  // 1. Verify project exists and is OPEN
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.status !== 'OPEN') {
    const error = new Error(`Cannot submit proposal to project in ${project.status} status.`);
    error.statusCode = 400;
    throw error;
  }

  // 2. Prevent duplicate proposal for same project
  const existingProposal = await prisma.proposals.findFirst({
    where: {
      project_id: projectId,
      freelancer_id: freelancerId,
    },
  });

  if (existingProposal) {
    const error = new Error('You have already submitted a proposal for this project.');
    error.statusCode = 409;
    throw error;
  }

  // 3. Create proposal
  const proposal = await prisma.proposals.create({
    data: {
      project_id: projectId,
      freelancer_id: freelancerId,
      cover_letter: coverLetter,
      proposed_amount: proposedAmount,
      estimated_days: estimatedDays,
      status: 'PENDING',
    },
    include: {
      projects: {
        select: { id: true, title: true, client_id: true },
      },
    },
  });

  // Create notification for client
  await prisma.notifications.create({
    data: {
      user_id: project.client_id,
      title: 'New Proposal Received',
      message: `A new proposal of $${proposedAmount} was submitted for your project "${project.title}".`,
      type: 'PROPOSAL',
      link: `/client/projects/${projectId}`,
    },
  });

  return proposal;
}

export async function getFreelancerProposals(freelancerId) {
  const sql = `
    SELECT
      prop.id,
      prop.proposed_amount,
      prop.estimated_days,
      prop.cover_letter,
      prop.status,
      prop.created_at,
      p.id AS project_id,
      p.title AS project_title,
      p.min_budget,
      p.max_budget,
      p.status AS project_status,
      c.name AS category_name,
      u.name AS client_name,
      ct.id AS contract_id
    FROM proposals prop
    JOIN projects p ON prop.project_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.client_id = u.id
    LEFT JOIN contracts ct ON prop.id = ct.proposal_id
    WHERE prop.freelancer_id = $1
    ORDER BY prop.created_at DESC;
  `;

  const res = await query(sql, [freelancerId]);
  return res.rows;
}

export async function getProposalsForProject(clientId, projectId) {
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.client_id !== clientId) {
    const error = new Error('Unauthorized to view proposals for this project.');
    error.statusCode = 403;
    throw error;
  }

  const sql = `
    SELECT
      pr.id,
      pr.proposed_amount,
      pr.estimated_days,
      pr.cover_letter,
      pr.status,
      pr.created_at,
      u.id AS freelancer_id,
      u.name AS freelancer_name,
      u.email AS freelancer_email,
      u.avatar_url,
      fp.title AS freelancer_title,
      fp.average_rating,
      fp.completed_projects_count,
      fp.hourly_rate,
      fp.experience_level
    FROM proposals pr
    JOIN users u ON pr.freelancer_id = u.id
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    WHERE pr.project_id = $1
    ORDER BY pr.created_at DESC;
  `;

  const res = await query(sql, [projectId]);
  return res.rows;
}

/**
 * Accept proposal using PostgreSQL stored procedure: accept_proposal(p_proposal_id, p_client_id)
 * Atomically locks project, accepts proposal, rejects competitors, creates contract, updates project status.
 */
export async function acceptProposal(clientId, proposalId) {
  // Call the ADBMS PostgreSQL Stored Procedure
  await query('CALL accept_proposal($1, $2);', [proposalId, clientId]);

  // Fetch created contract
  const contract = await prisma.contracts.findUnique({
    where: { proposal_id: proposalId },
    include: {
      projects: true,
      users_contracts_freelancer_idTousers: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Notify freelancer of acceptance
  if (contract) {
    await prisma.notifications.create({
      data: {
        user_id: contract.freelancer_id,
        title: 'Proposal Accepted! Contract Created',
        message: `Your proposal for "${contract.projects.title}" was accepted! Agreed amount: $${contract.agreed_amount}.`,
        type: 'CONTRACT',
        link: `/freelancer/contracts/${contract.id}`,
      },
    });
  }

  return {
    success: true,
    message: 'Proposal accepted and formal contract established atomically.',
    contract,
  };
}

export async function rejectProposal(clientId, proposalId) {
  const proposal = await prisma.proposals.findUnique({
    where: { id: proposalId },
    include: { projects: true },
  });

  if (!proposal) {
    const error = new Error('Proposal not found.');
    error.statusCode = 404;
    throw error;
  }

  if (proposal.projects.client_id !== clientId) {
    const error = new Error('Unauthorized.');
    error.statusCode = 403;
    throw error;
  }

  if (proposal.status !== 'PENDING') {
    const error = new Error(`Proposal is currently in ${proposal.status} status.`);
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.proposals.update({
    where: { id: proposalId },
    data: { status: 'REJECTED' },
  });

  return {
    success: true,
    message: 'Proposal rejected.',
    proposal: updated,
  };
}
