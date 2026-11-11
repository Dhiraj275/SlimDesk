import { z } from 'zod';

export const quotationItemSchema = z.object({
  description: z.string().trim().min(1, 'Deliverable description is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().default('units'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  sortOrder: z.number().default(0),
});

export const quotationPayloadSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Please enter a quotation title')
      .max(200, 'Title must be 200 characters or less'),
    clientInfo: z.object({
      name: z
        .string()
        .trim()
        .min(1, 'Please enter client contact name')
        .max(150, 'Client name must be 150 characters or less'),
      company: z.string().trim().max(150).optional().or(z.literal('')),
      email: z
        .string()
        .trim()
        .email('Please enter a valid client email address')
        .max(255)
        .optional()
        .or(z.literal('')),
      phone: z.string().trim().max(50).optional().or(z.literal('')),
      address: z.string().trim().max(500).optional().or(z.literal('')),
      gstin: z.string().trim().max(15).optional().or(z.literal('')),
      state: z.string().trim().optional().or(z.literal('')),
    }),
    issueDate: z.string().min(1, 'Please select the issue date'),
    expiryDate: z.string().min(1, 'Please select the validity expiry date'),
    currency: z.string().default('INR'),
    taxMode: z.enum(['none', 'gst', 'vat', 'custom']).default('none'),
    discountAmount: z.number().min(0).default(0),
    items: z
      .array(quotationItemSchema)
      .min(1, 'Please add at least one line item with a description'),
  })
  .refine(
    (data) => {
      if (!data.issueDate || !data.expiryDate) return true;
      return new Date(data.expiryDate) >= new Date(data.issueDate);
    },
    {
      message: 'Quotation expiry date cannot be earlier than issue date',
      path: ['expiryDate'],
    }
  );

export type QuotationPayloadValues = z.infer<typeof quotationPayloadSchema>;
