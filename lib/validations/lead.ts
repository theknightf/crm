import { z } from 'zod';

export const leadSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  source: z.string().min(1, 'Please select a source'),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']),
  budget: z.coerce.number().min(0, 'Budget must be positive').optional().or(z.literal('')),
  property_type: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type LeadValues = z.infer<typeof leadSchema>;

export const leadSources = [
  'website',
  'referral',
  'walk-in',
  'social-media',
  'phone-call',
  'email',
  'other',
];

export const leadStatuses = [
  { value: 'new', label: 'New', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'won', label: 'Won', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'lost', label: 'Lost', color: 'bg-red-50 text-red-700 border-red-200' },
];

export const propertyTypes = [
  'house',
  'apartment',
  'condo',
  'commercial',
  'land',
  'rental',
];

export function getStatusConfig(status: string) {
  return leadStatuses.find((s) => s.value === status) ?? leadStatuses[0];
}
