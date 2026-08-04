import { z } from 'zod';

export const followUpSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  scheduled_at: z.string().min(1, 'Please select a date and time'),
  lead_id: z.string().optional().or(z.literal('none')),
  customer_id: z.string().optional().or(z.literal('none')),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

export type FollowUpValues = z.infer<typeof followUpSchema>;

export const followUpStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
];

export function getFollowUpStatusConfig(status: string) {
  return followUpStatuses.find((s) => s.value === status) ?? followUpStatuses[0];
}
