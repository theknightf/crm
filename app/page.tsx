import Link from 'next/link';
import {
  Home as HomeIcon,
  ArrowRight,
  Users,
  CalendarClock,
  BarChart3,
  Building2,
  CheckCircle2,
  Shield,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Capture, track, and nurture leads through your sales pipeline with ease.',
  },
  {
    icon: CalendarClock,
    title: 'Follow-up Scheduling',
    description: 'Never miss a callback. Schedule and track every follow-up with reminders.',
  },
  {
    icon: BarChart3,
    title: 'Performance Reports',
    description: 'Visualize conversion rates, team performance, and pipeline health at a glance.',
  },
  {
    icon: Building2,
    title: 'Team Collaboration',
    description: 'Assign leads to agents, share customer data, and coordinate your brokerage.',
  },
];

const stats = [
  { value: '500+', label: 'Leads Managed' },
  { value: '98%', label: 'Follow-up Rate' },
  { value: '3x', label: 'Faster Conversions' },
  { value: '24/7', label: 'Always Available' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HomeIcon className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Estate CRM</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">
              Get Started
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Built for Real Estate Brokerages
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Manage your real estate
            <span className="block text-primary">relationships with clarity</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A clean, modern CRM designed for brokerages. Track leads, manage
            customers, schedule follow-ups, and measure performance — all in
            one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary lg:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight lg:text-4xl">
            Everything your brokerage needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Powerful tools designed to be simple enough for non-technical
            users, yet capable enough for professional teams.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-10 text-center text-primary-foreground lg:p-16">
          <Zap className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-3 text-primary-foreground/80">
            Join brokerages using Estate CRM to close more deals.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" variant="secondary">
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/70">
            <CheckCircle2 className="h-4 w-4" />
            No credit card required
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HomeIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Estate CRM</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Estate CRM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
