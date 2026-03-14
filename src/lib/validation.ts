import { z } from 'zod';

// Authentication schemas
export const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type Credentials = z.infer<typeof credentialsSchema>;

// Item schemas
export const createItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  quantity: z.number().int().default(0),
  locationId: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

// Transaction schemas
export const transactionSchema = z.object({
  itemId: z.string(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
