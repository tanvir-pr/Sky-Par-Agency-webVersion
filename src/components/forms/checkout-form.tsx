"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormData } from "@/validations/forms";
import { Loader2, CreditCard, ArrowRight, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PaymentMethodSelector,
  type PaymentMethodId,
} from "@/components/payment/payment-method-selector";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  serviceSlug: string;
  serviceTitle: string;
  packageName: string;
  packagePrice: string;
  depositLabel: string;
  stripeEnabled: boolean;
  initialMethod?: PaymentMethodId;
}

export function CheckoutForm({
  serviceSlug,
  serviceTitle,
  packageName,
  packagePrice,
  depositLabel,
  stripeEnabled,
  initialMethod,
}: CheckoutFormProps) {
  const defaultMethod: PaymentMethodId = initialMethod
    ?? (stripeEnabled ? "stripe" : "bank_transfer");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      serviceSlug,
      serviceTitle,
      packageName,
      packagePrice,
      paymentMethod: defaultMethod,
    },
  });

  const paymentMethod = watch("paymentMethod") as PaymentMethodId;

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      if (data.paymentMethod === "stripe") {
        const res = await axios.post("/api/stripe/create-checkout-session", {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          serviceSlug: data.serviceSlug,
          serviceTitle: data.serviceTitle,
          packageName: data.packageName,
          packagePrice: data.packagePrice,
          message: data.message,
        });

        if (res.data.url) {
          window.location.href = res.data.url;
          return;
        }

        toast.error("Could not start payment. Please try again.");
        return;
      }

      await axios.post("/api/checkout", data);
      toast.success("Payment request submitted! We'll send your invoice within 24 hours.");
      reset({
        serviceSlug,
        serviceTitle,
        packageName,
        packagePrice,
        paymentMethod: defaultMethod,
      });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to submit. Please try again.";
      toast.error(message);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl shadow-primary/5">
      <div className="h-1.5 bg-gradient-to-r from-[#635BFF] via-primary to-emerald-500" />

      <CardContent className="p-6 sm:p-8">
        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {serviceTitle}
              </p>
              <p className="mt-1 text-2xl font-bold">{packageName}</p>
              <p className="text-muted-foreground">{packagePrice}</p>
            </div>
            <div className="rounded-xl bg-primary px-4 py-3 text-center text-primary-foreground shadow-lg shadow-primary/20">
              <p className="text-[10px] font-medium uppercase tracking-wider opacity-90">Deposit</p>
              <p className="text-xl font-bold">{depositLabel}</p>
              <p className="text-[10px] opacity-80">50% to start</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <input type="hidden" {...register("serviceSlug")} />
          <input type="hidden" {...register("serviceTitle")} />
          <input type="hidden" {...register("packageName")} />
          <input type="hidden" {...register("packagePrice")} />
          <input type="hidden" {...register("paymentMethod")} />

          <PaymentMethodSelector
            value={paymentMethod}
            onChange={(method) =>
              setValue("paymentMethod", method, { shouldValidate: true })
            }
            stripeEnabled={stripeEnabled}
            depositLabel={depositLabel}
            error={errors.paymentMethod?.message}
          />

          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold">Your Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="John Doe" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="you@company.com" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input placeholder="+1 (555) 000-0000" {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Your company" {...register("company")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                rows={3}
                placeholder="Project details, timeline preferences..."
                {...register("message")}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className={cn(
              "w-full h-12 text-base gap-2 transition-all",
              paymentMethod === "stripe" && "bg-gradient-to-r from-[#635BFF] to-indigo-600 hover:from-[#5851ea] hover:to-indigo-700"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : paymentMethod === "stripe" ? (
              <>
                <CreditCard className="h-5 w-5" />
                Pay {depositLabel} via Stripe
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Request {depositLabel} Invoice
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
