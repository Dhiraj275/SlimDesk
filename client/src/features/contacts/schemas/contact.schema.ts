import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Contact or company name is required')
    .max(150, 'Name must be 150 characters or less'),
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
    .max(50, 'Phone must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .trim()
    .max(150, 'Company must be 150 characters or less')
    .optional()
    .or(z.literal('')),
  isClient: z.boolean(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
