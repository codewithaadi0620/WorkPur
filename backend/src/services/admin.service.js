import { prisma, query } from '../config/database.js';

export async function getAllUsers({ role, status, search, page = 1, limit = 20 } = {}) {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const offset = (page - 1) * limit;

  const [total, users] = await Promise.all([
    prisma.users.count({ where }),
    prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        created_at: true,
        client_profiles: {
          select: { company_name: true, total_spent: true },
        },
        freelancer_profiles: {
          select: { title: true, total_earnings: true, average_rating: true, completed_projects_count: true },
        },
        wallets: {
          select: { available_balance: true, reserved_balance: true },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Suspend user using PostgreSQL stored procedure: suspend_user(p_user_id, p_admin_id, p_reason)
 */
export async function suspendUser(adminId, userId, reason) {
  await query('CALL suspend_user($1, $2, $3);', [userId, adminId, reason]);
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, status: true },
  });
  return {
    success: true,
    message: 'User account suspended successfully via ADBMS stored procedure.',
    user,
  };
}

export async function activateUser(adminId, userId) {
  const user = await prisma.users.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
    select: { id: true, name: true, email: true, status: true },
  });

  await prisma.audit_logs.create({
    data: {
      user_id: adminId,
      action: 'ACTIVATE_USER',
      entity_name: 'users',
      entity_id: userId,
      details: { activated_at: new Date() },
    },
  });

  return {
    success: true,
    message: 'User account activated successfully.',
    user,
  };
}

export async function getAuditLogs({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    prisma.audit_logs.count(),
    prisma.audit_logs.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getCategories() {
  return prisma.categories.findMany({
    include: {
      skills: true,
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory({ name, description, slug }) {
  return prisma.categories.create({
    data: { name, description, slug },
  });
}

export async function getSkills() {
  return prisma.skills.findMany({
    include: {
      categories: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createSkill({ name, slug, categoryId }) {
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return prisma.skills.create({
    data: {
      name,
      slug: finalSlug,
      category_id: categoryId,
    },
    include: {
      categories: { select: { id: true, name: true } },
    },
  });
}

export async function getAllProjectsAdmin({ status, categoryId, search, page = 1, limit = 20 } = {}) {
  const where = {};
  if (status) where.status = status;
  if (categoryId) where.category_id = categoryId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const offset = (page - 1) * limit;

  const [total, projects] = await Promise.all([
    prisma.projects.count({ where }),
    prisma.projects.findMany({
      where,
      include: {
        categories: { select: { id: true, name: true } },
        users: { select: { id: true, name: true, email: true } },
        _count: { select: { proposals: true } },
        contracts: {
          select: {
            id: true,
            status: true,
            agreed_amount: true,
            users_contracts_freelancer_idTousers: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function updateProjectStatusAdmin(adminId, projectId, status, reason) {
  const existing = await prisma.projects.findUnique({
    where: { id: projectId },
  });

  if (!existing) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const project = await prisma.projects.update({
    where: { id: projectId },
    data: { status },
  });

  await prisma.audit_logs.create({
    data: {
      user_id: adminId,
      action: `ADMIN_PROJECT_${status}`,
      entity_name: 'projects',
      entity_id: projectId,
      details: { previous_status: existing.status, new_status: status, reason },
    },
  });

  return {
    success: true,
    message: `Project status updated to ${status} by administrator.`,
    project,
  };
}

