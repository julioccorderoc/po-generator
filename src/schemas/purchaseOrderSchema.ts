
import { z } from 'zod';

export const CompanyInfoSchema = z.object({
  name: z.string(),
  address_line1: z.string(),
  address_line2: z.string(),
  phone: z.string(),
});

export const ContactInfoSchema = z.object({
  name: z.string(),
  title: z.string().optional().default(""),
  company_name: z.string(),
  address_line1: z.string(),
  address_line2: z.string(),
  tel: z.string(),
  email: z.string().email().optional().default(""),
});

export const GeneralPOInfoSchema = z.object({
  product_name: z.string(),
  shipped_via: z.string(),
  est_delivery_date: z.string(), // ISO date string
  payment_terms: z.string(),
});

export const ItemSchema = z.object({
  item_number: z.string(),
  quantity: z.number(),
  description: z.string(),
  barcode: z.string().optional().default(""),
  unit_price: z.number(),
  total: z.number(),
});

export const SummaryTotalsSchema = z.object({
  total_bottles: z.number(),
  subtotal: z.number(),
  shipping: z.number().default(0),
  other_fees: z.number().default(0),
  grand_total: z.number(),
  deposit: z.number().default(0),
});

export const PackagingInstructionSchema = z.object({
  component: z.string(),
  instructions: z.string(),
});

export const AnnexedItemSchema = z.object({
  title: z.string(),
  type: z.string().default("document"), // Default type
  content: z.string(),
});

export const AuthDetailsSchema = z.object({
  date_of_signature: z.string(), // ISO date string
  authority: z.string(),
});

export const PurchaseOrderSchema = z.object({
  po_number: z.string(),
  po_date: z.string(), // ISO date string
  company: CompanyInfoSchema,
  to_manufacturer: ContactInfoSchema,
  ship_to: ContactInfoSchema,
  general_po_info: GeneralPOInfoSchema,
  items: z.array(ItemSchema),
  remarks: z.string().optional().default(""),
  summary_totals: SummaryTotalsSchema,
  packaging_instructions: z.array(PackagingInstructionSchema),
  auth_details: AuthDetailsSchema,
  annex_items: z.array(AnnexedItemSchema),
});

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Item = z.infer<typeof ItemSchema>;
