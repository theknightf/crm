'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  leadSchema,
  type LeadValues,
  leadSources,
  leadStatuses,
  propertyTypes,
} from '@/lib/validations/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadFormProps {
  lead?: LeadValues & { id: string };
  onSaved: () => void;
  onCancel: () => void;
}

export function LeadForm({ lead, onSaved, onCancel }: LeadFormProps) {
  const supabase = getSupabaseBrowserClient();
  const isEditing = !!lead;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      full_name: lead?.full_name ?? '',
      email: lead?.email ?? '',
      phone: lead?.phone ?? '',
      source: lead?.source ?? 'website',
      status: lead?.status ?? 'new',
      budget: lead?.budget ?? undefined,
      property_type: lead?.property_type ?? '',
      notes: lead?.notes ?? '',
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        full_name: lead.full_name,
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        source: lead.source,
        status: lead.status,
        budget: lead.budget,
        property_type: lead.property_type ?? '',
        notes: lead.notes ?? '',
      });
    }
  }, [lead, reset]);

  const onSubmit = async (values: LeadValues) => {
    const payload = {
      full_name: values.full_name,
      email: values.email || null,
      phone: values.phone || null,
      source: values.source,
      status: values.status,
      budget: values.budget ? Number(values.budget) : null,
      property_type: values.property_type || null,
      notes: values.notes || null,
    };

    if (isEditing && lead) {
      const { error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', lead.id);

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Lead updated successfully');
    } else {
      const { error } = await supabase.from('leads').insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Lead added successfully');
    }

    onSaved();
  };

  const watchSource = watch('source');
  const watchStatus = watch('status');
  const watchPropertyType = watch('property_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            placeholder="John Smith"
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+1 555-0100"
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            placeholder="500000"
            {...register('budget')}
          />
          {errors.budget && (
            <p className="text-sm text-destructive">{errors.budget.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            value={watchSource}
            onValueChange={(v) => setValue('source', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {leadSources.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={watchStatus}
            onValueChange={(v) => setValue('status', v as LeadValues['status'], { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Property Type</Label>
          <Select
            value={watchPropertyType || 'none'}
            onValueChange={(v) => setValue('property_type', v === 'none' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {propertyTypes.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes about this lead..."
            rows={3}
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Add Lead'}
        </Button>
      </div>
    </form>
  );
}
