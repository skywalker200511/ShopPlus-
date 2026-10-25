"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Tag,
  Heart,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency, formatDate, getInitials, normalizeEmail } from "@/lib/utils";
import type { Customer, CustomerStatus } from "@/types/database";

export default function CustomersPage() {
  const { customers, addCustomer, checkDuplicateEmail, members, user } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // New customer dialog & duplicate detection
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active" as CustomerStatus,
    importance: 3,
    owner_id: user.id,
    tags: "saas, enterprise",
    notes: "",
  });
  const [duplicateWarning, setDuplicateWarning] = useState<Customer | null>(null);

  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    if (email.trim().length > 3) {
      const match = checkDuplicateEmail(email);
      setDuplicateWarning(match || null);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const assignedMember = members.find((m) => m.user_id === formData.owner_id);

    addCustomer({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      company: formData.company.trim() || undefined,
      status: formData.status,
      importance: Number(formData.importance),
      owner_id: formData.owner_id,
      owner_name: assignedMember?.display_name || user.display_name,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: formData.notes.trim() || undefined,
      total_purchases: 0,
      total_revenue: 0,
      open_complaints_count: 0,
    });

    setIsCreateOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "active",
      importance: 3,
      owner_id: user.id,
      tags: "saas",
      notes: "",
    });
    setDuplicateWarning(null);
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesHealth = healthFilter === "all" || c.health_band === healthFilter;

      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [customers, searchTerm, statusFilter, healthFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const healthBandStyles: Record<string, string> = {
    healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "at-risk": "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  const statusStyles: Record<string, string> = {
    active: "bg-blue-50 text-blue-700 border-blue-200",
    inactive: "bg-gray-100 text-gray-700 border-gray-200",
    churned: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Customers"
        subtitle="Comprehensive customer accounts, relationship health tracking, and churn signals"
        actions={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Customer
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, company, email, or tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs sm:text-sm bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>

            {/* Health Band Filter */}
            <Select
              value={healthFilter}
              onValueChange={(val) => {
                setHealthFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-xs bg-white">
                <SelectValue placeholder="Health Band" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="healthy">Healthy (70-100)</SelectItem>
                <SelectItem value="at-risk">At-Risk (40-69)</SelectItem>
                <SelectItem value="critical">Critical (0-39)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customer Records Table */}
        <Card className="overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Name & Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Health & Risk</th>
                  <th className="py-3 px-4">Account Owner</th>
                  <th className="py-3 px-4">Purchases</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      No customers match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-3.5 px-4">
                        <Link href={`/customers/${c.id}`} className="font-semibold text-gray-900 group-hover:text-indigo-600 block">
                          {c.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{c.email}</span>
                          {c.phone && (
                            <>
                              <span className="text-gray-300">·</span>
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{c.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 px-2 ${statusStyles[c.status]}`}>
                          {c.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase py-0 px-1.5 ${healthBandStyles[c.health_band || "healthy"]}`}
                          >
                            {c.health_band || "healthy"}
                          </Badge>
                          <span className="text-xs font-semibold text-gray-700">
                            {c.health_score || 85}
                          </span>
                        </div>
                        {c.health_signals && c.health_signals.length > 0 && (
                          <p className="text-[11px] text-gray-500 truncate max-w-[200px] mt-0.5">
                            {c.health_signals[0]}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        {c.owner_name || "Unassigned"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900">
                          {c.total_revenue ? formatCurrency(c.total_revenue) : "$0"}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {c.total_purchases || 0} order(s)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/customers/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-800">
                            View <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Customer Dialog with Normalized Email Duplicate Check */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new customer profile. Email normalization prevents duplicate records.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-3.5">
            <div>
              <Label className="text-xs">Customer Name *</Label>
              <Input
                required
                placeholder="e.g. Marcus Brody"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Email Address *</Label>
              <Input
                required
                type="email"
                placeholder="e.g. customer@example.com"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
              {/* Duplicate Detection Alert */}
              {duplicateWarning && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duplicate Warning:</span> A customer with email{" "}
                    <strong>{duplicateWarning.email}</strong> already exists:{" "}
                    <Link
                      href={`/customers/${duplicateWarning.id}`}
                      className="underline text-indigo-700 font-semibold"
                      target="_blank"
                    >
                      {duplicateWarning.name}
                    </Link>
                    . Creating this will save an additional record with the same email.
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Phone Number</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as CustomerStatus })}
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
                  value={formData.owner_id}
                  onValueChange={(val) => setFormData({ ...formData, owner_id: val })}
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
            </div>

            <div>
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                placeholder="saas, enterprise, key-account"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
