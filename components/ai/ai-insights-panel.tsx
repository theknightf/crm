'use client';

import { useState } from 'react';
import { Sparkles, Loader2, TrendingUp, Lightbulb } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeadData {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  source: string;
  status: string;
  budget?: number | string | null;
  property_type?: string | null;
  notes?: string | null;
}

interface AIInsightsPanelProps {
  lead: LeadData;
}

export function AIInsightsPanel({ lead }: AIInsightsPanelProps) {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateInsights = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    const [scoreRes, suggestionsRes] = await Promise.all([
      fetch('/api/ai/lead-scoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: lead.id,
          fullName: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          budget: lead.budget,
          propertyType: lead.property_type,
          notes: lead.notes,
        }),
      }),
      fetch('/api/ai/follow-up-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadName: lead.full_name,
          leadStatus: lead.status,
          lastContactDays: 3,
        }),
      }),
    ]);

    if (scoreRes.ok) {
      const scoreData = await scoreRes.json();
      setScore(scoreData.score);
      setRecommendation(scoreData.recommendation);
      setReasons(scoreData.reasons ?? []);
    }

    if (suggestionsRes.ok) {
      const suggData = await suggestionsRes.json();
      setSuggestions(suggData.suggestions ?? []);
    }

    setLoading(false);
  };

  const scoreColor =
    score === null
      ? ''
      : score >= 70
        ? 'text-success'
        : score >= 40
          ? 'text-warning'
          : 'text-destructive';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Smart analysis for {lead.full_name}
            </CardDescription>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-4 w-4" />
            )}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {score === null && !loading ? (
          <p className="text-sm text-muted-foreground">
            Click &quot;Analyze&quot; to generate AI-powered insights for this lead.
          </p>
        ) : loading ? (
          <div className="space-y-2">
            <div className="h-6 animate-pulse rounded bg-secondary" />
            <div className="h-6 animate-pulse rounded bg-secondary" />
            <div className="h-6 animate-pulse rounded bg-secondary" />
          </div>
        ) : (
          <>
            {score !== null && (
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Lead Score</span>
                  <span className={`text-2xl font-bold ${scoreColor}`}>{score}/100</span>
                </div>
                {recommendation && (
                  <p className="mt-1 text-sm text-muted-foreground">{recommendation}</p>
                )}
                {reasons.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Suggested Actions</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-warning" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-border pt-2">
              <Badge variant="secondary" className="text-xs">
                AI Placeholder — connect a model to enable smart insights
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
