"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CardIcons } from "@/components/payment/card-icons";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { formatUsd } from "@/lib/pricing";

interface SessionDetails {
  paymentStatus: string;
  amountTotal: number | null;
  packageName: string | null;
  customerEmail: string | null;
}

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => setSession(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <>
      <PageHeader
        badge="Checkout"
        title={loading ? "Confirming payment" : error ? "Payment status" : "Payment successful"}
        description={
          loading
            ? "Please wait while we verify your transaction."
            : error
              ? "We couldn't verify your payment status."
              : "Thank you — your deposit has been received."
        }
      />
      <PageSection className="!pt-0" variant="mesh">
        <ContentCard className="mx-auto max-w-xl p-10 text-center" glow>
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Confirming your payment...</p>
            </div>
          ) : error || session?.paymentStatus !== "paid" ? (
            <>
              <h1 className="font-display mb-3 text-2xl font-bold">Payment status unknown</h1>
              <p className="mb-6 text-muted-foreground">
                We couldn&apos;t verify your payment. If you were charged, we&apos;ll email you a
                receipt shortly.
              </p>
              <Button variant="gradient" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
              <h1 className="font-display mb-2 text-2xl font-bold">Payment successful!</h1>
              <p className="mb-6 text-muted-foreground">
                Thank you! Your 50% deposit
                {session?.packageName ? ` for the ${session.packageName} package` : ""} has been
                received.
              </p>
              {session?.amountTotal != null && (
                <p className="mb-2 text-lg font-semibold">{formatUsd(session.amountTotal)}</p>
              )}
              {session?.customerEmail && (
                <p className="mb-6 text-sm text-muted-foreground">
                  Receipt sent to {session.customerEmail}
                </p>
              )}
              <CardIcons className="mb-6 justify-center" />
              <p className="mb-8 text-sm text-muted-foreground">
                Our team will contact you within 24 hours to kick off your project.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="gradient" asChild>
                  <Link href="/">
                    Back to home
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/portfolio">View our work</Link>
                </Button>
              </div>
            </>
          )}
        </ContentCard>
      </PageSection>
    </>
  );
}
