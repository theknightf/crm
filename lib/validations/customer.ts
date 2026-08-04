import { z } from 'zod';

export const customerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'closed']),
  notes: z.string().optional().or(z.literal('')),
});

export type CustomerValues = z.infer<typeof customerSchema>;

export const customerStatuses = [
  { value: 'active', label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { value: 'closed', label: 'Closed', color: 'bg-red-50 text-red-700 border-red-200' },
];

export function getCustomerStatusConfig(status: string) {
  return customerStatuses.find((s) => s.value === status) ?? customerStatuses[0];
}
