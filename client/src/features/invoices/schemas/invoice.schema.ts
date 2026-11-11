import { z } from 'zod';

export const recordPaymentSchema = z.object({
  amount: z
    .number()
    .positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['bank_transfer', 'upi', 'cash', 'card', 'other'] as const),
  paymentDate: z.string().min(1, 'Payment date is required'),
  referenceNumber: z.string().trim().max(100, 'Reference must be 100 characters or less').optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes must be 1000 characters or less').optional().or(z.literal('')),
});

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Line item description is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().default('units'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  sortOrder: z.number().default(0),
});

export const invoicePayloadSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Please enter an invoice title')
      .max(200, 'Title must be 200 characters or less'),
    clientInfo: z.object({
      name: z
        .string()
        .trim()
        .min(1, 'Please specify client contact name')
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
    dueDate: z.string().min(1, 'Please select the due date'),
    currency: z.string().default('INR'),
    taxMode: z.enum(['none', 'gst', 'vat', 'custom']).default('none'),
    discountAmount: z.number().min(0).default(0),
    items: z
      .array(invoiceItemSchema)
      .min(1, 'Please add at least one line item with a description'),
  })
  .refine(
    (data) => {
      if (!data.issueDate || !data.dueDate) return true;
      return new Date(data.dueDate) >= new Date(data.issueDate);
    },
    {
      message: 'Due date cannot be earlier than issue date',
      path: ['dueDate'],
    }
  );

export type InvoicePayloadValues = z.infer<typeof invoicePayloadSchema>;
