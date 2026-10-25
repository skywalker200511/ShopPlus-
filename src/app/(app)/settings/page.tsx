"use client";

import React, { useState } from "react";
import {
  Settings,
  Users,
  Shield,
  ShieldCheck,
  Key,
  Database,
  Building,
  UserCheck,
  CheckCircle2,
  Lock,
  History,
  Info,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, getInitials } from "@/lib/utils";
import type { UserRole } from "@/types/database";

export default function SettingsPage() {
  const { user, members, isDemoMode } = useApp();

  const [activeTab, setActiveTab] = useState<"team" | "roles" | "audit" | "env">("team");
  const [workspaceName, setWorkspaceName] = useState("Solez");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    manager: "bg-blue-100 text-blue-800 border-blue-200",
    employee: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Settings & Access Governance"
        subtitle="Manage workspace profile, team memberships, role-based access control (RBAC), and database connections"
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-6 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "team"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team & Members ({members.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "roles"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Role Permissions (RBAC)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("env")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "env"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Connection</span>
          </button>
        </div>

        {/* Tab 1: Team & Workspace Members */}
        {activeTab === "team" && (
          <div className="space-y-6">
            {/* Workspace Settings */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900">Workspace Profile</CardTitle>
                <CardDescription className="text-xs">
                  Organization branding and workspace scoping
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleSaveWorkspace} className="space-y-4 max-w-md">
                  <div>
                    <Label className="text-xs">Workspace Name</Label>
                    <Input
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Workspace Slug</Label>
                    <Input disabled value="solez" className="mt-1 h-9 text-xs bg-gray-50 text-gray-500" />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      Update Workspace
                    </Button>
                    {savedSuccess && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Changes saved
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Team Members List */}
            <Card className="overflow-hidden border border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-gray-900">Workspace Members &amp; Roles</CardTitle>
                    <CardDescription className="text-xs">
                      Staff members authorized to access this workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Date Added</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(m.display_name)}
                          </div>
                          <span>{m.display_name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{m.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0.5 px-2 ${roleColors[m.role]}`}>
                            {m.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{formatDate(m.created_at)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Role Permissions (RBAC Matrix) */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900">Role-Based Access Control (RBAC) Matrix</CardTitle>
                <CardDescription className="text-xs">
                  Enforced on server actions and mirrored in PostgreSQL Row Level Security (RLS) policies
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px] uppercase">
                      <th className="py-3 px-4">Action / Resource</th>
                      <th className="py-3 px-4 text-purple-700 font-bold">Admin</th>
                      <th className="py-3 px-4 text-blue-700 font-bold">Manager</th>
                      <th className="py-3 px-4 text-emerald-700 font-bold">Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Workspace settings &amp; billing</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-gray-400">Read Only</td>
                      <td className="py-2.5 px-4 text-gray-300">No Access</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Manage team members &amp; roles</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-gray-300">No Access</td>
                      <td className="py-2.5 px-4 text-gray-300">No Access</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">All customer records &amp; export</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-blue-600 font-medium">Assigned Only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Pipeline &amp; Deal Management</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-blue-600 font-medium">Assigned Only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Complaint resolution &amp; SLA override</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-blue-600 font-medium">Can add notes &amp; resolve</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Bulk CSV Import</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">Full Access</td>
                      <td className="py-2.5 px-4 text-gray-300">No Access</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Supabase Connection Setup */}
        {activeTab === "env" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900">Supabase Database Integration</CardTitle>
                <CardDescription className="text-xs">
                  Connect your PostgreSQL database with Supabase Auth and Row Level Security
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                  <span className="font-bold block mb-1">Current Configuration Status:</span>
                  {isDemoMode ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Demo Mode Active (No external credentials configured)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Connected to live Supabase project
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-gray-900 block">Required Environment Variables:</span>
                  <div className="p-3 bg-gray-900 text-gray-100 font-mono rounded-lg space-y-1 text-xs">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here</div>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    See <code>supabase/migrations/001_initial_schema.sql</code> and <code>supabase/seed.sql</code> in the
                    repository for schema migration commands and seed data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
