"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { auditSchema, type AuditFormData } from "@/validations/forms";
import { Loader2, Search } from "lucide-react";

export function AuditForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
  });

  const onSubmit = async (data: AuditFormData) => {
    try {
      await axios.post("/api/audit", data);
      toast.success("Free audit request submitted! We'll send your report within 48 hours.");
      reset();
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="audit-name">Full Name *</Label>
          <Input id="audit-name" placeholder="John Doe" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="audit-email">Email *</Label>
          <Input id="audit-email" type="email" placeholder="john@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audit-website">Website URL</Label>
        <Input id="audit-website" placeholder="https://yourwebsite.com" {...register("website")} />
        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="audit-message">What would you like us to audit?</Label>
        <Textarea
          id="audit-message"
          placeholder="SEO, performance, UX, conversion rate..."
          rows={4}
          {...register("message")}
        />
      </div>
      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Get Free Audit
          </>
        )}
      </Button>
    </form>
  );
}
