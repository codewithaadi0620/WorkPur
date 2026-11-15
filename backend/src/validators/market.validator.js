import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  projectType: z.enum(['FIXED_PRICE', 'HOURLY']).default('FIXED_PRICE'),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
  minBudget: z.number().nonnegative('Minimum budget must be positive'),
  maxBudget: z.number().positive('Maximum budget must be greater than zero'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format',
  }),
  skillIds: z.array(z.string().uuid()).min(1, 'Please select at least one required skill'),
}).refine((data) => data.maxBudget >= data.minBudget, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['maxBudget'],
});

export const updateProjectSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(20).optional(),
  categoryId: z.string().uuid().optional(),
  projectType: z.enum(['FIXED_PRICE', 'HOURLY']).optional(),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).optional(),
  minBudget: z.number().nonnegative().optional(),
  maxBudget: z.number().positive().optional(),
  deadline: z.string().optional(),
  status: z.enum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED']).optional(),
  skillIds: z.array(z.string().uuid()).optional(),
});

export const submitProposalSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  coverLetter: z.string().min(30, 'Cover letter must be at least 30 characters'),
  proposedAmount: z.number().positive('Proposed amount must be greater than zero'),
  estimatedDays: z.number().int().positive('Estimated days must be a positive integer'),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().optional(),
  amount: z.number().positive('Milestone amount must be positive'),
  dueDate: z.string().optional(),
});

export const submitMilestoneSchema = z.object({
  submissionNotes: z.string().min(10, 'Submission notes must be at least 10 characters'),
});

export const reviewSchema = z.object({
  contractId: z.string().uuid('Invalid contract ID'),
  rating: z.number().min(1.0).max(5.0),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});
