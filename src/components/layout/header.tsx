"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, X, Shield, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { globalSearch, recommendations, user } = useApp();
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const searchResults = searchQuery.trim().length >= 2 ? globalSearch(searchQuery) : [];
  const pendingRecsCount = recommendations.filter((r) => r.status === "pending").length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (item: { type: string; id: string }) => {
    setSearchOpen(false);
    setSearchQuery("");
    if (item.type === "customer") {
      router.push(`/customers/${item.id}`);
    } else if (item.type === "lead") {
      router.push(`/leads?selected=${item.id}`);
    } else if (item.type === "complaint") {
      router.push(`/complaints?selected=${item.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Title area & mobile spacer */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
            </div>
            {subtitle && <p className="text-xs text-gray-500 hidden sm:block mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Global Search and Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Bar */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <div className="relative">
                <Input
                  autoFocus
                  placeholder="Search customers, leads, tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 sm:w-80 h-9 pr-8 text-xs sm:text-sm bg-gray-50"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-4 h-4" />
                </button>

                {searchQuery.trim().length >= 2 && (
                  <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                      <span>Search Results ({searchResults.length})</span>
                      <span className="text-[10px] text-gray-400">Esc to close</span>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">
                        No matches found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {searchResults.map((res) => (
                          <button
                            key={`${res.type}-${res.id}`}
                            type="button"
                            onClick={() => handleSelectResult(res)}
                            className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/50 flex items-start gap-2.5 transition-colors"
                          >
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                                res.type === "customer"
                                  ? "bg-blue-100 text-blue-700"
                                  : res.type === "lead"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {res.type}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-900 truncate">{res.title}</p>
                              <p className="text-[11px] text-gray-500 truncate">{res.subtitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 h-9 px-3 text-xs sm:text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded">
                  /
                </kbd>
              </button>
            )}
          </div>

          {/* Quick link to Insights / Recommendations */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/insights")}
            className="relative h-9 px-2.5 text-xs text-gray-700"
            title="Proactive AI insights and pending recommendations"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 sm:mr-1.5" />
            <span className="hidden sm:inline">Insights</span>
            {pendingRecsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                {pendingRecsCount}
              </span>
            )}
          </Button>

          {/* Context actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
