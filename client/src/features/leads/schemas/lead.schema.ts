import { z } from 'zod';
import { LeadSource } from '../types/lead.types';

export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Contact or business name is required')
    .max(150, 'Name must be 150 characters or less'),
  title: z
    .string()
    .trim()
    .max(150, 'Opportunity title must be 150 characters or less')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .trim()
    .max(150, 'Company name must be 150 characters or less')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be 255 characters or less')
    .or(z.literal(''))
    .optional(),
  phone: z
    .string()
    .trim()
    .max(50, 'Phone number must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  source: z.nativeEnum(LeadSource),
  interestedService: z
    .string()
    .trim()
    .max(255, 'Interested service must be 255 characters or less')
    .optional()
    .or(z.literal('')),
  estimatedBudget: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      'Budget must be a positive number or zero'
    ),
  currency: z.string(),
  description: z
    .string()
    .trim()
    .max(5000, 'Requirements notes must be 5000 characters or less')
    .optional()
    .or(z.literal('')),
  nextFollowUpDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Please enter a valid date and time'
    ),
  followUpNotes: z
    .string()
    .trim()
    .max(500, 'Reminder note must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>;
