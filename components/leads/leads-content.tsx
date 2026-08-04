'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useDebounce } from '@/hooks/use-debounce';
import {
  leadStatuses,
  getStatusConfig,
  type LeadValues,
} from '@/lib/validations/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { LeadForm } from '@/components/leads/lead-form';
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel';

interface Lead extends LeadValues {
  id: string;
  created_at: string;
}

export function LeadsContent() {
  const supabase = getSupabaseBrowserClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    let filtered = data ?? [];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.full_name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q),
      );
    }

    setLeads(filtered as Lead[]);
    setLoading(false);
  }, [supabase, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAdd = () => {
    setEditingLead(null);
    setDialogOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingLead(null);
    fetchLeads();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('leads').delete().eq('id', deleteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Lead deleted');
    setDeleteId(null);
    fetchLeads();
  };

  const handleConvert = async (lead: Lead) => {
    const { error } = await supabase.from('customers').insert({
      lead_id: lead.id,
      full_name: lead.full_name,
      email: lead.email || null,
      phone: lead.phone || null,
      notes: lead.notes || null,
      status: 'active',
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from('leads').update({ status: 'won' }).eq('id', lead.id);
    toast.success(`${lead.full_name} converted to customer`);
    fetchLeads();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sales pipeline and track potential clients.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          {leadStatuses.map((s) => (
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
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'No leads match your filters.'
                : 'No leads yet. Click "Add Lead" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="hidden px-4 py-3 md:table-cell">Contact</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Budget</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => {
                  const statusConfig = getStatusConfig(lead.status);
                  return (
                    <tr key={lead.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{lead.full_name}</p>
                        {lead.property_type && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {lead.property_type}
                          </p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="space-y-0.5">
                          {lead.email && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </p>
                          )}
                          {lead.phone && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-sm capitalize text-muted-foreground">
                          {lead.source?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {lead.budget ? (
                          <span className="text-sm">
                            ${Number(lead.budget).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {lead.status !== 'won' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConvert(lead)}
                              title="Convert to customer"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            <DialogDescription>
              {editingLead
                ? 'Update the lead information below.'
                : 'Enter the details for your new prospect.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <LeadForm
                lead={editingLead ?? undefined}
                onSaved={handleSaved}
                onCancel={() => setDialogOpen(false)}
              />
            </div>
            {editingLead && (
              <div className="lg:col-span-2">
                <AIInsightsPanel lead={editingLead} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The lead will be permanently removed.
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
