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
import { inquirySchema, type InquiryFormData } from "@/validations/forms";
import { Loader2 } from "lucide-react";

const projectTypes = [
  "Website",
  "Web Application",
  "Automation",
  "AI Integration",
  "Marketing Campaign",
  "Other",
];

const budgets = ["Under $5,000", "$5,000 - $15,000", "$15,000 - $50,000", "$50,000+"];

export function InquiryForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryFormData) => {
    try {
      await axios.post("/api/inquiry", data);
      toast.success("Project inquiry submitted! Our team will review it shortly.");
      reset();
    } catch {
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label>Project Type *</Label>
          <Select onValueChange={(v) => setValue("projectType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projectType && <p className="text-xs text-destructive">{errors.projectType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Budget *</Label>
          <Select onValueChange={(v) => setValue("budget", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              {budgets.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" placeholder="e.g. 3 months" {...register("deadline")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirements">Project Requirements *</Label>
        <Textarea
          id="requirements"
          placeholder="Describe your project in detail..."
          rows={6}
          {...register("requirements")}
        />
        {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
      </div>
      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Project Inquiry"}
      </Button>
    </form>
  );
}
