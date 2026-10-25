"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  ArrowRight,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  ChevronRight,
  Info,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Lead, LeadStage } from "@/types/database";

const PIPELINE_STAGES: { stage: LeadStage; label: string; color: string }[] = [
  { stage: "new", label: "New Leads", color: "border-t-blue-500" },
  { stage: "qualified", label: "Qualified", color: "border-t-indigo-500" },
  { stage: "proposal", label: "Proposal", color: "border-t-purple-500" },
  { stage: "negotiation", label: "Negotiation", color: "border-t-amber-500" },
  { stage: "won", label: "Won Deals", color: "border-t-emerald-500" },
  { stage: "lost", label: "Lost Deals", color: "border-t-gray-400" },
];

const STAGE_EXPLANATIONS: Record<LeadStage, { title: string; desc: string; nextStep: string }> = {
  new: {
    title: "Initial Customer Interest",
    desc: "The customer signed up on a waitlist, asked about shoe drop availability, or requested early-access notification.",
    nextStep: "Reach out to verify their preferred shoe model, sizing, and quantity.",
  },
  qualified: {
    title: "Sizing & Model Confirmed",
    desc: "Shoe model and sizing are verified in stock (or scheduled for drop release), and customer is ready to buy.",
    nextStep: "Send a pre-order invoice or private VIP checkout link.",
  },
  proposal: {
    title: "Invoice or Pre-Order Link Dispatched",
    desc: "The customer has received the payment link, early-bird coupon code, or bulk team quote.",
    nextStep: "Follow up to answer any questions and assist them with completing checkout.",
  },
  negotiation: {
    title: "Reviewing Terms & Holding Payment",
    desc: "Customer is reviewing final options, warranty guarantees, or holding payment.",
    nextStep: "Address any blockers or complaints immediately to secure the sale.",
  },
  won: {
    title: "Order Paid & Closed 👟",
    desc: "Customer completed checkout! Payment has been captured and shoes are queued for dispatch.",
    nextStep: "Ensure quick fulfillment and request product feedback once delivered.",
  },
  lost: {
    title: "Opportunity Lost",
    desc: "Customer canceled their reservation, opted for another brand, or did not complete checkout.",
    nextStep: "Log the lost reason for product R&D insights.",
  },
};

