"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Target,
  MessageSquareWarning,
  Sparkles,
  Upload,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/leads", label: "Leads & Sales", icon: Target },
  { href: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
  { href: "/import", label: "Import & Quality", icon: Upload },
  { href: "/settings", label: "Users & Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isDemoMode, dashboardMetrics } = useApp();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Workspace Branding */}
      <div className={cn("flex items-center gap-3 px-4 py-4 border-b border-gray-200", collapsed && "justify-center px-2")}>
        <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-lg shrink-0 shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-gray-900 tracking-tight">SmartCRM</h1>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">Pro</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{user.workspace_name}</p>
          </div>
        )}
      </div>

      {/* Demo Mode / Proactive Alert Tag */}
      {isDemoMode && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-amber-50/80 border border-amber-200/80 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Demo Mode Active</span>
          </div>
          <p className="text-[11px] text-amber-700/90 mt-0.5 leading-tight">
            Using deterministic rules &amp; sample seed data.
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const badgeCount =
            item.href === "/complaints" && dashboardMetrics.openComplaints > 0
              ? dashboardMetrics.openComplaints
              : item.href === "/insights" && dashboardMetrics.churnRiskCount > 0
              ? dashboardMetrics.churnRiskCount
              : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {badgeCount !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                        item.href === "/complaints" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className={cn("border-t border-gray-200 p-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
              {getInitials(user.display_name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                {getInitials(user.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.display_name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop expand/collapse toggle */}
      <div className="hidden lg:block border-t border-gray-200 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center h-8 text-gray-400 hover:text-gray-700"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top trigger */}
      <button
        type="button"
        className="lg:hidden fixed top-3.5 left-3 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop fixed sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-200 h-screen transition-all duration-200 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
