export const SITE_CONFIG = {
  name: "Nexus Digital",
  tagline: "Transforming Ideas Into Digital Excellence",
  description:
    "Full-service digital agency specializing in web development, automation, AI integrations, video editing, and digital marketing.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "hello@nexusdigital.com",
  phone: "+1 (555) 123-4567",
  address: "123 Innovation Drive, San Francisco, CA 94105",
};

export const STATS = [
  { value: 200, suffix: "+", label: "Projects Completed" },
  { value: 50, suffix: "+", label: "Happy Clients" },
  { value: 5, suffix: "+", label: "Years Experience" },
  { value: 15, suffix: "+", label: "Team Members" },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  {
    href: "/services",
    label: "Services",
    children: [
      { href: "/services/web-development", label: "Web Development" },
      { href: "/services/automation", label: "Automation" },
      { href: "/services/ai-integrations", label: "AI Integrations" },
      { href: "/services/video-editing", label: "Video Editing" },
      { href: "/services/photo-editing", label: "Photo Editing" },
      { href: "/services/digital-marketing", label: "Digital Marketing" },
    ],
  },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/audit", label: "Free Audit" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery",
    description: "We dive deep into your business goals, target audience, and project requirements.",
  },
  {
    step: "02",
    title: "Planning",
    description: "Strategic roadmap with timelines, milestones, and resource allocation.",
  },
  {
    step: "03",
    title: "Design",
    description: "Stunning UI/UX designs that align with your brand and user expectations.",
  },
  {
    step: "04",
    title: "Development",
    description: "Clean, scalable code built with modern technologies and best practices.",
  },
  {
    step: "05",
    title: "Testing",
    description: "Rigorous QA across devices, browsers, and performance benchmarks.",
  },
  {
    step: "06",
    title: "Launch",
    description: "Smooth deployment with ongoing support and optimization.",
  },
];

export const WHY_CHOOSE_US = [
  {
    title: "Fast Delivery",
    description: "Agile methodology ensures rapid turnaround without compromising quality.",
    icon: "Zap",
  },
  {
    title: "Experienced Team",
    description: "Senior developers, designers, and marketers with 5+ years of expertise.",
    icon: "Users",
  },
  {
    title: "Affordable Pricing",
    description: "Premium quality at competitive rates with transparent, no-hidden-fee pricing.",
    icon: "DollarSign",
  },
  {
    title: "Ongoing Support",
    description: "Dedicated post-launch support, maintenance, and continuous improvement.",
    icon: "HeadphonesIcon",
  },
];

export const FAQ_ITEMS = [
  {
    question: "How long does a typical project take?",
    answer:
      "Project timelines vary based on scope. A simple website takes 2-4 weeks, while complex web applications can take 2-3 months. We provide detailed timelines during our discovery phase.",
  },
  {
    question: "Do you offer ongoing maintenance?",
    answer:
      "Yes! All our packages include free support periods, and we offer flexible maintenance plans starting at $299/month for updates, security patches, and performance monitoring.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "We use modern, industry-standard technologies including Next.js, React, Node.js, PostgreSQL, and cloud services. We choose the best stack for each project's specific needs.",
  },
  {
    question: "Can you work with our existing team?",
    answer:
      "Absolutely. We seamlessly integrate with in-house teams, providing dedicated developers, designers, or full project management as needed.",
  },
  {
    question: "How do you handle project communication?",
    answer:
      "We use Slack, email, and weekly video calls to keep you updated. You'll have access to a project dashboard with real-time progress tracking.",
  },
  {
    question: "What is your payment structure?",
    answer:
      "We typically work with a 50% upfront deposit and 50% upon completion. For larger projects, we offer milestone-based payment schedules.",
  },
];

export const CLIENT_LOGOS = [
  "TechCorp", "InnovateLab", "GrowthHub", "DataFlow", "CloudNine", "PixelPerfect",
];

export const PORTFOLIO_CATEGORIES = [
  "All",
  "Web Development",
  "Automation",
  "Marketing",
  "Editing",
];

export const CORE_VALUES = [
  { title: "Innovation", description: "Pushing boundaries with cutting-edge solutions" },
  { title: "Integrity", description: "Transparent communication and honest partnerships" },
  { title: "Excellence", description: "Delivering exceptional quality in every project" },
  { title: "Collaboration", description: "Working together to achieve shared success" },
];

export const ACHIEVEMENTS = [
  "Google Partner Agency",
  "AWS Certified Solutions",
  "Top 10 Agency 2024 - Clutch",
  "ISO 27001 Certified",
];

export const LEAD_STATUSES = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"] as const;

export const PAYMENT_METHODS = [
  "Visa / Mastercard",
  "Bank Transfer",
  "PayPal",
  "Stripe",
  "Wise",
];

export const PAYMENT_TERMS = [
  "50% deposit required to start the project",
  "Remaining 50% due upon project completion",
  "Milestone-based payments available for Enterprise",
  "All prices in USD unless stated otherwise",
  "Invoice sent within 24 hours of request",
  "7-day money-back guarantee on deposits",
];
