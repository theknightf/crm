import Link from 'next/link';
import { Home, ArrowLeft, Building2, Users, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignUpForm } from '@/components/auth/sign-up-form';

const highlights = [
  { icon: Users, text: 'Track leads through your entire sales pipeline' },
  { icon: Building2, text: 'Manage clients, teams, and properties in one place' },
  { icon: TrendingUp, text: 'Visualize performance with real-time analytics' },
];

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary to-primary/70 p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Estate CRM</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Start closing more deals
            <br />
            with Estate CRM.
          </h2>
          <div className="space-y-4">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-primary-foreground/90">{h.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">
          &copy; 2026 Estate CRM. All rights reserved.
        </p>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Home className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-xl font-bold">Estate CRM</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with your real estate CRM in minutes.
            </p>
          </div>

          <SignUpForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <Link href="/" className="mt-4 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
