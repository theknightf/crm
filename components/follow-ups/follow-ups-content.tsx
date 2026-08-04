'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  CalendarClock,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  followUpStatuses,
  getFollowUpStatusConfig,
  type FollowUpValues,
} from '@/lib/validations/follow-up';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FollowUpForm } from '@/components/follow-ups/follow-up-form';

interface FollowUp extends FollowUpValues {
  id: string;
  created_at: string;
}

export function FollowUpsContent() {
  const supabase = getSupabaseBrowserClient();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('follow_ups')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setFollowUps(data ?? []);
    setLoading(false);
  }, [supabase, statusFilter]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleAdd = () => {
    setEditingFollowUp(null);
    setDialogOpen(true);
  };

  const handleEdit = (fu: FollowUp) => {
    setEditingFollowUp(fu);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingFollowUp(null);
    fetchFollowUps();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('follow_ups').delete().eq('id', deleteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Follow-up deleted');
    setDeleteId(null);
    fetchFollowUps();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from('follow_ups')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Follow-up marked as ${status}`);
    fetchFollowUps();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const isOverdue = diffMs < 0 && statusFilter === 'pending';
    const isToday = date.toDateString() === now.toDateString();

    return {
      formatted: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      isOverdue,
      isToday,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">
            Schedule and track your client follow-up activities.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <CalendarClock className="mr-2 h-4 w-4" />
          Schedule Follow-up
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        {followUpStatuses.map((s) => (
          <Button
            key={s.value}
            variant={statusFilter === s.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <CalendarClock className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            No {statusFilter !== 'all' ? statusFilter : ''} follow-ups.
          </p>
          <Button onClick={handleAdd} size="sm" className="mt-4">
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Schedule One Now
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => {
            const statusConfig = getFollowUpStatusConfig(fu.status);
            const { formatted, isOverdue, isToday } = formatDate(fu.scheduled_at);

            return (
              <Card
                key={fu.id}
                className={
                  isOverdue
                    ? 'border-destructive/30 bg-destructive/5'
                    : isToday && fu.status === 'pending'
                      ? 'border-warning/30 bg-warning/5'
                      : ''
                }
              >
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{fu.title}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    {fu.description && (
                      <p className="text-sm text-muted-foreground">{fu.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatted}
                      {isOverdue && fu.status === 'pending' && (
                        <span className="font-medium text-destructive">— Overdue</span>
                      )}
                      {isToday && fu.status === 'pending' && (
                        <span className="font-medium text-warning">— Today</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {fu.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(fu.id, 'completed')}
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(fu.id, 'cancelled')}
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(fu)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(fu.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingFollowUp ? 'Edit Follow-up' : 'Schedule New Follow-up'}
            </DialogTitle>
            <DialogDescription>
              {editingFollowUp
                ? 'Update the follow-up details below.'
                : 'Set a reminder for your next client interaction.'}
            </DialogDescription>
          </DialogHeader>
          <FollowUpForm
            followUp={editingFollowUp ?? undefined}
            onSaved={handleSaved}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this follow-up?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
