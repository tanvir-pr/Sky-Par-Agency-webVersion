"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quoteSchema, type QuoteFormData } from "@/validations/forms";
import { Loader2 } from "lucide-react";

const services = [
  "Web Development",
  "Automation",
  "AI Integrations",
  "Video Editing",
  "Photo Editing",
  "Digital Marketing",
];

const budgets = ["Under $5,000", "$5,000 - $15,000", "$15,000 - $50,000", "$50,000+"];

export function QuoteForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
  });

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await axios.post("/api/quote", data);
      toast.success("Quote request sent! We'll respond with a custom proposal.");
      reset();
    } catch {
      toast.error("Failed to submit quote request.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quote-name">Full Name *</Label>
          <Input id="quote-name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quote-email">Email *</Label>
          <Input id="quote-email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Service *</Label>
          <Select onValueChange={(v) => setValue("service", v)}>
            <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
            <SelectContent>
              {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.service && <p className="text-xs text-destructive">{errors.service.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Budget *</Label>
          <Select onValueChange={(v) => setValue("budget", v)}>
            <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
            <SelectContent>
              {budgets.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quote-requirements">Project Details *</Label>
        <Textarea id="quote-requirements" rows={5} {...register("requirements")} />
        {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
      </div>
      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Custom Quote"}
      </Button>
    </form>
  );
}
