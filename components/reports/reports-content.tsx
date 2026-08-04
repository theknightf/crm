'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  UserPlus,
  CalendarClock,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ReportData {
  leadStatusData: { name: string; value: number; color: string }[];
  conversionFunnel: { stage: string; count: number }[];
  followUpData: { name: string; value: number }[];
  monthlyLeads: { month: string; leads: number; customers: number }[];
  summary: {
    totalLeads: number;
    totalCustomers: number;
    totalFollowUps: number;
    completedFollowUps: number;
    conversionRate: number;
    followUpCompletionRate: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#a855f7',
  won: '#22c55e',
  lost: '#ef4444',
};

export function ReportsContent() {
  const supabase = getSupabaseBrowserClient();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [leadsRes, customersRes, followUpsRes] = await Promise.all([
      supabase.from('leads').select('id, status, created_at'),
      supabase.from('customers').select('id, created_at'),
      supabase.from('follow_ups').select('id, status'),
    ]);

    const leads = leadsRes.data ?? [];
    const customers = customersRes.data ?? [];
    const followUps = followUpsRes.data ?? [];

    // Lead status distribution
    const statusCounts: Record<string, number> = {};
    leads.forEach((l) => {
      statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
    });

    const leadStatusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? '#94a3b8',
    }));

    // Conversion funnel
    const funnelStages = ['new', 'contacted', 'qualified', 'won'];
    const conversionFunnel = funnelStages.map((stage) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      count: leads.filter((l) => funnelStages.indexOf(l.status) >= funnelStages.indexOf(stage)).length,
    }));

    // Follow-up status
    const fuStatusCounts: Record<string, number> = {};
    followUps.forEach((f) => {
      fuStatusCounts[f.status] = (fuStatusCounts[f.status] ?? 0) + 1;
    });
    const followUpData = Object.entries(fuStatusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Monthly leads & customers (last 6 months)
    const now = new Date();
    const months: { month: string; leads: number; customers: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const leadsInMonth = leads.filter((l) => {
        const created = new Date(l.created_at);
        return created >= monthStart && created < monthEnd;
      }).length;

      const customersInMonth = customers.filter((c) => {
        const created = new Date(c.created_at);
        return created >= monthStart && created < monthEnd;
      }).length;

      months.push({ month: monthName, leads: leadsInMonth, customers: customersInMonth });
    }

    const totalLeads = leads.length;
    const totalCustomers = customers.length;
    const wonLeads = leads.filter((l) => l.status === 'won').length;
    const completedFollowUps = followUps.filter((f) => f.status === 'completed').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    const followUpCompletionRate = followUps.length > 0
      ? Math.round((completedFollowUps / followUps.length) * 100)
      : 0;

    setData({
      leadStatusData,
      conversionFunnel,
      followUpData,
      monthlyLeads: months,
      summary: {
        totalLeads,
        totalCustomers,
        totalFollowUps: followUps.length,
        completedFollowUps,
        conversionRate,
        followUpCompletionRate,
      },
    });

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Leads',
      value: data.summary.totalLeads,
      icon: UserPlus,
      color: 'text-primary',
    },
    {
      label: 'Total Customers',
      value: data.summary.totalCustomers,
      icon: Users,
      color: 'text-success',
    },
    {
      label: 'Conversion Rate',
      value: `${data.summary.conversionRate}%`,
      icon: Target,
      color: 'text-foreground',
    },
    {
      label: 'Follow-up Completion',
      value: `${data.summary.followUpCompletionRate}%`,
      icon: CheckCircle2,
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Analytics and performance insights for your brokerage.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{card.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Breakdown of leads by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            {data.leadStatusData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.leadStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {data.leadStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Leads progressing through pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            {data.summary.totalLeads === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.conversionFunnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Leads and customers over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {data.summary.totalLeads === 0 && data.summary.totalCustomers === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.monthlyLeads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[250px] items-center justify-center text-center">
      <div>
        <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          No data available yet. Add leads and customers to see analytics.
        </p>
      </div>
    </div>
  );
}
