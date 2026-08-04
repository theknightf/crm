'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  followUpSchema,
  type FollowUpValues,
  followUpStatuses,
} from '@/lib/validations/follow-up';
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

interface FollowUpFormProps {
  followUp?: FollowUpValues & { id: string };
  onSaved: () => void;
  onCancel: () => void;
}

export function FollowUpForm({ followUp, onSaved, onCancel }: FollowUpFormProps) {
  const supabase = getSupabaseBrowserClient();
  const isEditing = !!followUp;
  const [leads, setLeads] = useState<{ id: string; full_name: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    supabase.from('leads').select('id, full_name').order('full_name').then(({ data }) => {
      setLeads(data ?? []);
    });
    supabase.from('customers').select('id, full_name').order('full_name').then(({ data }) => {
      setCustomers(data ?? []);
    });
  }, [supabase]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      title: followUp?.title ?? '',
      description: followUp?.description ?? '',
      scheduled_at: followUp?.scheduled_at
        ? new Date(followUp.scheduled_at).toISOString().slice(0, 16)
        : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      lead_id: followUp?.lead_id ?? 'none',
      customer_id: followUp?.customer_id ?? 'none',
      status: followUp?.status ?? 'pending',
    },
  });

  useEffect(() => {
    if (followUp) {
      reset({
        title: followUp.title,
        description: followUp.description ?? '',
        scheduled_at: new Date(followUp.scheduled_at).toISOString().slice(0, 16),
        lead_id: followUp.lead_id ?? 'none',
        customer_id: followUp.customer_id ?? 'none',
        status: followUp.status,
      });
    }
  }, [followUp, reset]);

  const onSubmit = async (values: FollowUpValues) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      scheduled_at: new Date(values.scheduled_at).toISOString(),
      lead_id: values.lead_id && values.lead_id !== 'none' ? values.lead_id : null,
      customer_id: values.customer_id && values.customer_id !== 'none' ? values.customer_id : null,
      status: values.status,
    };

    if (isEditing && followUp) {
      const { error } = await supabase
        .from('follow_ups')
        .update(payload)
        .eq('id', followUp.id);

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Follow-up updated successfully');
    } else {
      const { error } = await supabase.from('follow_ups').insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Follow-up scheduled successfully');
    }

    onSaved();
  };

  const watchLeadId = watch('lead_id');
  const watchCustomerId = watch('customer_id');
  const watchStatus = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Call John about property listing"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_at">Date & Time *</Label>
        <Input
          id="scheduled_at"
          type="datetime-local"
          {...register('scheduled_at')}
        />
        {errors.scheduled_at && (
          <p className="text-sm text-destructive">{errors.scheduled_at.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Related Lead</Label>
          <Select
            value={watchLeadId ?? 'none'}
            onValueChange={(v) => setValue('lead_id', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No lead</SelectItem>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Related Customer</Label>
          <Select
            value={watchCustomerId ?? 'none'}
            onValueChange={(v) => setValue('customer_id', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No customer</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={watchStatus}
          onValueChange={(v) => setValue('status', v as FollowUpValues['status'], { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {followUpStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Details about this follow-up..."
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Schedule Follow-up'}
        </Button>
      </div>
    </form>
  );
}
