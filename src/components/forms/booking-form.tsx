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
import { bookingSchema, type BookingFormData } from "@/validations/forms";
import { Loader2 } from "lucide-react";

const services = [
  "Web Development",
  "Automation",
  "AI Integrations",
  "Digital Marketing",
  "Strategy Consultation",
];

const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export function BookingForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      await axios.post("/api/booking", data);
      toast.success("Booking request received! We'll confirm your consultation shortly.");
      reset();
    } catch {
      toast.error("Failed to submit booking request.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking-name">Full Name *</Label>
          <Input id="booking-name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-email">Email *</Label>
          <Input id="booking-email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-phone">Phone *</Label>
          <Input id="booking-phone" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
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
          <Label htmlFor="booking-date">Preferred Date *</Label>
          <Input id="booking-date" type="date" {...register("preferredDate")} />
          {errors.preferredDate && <p className="text-xs text-destructive">{errors.preferredDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Preferred Time *</Label>
          <Select onValueChange={(v) => setValue("preferredTime", v)}>
            <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
            <SelectContent>
              {times.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.preferredTime && <p className="text-xs text-destructive">{errors.preferredTime.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="booking-message">Additional notes</Label>
        <Textarea id="booking-message" rows={3} {...register("message")} />
      </div>
      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Consultation"}
      </Button>
    </form>
  );
}
