
import { z } from 'zod';

export const AttachedFieldSchema = z.object({
  title: z.string(),
  type: z.string(),
  content: z.string(),
});

export const BaseDocGenSchema = z.object({
  doc_id: z.string().describe("Unique identifier for the document (e.g., PO number, Invoice number)."),
  created_at: z.string().describe("Date the document data instance refers to or was created on."), // ISO date string
  recipient_email: z.string().email().describe("Primary recipient email for this document."),
  attached_fields: z.array(AttachedFieldSchema).optional().default([]).describe("Optional list of annexed items to include in the document."),
});

export const CompanyInfoSchema = z.object({
  name: z.string(),
  address_line1: z.string(),
  address_line2: z.string(),
  phone: z.string(),
});

export const ContactInfoSchema = z.object({
  name: z.string(),
  title: z.string().optional().nullable().default(null),
  company_name: z.string(),
  address_line1: z.string(),
  address_line2: z.string(),
  tel: z.string(),
  email: z.string().email().optional().nullable().default(null),
});

export const GeneralPOInfoSchema = z.object({
  product_name: z.string(),
  shipped_via: z.string(),
  est_delivery_date: z.string(), // ISO date string
  payment_terms: z.string(),
});

export const ItemSchema = z.object({
  item_number: z.string(),
  quantity: z.number().int(),
  description: z.string(),
  barcode: z.string().optional().default(""),
  unit_price: z.number(),
  total: z.number(),
});

export const SummaryTotalsSchema = z.object({
  total_bottles: z.number().int(),
  subtotal: z.number(),
  shipping: z.number(),
  other_fees: z.number(),
  grand_total: z.number(),
  deposit: z.number(),
});

export const PackagingInstructionSchema = z.object({
  component: z.string(),
  instructions: z.string(),
});

export const AuthDetailsSchema = z.object({
  signature_date: z.string(), // ISO date string
  authority: z.string(),
});

export const PurchaseOrderSchema = BaseDocGenSchema.extend({
  company: CompanyInfoSchema,
  to_manufacturer: ContactInfoSchema,
  ship_to: ContactInfoSchema,
  general_po_info: GeneralPOInfoSchema,
  items: z.array(ItemSchema),
  remarks: z.string().optional().nullable().default(null),
  summary_totals: SummaryTotalsSchema,
  packaging_instructions: z.array(PackagingInstructionSchema).optional().nullable().default(null),
  auth_details: AuthDetailsSchema,
});

export type AttachedField = z.infer<typeof AttachedFieldSchema>;
export type BaseDocGen = z.infer<typeof BaseDocGenSchema>;
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Item = z.infer<typeof ItemSchema>;
