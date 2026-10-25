import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartCRM — Intelligent CRM & Retention Platform",
  description: "A proactive, responsive CRM for small and mid-sized businesses with explainable churn risk and customer retention insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
