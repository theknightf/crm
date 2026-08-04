'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  CalendarClock,
  TrendingUp,
  ArrowRight,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface DashboardStats {
  totalLeads: number;
  activeCustomers: number;
  pendingFollowUps: number;
  conversionRate: number;
}

interface ActivityItem {
  id: string;
  type: 'lead' | 'follow_up' | 'customer';
  message: string;
  time: string;
  status: string;
}

export function DashboardContent() {
  const supabase = getSupabaseBrowserClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeCustomers: 0,
    pendingFollowUps: 0,
    conversionRate: 0,
  });
  const [recentLeads, setRecentLeads] = useState<ActivityItem[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [leadsCountRes, customersRes, followUpsRes, wonLeadsRes, recentLeadsRes, upcomingDataRes] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact' }),
      supabase.from('customers').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('follow_ups').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'won'),
      supabase.from('leads').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('follow_ups').select('id, title, scheduled_at, status, lead_id').eq('status', 'pending').order('scheduled_at', { ascending: true }).limit(5),
    ]);

    const totalLeads = leadsCountRes.count ?? 0;
    const wonLeads = wonLeadsRes.count ?? 0;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    setStats({
      totalLeads,
      activeCustomers: customersRes.count ?? 0,
      pendingFollowUps: followUpsRes.count ?? 0,
      conversionRate,
    });

    setRecentLeads(
      (recentLeadsRes.data ?? []).map((lead) => ({
        id: lead.id,
        type: 'lead' as const,
        message: `${lead.full_name} — ${lead.status}`,
        time: formatRelativeTime(lead.created_at),
        status: lead.status,
      })),
    );

    setUpcomingFollowUps(
      (upcomingDataRes.data ?? []).map((fu) => ({
        id: fu.id,
        type: 'follow_up' as const,
        message: fu.title,
        time: formatRelativeTime(fu.scheduled_at),
        status: fu.status,
      })),
    );

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: UserPlus, color: 'text-primary' },
    { label: 'Active Customers', value: stats.activeCustomers, icon: Users, color: 'text-success' },
    { label: 'Pending Follow-ups', value: stats.pendingFollowUps, icon: CalendarClock, color: 'text-warning' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here&apos;s what&apos;s happening at your brokerage.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {loading ? '—' : stat.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Upcoming Follow-ups */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest prospects in your pipeline</CardDescription>
              </div>
              <Link href="/leads">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No leads yet. Add your first lead to get started.
                </p>
                <Link href="/leads" className="mt-4">
                  <Button size="sm">
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Add Lead
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.message}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Follow-ups</CardTitle>
                <CardDescription>Scheduled activities due soon</CardDescription>
              </div>
              <Link href="/follow-ups">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : upcomingFollowUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarClock className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No upcoming follow-ups scheduled.
                </p>
                <Link href="/follow-ups" className="mt-4">
                  <Button size="sm">
                    <CalendarClock className="mr-1.5 h-4 w-4" />
                    Schedule Follow-up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingFollowUps.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.message}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-warning">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/leads">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Add New Lead</p>
                  <p className="text-xs text-muted-foreground">Capture a prospect</p>
                </div>
              </div>
            </Link>
            <Link href="/follow-ups">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Schedule Follow-up</p>
                  <p className="text-xs text-muted-foreground">Set a reminder</p>
                </div>
              </div>
            </Link>
            <Link href="/reports">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success text-success-foreground">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">View Reports</p>
                  <p className="text-xs text-muted-foreground">Check performance</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-amber-50 text-amber-700 border-amber-200',
    qualified: 'bg-purple-50 text-purple-700 border-purple-200',
    won: 'bg-green-50 text-green-700 border-green-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = past.getTime() - now.getTime();
  const diffMins = Math.round(Math.abs(diffMs) / 60000);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)}w ago`;
  return past.toLocaleDateString();
}
