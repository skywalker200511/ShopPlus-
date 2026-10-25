import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "churned"]),
  owner_id: z.string().uuid().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  importance: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const leadSchema = z.object({
  contact_name: z.string().min(1, "Contact name is required").max(200),
  contact_email: z.string().email("Invalid email address"),
  company: z.string().max(200).optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
  value: z.number().min(0, "Value must be positive"),
  stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]),
  owner_id: z.string().uuid().optional().or(z.literal("")),
  expected_close_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  customer_id: z.string().uuid().optional().or(z.literal("")),
});

export const complaintSchema = z.object({
  customer_id: z.string().uuid("Customer is required"),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().min(1, "Description is required").max(10000),
  severity: z.number().int().min(1).max(5),
  owner_id: z.string().uuid().optional().or(z.literal("")),
  sla_due_at: z.string().optional().or(z.literal("")),
});

export const complaintNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(5000),
  is_internal: z.boolean().default(true),
});

export const csvRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["active", "inactive", "churned"]).optional(),
  tags: z.string().optional(),
  importance: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type ComplaintNoteInput = z.infer<typeof complaintNoteSchema>;
