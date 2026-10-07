import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import CheckoutSuccessContent from "./success-content";

export const metadata = buildPageMetadata({
  title: "Payment Successful",
  description: "Your payment was processed successfully.",
  path: "/checkout/success",
  noIndex: true,
});

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="section-padding pt-32 text-center text-muted-foreground">
          Loading payment confirmation...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
