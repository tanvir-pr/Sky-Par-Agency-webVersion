import Link from "next/link";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CardIcons } from "@/components/payment/card-icons";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Payment Cancelled",
  description: "Your payment was cancelled. No charges were made.",
  path: "/checkout/cancel",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ service?: string; plan?: string }>;
}

export default async function CheckoutCancelPage({ searchParams }: Props) {
  const { service, plan } = await searchParams;
  const checkoutUrl =
    service && plan
      ? `/checkout?service=${encodeURIComponent(service)}&plan=${encodeURIComponent(plan)}`
      : service
        ? `/checkout?service=${encodeURIComponent(service)}`
        : "/pricing";
  const pricingUrl = service ? `/pricing?service=${service}` : "/pricing";

  return (
    <>
      <PageHeader
        badge="Checkout"
        title="Payment cancelled"
        description="No charges were made. You can try again or choose another payment method."
      />
      <PageSection className="!pt-0" variant="mesh">
        <ContentCard className="mx-auto max-w-xl p-10 text-center" glow>
          <XCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="mb-6 text-muted-foreground">
            Your payment was cancelled. Your card was not charged.
          </p>
          <CardIcons className="mb-6 justify-center" />
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="gradient" asChild>
              <Link href={checkoutUrl}>
                <CreditCard className="h-4 w-4" />
                Try again with Visa / Mastercard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={pricingUrl}>
                <ArrowLeft className="h-4 w-4" />
                Back to pricing
              </Link>
            </Button>
          </div>
        </ContentCard>
      </PageSection>
    </>
  );
}
