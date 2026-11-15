import { prisma } from '../config/database.js';

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        created_at: true,
        client_profiles: true,
        freelancer_profiles: {
          include: {
            freelancer_skills: {
              include: { skills: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, avatarUrl, companyName, website, billingAddress, title, bio, hourlyRate, experienceLevel, portfolioUrl, availability, skillIds } = req.body;

    await prisma.$transaction(async (tx) => {
      if (name || avatarUrl) {
        await tx.users.update({
          where: { id: userId },
          data: {
            name: name || undefined,
            avatar_url: avatarUrl || undefined,
          },
        });
      }

      if (req.user.role === 'CLIENT') {
        await tx.client_profiles.update({
          where: { user_id: userId },
          data: {
            company_name: companyName || undefined,
            website: website || undefined,
            billing_address: billingAddress || undefined,
          },
        });
      } else if (req.user.role === 'FREELANCER') {
        const fp = await tx.freelancer_profiles.update({
          where: { user_id: userId },
          data: {
            title: title || undefined,
            bio: bio || undefined,
            hourly_rate: hourlyRate !== undefined ? hourlyRate : undefined,
            experience_level: experienceLevel || undefined,
            portfolio_url: portfolioUrl || undefined,
            availability: availability || undefined,
          },
        });

        if (skillIds && Array.isArray(skillIds)) {
          await tx.freelancer_skills.deleteMany({
            where: { freelancer_id: fp.id },
          });

          if (skillIds.length > 0) {
            await tx.freelancer_skills.createMany({
              data: skillIds.map((skillId) => ({
                freelancer_id: fp.id,
                skill_id: skillId,
              })),
            });
          }
        }
      }
    });

    const updatedUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        client_profiles: true,
        freelancer_profiles: {
          include: {
            freelancer_skills: {
              include: { skills: true },
            },
          },
        },
        wallets: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notifications.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 30,
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    await prisma.notifications.update({
      where: { id: req.params.id },
      data: { is_read: true },
    });
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}
