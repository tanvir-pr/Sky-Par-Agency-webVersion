import Link from "next/link";
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SITE_CONFIG } from "@/lib/constants";
import { NewsletterForm } from "@/components/forms/newsletter-form";

const footerLinks = {
  services: [
    { label: "Web Development", href: "/services/web-development" },
    { label: "Automation", href: "/services/automation" },
    { label: "AI Integrations", href: "/services/ai-integrations" },
    { label: "Digital Marketing", href: "/services/digital-marketing" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Testimonials", href: "/testimonials" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "Pricing", href: "/pricing" },
    { label: "Free Audit", href: "/audit" },
    { label: "Consultation", href: "/consultation" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-[#06070c] text-white">
      <div className="absolute inset-0 bg-hero-mesh opacity-40" />
      <div className="container-custom relative section-padding pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-cyan-500 to-violet-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">{SITE_CONFIG.name}</span>
            </Link>
            <p className="max-w-sm leading-relaxed text-white/60">
              {SITE_CONFIG.description}
            </p>
            <div className="space-y-3 text-sm text-white/55">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                {SITE_CONFIG.email}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                {SITE_CONFIG.phone}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                {SITE_CONFIG.address}
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-white">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-white/55 transition-colors hover:text-cyan-300"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold text-white">Newsletter</h4>
            <p className="mb-4 text-sm text-white/55">
              Get the latest insights on digital trends and agency updates.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-white/45">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["X", "in", "IG", "FB", "YT"].map((label) => (
              <a
                key={label}
                href="#"
                className="rounded-lg p-2 text-xs font-semibold text-white/45 transition-colors hover:bg-white/10 hover:text-cyan-300"
                aria-label={`Social link ${label}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
