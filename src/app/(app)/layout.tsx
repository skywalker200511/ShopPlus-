import React, { Suspense } from "react";
import { AppProvider } from "@/contexts/app-context";
import { Sidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <TooltipProvider>
        <div className="flex h-screen bg-slate-50/60 overflow-hidden text-slate-900">
          <Suspense fallback={<div className="w-64 bg-white border-r border-gray-200" />}>
            <Sidebar />
          </Suspense>
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading...</div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </TooltipProvider>
    </AppProvider>
  );
}
