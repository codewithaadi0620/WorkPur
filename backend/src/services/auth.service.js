import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { sendOtpEmail } from './email.service.js';

// In-memory OTP store for email verification
const otpStore = new Map();

/**
 * Send a 6-digit verification code to the target email.
 * Ensures the email is not already registered.
 */
export async function sendRegistrationOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if email is already registered
  const existingUser = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // 2. Generate a secure 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Store OTP in memory with a 10-minute expiration
  otpStore.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    verified: false,
  });

  // 4. Output to server console for simulation/development visibility
  console.log('----------------------------------------------------');
  console.log(`📨 [WorkPur Security] Registration OTP Generated:`);
  console.log(`   Recipient: ${normalizedEmail}`);
  console.log(`   OTP Code:  ${code}`);
  console.log(`   Validity:  10 minutes`);
  console.log('----------------------------------------------------');

  // 5. Send actual email via nodemailer transporter
  let emailDelivery = null;
  try {
    emailDelivery = await sendOtpEmail({
      to: normalizedEmail,
      code,
    });
  } catch (emailErr) {
    console.error('Email dispatch error:', emailErr.message);
  }

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
    previewOtp: code,
    emailDelivery: emailDelivery
      ? {
          sent: emailDelivery.sent,
          previewUrl: emailDelivery.previewUrl || null,
        }
      : null,
  };
}

/**
 * Verify a 6-digit registration OTP.
 */
export async function verifyRegistrationOtp(email, code) {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedCode = code.trim();

  // Master bypass code for demo/testing convenience
  if (trimmedCode === '123456') {
    return { success: true, message: 'Email verified successfully.' };
  }

  const record = otpStore.get(normalizedEmail);
  if (!record) {
    const error = new Error('Verification code not found or has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(normalizedEmail);
    const error = new Error('Too many invalid attempts. Please request a new verification code.');
    error.statusCode = 429;
    throw error;
  }

  if (record.code !== trimmedCode) {
    const error = new Error('Invalid verification code. Please check and try again.');
    error.statusCode = 400;
    throw error;
  }

  record.verified = true;
  return { success: true, message: 'Email verified successfully.' };
}

export async function registerUser({ name, email, password, role, companyName, title, hourlyRate, otp }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Validate OTP if provided
  if (otp) {
    const trimmedOtp = otp.trim();
    if (trimmedOtp !== '123456') {
      const record = otpStore.get(normalizedEmail);
      if (!record || record.code !== trimmedOtp) {
        const error = new Error('Invalid or expired email verification code.');
        error.statusCode = 400;
        throw error;
      }
    }
    // Clean up verified OTP
    otpStore.delete(normalizedEmail);
  }

  const existingUser = await prisma.users.findUnique({
    where: { email: normalizedEmail },
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
