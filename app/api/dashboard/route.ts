import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
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

  const [leadsRes, customersRes, followUpsRes, wonLeadsRes] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact' }),
    supabase.from('customers').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('follow_ups').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'won'),
  ]);

  const totalLeads = leadsRes.count ?? 0;
  const wonLeads = wonLeadsRes.count ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return NextResponse.json({
    totalLeads,
    activeCustomers: customersRes.count ?? 0,
    pendingFollowUps: followUpsRes.count ?? 0,
    conversionRate,
  });
}
