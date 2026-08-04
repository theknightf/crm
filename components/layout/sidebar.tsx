'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarClock,
  Building2,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: UserPlus },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Follow-ups', href: '/follow-ups', icon: CalendarClock },
  { label: 'Teams', href: '/teams', icon: Building2 },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Home className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">Estate CRM</p>
          <p className="text-[11px] text-muted-foreground">Real Estate</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
        <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-gradient-to-br from-secondary to-secondary/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Plan
          </p>
          <p className="text-sm font-semibold">Professional</p>
        </div>
      </div>
    </aside>
  );
}
