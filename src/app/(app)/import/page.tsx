"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  ArrowRight,
  ShieldAlert,
  Info,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useApp } from "@/contexts/app-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeEmail, generateId } from "@/lib/utils";
import type { Customer, ImportJob } from "@/types/database";

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  status: "valid" | "invalid" | "duplicate";
  errors: string[];
}

export default function ImportPage() {
  const { customers, addCustomer, addImportJob, user } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "",
    tags: "",
  });

  const [step, setStep] = useState<"upload" | "map" | "preview" | "summary">("upload");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "create_copy">("skip");
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  // Sample CSV generator for convenient user testing
  const handleDownloadSampleCsv = () => {
    const csvContent =
      "Full Name,Email Address,Telephone,Account Status,Shoe Preferences\n" +
      "David Sterling,dsterling@gmail.com,+1 555-234-5679,active,marathon-running\n" +
      "Rachel Green,rachel.green@outlook.com,+1 555-345-6790,active,daily-lifestyle\n" +
      "Laura Miller,laura.miller@yahoo.com,+1 555-888-9900,active,trail-hiking\n" +
      "Pending Verification,missing-at-sign.com,+1 555-000-1111,active,quality-test\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "smartcrm_sample_customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    Papa.parse<Record<string, string>>(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fileHeaders = results.meta.fields || [];
        setHeaders(fileHeaders);
        setRawData(results.data);

        // Auto-guess sensible mapping
        const autoMap: Record<string, string> = {
          name: "",
          email: "",
          phone: "",
          company: "",
          status: "",
          tags: "",
        };

        fileHeaders.forEach((h) => {
          const lower = h.toLowerCase();
          if (lower.includes("name")) autoMap.name = h;
          else if (lower.includes("email") || lower.includes("mail")) autoMap.email = h;
          else if (lower.includes("phone") || lower.includes("tel")) autoMap.phone = h;
          else if (lower.includes("comp") || lower.includes("org")) autoMap.company = h;
          else if (lower.includes("stat")) autoMap.status = h;
          else if (lower.includes("tag")) autoMap.tags = h;
        });

        setColumnMapping(autoMap as typeof columnMapping);
        setStep("map");
      },
    });
  };

  const handleProcessValidation = () => {
    if (!columnMapping.name || !columnMapping.email) {
      alert("Please map at least Name and Email fields.");
      return;
    }

    const rows: ParsedRow[] = [];
    const seenEmailsInFile = new Set<string>();

    rawData.forEach((row, idx) => {
      const rowNum = idx + 1;
      const errors: string[] = [];
      const rawName = row[columnMapping.name]?.trim() || "";
      const rawEmail = row[columnMapping.email]?.trim() || "";

      if (!rawName) {
        errors.push("Missing customer name");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!rawEmail) {
        errors.push("Missing email address");
      } else if (!emailRegex.test(rawEmail)) {
        errors.push(`Invalid email format: "${rawEmail}"`);
      }

      const normalized = normalizeEmail(rawEmail);
      let isDuplicate = false;

      // Duplicate within file
      if (seenEmailsInFile.has(normalized)) {
        isDuplicate = true;
        errors.push("Duplicate email within uploaded CSV file");
      } else if (normalized) {
        seenEmailsInFile.add(normalized);
      }

      // Duplicate against existing CRM database
      const existingMatch = customers.find((c) => normalizeEmail(c.email) === normalized);
      if (existingMatch) {
        isDuplicate = true;
        errors.push(`Matches existing customer: ${existingMatch.name}`);
      }

      let status: "valid" | "invalid" | "duplicate" = "valid";
      if (errors.some((err) => err.includes("Invalid") || err.includes("Missing"))) {
        status = "invalid";
      } else if (isDuplicate) {
        status = "duplicate";
      }

      rows.push({
        rowNumber: rowNum,
        data: row,
        status,
        errors,
      });
    });

    setParsedRows(rows);
    setStep("preview");
  };

  const handleExecuteImport = () => {
    let imported = 0;
    let skipped = 0;

    parsedRows.forEach((row) => {
      if (row.status === "invalid") {
        skipped++;
        return;
      }

      if (row.status === "duplicate" && duplicateStrategy === "skip") {
        skipped++;
        return;
      }

      const nameVal = row.data[columnMapping.name]?.trim() || "Customer";
      const emailVal = row.data[columnMapping.email]?.trim() || "";
      const phoneVal = columnMapping.phone ? row.data[columnMapping.phone]?.trim() : undefined;
      const compVal = columnMapping.company ? row.data[columnMapping.company]?.trim() : undefined;
      const tagsVal = columnMapping.tags
        ? row.data[columnMapping.tags]?.split(",").map((t) => t.trim()).filter(Boolean)
        : ["imported"];

      addCustomer({
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        company: compVal,
        status: "active",
        importance: 3,
        owner_id: user.id,
        owner_name: user.display_name,
        tags: tagsVal || [],
        total_purchases: 0,
        total_revenue: 0,
        open_complaints_count: 0,
      });

      imported++;
    });

    setImportedCount(imported);
    setSkippedCount(skipped);

    addImportJob({
      id: generateId(),
      workspace_id: user.workspace_id,
      filename: file?.name || "import.csv",
      status: "completed",
      total_rows: parsedRows.length,
      imported_rows: imported,
      skipped_rows: skipped,
      failed_rows: parsedRows.filter((r) => r.status === "invalid").length,
      duplicate_rows: parsedRows.filter((r) => r.status === "duplicate").length,
      created_by: user.id,
      created_at: new Date().toISOString(),
    });

    setStep("summary");
  };

  const handleDownloadRejectedRows = () => {
    const rejected = parsedRows.filter((r) => r.status !== "valid");
    if (rejected.length === 0) return;

    const exportData = rejected.map((r) => ({
      Row: r.rowNumber,
      Status: r.status,
      Errors: r.errors.join("; "),
      ...r.data,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rejected_rows_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validRows = parsedRows.filter((r) => r.status === "valid");
  const duplicateRows = parsedRows.filter((r) => r.status === "duplicate");
  const invalidRows = parsedRows.filter((r) => r.status === "invalid");

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Data Imports &amp; Quality Control"
        subtitle="Upload customer records from CSV, map fields, inspect duplicates, and safely batch import"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSampleCsv}
            className="h-9 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Sample CSV
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          <div className={`p-2.5 rounded-lg border ${step === "upload" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white text-gray-500"}`}>
            1. Select File
          </div>
          <div className={`p-2.5 rounded-lg border ${step === "map" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white text-gray-500"}`}>
            2. Map Fields
          </div>
          <div className={`p-2.5 rounded-lg border ${step === "preview" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white text-gray-500"}`}>
            3. Validate &amp; Preview
          </div>
          <div className={`p-2.5 rounded-lg border ${step === "summary" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white text-gray-500"}`}>
            4. Completion
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <Card className="border-dashed border-2 border-gray-300 hover:border-indigo-400 transition-colors p-8 text-center">
            <CardContent className="space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Upload CSV Spreadsheet</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Supports customer lists exported from Salesforce, HubSpot, Shopify, or Excel.
                </p>
              </div>

              <div className="pt-2">
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs">
                    <Upload className="w-4 h-4" /> Browse CSV File
                  </div>
                </Label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <p className="text-[11px] text-gray-400">
                Need a template to test with? Use the &ldquo;Download Sample CSV&rdquo; button above.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Column Mapping */}
        {step === "map" && (
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">Map CSV Columns to SmartCRM</CardTitle>
              <CardDescription className="text-xs">
                File: <strong>{file?.name}</strong> ({rawData.length} rows detected)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <Label className="text-xs">Customer Full Name *</Label>
                  <Select
                    value={columnMapping.name}
                    onValueChange={(val) => setColumnMapping({ ...columnMapping, name: val })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue placeholder="Select CSV column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Email Address *</Label>
                  <Select
                    value={columnMapping.email}
                    onValueChange={(val) => setColumnMapping({ ...columnMapping, email: val })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue placeholder="Select CSV column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Phone Number</Label>
                  <Select
                    value={columnMapping.phone}
                    onValueChange={(val) => setColumnMapping({ ...columnMapping, phone: val })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Company / Organization</Label>
                  <Select
                    value={columnMapping.company}
                    onValueChange={(val) => setColumnMapping({ ...columnMapping, company: val })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setStep("upload")}>
                  Change File
                </Button>
                <Button size="sm" onClick={handleProcessValidation} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Validate &amp; Preview <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Validation Preview & Duplicate Options */}
        {step === "preview" && (
          <div className="space-y-4">
            {/* Validation Tally */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Card className="p-3.5 bg-emerald-50/70 border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900">{validRows.length} Valid Rows</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">Ready for immediate import</p>
              </Card>

              <Card className="p-3.5 bg-amber-50/70 border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-900">{duplicateRows.length} Duplicate Matches</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">Already present in database or duplicate in file</p>
              </Card>

              <Card className="p-3.5 bg-red-50/70 border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-red-900">{invalidRows.length} Invalid Rows</span>
                </div>
                <p className="text-[11px] text-red-700 mt-1">Missing required fields or bad emails</p>
              </Card>
            </div>

            {/* Duplicate Strategy Selector (Prevents silent overwrites) */}
            <Card className="p-4 bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">Duplicate Handling Policy</span>
                  <p className="text-gray-500 mt-0.5">
                    SmartCRM never silently overwrites customer records. Choose how duplicates should be handled:
                  </p>
                </div>
                <Select
                  value={duplicateStrategy}
                  onValueChange={(val) => setDuplicateStrategy(val as "skip" | "create_copy")}
                >
                  <SelectTrigger className="w-56 h-8 text-xs bg-white font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip duplicates (Safe default)</SelectItem>
                    <SelectItem value="create_copy">Import as separate profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Data Inspection Preview Table */}
            <Card className="overflow-hidden border border-gray-200">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Previewing First 10 Rows</span>
                {invalidRows.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadRejectedRows}
                    className="h-7 text-xs text-red-600 hover:text-red-700"
                  >
                    <Download className="w-3 h-3 mr-1" /> Download Rejected CSV Report
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3">Validation Status</th>
                      <th className="py-2.5 px-3">Customer Name</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Notes &amp; Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.slice(0, 10).map((r) => (
                      <tr key={r.rowNumber} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-mono text-gray-400">{r.rowNumber}</td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold py-0 px-1.5 ${
                              r.status === "valid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : r.status === "duplicate"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">
                          {r.data[columnMapping.name] || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {r.data[columnMapping.email] || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          {r.errors.length > 0 ? (
                            <span className="text-red-600">{r.errors.join("; ")}</span>
                          ) : (
                            <span className="text-emerald-600">Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setStep("map")}>
                  Back to Mapping
                </Button>
                <Button
                  size="sm"
                  onClick={handleExecuteImport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Confirm &amp; Import Valid Records ({validRows.length})
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === "summary" && (
          <Card className="p-8 text-center max-w-lg mx-auto">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Import Complete!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your customer records have been saved into the active workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl text-left text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Successfully Imported</span>
                  <span className="text-lg font-bold text-emerald-600">{importedCount} customers</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Skipped / Rejected</span>
                  <span className="text-lg font-bold text-amber-600">{skippedCount} rows</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {skippedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadRejectedRows}
                    className="text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Export Rejected Rows
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setParsedRows([]);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  Import Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
