import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Shield, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { CardIcons } from "@/components/payment/card-icons";
import { ContentCard, IconBox, PageSection } from "@/components/ui/page-section";
import { PAYMENT_METHODS, PAYMENT_TERMS } from "@/lib/constants";
import { canPayWithStripe, formatUsd, getCheckoutSelection } from "@/lib/pricing";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Checkout & Payment",
  description: "Complete your project order and pay your deposit securely.",
  path: "/checkout",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ service?: string; plan?: string; method?: string }>;
}

function parseMethod(method?: string): "stripe" | "bank_transfer" | "paypal" | undefined {
  if (method === "stripe" || method === "bank_transfer" || method === "paypal") {
    return method;
  }
  return undefined;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { service, plan, method } = await searchParams;
  const serviceSlug = service || "web-development";

  const selection = await getCheckoutSelection(serviceSlug, plan);
  if (!selection) notFound();

  const { plan: selected, serviceTitle } = selection;
  const stripeEnabled = canPayWithStripe(selected);
  const depositLabel =
    selected.depositCents != null
      ? formatUsd(selected.depositCents)
      : "Contact for quote";

  const backHref = `/pricing?service=${serviceSlug}`;

  return (
    <>
      <PageHeader
        badge="Checkout"
        title="Complete your order"
        description={`${serviceTitle} — ${selected.name} plan. Pay your deposit securely.`}
      />

      <PageSection className="!pt-0" variant="mesh">
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {serviceTitle} pricing
        </Link>

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContentCard className="p-6 md:p-8" hover={false}>
              <CheckoutForm
                serviceSlug={serviceSlug}
                serviceTitle={serviceTitle}
                packageName={selected.name}
                packagePrice={selected.price}
                depositLabel={depositLabel}
                stripeEnabled={stripeEnabled}
                initialMethod={parseMethod(method)}
              />
            </ContentCard>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <ContentCard className="p-6" glow>
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                Service
              </p>
              <p className="font-display mb-4 font-semibold">{serviceTitle}</p>
              <div className="mb-4 flex items-center gap-3">
                <IconBox icon={Shield} size="sm" />
                <h3 className="font-display font-semibold">Secure payment</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Card payments are processed by Stripe. We never store your card details.
              </p>
              <CardIcons className="mb-4" />
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <span
                    key={m}
                    className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </ContentCard>

            <ContentCard className="p-6" hover={false}>
              <div className="mb-4 flex items-center gap-3">
                <IconBox icon={CreditCard} size="sm" />
                <h3 className="font-display font-semibold">Payment terms</h3>
              </div>
              <ul className="space-y-3">
                {PAYMENT_TERMS.map((term) => (
                  <li key={term} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    {term}
                  </li>
                ))}
              </ul>
            </ContentCard>

            <ContentCard className="border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground" glow>
              <strong className="font-display text-foreground">{selected.name} includes:</strong>
              <ul className="mt-2 space-y-1">
                {selected.features.slice(0, 4).map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs">Timeline: {selected.timeline}</p>
              {selected.depositCents != null && (
                <p className="mt-2 text-xs font-medium text-foreground">
                  Deposit due now: {formatUsd(selected.depositCents)}
                </p>
              )}
            </ContentCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}
