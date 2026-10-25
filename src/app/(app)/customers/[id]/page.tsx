"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Heart,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquare,
  FileText,
  PhoneCall,
  Users,
  Target,
  Edit,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import type { ActivityType, CustomerStatus } from "@/types/database";

function CustomerDetailInner() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const {
    customers,
    updateCustomer,
    deleteCustomer,
    complaints,
    leads,
    purchases,
    activities,
    recommendations,
    addActivity,
    updateRecommendation,
    members,
    user,
  } = useApp();

  const customer = customers.find((c) => c.id === customerId);

  // Activity modal state
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");

  // Edit customer modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    company: customer?.company || "",
    status: (customer?.status || "active") as CustomerStatus,
    importance: customer?.importance || 3,
    owner_id: customer?.owner_id || user.id,
    notes: customer?.notes || "",
  });

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Customer Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">This record does not exist or may have been deleted.</p>
        <Link href="/customers" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  // Related items
  const custPurchases = purchases.filter((p) => p.customer_id === customer.id);
  const custActivities = activities.filter((a) => a.customer_id === customer.id);
  const custComplaints = complaints.filter((c) => c.customer_id === customer.id);
  const custLeads = leads.filter((l) => l.customer_id === customer.id);
  const custRecs = recommendations.filter((r) => r.customer_id === customer.id && r.status === "pending");

  const totalSpent = custPurchases.reduce((acc, p) => acc + p.amount, 0);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    addActivity({
      customer_id: customer.id,
      type: activityType,
      title: activityTitle.trim(),
      description: activityDesc.trim() || undefined,
    });

    setActivityTitle("");
    setActivityDesc("");
    setIsActivityOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedMember = members.find((m) => m.user_id === editData.owner_id);

    updateCustomer(customer.id, {
      ...editData,
      owner_name: assignedMember?.display_name || user.display_name,
    });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      deleteCustomer(customer.id);
      router.push("/customers");
    }
  };

  const healthBandStyles: Record<string, string> = {
    healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "at-risk": "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  const activityIcons: Record<string, React.ReactNode> = {
    call: <PhoneCall className="w-3.5 h-3.5 text-blue-600" />,
    email: <Mail className="w-3.5 h-3.5 text-purple-600" />,
    meeting: <Users className="w-3.5 h-3.5 text-emerald-600" />,
    note: <FileText className="w-3.5 h-3.5 text-gray-600" />,
    purchase: <DollarSign className="w-3.5 h-3.5 text-green-600" />,
    complaint: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
    lead_update: <Target className="w-3.5 h-3.5 text-indigo-600" />,
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title={customer.name}
        subtitle={`Solez Customer Profile · Member since ${formatDate(customer.created_at)}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Customers
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditData({
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone || "",
                  company: customer.company || "",
                  status: customer.status,
                  importance: customer.importance,
                  owner_id: customer.owner_id || user.id,
                  notes: customer.notes || "",
                });
                setIsEditOpen(true);
              }}
              className="h-9 text-xs"
            >
              <Edit className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
            {user.role === "admin" && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="h-9 text-xs text-red-600 hover:text-red-700">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Top Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Account Profile & Contact */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">Account Details</CardTitle>
                  <CardDescription className="text-xs">Primary contact details &amp; preferences</CardDescription>
                </div>
                <Badge variant="outline" className={`text-xs uppercase font-bold py-0.5 px-2 ${healthBandStyles[customer.health_band || "healthy"]}`}>
                  {customer.health_band || "healthy"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Email Address</span>
                  <span className="text-gray-900 font-semibold">{customer.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Phone</span>
                  <span className="text-gray-900 font-semibold">{customer.phone || "Not recorded"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Account Owner</span>
                  <span className="text-gray-900 font-semibold">{customer.owner_name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Customer Importance</span>
                  <span className="text-gray-900 font-semibold">{customer.importance} / 5</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-xs text-gray-400 block font-medium mb-1.5">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              {customer.notes && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700 block mb-0.5">Internal Notes:</span>
                  <p className="text-gray-600">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Explainable Health & Retention Score */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">Health &amp; Churn Risk</CardTitle>
                  <CardDescription className="text-xs">Explainable retention signals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-gray-900">{customer.health_score || 85}</span>
                <span className="text-xs font-semibold text-gray-500">out of 100</span>
              </div>
              <Progress value={customer.health_score || 85} className="h-2 bg-gray-100" />

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Contributing Signals
                </span>
                {customer.health_signals && customer.health_signals.length > 0 ? (
                  customer.health_signals.map((sig, idx) => (
                    <div key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{sig}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No negative churn signals triggered.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Follow-up Recommendations for This Customer */}
        {custRecs.length > 0 && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Recommended Follow-Up Action</span>
            </div>
            <div className="space-y-2">
              {custRecs.map((rec) => (
                <div key={rec.id} className="p-3 bg-white rounded-lg border border-indigo-100 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{rec.title}</span>
                    <p className="text-gray-600 mt-0.5">{rec.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                    onClick={() => updateRecommendation(rec.id, "completed", "Done from customer detail page")}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Done
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline & Log Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Communication Timeline */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-gray-900">Communication &amp; Activity</CardTitle>
                    <CardDescription className="text-xs">Interaction history across calls, meetings, and emails</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsActivityOpen(true)}
                    className="h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Log Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {custActivities.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">
                    No recent activities logged for this customer.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {custActivities.map((act) => (
                      <div key={act.id} className="relative">
                        <div className="absolute -left-6 top-1 p-1 bg-white rounded-full border border-gray-300">
                          {activityIcons[act.type] || <MessageSquare className="w-3 h-3 text-gray-500" />}
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{act.title}</span>
                            <span className="text-[10px] text-gray-400">{formatRelativeTime(act.created_at)}</span>
                          </div>
                          {act.description && <p className="text-gray-600 mt-1">{act.description}</p>}
                          <span className="text-[10px] text-gray-400 block mt-1.5">
                            By {act.performer_name || "Team Member"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Associated Leads / Deals */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900">Associated Leads &amp; Deals</CardTitle>
                <CardDescription className="text-xs">Sales pipeline opportunities linked to this account</CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 text-xs">
                {custLeads.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No active leads or deals associated.</p>
                ) : (
                  custLeads.map((lead) => (
                    <div key={lead.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{lead.contact_name}</span>
                        <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 px-1.5">
                            {lead.stage}
                          </Badge>
                          <span>Value: <strong>{formatCurrency(lead.value)}</strong></span>
                        </div>
                      </div>
                      <Link href={`/leads?selected=${lead.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                          View Deal
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Complaints & Purchases */}
          <div className="space-y-6">
            {/* Associated Complaints */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900">Complaints &amp; Support</CardTitle>
                <CardDescription className="text-xs">Open tickets and SLA status</CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 text-xs">
                {custComplaints.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No complaints reported.</p>
                ) : (
                  custComplaints.map((c) => (
                    <div key={c.id} className="p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 truncate">{c.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold py-0 px-1.5 ${
                            c.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-gray-500 line-clamp-2 mt-1">{c.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Severity: {c.severity}/5</span>
                        <Link href={`/complaints?selected=${c.id}`} className="text-indigo-600 hover:underline">
                          View details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Purchase History */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-900">Purchase History</CardTitle>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    LTV: {formatCurrency(totalSpent)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 text-xs">
                {custPurchases.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No recorded purchases.</p>
                ) : (
                  custPurchases.map((pur) => (
                    <div key={pur.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{pur.description}</span>
                        <span className="text-[10px] text-gray-400 block">{formatDate(pur.purchased_at)}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(pur.amount)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Log Activity Dialog */}
      <Dialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity for {customer.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddActivity} className="space-y-3">
            <div>
              <Label className="text-xs">Activity Type</Label>
              <Select value={activityType} onValueChange={(val) => setActivityType(val as ActivityType)}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Internal Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Subject / Title *</Label>
              <Input
                required
                placeholder="e.g. Discussed Q3 renewal pricing"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Details / Outcome</Label>
              <Textarea
                placeholder="Notes on what was agreed or next steps..."
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                className="mt-1 text-xs"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsActivityOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div>
              <Label className="text-xs">Name *</Label>
              <Input
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  required
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={editData.status}
                onValueChange={(val) => setEditData({ ...editData, status: val as CustomerStatus })}
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Account Owner</Label>
              <Select
                value={editData.owner_id}
                onValueChange={(val) => setEditData({ ...editData, owner_id: val })}
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.display_name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="mt-1 text-xs"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Update Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading customer profile...</div>}>
      <CustomerDetailInner />
    </React.Suspense>
  );
}
