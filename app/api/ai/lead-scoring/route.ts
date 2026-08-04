import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface LeadScoreInput {
  leadId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  budget: number | null;
  propertyType: string | null;
  notes: string | null;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: LeadScoreInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // AI PLACEHOLDER: Lead scoring algorithm
  // This is a rule-based placeholder. Replace with an AI model call
  // (e.g., OpenAI, Anthropic) when AI features are enabled.
  let score = 0;
  const reasons: string[] = [];

  // Budget scoring (0-30 points)
  if (body.budget) {
    if (body.budget >= 1000000) {
      score += 30;
      reasons.push('High budget indicates strong buying intent');
    } else if (body.budget >= 500000) {
      score += 20;
      reasons.push('Moderate budget shows serious interest');
    } else if (body.budget >= 100000) {
      score += 10;
      reasons.push('Budget range suggests entry-level interest');
    }
  }

  // Source scoring (0-25 points)
  const sourceScores: Record<string, number> = {
    referral: 25,
    'phone-call': 20,
    'walk-in': 18,
    website: 15,
    email: 12,
    'social-media': 10,
    other: 5,
  };
  const sourceScore = sourceScores[body.source] ?? 5;
  score += sourceScore;
  if (sourceScore >= 18) {
    reasons.push(`${body.source.replace('-', ' ')} source has high conversion rates`);
  }

  // Contact info scoring (0-20 points)
  if (body.email && body.phone) {
    score += 20;
    reasons.push('Complete contact information available');
  } else if (body.email || body.phone) {
    score += 10;
    reasons.push('Partial contact information available');
  }

  // Status scoring (0-15 points)
  const statusScores: Record<string, number> = {
    qualified: 15,
    contacted: 10,
    new: 5,
    won: 0,
    lost: 0,
  };
  score += statusScores[body.status] ?? 0;
  if (body.status === 'qualified') {
    reasons.push('Lead is already qualified');
  }

  // Property type scoring (0-10 points)
  if (body.propertyType) {
    score += 10;
    reasons.push('Property preference identified');
  }

  score = Math.min(score, 100);

  let recommendation: string;
  if (score >= 70) {
    recommendation = 'High priority — schedule immediate follow-up';
  } else if (score >= 40) {
    recommendation = 'Medium priority — nurture with regular contact';
  } else {
    recommendation = 'Low priority — add to general marketing list';
  }

  return NextResponse.json({
    score,
    recommendation,
    reasons,
    powered_by: 'AI Placeholder — connect an AI model to enable smart scoring',
  });
}
