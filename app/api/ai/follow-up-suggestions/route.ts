import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  let body: { leadName: string; leadStatus: string; lastContactDays: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // AI PLACEHOLDER: Follow-up suggestion generator
  // Replace with an AI model call when AI features are enabled.
  const suggestions: string[] = [];

  if (body.leadStatus === 'new') {
    suggestions.push('Send a welcome email introducing your brokerage services');
    suggestions.push('Call within 24 hours to establish first contact');
    suggestions.push('Share a curated list of available properties matching their criteria');
  } else if (body.leadStatus === 'contacted') {
    suggestions.push('Send a follow-up email with property recommendations');
    suggestions.push('Schedule a property viewing appointment');
    suggestions.push('Share client testimonials from similar buyers');
  } else if (body.leadStatus === 'qualified') {
    suggestions.push('Prepare a personalized property portfolio');
    suggestions.push('Schedule a face-to-face meeting to discuss financing options');
    suggestions.push('Connect them with a mortgage advisor');
  }

  if (body.lastContactDays > 7) {
    suggestions.push(`It has been ${body.lastContactDays} days since last contact — reach out to re-engage`);
  }

  if (suggestions.length === 0) {
    suggestions.push('Check in to see if their needs have changed');
    suggestions.push('Share new property listings that may interest them');
  }

  return NextResponse.json({
    suggestions,
    powered_by: 'AI Placeholder — connect an AI model for personalized suggestions',
  });
}
