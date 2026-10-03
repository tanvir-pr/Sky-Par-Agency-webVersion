"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, MapPin, Clock, DollarSign, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FadeInUp } from "@/components/animations/motion";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { applicationSchema, type ApplicationFormData } from "@/validations/forms";

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string | null;
  description: string;
  requirements: string[];
}

export default function CareerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    fetch(`/api/careers?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const careers = data.careers || [];
        setCareer(careers[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const onSubmit = async (data: ApplicationFormData & { resume?: string }) => {
    if (!career) return;
    try {
      await axios.post("/api/applications", { ...data, careerId: career.id });
      toast.success("Application submitted successfully!");
      reset();
    } catch {
      toast.error("Failed to submit application.");
    }
  };

  if (loading) {
    return (
      <PageSection className="!pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </PageSection>
    );
  }

  if (!career) {
    return (
      <PageSection className="!pt-32">
        <div className="mx-auto max-w-4xl py-20 text-center">
          <h1 className="font-display mb-4 text-2xl font-bold">Position not found</h1>
          <Button asChild>
            <Link href="/careers">View all positions</Link>
          </Button>
        </div>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection className="!pb-8 !pt-32" variant="mesh">
        <div className="mx-auto max-w-4xl">
          <FadeInUp>
            <Link
              href="/careers"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to careers
            </Link>
            <Badge variant="secondary" className="mb-4">
              {career.department}
            </Badge>
            <h1 className="font-display mb-4 text-4xl font-bold">{career.title}</h1>
            <div className="mb-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {career.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {career.type}
              </span>
              {career.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> {career.salary}
                </span>
              )}
            </div>
          </FadeInUp>
        </div>
      </PageSection>

      <PageSection className="!pt-0" variant="default">
        <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <FadeInUp>
              <span className="section-label mb-4">Role</span>
              <h2 className="font-display mb-4 text-2xl font-bold">About the role</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {career.description}
              </p>
            </FadeInUp>
            {career.requirements.length > 0 && (
              <FadeInUp>
                <span className="section-label mb-4">Requirements</span>
                <h2 className="font-display mb-4 text-2xl font-bold">What we&apos;re looking for</h2>
                <ul className="space-y-3">
                  {career.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-3 rounded-2xl border bg-card/80 p-4 text-muted-foreground backdrop-blur-sm"
                    >
                      <span className="mt-1 text-primary">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </FadeInUp>
            )}
          </div>

          <FadeInUp delay={0.2}>
            <ContentCard className="sticky top-28 p-6" glow>
              <h3 className="font-display mb-6 text-xl font-bold">Apply now</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <Label htmlFor="resume">Resume (PDF, max 2MB)</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("File must be under 2MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setValue("resume", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">PDF or Word document</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover">Cover Letter</Label>
                    <Textarea id="cover" rows={4} {...register("cover")} />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit application"
                    )}
                  </Button>
                </form>
            </ContentCard>
          </FadeInUp>
        </div>
      </PageSection>
    </>
  );
}
