import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser({ name, email, password, role, companyName, title, hourlyRate }) {
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Email address is already registered.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  // Execute user creation, role profile creation, and wallet creation atomically
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        role,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        created_at: true,
      },
    });

    if (role === 'CLIENT') {
      await tx.client_profiles.create({
        data: {
          user_id: user.id,
          company_name: companyName || name,
        },
      });
    } else if (role === 'FREELANCER') {
      await tx.freelancer_profiles.create({
        data: {
          user_id: user.id,
          title: title || 'Freelance Specialist',
          hourly_rate: hourlyRate || 0,
        },
      });
    }

    // Initialize user wallet with 0 balance
    await tx.wallets.create({
      data: {
        user_id: user.id,
        available_balance: 0.00,
        reserved_balance: 0.00,
      },
    });

    return user;
  });

  const token = signToken({ userId: result.id, role: result.role });
  return { user: result, token };
}

export async function loginUser(email, password) {
  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      client_profiles: true,
      freelancer_profiles: true,
      wallets: true,
    },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'SUSPENDED') {
    const error = new Error('Your account has been suspended. Please contact platform support.');
    error.statusCode = 403;
    throw error;
  }

  const token = signToken({ userId: user.id, role: user.role });

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url,
    profile: user.role === 'CLIENT' ? user.client_profiles : user.freelancer_profiles,
    wallet: user.wallets,
  };

  return { user: sanitizedUser, token };
}

export async function getCurrentUser(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      client_profiles: true,
      freelancer_profiles: {
        include: {
          freelancer_skills: {
            include: {
              skills: true,
            },
          },
        },
      },
      wallets: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    profile: user.role === 'CLIENT' ? user.client_profiles : user.freelancer_profiles,
    wallet: user.wallets,
  };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.password_hash);
  if (!isMatch) {
    const error = new Error('Current password does not match.');
    error.statusCode = 400;
    throw error;
  }

  const newHash = await hashPassword(newPassword);
  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: newHash },
  });

  return { success: true, message: 'Password updated successfully.' };
}
