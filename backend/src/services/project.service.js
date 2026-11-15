import { prisma, query } from '../config/database.js';

export async function createProject(clientId, data) {
  const { title, description, categoryId, projectType, experienceLevel, minBudget, maxBudget, deadline, skillIds } = data;

  const result = await prisma.$transaction(async (tx) => {
    const project = await tx.projects.create({
      data: {
        client_id: clientId,
        category_id: categoryId,
        title,
        description,
        project_type: projectType,
        experience_level: experienceLevel,
        min_budget: minBudget,
        max_budget: maxBudget,
        deadline: new Date(deadline),
        status: 'OPEN',
      },
    });

    if (skillIds && skillIds.length > 0) {
      const projectSkillsData = skillIds.map((skillId) => ({
        project_id: project.id,
        skill_id: skillId,
      }));
      await tx.project_skills.createMany({
        data: projectSkillsData,
      });
    }

    return project;
  });

  return getProjectById(result.id);
}

export async function getProjects(filters = {}) {
  const {
    search,
    categoryId,
    minBudget,
    maxBudget,
    experienceLevel,
    projectType,
    status = 'OPEN',
    sort = 'newest',
    page = 1,
    limit = 10,
  } = filters;

  const offset = (page - 1) * limit;
  const whereClauses = [];
  const params = [];

  if (status) {
    params.push(status);
    whereClauses.push(`p.status = $${params.length}`);
  }

  if (categoryId) {
    params.push(categoryId);
    whereClauses.push(`p.category_id = $${params.length}`);
  }

  if (experienceLevel) {
    params.push(experienceLevel);
    whereClauses.push(`p.experience_level = $${params.length}`);
  }

  if (projectType) {
    params.push(projectType);
    whereClauses.push(`p.project_type = $${params.length}`);
  }

  if (minBudget !== undefined && minBudget !== null) {
    params.push(minBudget);
    whereClauses.push(`p.max_budget >= $${params.length}`);
  }

  if (maxBudget !== undefined && maxBudget !== null) {
    params.push(maxBudget);
    whereClauses.push(`p.min_budget <= $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    whereClauses.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let orderString = 'ORDER BY p.created_at DESC';
  if (sort === 'oldest') orderString = 'ORDER BY p.created_at ASC';
  if (sort === 'budget_high') orderString = 'ORDER BY p.max_budget DESC';
  if (sort === 'budget_low') orderString = 'ORDER BY p.min_budget ASC';

  // Count total query
  const countSql = `
    SELECT COUNT(DISTINCT p.id) AS total
    FROM projects p
    ${whereString};
  `;
  const countRes = await query(countSql, params);
  const total = parseInt(countRes.rows[0]?.total || '0', 10);

  // Paginated data query with skills and proposal counts
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const dataSql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.project_type,
      p.experience_level,
      p.min_budget,
      p.max_budget,
      p.deadline,
      p.status,
      p.created_at,
      p.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      u.id AS client_id,
      u.name AS client_name,
      cp.company_name,
      COUNT(DISTINCT prop.id) AS proposal_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', s.id, 'name', s.name)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS required_skills
    FROM projects p
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.client_id = u.id
    LEFT JOIN client_profiles cp ON u.id = cp.user_id
    LEFT JOIN proposals prop ON p.id = prop.project_id
    LEFT JOIN project_skills ps ON p.id = ps.project_id
    LEFT JOIN skills s ON ps.skill_id = s.id
    ${whereString}
    GROUP BY p.id, c.id, c.name, u.id, u.name, cp.company_name
    ${orderString}
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const dataRes = await query(dataSql, params);

  return {
    projects: dataRes.rows,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getProjectById(projectId, currentUserId = null) {
  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.project_type,
      p.experience_level,
      p.min_budget,
      p.max_budget,
      p.deadline,
      p.status,
      p.created_at,
      p.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      u.id AS client_id,
      u.name AS client_name,
      cp.company_name,
      cp.total_spent,
      COUNT(DISTINCT prop.id) AS proposal_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', s.id, 'name', s.name)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS required_skills
    FROM projects p
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.client_id = u.id
    LEFT JOIN client_profiles cp ON u.id = cp.user_id
    LEFT JOIN proposals prop ON p.id = prop.project_id
    LEFT JOIN project_skills ps ON p.id = ps.project_id
    LEFT JOIN skills s ON ps.skill_id = s.id
    WHERE p.id = $1
    GROUP BY p.id, c.id, c.name, u.id, u.name, cp.company_name, cp.total_spent;
  `;

  const res = await query(sql, [projectId]);
  if (!res.rows[0]) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const project = res.rows[0];

  // If current user is the owner client, also fetch proposals
  if (currentUserId && currentUserId === project.client_id) {
    const proposalsSql = `
      SELECT 
        pr.id,
        pr.proposed_amount,
        pr.estimated_days,
        pr.cover_letter,
        pr.status,
        pr.created_at,
        u.id AS freelancer_id,
        u.name AS freelancer_name,
        u.avatar_url,
        fp.title AS freelancer_title,
        fp.average_rating,
        fp.completed_projects_count,
        fp.hourly_rate
      FROM proposals pr
      JOIN users u ON pr.freelancer_id = u.id
      JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE pr.project_id = $1
      ORDER BY pr.created_at DESC;
    `;
    const propRes = await query(proposalsSql, [projectId]);
    project.proposals = propRes.rows;
  } else if (currentUserId) {
    // If user is a freelancer, check if they already submitted a proposal
    const myProp = await prisma.proposals.findFirst({
      where: { project_id: projectId, freelancer_id: currentUserId },
    });
    project.myProposal = myProp;
  }

  // If active contract exists, fetch contract info
  const contract = await prisma.contracts.findUnique({
    where: { project_id: projectId },
    include: {
      milestones: true,
      users_contracts_freelancer_idTousers: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  project.contract = contract;

  return project;
}

export async function getClientProjects(clientId, status = null) {
  const where = { client_id: clientId };
  if (status) where.status = status;

  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.project_type,
      p.experience_level,
      p.min_budget,
      p.max_budget,
      p.deadline,
      p.status,
      p.created_at,
      c.name AS category_name,
      COUNT(DISTINCT prop.id) AS proposal_count,
      ct.id AS contract_id,
      ct.status AS contract_status,
      ct.agreed_amount AS contract_amount,
      u_free.name AS hired_freelancer_name
    FROM projects p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN proposals prop ON p.id = prop.project_id
    LEFT JOIN contracts ct ON p.id = ct.project_id
    LEFT JOIN users u_free ON ct.freelancer_id = u_free.id
    WHERE p.client_id = $1 ${status ? 'AND p.status = $2' : ''}
    GROUP BY p.id, c.name, ct.id, ct.status, ct.agreed_amount, u_free.name
    ORDER BY p.created_at DESC;
  `;

  const params = status ? [clientId, status] : [clientId];
  const res = await query(sql, params);
  return res.rows;
}

export async function updateProject(clientId, projectId, data) {
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.client_id !== clientId) {
    const error = new Error('Unauthorized to modify this project.');
    error.statusCode = 403;
    throw error;
  }

  if (project.status === 'IN_PROGRESS' || project.status === 'COMPLETED') {
    const error = new Error(`Cannot modify project with status ${project.status}.`);
    error.statusCode = 400;
    throw error;
  }

  const { title, description, categoryId, projectType, experienceLevel, minBudget, maxBudget, deadline, status, skillIds } = data;

  await prisma.$transaction(async (tx) => {
    await tx.projects.update({
      where: { id: projectId },
      data: {
        title,
        description,
        category_id: categoryId,
        project_type: projectType,
        experience_level: experienceLevel,
        min_budget: minBudget,
        max_budget: maxBudget,
        deadline: deadline ? new Date(deadline) : undefined,
        status,
      },
    });

    if (skillIds) {
      await tx.project_skills.deleteMany({
        where: { project_id: projectId },
      });
      if (skillIds.length > 0) {
        await tx.project_skills.createMany({
          data: skillIds.map((skillId) => ({
            project_id: projectId,
            skill_id: skillId,
          })),
        });
      }
    }
  });

  return getProjectById(projectId, clientId);
}

export async function deleteProject(clientId, projectId) {
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.client_id !== clientId) {
    const error = new Error('Unauthorized to delete this project.');
    error.statusCode = 403;
    throw error;
  }

  if (project.status === 'IN_PROGRESS' || project.status === 'COMPLETED') {
    const error = new Error('Cannot delete an ongoing or completed project.');
    error.statusCode = 400;
    throw error;
  }

  await prisma.projects.delete({
    where: { id: projectId },
  });

  return { success: true, message: 'Project deleted successfully.' };
}
