import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  budget: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().min(1, "Please select a budget range"),
  deadline: z.string().optional(),
  requirements: z.string().min(20, "Please describe your requirements"),
});

export const auditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  message: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const quoteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().optional(),
  requirements: z.string().min(20, "Please describe what you need quoted"),
});

export const supportSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  message: z.string().min(20, "Please describe your issue"),
});

export const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  service: z.string().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  message: z.string().optional(),
});

export const chatSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

export const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional(),
  packageName: z.string().min(1),
  packagePrice: z.string().min(1),
  serviceSlug: z.string().min(1),
  serviceTitle: z.string().min(1),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  message: z.string().optional(),
});

export const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  cover: z.string().optional(),
  resume: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type InquiryFormData = z.infer<typeof inquirySchema>;
export type AuditFormData = z.infer<typeof auditSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
export type SupportFormData = z.infer<typeof supportSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type ChatFormData = z.infer<typeof chatSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
