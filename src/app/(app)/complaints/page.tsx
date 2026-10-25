"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Lock,
  Sparkles,
  Info,
  Calendar,
  User,
  ShieldAlert,
  ChevronRight,
  Flame,
  ThumbsDown,
  ThumbsUp,
  Minus,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatRelativeTime, useIsClient } from "@/lib/utils";
import type { Complaint, ComplaintStatus, ComplaintSentiment } from "@/types/database";

export default function ComplaintsPage() {
  const {
    complaints,
    complaintNotes,
    addComplaint,
    updateComplaint,
    updateComplaintStatus,
    addComplaintNote,
    customers,
    members,
    user,
  } = useApp();

  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(
    complaints[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  // New complaint dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    customer_id: customers[0]?.id || "",
    title: "",
    description: "",
    severity: 4,
    owner_id: user.id,
  });

  // Note text input
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(true);
  const isClient = useIsClient();
  const nowTime = isClient ? 1750000000000 : 0;

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId) || complaints[0];
  const activeNotes = selectedComplaint
    ? complaintNotes.filter((n) => n.complaint_id === selectedComplaint.id)
    : [];

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.customer_name && c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchSeverity = severityFilter === "all" || c.severity.toString() === severityFilter;
      const matchSentiment = sentimentFilter === "all" || c.sentiment === sentimentFilter;

      return matchSearch && matchStatus && matchSeverity && matchSentiment;
    });
  }, [complaints, searchTerm, statusFilter, severityFilter, sentimentFilter]);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.title.trim() || !createData.description.trim()) return;

    const assignedMember = members.find((m) => m.user_id === createData.owner_id);

    const created = addComplaint({
      customer_id: createData.customer_id,
      title: createData.title.trim(),
      description: createData.description.trim(),
      severity: Number(createData.severity),
      owner_id: createData.owner_id,
      owner_name: assignedMember?.display_name || user.display_name,
      status: "new",
      sla_due_at: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    });

    setIsCreateOpen(false);
    setSelectedComplaintId(created.id);
    setCreateData({
      customer_id: customers[0]?.id || "",
      title: "",
      description: "",
      severity: 4,
      owner_id: user.id,
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedComplaint) return;

    addComplaintNote(selectedComplaint.id, newNoteContent.trim(), isInternalNote);
    setNewNoteContent("");
  };

  const statusBadgeStyle: Record<ComplaintStatus, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    waiting: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const sentimentIcon: Record<ComplaintSentiment, React.ReactNode> = {
    negative: <ThumbsDown className="w-3.5 h-3.5 text-red-600" />,
    positive: <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />,
    neutral: <Minus className="w-3.5 h-3.5 text-gray-500" />,
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Complaints &amp; Support Inbox"
        subtitle="Transparent priority triage with explainable sentiment detection, SLA deadlines, and team resolution audit"
        actions={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Log Complaint
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search complaints, customer, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs bg-white">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="5">Severity 5 (Max)</SelectItem>
                <SelectItem value="4">Severity 4</SelectItem>
                <SelectItem value="3">Severity 3</SelectItem>
                <SelectItem value="2">Severity 2</SelectItem>
                <SelectItem value="1">Severity 1</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs bg-white">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Master-Detail 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Column 1: Complaint List (5 Cols) */}
          <Card className="lg:col-span-5 overflow-hidden border border-gray-200">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 font-semibold uppercase tracking-wider">
              <span>Inbox ({filteredComplaints.length})</span>
              <span>Priority Score</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto">
              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No complaints match your filter settings.
                </div>
              ) : (
                filteredComplaints.map((c) => {
                  const isSelected = selectedComplaint?.id === c.id;
                  const isOverdue = Boolean(nowTime && c.status !== "resolved" && c.sla_due_at && new Date(c.sla_due_at).getTime() < nowTime);

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedComplaintId(c.id)}
                      className={`w-full text-left p-3.5 transition-colors block ${
                        isSelected ? "bg-indigo-50/70 border-l-4 border-l-indigo-600" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase font-bold py-0 px-1.5 ${statusBadgeStyle[c.status]}`}
                            >
                              {c.status.replace("_", " ")}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                SLA Overdue
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400">Sev {c.severity}/5</span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 mt-1 truncate">{c.title}</p>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {c.customer_name || "Direct Customer"}
                          </p>
                        </div>

                        {/* Priority Score Gauge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded ${
                              (c.priority_score || 0) >= 70
                                ? "bg-red-100 text-red-800"
                                : (c.priority_score || 0) >= 40
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {c.priority_score || 50}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            {formatRelativeTime(c.created_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Column 2: Selected Complaint Details & History (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedComplaint ? (
              <>
                {/* Detail Card */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs uppercase font-bold py-0.5 px-2 ${statusBadgeStyle[selectedComplaint.status]}`}>
                            {selectedComplaint.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Logged {formatDate(selectedComplaint.created_at)}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-gray-900 mt-1">
                          {selectedComplaint.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Customer:{" "}
                          <Link
                            href={`/customers/${selectedComplaint.customer_id}`}
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            {selectedComplaint.customer_name || "Customer Profile"}
                          </Link>{" "}
                          ({selectedComplaint.customer_email})
                        </CardDescription>
                      </div>

                      {/* Workflow Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedComplaint.status}
                          onValueChange={(val) => updateComplaintStatus(selectedComplaint.id, val as ComplaintStatus)}
                        >
                          <SelectTrigger className="h-8 text-xs font-semibold bg-white border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="waiting">Waiting</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Complaint Text */}
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 text-xs text-gray-800 leading-relaxed">
                      {selectedComplaint.description}
                    </div>

                    {/* Transparent Priority Score & Sentiment Explanation */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-red-500" />
                          <span className="text-xs font-bold text-gray-900">
                            Transparent Priority Triage: {selectedComplaint.priority_score || 50}/100
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          {sentimentIcon[selectedComplaint.sentiment || "neutral"]}
                          <span className="font-semibold capitalize text-gray-700">
                            {selectedComplaint.sentiment || "Neutral"} Sentiment
                          </span>
                          {selectedComplaint.sentiment_confidence && (
                            <span className="text-[10px] text-gray-400">
                              ({Math.round(selectedComplaint.sentiment_confidence * 100)}% confidence)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reasons behind priority */}
                      <div className="text-xs space-y-1">
                        <span className="text-[11px] font-semibold text-gray-500 block">
                          Why this ticket has priority {selectedComplaint.priority_score}/100:
                        </span>
                        {selectedComplaint.priority_reasons?.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700 text-[11px]">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Explainable Sentiment Note */}
                      {selectedComplaint.sentiment_explanation && (
                        <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 italic">
                          Sentiment signal: &ldquo;{selectedComplaint.sentiment_explanation}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* SLA and Owner Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-gray-400 block font-medium">Assigned Owner</span>
                        <span className="font-semibold text-gray-900">
                          {selectedComplaint.owner_name || "Unassigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">SLA Due Date</span>
                        <span className="font-semibold text-gray-900">
                          {selectedComplaint.sla_due_at ? formatDate(selectedComplaint.sla_due_at) : "No SLA set"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Internal Notes & History */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-gray-500" /> Resolution Audit &amp; Internal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Notes List */}
                    <div className="space-y-3">
                      {activeNotes.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                          No internal notes recorded yet. Add an update below.
                        </p>
                      ) : (
                        activeNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-gray-500">
                              <span className="font-bold text-gray-900">{note.author_name}</span>
                              <span className="text-[10px] text-gray-400">{formatRelativeTime(note.created_at)}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{note.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add note input */}
                    <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-gray-100">
                      <Textarea
                        placeholder="Add an internal note or record communication with the customer..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="text-xs"
                        rows={2}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Team-only internal note
                        </span>
                        <Button type="submit" size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Send className="w-3 h-3 mr-1" /> Post Note
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center text-gray-400 text-xs">
                Select a complaint from the inbox to review details.
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Log Complaint Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Customer Complaint</DialogTitle>
            <DialogDescription className="text-xs">
              Sentiment and priority scores are calculated automatically from description keywords and customer value.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateComplaint} className="space-y-3">
            <div>
              <Label className="text-xs">Customer Account *</Label>
              <Select
                value={createData.customer_id}
                onValueChange={(val) => setCreateData({ ...createData, customer_id: val })}
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Complaint Subject *</Label>
              <Input
                required
                placeholder="e.g. Delayed shipment on order #492"
                value={createData.title}
                onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Issue Description *</Label>
              <Textarea
                required
                placeholder="Explain the customer's problem in their own words..."
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                className="mt-1 text-xs"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Severity (1 to 5)</Label>
                <Select
                  value={createData.severity.toString()}
                  onValueChange={(val) => setCreateData({ ...createData, severity: Number(val) })}
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Critical Business Block</SelectItem>
                    <SelectItem value="4">4 - High Impact</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="2">2 - Minor inconvenience</SelectItem>
                    <SelectItem value="1">1 - Trivial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Assignee</Label>
                <Select
                  value={createData.owner_id}
                  onValueChange={(val) => setCreateData({ ...createData, owner_id: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Log Complaint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
