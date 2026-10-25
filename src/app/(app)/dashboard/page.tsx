"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  HeartHandshake,
  Target,
  MessageSquareWarning,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Info,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const {
    dashboardMetrics: m,
    customers,
    recommendations,
    customerGrowthData,
    revenueData,
    pipelineSummary,
    isDemoMode,
    updateRecommendation,
  } = useApp();

  const [dateRange, setDateRange] = useState<"30d" | "90d" | "6m">("6m");

  // At-risk customers (health score < 70 or health_band at-risk/critical)
  const watchList = customers
    .filter((c) => c.health_band === "at-risk" || c.health_band === "critical")
    .sort((a, b) => (a.health_score || 100) - (b.health_score || 100))
    .slice(0, 5);

  const pendingRecs = recommendations
    .filter((r) => r.status === "pending")
    .slice(0, 5);

  const priorityBadgeStyle: Record<string, string> = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-amber-100 text-amber-800 border-amber-200",
    medium: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Executive Dashboard"
        subtitle="Real-time retention, pipeline health, and proactive action triggers"
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Demo Data &amp; Rule-Based Analysis Active:</span> All metrics and
              insights below are generated from sample workspace records and deterministic retention heuristics.
              Connect Supabase to persist your team&apos;s live database.
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 font-semibold text-[10px]">
              SAMPLE WORKSPACE
            </Badge>
          </div>
        )}

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Customers */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customers</span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{m.totalCustomers}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{m.newCustomersThisMonth} this month
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Active customer accounts in database
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Retention & Churn Risk */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Retention Rate</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{m.retentionRate}%</span>
                <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> {m.churnRiskCount} at risk
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {m.churnRiskCount > 0 ? "Flagged for reduced order frequency" : "Healthy engagement across accounts"}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Pipeline & Conversion */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Pipeline</span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(m.openPipelineValue)}</span>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {m.leadConversionRate}% win rate
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Across {pipelineSummary.filter((s) => !["won", "lost"].includes(s.stage)).reduce((acc, s) => acc + s.count, 0)} active deals
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Complaints & SLA */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaint Inbox</span>
                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                  <MessageSquareWarning className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{m.openComplaints}</span>
                {m.overdueComplaints > 0 ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    {m.overdueComplaints} overdue SLA
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">All SLAs met</span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" /> Avg resolution time: ~{m.avgResolutionTimeHours} hrs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Growth & Revenue Charts with Date Range Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Customer Growth */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">Customer Base Growth</CardTitle>
                  <CardDescription className="text-xs">
                    Cumulative accounts &amp; new additions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg self-start">
                  {(["30d", "90d", "6m"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDateRange(r)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                        dateRange === r ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="customerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="customers"
                      name="Total Customers"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#customerGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Revenue Trend */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">Revenue Recognized</CardTitle>
                  <CardDescription className="text-xs">
                    Monthly billing &amp; closed contract value
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    YTD: {formatCurrency(m.totalRevenue)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), "Revenue"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center: Customers to Watch & Recommended Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customers to Watch */}
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 rounded-md text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-gray-900">Customers to Watch</CardTitle>
                    <CardDescription className="text-xs">
                      Early indicators of declining health and retention risk
                    </CardDescription>
                  </div>
                </div>
                <Link href="/customers" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                  All accounts <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-100">
              {watchList.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  No high-risk accounts detected. All customer health scores are above safe thresholds.
                </div>
              ) : (
                watchList.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-gray-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/customers/${c.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate">
                            {c.name}
                          </Link>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold py-0 px-1.5 ${
                              c.health_band === "critical"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {c.health_band}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {c.email} · Account Owner: {c.owner_name || "Unassigned"}
                        </p>
                        {/* Risk signals */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.health_signals?.map((sig, idx) => (
                            <span key={idx} className="text-[11px] bg-red-50/80 text-red-700 px-2 py-0.5 rounded border border-red-100">
                              • {sig}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Health score badge & progress */}
                      <div className="text-right shrink-0 w-20">
                        <div className="text-sm font-bold text-gray-900">{c.health_score}/100</div>
                        <Progress
                          value={c.health_score}
                          className="h-1.5 mt-1.5 bg-gray-100"
                        />
                        <span className="text-[10px] text-gray-400 block mt-1">Health Score</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recommended Next Actions */}
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-gray-900">Recommended Follow-Ups</CardTitle>
                    <CardDescription className="text-xs">
                      Proactive actions to protect revenue &amp; satisfy customers
                    </CardDescription>
                  </div>
                </div>
                <Link href="/insights" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                  Review all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-100">
              {pendingRecs.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  All recommended follow-ups have been resolved or accepted!
                </div>
              ) : (
                pendingRecs.map((rec) => (
                  <div key={rec.id} className="p-4 hover:bg-gray-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">{rec.title}</span>
                          <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 px-1.5 ${priorityBadgeStyle[rec.priority]}`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-snug">{rec.reason}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                          {rec.customer_name && <span>Account: <strong className="text-gray-600">{rec.customer_name}</strong></span>}
                          {rec.assigned_to_name && <span>Assignee: {rec.assigned_to_name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => updateRecommendation(rec.id, "completed", "Marked complete from dashboard")}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => updateRecommendation(rec.id, "accepted", "Accepted onto working schedule")}
                      >
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-400 hover:text-gray-600"
                        onClick={() => updateRecommendation(rec.id, "dismissed", "Dismissed by user")}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Stage Distribution Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Sales Pipeline Progression</CardTitle>
                <CardDescription className="text-xs">
                  Active deal stages, probability weighted values, and conversion progression
                </CardDescription>
              </div>
              <Link href="/leads">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Open Kanban Board <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {pipelineSummary.map((s) => (
                <div
                  key={s.stage}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{s.stage}</span>
                    <span className="text-xs font-semibold px-1.5 py-0.2 bg-white rounded border border-gray-200">
                      {s.count}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-base font-bold text-gray-900">{formatCurrency(s.value)}</div>
                    <p className="text-[10px] text-gray-400">Total volume</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
