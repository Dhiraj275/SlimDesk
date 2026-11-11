import { z } from 'zod';

export const businessProfileSchema = z.object({
  businessName: z.string().trim().max(150, 'Business name must be 150 characters or less').optional().or(z.literal('')),
  legalName: z.string().trim().max(150, 'Legal name must be 150 characters or less').optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Please enter a valid business email address')
    .max(255)
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().max(50, 'Phone must be 50 characters or less').optional().or(z.literal('')),
  address: z.string().trim().max(500, 'Address must be 500 characters or less').optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  website: z
    .string()
    .trim()
    .url('Please enter a valid website URL (e.g. https://example.com)')
    .max(255)
    .optional()
    .or(z.literal('')),
  gstin: z
    .string()
    .trim()
    .max(15, 'GSTIN must be 15 characters or less')
    .optional()
    .or(z.literal('')),
});

export type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

export const paymentProfileSchema = z.object({
  name: z.string().trim().min(1, 'Profile name is required').max(100),
  type: z.enum(['bank_transfer', 'upi', 'international', 'cash', 'other'] as const),
  currency: z.string().default('INR'),
  isDefault: z.boolean().default(false),
  details: z.string().trim().min(1, 'Payment instructions or details are required').max(1000),
  bankName: z.string().trim().max(100).optional().or(z.literal('')),
  accountNumber: z.string().trim().max(50).optional().or(z.literal('')),
  ifscCode: z.string().trim().max(20).optional().or(z.literal('')),
  upiId: z.string().trim().max(100).optional().or(z.literal('')),
});

export type PaymentProfileFormValues = z.infer<typeof paymentProfileSchema>;

export const serviceItemSchema = z.object({
  name: z.string().trim().min(1, 'Service name is required').max(150),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  defaultUnit: z.string().trim().min(1, 'Unit is required').default('units'),
  defaultUnitPrice: z.number().min(0, 'Unit price must be zero or positive'),
  currency: z.string().default('INR'),
  taxRate: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
});

export type ServiceItemFormValues = z.infer<typeof serviceItemSchema>;

export const snippetSchema = z.object({
  title: z.string().trim().min(1, 'Snippet title is required').max(100),
  category: z.enum(['terms', 'notes', 'payment_schedule', 'revision_policy', 'custom'] as const),
  content: z.string().trim().min(1, 'Snippet content is required').max(5000),
});

export type SnippetFormValues = z.infer<typeof snippetSchema>;
