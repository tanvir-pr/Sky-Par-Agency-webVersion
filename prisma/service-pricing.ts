import type { ServicePricingPlan } from "@/types/pricing";

type PlanInput = Omit<ServicePricingPlan, "depositCents"> & {
  depositCents?: number | null;
};

function plan(
  name: string,
  price: string,
  priceCents: number | null,
  description: string,
  timeline: string,
  features: string[],
  popular = false
): PlanInput {
  return {
    name,
    price,
    priceCents,
    depositCents: priceCents ? Math.round(priceCents / 2) : null,
    description,
    timeline,
    features,
    popular,
  };
}

export const SERVICE_PRICING: Record<string, PlanInput[]> = {
  "web-development": [
    plan(
      "Starter",
      "$2,999",
      299900,
      "Perfect for small businesses and startups",
      "2-4 weeks",
      [
        "5-page responsive website",
        "Mobile-first design",
        "Basic SEO setup",
        "Contact form integration",
        "1 month free support",
        "SSL certificate",
      ]
    ),
    plan(
      "Professional",
      "$7,999",
      799900,
      "Ideal for growing businesses",
      "4-8 weeks",
      [
        "Up to 15 custom pages",
        "CMS integration",
        "Advanced SEO optimization",
        "Blog setup",
        "Analytics integration",
        "3 months free support",
        "Performance optimization",
      ],
      true
    ),
    plan(
      "Enterprise",
      "Custom",
      null,
      "For large-scale platforms and apps",
      "8+ weeks",
      [
        "Unlimited pages & features",
        "Custom web application",
        "API development",
        "Dedicated project manager",
        "12 months priority support",
        "SLA guarantee",
      ]
    ),
  ],
  automation: [
    plan(
      "Workflow Starter",
      "$1,499",
      149900,
      "Automate essential daily tasks",
      "1-2 weeks",
      [
        "Up to 3 automated workflows",
        "Email automation setup",
        "CRM basic integration",
        "Documentation included",
        "2 weeks support",
      ]
    ),
    plan(
      "Business Automation",
      "$4,499",
      449900,
      "Full department automation suite",
      "3-5 weeks",
      [
        "Up to 10 workflows",
        "Multi-tool integrations",
        "Custom API connections",
        "Error monitoring setup",
        "Team training session",
        "1 month support",
      ],
      true
    ),
    plan(
      "Enterprise",
      "Custom",
      null,
      "Organization-wide automation",
      "6+ weeks",
      [
        "Unlimited workflows",
        "Custom middleware",
        "Dedicated automation engineer",
        "SLA & monitoring",
        "Quarterly optimization",
      ]
    ),
  ],
  "ai-integrations": [
    plan(
      "AI MVP",
      "$3,499",
      349900,
      "Quick AI feature for your product",
      "2-3 weeks",
      [
        "Single AI use case",
        "OpenAI / Claude integration",
        "Basic prompt engineering",
        "API endpoint setup",
        "2 weeks support",
      ]
    ),
    plan(
      "Production AI",
      "$8,999",
      899900,
      "Production-ready AI system",
      "4-8 weeks",
      [
        "Custom AI chatbot or agent",
        "RAG / knowledge base setup",
        "Multi-model integration",
        "Analytics & monitoring",
        "3 months support",
      ],
      true
    ),
    plan(
      "Enterprise AI",
      "Custom",
      null,
      "Full AI transformation",
      "8+ weeks",
      [
        "Custom ML pipelines",
        "Fine-tuned models",
        "Enterprise security review",
        "Dedicated AI engineer",
        "Ongoing model tuning",
      ]
    ),
  ],
  "video-editing": [
    plan(
      "Single Video",
      "$299",
      29900,
      "One polished video deliverable",
      "3-5 days",
      [
        "Up to 5 min video",
        "Basic color correction",
        "2 revision rounds",
        "1080p export",
        "Royalty-free music",
      ]
    ),
    plan(
      "Content Pack",
      "$799",
      79900,
      "Batch of social or YouTube videos",
      "1-2 weeks",
      [
        "Up to 5 videos",
        "Motion graphics",
        "Thumbnail design",
        "Platform-optimized formats",
        "3 revision rounds",
      ],
      true
    ),
    plan(
      "Monthly Retainer",
      "$1,499/mo",
      149900,
      "Ongoing video production",
      "Monthly",
      [
        "8 videos per month",
        "Priority turnaround",
        "Dedicated editor",
        "Brand style guide",
        "Unlimited minor revisions",
      ]
    ),
  ],
  "photo-editing": [
    plan(
      "Basic Edit",
      "$199",
      19900,
      "Quick retouching for small batches",
      "2-3 days",
      [
        "Up to 20 images",
        "Background removal",
        "Color correction",
        "Web-ready exports",
        "1 revision round",
      ]
    ),
    plan(
      "Pro Package",
      "$499",
      49900,
      "E-commerce and marketing ready",
      "5-7 days",
      [
        "Up to 50 images",
        "Product retouching",
        "Shadow & reflection",
        "Multiple format exports",
        "2 revision rounds",
      ],
      true
    ),
    plan(
      "Bulk Processing",
      "$999",
      99900,
      "High-volume catalog editing",
      "1-2 weeks",
      [
        "Up to 200 images",
        "Batch processing pipeline",
        "Consistent brand look",
        "Priority delivery",
        "Dedicated editor",
      ]
    ),
  ],
  "digital-marketing": [
    plan(
      "Starter",
      "$999/mo",
      99900,
      "Essential marketing for small business",
      "Monthly",
      [
        "SEO audit & fixes",
        "2 social channels",
        "8 posts per month",
        "Monthly analytics report",
        "Email support",
      ]
    ),
    plan(
      "Growth",
      "$2,499/mo",
      249900,
      "Scale traffic and conversions",
      "Monthly",
      [
        "Full SEO strategy",
        "PPC campaign management",
        "4 social channels",
        "Content calendar",
        "Bi-weekly strategy calls",
        "Conversion tracking",
      ],
      true
    ),
    plan(
      "Enterprise",
      "Custom",
      null,
      "Full-funnel marketing team",
      "Custom",
      [
        "Dedicated marketing manager",
        "Multi-channel campaigns",
        "Custom reporting dashboard",
        "A/B testing program",
        "Quarterly strategy reviews",
      ]
    ),
  ],
};
