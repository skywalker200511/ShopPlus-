"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  Heart,
  TrendingDown,
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
  Minus,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Info,
  Calendar,
  User,
  ArrowRight,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecommendationStatus, ComplaintSentiment } from "@/types/database";

export default function InsightsPage() {
  const {
    customers,
    complaints,
    recommendations,
    updateRecommendation,
    updateComplaint,
    isDemoMode,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"churn" | "sentiment" | "recommendations">("churn");

  // Churn risk accounts
  const churnRiskAccounts = customers
    .filter((c) => (c.health_score || 100) < 70)
    .sort((a, b) => (a.health_score || 100) - (b.health_score || 100));

  // Sentiment override handler
  const handleOverrideSentiment = (complaintId: string, newSentiment: ComplaintSentiment) => {
    updateComplaint(complaintId, {
      sentiment: newSentiment,
      sentiment_explanation: `Manually verified & overridden by ${user.display_name}`,
    });
  };

  const priorityBadgeStyle: Record<string, string> = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-amber-100 text-amber-800 border-amber-200",
    medium: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="AI Retention Insights &amp; Recommendations"
        subtitle="Explainable churn prediction, sentiment classification, and proactive action triggers"
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Model Transparency Banner */}
        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-indigo-950 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">Transparent Decision Rules:</span>
                <Badge variant="outline" className="text-[10px] bg-white text-indigo-700 border-indigo-300 font-semibold">
                  {isDemoMode ? "Rule-Based Demo Engine" : "LLM Assisted"}
                </Badge>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                Scores below are never black boxes. Every churn risk band and sentiment label shows its exact contributing
                signals (recency of purchase, unaddressed tickets, customer importance, SLA time remaining). Staff members can
                override classifications at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 gap-6 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("churn")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "churn"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Customer Churn Risk ({churnRiskAccounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recommendations")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "recommendations"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Follow-Up Recommendations ({recommendations.filter((r) => r.status === "pending").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sentiment")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "sentiment"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Sentiment Analysis &amp; Overrides</span>
          </button>
        </div>

        {/* Tab 1: Churn Risk */}
        {activeTab === "churn" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Accounts Flagged for Retention Intervention</h3>
                <p className="text-xs text-gray-500">
                  Customers with declining health scores (&lt; 70), dormant purchasing, or open disputes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {churnRiskAccounts.map((c) => (
                <Card key={c.id} className="border border-gray-200 hover:border-gray-300 transition-all">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/customers/${c.id}`} className="font-bold text-gray-900 hover:text-indigo-600 text-sm">
                          {c.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{c.email}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase py-0.5 px-2 ${
                          c.health_band === "critical"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {c.health_band} risk
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3.5 text-xs">
                    {/* Score Gauge */}
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="font-semibold text-gray-700">Health Index</span>
                        <span className="font-bold text-gray-900">{c.health_score}/100</span>
                      </div>
                      <Progress value={c.health_score} className="h-1.5 bg-gray-100" />
                    </div>

                    {/* Contributing Signals */}
                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 space-y-1">
                      <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
                        Contributing Risk Signals:
                      </span>
                      {c.health_signals?.map((sig, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-red-900 text-xs">
                          <span className="font-bold">•</span>
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recommended Next Step */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-gray-500">
                        Owner: <strong>{c.owner_name || "Unassigned"}</strong> · LTV:{" "}
                        <strong>{formatCurrency(c.total_revenue || 0)}</strong>
                      </div>
                      <Link href={`/customers/${c.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-indigo-600">
                          Take Action <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Recommendations */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Proactive Suggested Actions</h3>
              <p className="text-xs text-gray-500">
                Action triggers derived from overdue complaints, expiring deal dates, and dormant client accounts
              </p>
            </div>

            <Card className="border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{rec.title}</span>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 px-1.5 ${priorityBadgeStyle[rec.priority]}`}>
                          {rec.priority}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] uppercase font-bold py-0 px-1.5 ${
                            rec.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : rec.status === "dismissed"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {rec.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug">{rec.reason}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                        {rec.customer_name && <span>Account: <strong className="text-gray-600">{rec.customer_name}</strong></span>}
                        {rec.assigned_to_name && <span>Assignee: {rec.assigned_to_name}</span>}
                        {rec.due_date && <span>Target: {formatDate(rec.due_date)}</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {rec.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => updateRecommendation(rec.id, "completed", "Done")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => updateRecommendation(rec.id, "accepted", "Accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-gray-400 hover:text-gray-600"
                            onClick={() => updateRecommendation(rec.id, "dismissed", "Dismissed")}
                          >
                            Dismiss
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 capitalize">
                          {rec.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Tab 3: Sentiment Analysis & Staff Overrides */}
        {activeTab === "sentiment" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Complaint Sentiment Classifier &amp; Verification</h3>
              <p className="text-xs text-gray-500">
                Review sentiment scores extracted from incoming tickets. Staff can adjust or override any prediction.
              </p>
            </div>

            <Card className="border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{c.title}</span>
                      <p className="text-gray-500 mt-0.5">
                        Customer: <strong>{c.customer_name || "Direct"}</strong> · Status: {c.status}
                      </p>
                    </div>

                    {/* Sentiment Badge & Override controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Classified as:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs uppercase font-bold py-0.5 px-2 ${
                          c.sentiment === "negative"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : c.sentiment === "positive"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {c.sentiment || "Neutral"}
                      </Badge>

                      {/* Staff override selector */}
                      <Select
                        value={c.sentiment || "neutral"}
                        onValueChange={(val) => handleOverrideSentiment(c.id, val as ComplaintSentiment)}
                      >
                        <SelectTrigger className="h-7 text-[11px] w-28 bg-white border-gray-300">
                          <SelectValue placeholder="Override" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="positive">Positive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <p className="p-2.5 bg-gray-50 rounded-lg text-gray-700 italic border border-gray-100">
                    &ldquo;{c.description}&rdquo;
                  </p>

                  {c.sentiment_explanation && (
                    <p className="text-[11px] text-gray-500">
                      <strong>Analysis Signal:</strong> {c.sentiment_explanation}
                    </p>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
