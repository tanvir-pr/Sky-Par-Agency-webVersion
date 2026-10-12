"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Package {
  id: string;
  name: string;
  price: string;
  deliveryTime: string;
  category: { name: string } | null;
}

export default function PortalNewOrderPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageId, setPackageId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get("/api/portal/services")
      .then((res) => setPackages(res.data.packages))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedPackage = packages.find((p) => p.id === packageId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId) {
      toast.error("Please select a service package");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/api/portal/orders", { packageId, notes: notes || undefined });
      toast.success("Order submitted successfully!");
      router.push("/portal");
    } catch {
      toast.error("Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PortalHeader title="New Order" description="Request a new service or project" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Submit Order Request</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading packages...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Service Package</Label>
                  <Select value={packageId} onValueChange={setPackageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.category?.name} — {pkg.name} ({pkg.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPackage && (
                  <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="font-medium">{selectedPackage.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPackage.category?.name} · {selectedPackage.price} ·{" "}
                      {selectedPackage.deliveryTime}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your requirements, timeline, or any special requests..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Order"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
