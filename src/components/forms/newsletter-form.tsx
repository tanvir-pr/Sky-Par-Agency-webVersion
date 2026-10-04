"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema, type NewsletterFormData } from "@/validations/forms";
import { Loader2 } from "lucide-react";

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      await axios.post("/api/newsletter", data);
      toast.success("Successfully subscribed to our newsletter!");
      reset();
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Input
        placeholder="Enter your email"
        {...register("email")}
        className="flex-1"
      />
      <Button type="submit" disabled={isSubmitting} size="default">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
      </Button>
      {errors.email && (
        <p className="text-xs text-destructive absolute mt-12">{errors.email.message}</p>
      )}
    </form>
  );
}
