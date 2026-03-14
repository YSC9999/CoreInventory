// Type definitions for the CoreInventory application

export type User = {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

export type Item = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  locationId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Location = {
  id: string;
  name: string;
  address?: string;
};

export type Transaction = {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  notes?: string;
  createdAt: Date;
  createdBy: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
