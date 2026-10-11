"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Save, Settings } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Settings {
  companyName: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  favicon: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialYoutube: string | null;
  calendlyUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  stripeKey: string | null;
  paypalEmail: string | null;
  pusherKey: string | null;
  s3Bucket: string | null;
  openaiKey: string | null;
  customDomain: string | null;
}

const defaultSettings: Settings = {
  companyName: "",
  tagline: "",
  email: "",
  phone: "",
  address: "",
  logo: "",
  favicon: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialInstagram: "",
  socialFacebook: "",
  socialYoutube: "",
  calendlyUrl: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  smtpHost: "",
  smtpPort: null,
  smtpUser: "",
  smtpPass: "",
  stripeKey: "",
  paypalEmail: "",
  pusherKey: "",
  s3Bucket: "",
  openaiKey: "",
  customDomain: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/settings")
      .then((res) => {
        const data = res.data.settings;
        setSettings({
          companyName: data.companyName || "",
          tagline: data.tagline || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          socialTwitter: data.socialTwitter || "",
          socialLinkedin: data.socialLinkedin || "",
          socialInstagram: data.socialInstagram || "",
          socialFacebook: data.socialFacebook || "",
          socialYoutube: data.socialYoutube || "",
          calendlyUrl: data.calendlyUrl || "",
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
          seoKeywords: data.seoKeywords || "",
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort ?? null,
          smtpUser: data.smtpUser || "",
          smtpPass: data.smtpPass || "",
          stripeKey: data.stripeKey || "",
          paypalEmail: data.paypalEmail || "",
          pusherKey: data.pusherKey || "",
          s3Bucket: data.s3Bucket || "",
          openaiKey: data.openaiKey || "",
          customDomain: data.customDomain || "",
        });
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof Settings, value: string | number | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/settings", settings);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Settings" description="Configure your agency settings" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Settings" description="Configure your agency settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border bg-gradient-to-br from-slate-500/10 via-white to-indigo-500/5 p-6 dark:from-slate-950/30 dark:via-slate-900 dark:to-indigo-950/20">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/50">
                <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Agency Settings</h2>
                <p className="text-sm text-muted-foreground">Company info, integrations, SEO and payment configuration</p>
              </div>
            </div>
          </div>
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic details about your agency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings.tagline || ""}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={settings.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  rows={2}
                  value={settings.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={settings.logo || ""}
                    onChange={(e) => handleChange("logo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input
                    value={settings.favicon || ""}
                    onChange={(e) => handleChange("favicon", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Calendly URL</Label>
                <Input
                  value={settings.calendlyUrl || ""}
                  onChange={(e) => handleChange("calendlyUrl", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  value={settings.seoTitle || ""}
                  onChange={(e) => handleChange("seoTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea
                  rows={3}
                  value={settings.seoDescription || ""}
                  onChange={(e) => handleChange("seoDescription", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <Input
                  placeholder="digital agency, web development, ..."
                  value={settings.seoKeywords || ""}
                  onChange={(e) => handleChange("seoKeywords", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input
                    value={settings.socialTwitter || ""}
                    onChange={(e) => handleChange("socialTwitter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={settings.socialLinkedin || ""}
                    onChange={(e) => handleChange("socialLinkedin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    value={settings.socialInstagram || ""}
                    onChange={(e) => handleChange("socialInstagram", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    value={settings.socialFacebook || ""}
                    onChange={(e) => handleChange("socialFacebook", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube</Label>
                  <Input
                    value={settings.socialYoutube || ""}
                    onChange={(e) => handleChange("socialYoutube", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations & API Keys</CardTitle>
                  <CardDescription>Configure third-party services (stored in database; env vars take precedence at runtime)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stripe Key</Label>
                      <Input type="password" value={settings.stripeKey || ""} onChange={(e) => handleChange("stripeKey", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>PayPal Email</Label>
                      <Input value={settings.paypalEmail || ""} onChange={(e) => handleChange("paypalEmail", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>OpenAI API Key</Label>
                      <Input type="password" value={settings.openaiKey || ""} onChange={(e) => handleChange("openaiKey", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Pusher Key</Label>
                      <Input value={settings.pusherKey || ""} onChange={(e) => handleChange("pusherKey", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>S3 Bucket</Label>
                      <Input value={settings.s3Bucket || ""} onChange={(e) => handleChange("s3Bucket", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Domain</Label>
                      <Input value={settings.customDomain || ""} onChange={(e) => handleChange("customDomain", e.target.value)} placeholder="app.yourdomain.com" />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm font-medium">SMTP (Email)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input value={settings.smtpHost || ""} onChange={(e) => handleChange("smtpHost", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input type="number" value={settings.smtpPort ?? ""} onChange={(e) => handleChange("smtpPort", e.target.value ? parseInt(e.target.value) : null)} />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP User</Label>
                      <Input value={settings.smtpUser || ""} onChange={(e) => handleChange("smtpUser", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input type="password" value={settings.smtpPass || ""} onChange={(e) => handleChange("smtpPass", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end pb-8">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