export default function LeadsPage() {
  const { leads, addLead, updateLead, moveLead, deleteLead, members, customers, complaints, user } = useApp();

  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Lead inspection window modal
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Create lead modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    company: "",
    source: "VIP Sneaker Drop",
    value: 250,
    stage: "new" as LeadStage,
    owner_id: user.id,
    expected_close_date: "",
    customer_id: "",
    notes: "",
  });

  // Edit lead modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchQuery =
        l.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStage = stageFilter === "all" || l.stage === stageFilter;
      return matchQuery && matchStage;
    });
  }, [leads, searchTerm, stageFilter]);

  // Pipeline metrics
  const activeLeads = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const openValue = activeLeads.reduce((acc, l) => acc + l.value, 0);
  const wonLeads = leads.filter((l) => l.stage === "won");
  const wonValue = wonLeads.reduce((acc, l) => acc + l.value, 0);
  const closedLeads = leads.filter((l) => ["won", "lost"].includes(l.stage));
  const conversionRate = closedLeads.length > 0 ? Math.round((wonLeads.length / closedLeads.length) * 100) : 50;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name.trim() || !formData.contact_email.trim()) return;

    const assignedMember = members.find((m) => m.user_id === formData.owner_id);
    const linkedCust = customers.find((c) => c.id === formData.customer_id);

    addLead({
      contact_name: formData.contact_name.trim(),
      contact_email: formData.contact_email.trim(),
      company: formData.company.trim() || undefined,
      source: formData.source.trim() || undefined,
      value: Number(formData.value) || 0,
      stage: formData.stage,
      owner_id: formData.owner_id,
      owner_name: assignedMember?.display_name || user.display_name,
      customer_id: formData.customer_id || undefined,
      customer_name: linkedCust?.name,
      expected_close_date: formData.expected_close_date || undefined,
      notes: formData.notes.trim() || undefined,
    });

    setIsCreateOpen(false);
    setFormData({
      contact_name: "",
      contact_email: "",
      company: "",
      source: "VIP Sneaker Drop",
      value: 250,
      stage: "new",
      owner_id: user.id,
      expected_close_date: "",
      customer_id: "",
      notes: "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const assignedMember = members.find((m) => m.user_id === selectedLead.owner_id);
    updateLead(selectedLead.id, {
      ...selectedLead,
      owner_name: assignedMember?.display_name || selectedLead.owner_name,
    });
    setIsEditOpen(false);
    setSelectedLead(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Leads &amp; Sales Pipeline"
        subtitle="Manage deal flow across pipeline stages with win/loss tracking and conversion forecasting"
        actions={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Lead
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Pipeline Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500 uppercase">Active Pipeline Value</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(openValue)}</div>
            <p className="text-xs text-gray-400 mt-0.5">{activeLeads.length} deals in active progression</p>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500 uppercase">Won Closed Value</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(wonValue)}</div>
            <p className="text-xs text-gray-400 mt-0.5">{wonLeads.length} deals successfully closed</p>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500 uppercase">Win Conversion Rate</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{conversionRate}%</div>
            <p className="text-xs text-gray-400 mt-0.5">Based on {closedLeads.length} decided opportunities</p>
          </Card>
        </div>

        {/* Toolbar: Search, Filters, and View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search leads by contact name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                  viewMode === "board" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
                title="Board view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                  viewMode === "list" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === "board" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
            {PIPELINE_STAGES.map((col) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === col.stage);
              const stageValue = stageLeads.reduce((acc, l) => acc + l.value, 0);

              return (
                <div
                  key={col.stage}
                  className={`bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 border-t-4 ${col.color} flex flex-col min-h-[480px] shadow-2xs`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/80">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">{col.label}</h3>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {formatCurrency(stageValue)}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-1.5 py-0.5 bg-white rounded border border-gray-200 text-gray-600">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards inside Stage */}
                  <div className="space-y-2.5 flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No leads in this stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setViewingLead(lead)}
                          className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group text-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold text-gray-900 group-hover:text-indigo-600 truncate">
                              {lead.contact_name}
                            </span>
                            <span className="font-bold text-indigo-700 shrink-0">
                              {formatCurrency(lead.value)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-full">
                              {lead.lead_type || lead.source || "Shoe Lead"}
                            </Badge>
                          </div>

                          {lead.notes && (
                            <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                              &ldquo;{lead.notes}&rdquo;
                            </p>
                          )}

                          <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
                            <span>Owner: {lead.owner_name?.split(" ")[0] || "Team"}</span>
                            {lead.expected_close_date && (
                              <span>Due: {formatDate(lead.expected_close_date)}</span>
                            )}
                          </div>

                          {/* Quick stage transition button */}
                          <div className="pt-1 flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={lead.stage}
                              onValueChange={(val) => moveLead(lead.id, val as LeadStage)}
                            >
                              <SelectTrigger className="h-6 text-[10px] px-1.5 bg-gray-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PIPELINE_STAGES.map((s) => (
                                  <SelectItem key={s.stage} value={s.stage} className="text-xs">
                                    Move to {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingLead(lead);
                                }}
                                className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                title="Click to view explanation"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setIsEditOpen(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-700 rounded"
                                title="Edit lead"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <Card className="overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Contact &amp; Email</th>
                    <th className="py-3 px-4">Deal Value</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Opportunity Type</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Target Close</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setViewingLead(lead)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 group-hover:text-indigo-600 block">{lead.contact_name}</span>
                        <span className="text-xs text-gray-500">{lead.contact_email}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{formatCurrency(lead.value)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 px-2">
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 font-medium bg-gray-100 text-gray-700">
                          {lead.lead_type || lead.source || "Shoe Lead"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{lead.owner_name || "Unassigned"}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {lead.expected_close_date ? formatDate(lead.expected_close_date) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingLead(lead)}
                            className="h-8 text-xs text-indigo-600 hover:bg-indigo-50"
                          >
                            <Info className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsEditOpen(true);
                            }}
                            className="h-8 text-xs text-gray-600"
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Sales Opportunity</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Contact Name *</Label>
                <Input
                  required
                  placeholder="Jane Doe"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Contact Email *</Label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Campaign / Source</Label>
                <Input
                  placeholder="e.g. VIP Club or WinterBoot"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Opportunity Value ($)</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="25"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Initial Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(val) => setFormData({ ...formData, stage: val as LeadStage })}
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.stage} value={s.stage}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Target Close Date</Label>
                <Input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Owner</Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={(val) => setFormData({ ...formData, owner_id: val })}
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

              <div>
                <Label className="text-xs">Lead Source</Label>
                <Input
                  placeholder="Website, Referral, Event"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Deal Notes &amp; Strategy</Label>
              <Textarea
                placeholder="RFP requirements, decision makers, budget notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 text-xs"
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Opportunity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      {selectedLead && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Deal: {selectedLead.contact_name}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Contact Name</Label>
                  <Input
                    required
                    value={selectedLead.contact_name}
                    onChange={(e) => setSelectedLead({ ...selectedLead, contact_name: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Deal Value ($)</Label>
                  <Input
                    required
                    type="number"
                    value={selectedLead.value}
                    onChange={(e) => setSelectedLead({ ...selectedLead, value: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Stage</Label>
                  <Select
                    value={selectedLead.stage}
                    onValueChange={(val) => setSelectedLead({ ...selectedLead, stage: val as LeadStage })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((s) => (
                        <SelectItem key={s.stage} value={s.stage}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Owner</Label>
                  <Select
                    value={selectedLead.owner_id}
                    onValueChange={(val) => setSelectedLead({ ...selectedLead, owner_id: val })}
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

              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea
                  value={selectedLead.notes || ""}
                  onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>

              <DialogFooter className="flex justify-between items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this opportunity?")) {
                      deleteLead(selectedLead.id);
                      setIsEditOpen(false);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 h-8"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Lead Explanation & Details Modal Window */}
      {viewingLead && (() => {
        const linkedCustomer = customers.find(
          (c) => c.id === viewingLead.customer_id || c.email === viewingLead.contact_email
        );
        const customerComplaints = complaints.filter(
          (c) =>
            (c.customer_id === linkedCustomer?.id || c.customer_email === viewingLead.contact_email) &&
            c.status !== "resolved"
        );
        const stageInfo = STAGE_EXPLANATIONS[viewingLead.stage] || {
          title: viewingLead.stage,
          desc: "Opportunity in progression.",
          nextStep: "Follow up with customer.",
        };

        return (
          <Dialog open={Boolean(viewingLead)} onOpenChange={(open) => !open && setViewingLead(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <div className="flex items-start justify-between gap-3 pr-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold text-gray-900">
                        {viewingLead.contact_name}
                      </DialogTitle>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold py-0.5 px-2 border-indigo-200 bg-indigo-50 text-indigo-700"
                      >
                        {viewingLead.stage}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{viewingLead.contact_email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block font-medium">Potential Revenue</span>
                    <span className="text-xl font-extrabold text-indigo-700">
                      {formatCurrency(viewingLead.value)}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3.5 pt-1 text-xs">
                {/* Section 1: Plain-English Opportunity Explanation */}
                <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>What is this opportunity?</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold bg-white border border-gray-200 text-gray-800">
                      {viewingLead.lead_type || viewingLead.source || "Shoe Order"}
                    </Badge>
                    {viewingLead.expected_close_date && (
                      <span className="text-gray-500 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Target Close: {formatDate(viewingLead.expected_close_date)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {viewingLead.notes || "Customer inquiry for upcoming footwear line."}
                  </p>
                </div>

                {/* Section 2: Stage Progress & Next Step */}
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      Stage: {stageInfo.title}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">{stageInfo.desc}</p>
                  <div className="pt-1.5 border-t border-indigo-100/80 text-[11px] text-indigo-900 font-medium">
                    <span className="text-indigo-600 font-bold">Next Action:</span> {stageInfo.nextStep}
                  </div>
                </div>

                {/* Section 3: CRM Connection: Complaint / Churn Alert */}
                {customerComplaints.length > 0 ? (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>⚠️ High Churn Risk: Customer Holding Payment!</span>
                    </div>
                    <p className="text-[11px] text-red-700 leading-normal">
                      This customer has <strong>{customerComplaints.length} open complaint(s)</strong> (e.g. <em>&ldquo;{customerComplaints[0].title}&rdquo;</em>).
                      They are withholding payment on this <strong>{formatCurrency(viewingLead.value)}</strong> order until their issue is resolved!
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/complaints"
                        className="text-xs text-red-900 font-bold underline hover:text-red-700 inline-flex items-center gap-1"
                      >
                        Go to Complaints Desk to resolve this ticket →
                      </Link>
                    </div>
                  </div>
                ) : linkedCustomer ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Customer in healthy standing: <strong>{linkedCustomer.health_score}/100 Health</strong>
                      </span>
                    </div>
                    <Link
                      href={`/customers/${linkedCustomer.id}`}
                      className="text-indigo-700 font-semibold underline text-[11px] flex items-center gap-0.5"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : null}

                {/* Section 4: Stage Actions */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const toEdit = viewingLead;
                      setViewingLead(null);
                      setSelectedLead(toEdit);
                      setIsEditOpen(true);
                    }}
                    className="h-8 text-xs"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit Deal
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {viewingLead.stage !== "won" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          moveLead(viewingLead.id, "won");
                          setViewingLead({ ...viewingLead, stage: "won" });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark as Won 👟
                      </Button>
                    )}
                    {viewingLead.stage !== "lost" && viewingLead.stage !== "won" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          moveLead(viewingLead.id, "lost");
                          setViewingLead({ ...viewingLead, stage: "lost" });
                        }}
                        className="text-gray-600 hover:text-red-600 h-8 text-xs"
                      >
                        Mark as Lost
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setViewingLead(null)}
                      className="h-8 text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
