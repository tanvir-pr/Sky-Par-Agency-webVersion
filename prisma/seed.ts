import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SERVICE_PRICING } from "./service-pricing";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../src/lib/rbac/role-permissions";

const prisma = new PrismaClient();

const CATEGORY_META: Record<string, { name: string; icon: string; description: string }> = {
  "web-development": { name: "Web Development", icon: "Globe", description: "Custom websites and web applications" },
  automation: { name: "Automation", icon: "Bot", description: "Business workflow automation" },
  "ai-integrations": { name: "AI Integrations", icon: "Brain", description: "AI-powered solutions" },
  "video-editing": { name: "Video Editing", icon: "Video", description: "Professional video production" },
  "photo-editing": { name: "Photo Editing", icon: "Image", description: "Expert photo retouching" },
  "digital-marketing": { name: "Digital Marketing", icon: "Megaphone", description: "SEO, PPC, and social media" },
};

async function seedPermissions() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: { resource: perm.resource, action: perm.action, description: perm.description },
    });
  }

  const allPerms = await prisma.permission.findMany();
  for (const [role, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
    for (const key of permKeys) {
      const [resource, action] = key.split(":");
      const perm = allPerms.find((p) => p.resource === resource && p.action === action);
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role: role as UserRole, permissionId: perm.id } },
          update: {},
          create: { role: role as UserRole, permissionId: perm.id },
        });
      }
    }
  }
}

async function seedServiceCategories() {
  for (const [slug, plans] of Object.entries(SERVICE_PRICING)) {
    const meta = CATEGORY_META[slug];
    if (!meta) continue;

    const service = await prisma.service.findUnique({ where: { slug } });

    const category = await prisma.serviceCategory.upsert({
      where: { slug },
      update: { name: meta.name, icon: meta.icon, description: meta.description, serviceId: service?.id },
      create: {
        name: meta.name,
        slug,
        icon: meta.icon,
        description: meta.description,
        serviceId: service?.id,
        order: Object.keys(CATEGORY_META).indexOf(slug),
      },
    });

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const planSlug = plan.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      await prisma.servicePackage.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: planSlug } },
        update: {
          name: plan.name,
          price: plan.price,
          priceCents: plan.priceCents,
          deliveryTime: plan.timeline,
          description: plan.description,
          features: plan.features,
          popular: plan.popular ?? false,
          order: i,
        },
        create: {
          categoryId: category.id,
          name: plan.name,
          slug: planSlug,
          price: plan.price,
          priceCents: plan.priceCents,
          deliveryTime: plan.timeline,
          description: plan.description,
          features: plan.features,
          popular: plan.popular ?? false,
          order: i,
        },
      });
    }
  }
}

async function seedRoleUsers(password: string) {
  const roleUsers: { name: string; email: string; role: UserRole }[] = [
    { name: "Super Admin", email: "superadmin@nexusdigital.com", role: "SUPER_ADMIN" },
    { name: "Admin User", email: "admin@nexusdigital.com", role: "ADMIN" },
    { name: "Project Manager", email: "pm@nexusdigital.com", role: "PROJECT_MANAGER" },
    { name: "Sales Manager", email: "sales@nexusdigital.com", role: "SALES_MANAGER" },
    { name: "SEO Specialist", email: "seo@nexusdigital.com", role: "SEO_SPECIALIST" },
    { name: "SMM Manager", email: "smm@nexusdigital.com", role: "SMM_MANAGER" },
    { name: "Content Writer", email: "content@nexusdigital.com", role: "CONTENT_WRITER" },
    { name: "Video Editor", email: "video@nexusdigital.com", role: "VIDEO_EDITOR" },
    { name: "Finance Manager", email: "finance@nexusdigital.com", role: "FINANCE" },
    { name: "AI Engineer", email: "ai@nexusdigital.com", role: "AI_ENGINEER" },
  ];

  for (const u of roleUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, status: "ACTIVE" },
      create: {
        name: u.name,
        email: u.email,
        password,
        role: u.role,
        status: "ACTIVE",
      },
    });
  }

  console.log("  ✓ 10 role-based staff users seeded (password: admin123)");
  return roleUsers;
}

async function seedClients(clientPassword: string) {
  const industries = ["Technology", "Healthcare", "E-commerce", "Finance", "Education", "Real Estate", "Food & Beverage", "Fashion", "Legal", "Manufacturing"];
  const categories = await prisma.serviceCategory.findMany({ include: { packages: { take: 1 } } });
  const salesManager = await prisma.user.findUnique({ where: { email: "sales@nexusdigital.com" } });
  const pm = await prisma.user.findUnique({ where: { email: "pm@nexusdigital.com" } });

  const clientsData = [
    { name: "Sarah Mitchell", company: "TechFlow Solutions", email: "sarah.mitchell@techflow.io", phone: "+1 555-1001", city: "San Francisco" },
    { name: "James Chen", company: "GreenLeaf Organics", email: "james.chen@greenleaf.com", phone: "+1 555-1002", city: "Portland" },
    { name: "Emily Rodriguez", company: "BrightPath Education", email: "emily.r@brightpath.edu", phone: "+1 555-1003", city: "Austin" },
    { name: "Michael Thompson", company: "Summit Realty Group", email: "m.thompson@summitrealty.com", phone: "+1 555-1004", city: "Denver" },
    { name: "Lisa Wang", company: "CloudNine SaaS", email: "lisa.wang@cloudnine.io", phone: "+1 555-1005", city: "Seattle" },
    { name: "David Park", company: "DataFlow Analytics", email: "david@dataflow.ai", phone: "+1 555-1006", city: "Boston" },
    { name: "Anna Kowalski", company: "StyleHub Fashion", email: "anna@stylehub.co", phone: "+1 555-1007", city: "New York" },
    { name: "Robert Johnson", company: "LegalEdge Partners", email: "r.johnson@legaledge.com", phone: "+1 555-1008", city: "Chicago" },
    { name: "Maria Garcia", company: "FreshBite Restaurants", email: "maria@freshbite.com", phone: "+1 555-1009", city: "Miami" },
    { name: "Kevin O'Brien", company: "IronWorks Manufacturing", email: "kevin@ironworks.com", phone: "+1 555-1010", city: "Detroit" },
    { name: "Jennifer Lee", company: "MedCare Plus", email: "j.lee@medcareplus.com", phone: "+1 555-1011", city: "Los Angeles" },
    { name: "Chris Anderson", company: "ShopSmart E-commerce", email: "chris@shopsmart.com", phone: "+1 555-1012", city: "Dallas" },
    { name: "Priya Sharma", company: "FinWise Capital", email: "priya@finwise.com", phone: "+1 555-1013", city: "Charlotte" },
    { name: "Tom Baker", company: "AutoDrive Motors", email: "tom.baker@autodrive.com", phone: "+1 555-1014", city: "Phoenix" },
    { name: "Rachel Green", company: "EcoHome Builders", email: "rachel@ecohome.com", phone: "+1 555-1015", city: "Nashville" },
    { name: "Daniel Kim", company: "GameZone Studios", email: "daniel@gamezone.gg", phone: "+1 555-1016", city: "San Diego" },
    { name: "Sophie Martin", company: "Artisan Coffee Co", email: "sophie@artisancoffee.com", phone: "+1 555-1017", city: "Portland" },
    { name: "Alex Turner", company: "FitLife Wellness", email: "alex@fitlife.com", phone: "+1 555-1018", city: "Atlanta" },
    { name: "Nina Patel", company: "TravelWise Agency", email: "nina@travelwise.com", phone: "+1 555-1019", city: "Orlando" },
    { name: "Demo Client", company: "Demo Corp", email: "client@demo.com", phone: "+1 555-0100", city: "San Francisco" },
  ];

  const subscriptionStatuses = ["ACTIVE", "ACTIVE", "ACTIVE", "PENDING", "PAUSED", "COMPLETED"] as const;
  let orderCounter = 1;

  for (let i = 0; i < clientsData.length; i++) {
    const c = clientsData[i];
    const industry = industries[i % industries.length];
    const category = categories[i % categories.length];
    const pkg = category?.packages[0];

    const client = await prisma.client.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        company: c.company,
        phone: c.phone,
        industry,
        address: `${100 + i} Main St, ${c.city}, USA`,
        website: `https://${c.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      },
      create: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        industry,
        address: `${100 + i} Main St, ${c.city}, USA`,
        website: `https://${c.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        notes: `Key account in ${industry} sector. Primary contact: ${c.name}.`,
      },
    });

    // Portal login for all clients
    await prisma.user.upsert({
      where: { email: c.email },
      update: { clientId: client.id, role: "CLIENT", name: c.name },
      create: {
        name: c.name,
        email: c.email,
        password: clientPassword,
        role: "CLIENT",
        clientId: client.id,
        status: "ACTIVE",
      },
    });

    // Client notes
    const noteExists = await prisma.clientNote.findFirst({ where: { clientId: client.id } });
    if (!noteExists) {
      await prisma.clientNote.create({
        data: {
          clientId: client.id,
          content: `Initial onboarding call completed. ${c.company} interested in ${category?.name ?? "digital services"}.`,
          authorId: salesManager?.id,
        },
      });
    }

    // Subscription for most clients
    if (pkg && i < 18) {
      const existingSub = await prisma.clientSubscription.findFirst({ where: { clientId: client.id } });
      if (!existingSub) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - (i % 6));
        await prisma.clientSubscription.create({
          data: {
            clientId: client.id,
            packageId: pkg.id,
            status: subscriptionStatuses[i % subscriptionStatuses.length],
            startDate,
            endDate: i % 4 === 0 ? new Date(Date.now() + 90 * 86400000) : undefined,
            monthlyFee: pkg.priceCents ? pkg.priceCents / 100 : 999,
            assignedToId: pm?.id,
            notes: `${pkg.name} package for ${c.company}`,
          },
        });
      }
    }

    // Order for some clients
    if (pkg && i % 3 === 0) {
      const orderNum = `ORD-${String(orderCounter++).padStart(4, "0")}`;
      const existingOrder = await prisma.order.findUnique({ where: { orderNumber: orderNum } });
      if (!existingOrder) {
        const statuses = ["NEW", "REVIEW", "ACCEPTED", "IN_PROGRESS", "COMPLETED"] as const;
        await prisma.order.create({
          data: {
            orderNumber: orderNum,
            clientId: client.id,
            packageId: pkg.id,
            price: pkg.priceCents ? pkg.priceCents / 100 : 2999,
            status: statuses[i % statuses.length],
            managerId: pm?.id,
            notes: `Order for ${pkg.name} - ${c.company}`,
          },
        });
      }
    }

    // Invoice for some clients
    if (i % 2 === 0) {
      const invNum = `INV-${String(i + 1).padStart(4, "0")}`;
      const existingInv = await prisma.invoice.findUnique({ where: { invoiceNumber: invNum } });
      if (!existingInv && pkg) {
        const amount = pkg.priceCents ? pkg.priceCents / 100 : 1500;
        await prisma.invoice.create({
          data: {
            invoiceNumber: invNum,
            clientId: client.id,
            status: i % 4 === 0 ? "PAID" : i % 3 === 0 ? "SENT" : "DRAFT",
            lineItems: [{ description: `${pkg.name} - ${category.name}`, amount, qty: 1 }],
            subtotal: amount,
            tax: 0,
            total: amount,
            dueDate: new Date(Date.now() + 30 * 86400000),
          },
        });
      }
    }
  }

  console.log("  ✓ 20 clients seeded with subscriptions, notes, orders & invoices");
}

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("admin123", 12);
  const clientPassword = await bcrypt.hash("client123", 12);

  await seedPermissions();

  const roleUsers = await seedRoleUsers(password);
  const admin = await prisma.user.findUnique({ where: { email: "admin@nexusdigital.com" } });
  if (!admin) throw new Error("Admin user not found after seed");

  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Nexus Digital",
      tagline: "Transforming Ideas Into Digital Excellence",
      email: "hello@nexusdigital.com",
      phone: "+1 (555) 123-4567",
      address: "123 Innovation Drive, San Francisco, CA 94105",
      calendlyUrl: "https://calendly.com",
      seoTitle: "Nexus Digital | Full-Service Digital Agency",
      seoDescription: "Web development, automation, AI integrations, and digital marketing agency.",
      seoKeywords: "digital agency, web development, automation, AI, marketing",
    },
  });

  const services = [
    {
      title: "Web Development",
      slug: "web-development",
      icon: "Globe",
      shortDesc: "Custom websites and web applications built with cutting-edge technologies.",
      description: "We build responsive, high-performance websites and web applications tailored to your business needs.",
      features: ["Responsive Design", "CMS Integration", "E-commerce Solutions", "Performance Optimization", "SEO-Friendly Architecture", "API Development"],
      order: 1,
    },
    {
      title: "Automation",
      slug: "automation",
      icon: "Bot",
      shortDesc: "Streamline workflows with intelligent business automation solutions.",
      description: "Automate repetitive tasks, integrate systems, and boost productivity with our custom automation solutions.",
      features: ["Workflow Automation", "CRM Integration", "Email Automation", "Data Pipeline", "API Integrations", "Custom Scripts"],
      order: 2,
    },
    {
      title: "AI Integrations",
      slug: "ai-integrations",
      icon: "Brain",
      shortDesc: "Leverage AI to transform your business processes and customer experience.",
      description: "Integrate cutting-edge AI capabilities into your products and workflows.",
      features: ["AI Chatbots", "Natural Language Processing", "Predictive Analytics", "Computer Vision", "Custom ML Models", "OpenAI Integration"],
      order: 3,
    },
    {
      title: "Video Editing",
      slug: "video-editing",
      icon: "Video",
      shortDesc: "Professional video editing for YouTube, ads, and social media content.",
      description: "Our video editing team creates compelling content that engages your audience.",
      features: ["YouTube Videos", "Short-form Content", "Ad Editing", "Motion Graphics", "Color Grading", "Sound Design"],
      order: 4,
    },
    {
      title: "Photo Editing",
      slug: "photo-editing",
      icon: "Image",
      shortDesc: "Expert retouching, product editing, and creative graphics.",
      description: "Professional photo editing services for e-commerce, marketing, and creative projects.",
      features: ["Retouching", "Product Editing", "Background Removal", "Thumbnail Design", "Social Media Graphics", "Batch Processing"],
      order: 5,
    },
    {
      title: "Digital Marketing",
      slug: "digital-marketing",
      icon: "Megaphone",
      shortDesc: "SEO, PPC, and social media strategies that drive measurable results.",
      description: "Grow your online presence with data-driven marketing strategies.",
      features: ["SEO Optimization", "PPC Campaigns", "Social Media Marketing", "Content Strategy", "Analytics & Reporting", "Email Marketing"],
      order: 6,
    },
  ];

  for (const service of services) {
    const pricing = SERVICE_PRICING[service.slug] ?? [];
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service, pricing },
      create: { ...service, pricing },
    });
  }

  await seedServiceCategories();
  await seedClients(clientPassword);

  // Sample leads
  const leadData = [
    { name: "John Smith", email: "john@acme.com", company: "Acme Inc", service: "Web Development", status: "NEW" as const, source: "Website", leadScore: 75 },
    { name: "Jane Doe", email: "jane@startup.io", company: "StartupIO", service: "Digital Marketing", status: "CONTACTED" as const, source: "Referral", leadScore: 60 },
    { name: "Bob Wilson", email: "bob@enterprise.com", company: "Enterprise Co", service: "AI Integrations", status: "MEETING_SCHEDULED" as const, source: "LinkedIn", leadScore: 85 },
  ];

  for (const lead of leadData) {
    const existing = await prisma.lead.findFirst({ where: { email: lead.email } });
    if (!existing) {
      await prisma.lead.create({ data: lead });
    }
  }

  // Automation rules
  const automationRules = [
    { name: "Auto-assign new leads", trigger: "LEAD_CREATED" as const, action: "ASSIGN_LEAD" as const },
    { name: "Welcome email on client create", trigger: "CLIENT_CREATED" as const, action: "SEND_EMAIL" as const },
    { name: "Invoice overdue reminder", trigger: "INVOICE_OVERDUE" as const, action: "SEND_NOTIFICATION" as const },
    { name: "Contract renewal reminder", trigger: "CONTRACT_EXPIRING" as const, action: "SEND_EMAIL" as const },
    { name: "Create tasks on order accept", trigger: "ORDER_ACCEPTED" as const, action: "CREATE_TASK" as const },
  ];

  for (const rule of automationRules) {
    const existing = await prisma.automationRule.findFirst({ where: { name: rule.name } });
    if (!existing) await prisma.automationRule.create({ data: rule });
  }

  // Portfolio, testimonials, team (only if empty)
  const portfolioCount = await prisma.portfolio.count();
  if (portfolioCount === 0) {
    const portfolio = [
      {
        title: "TechCorp SaaS Platform",
        slug: "techcorp-saas",
        shortDesc: "A modern SaaS dashboard for project management.",
        description: "Built a comprehensive SaaS platform for TechCorp.",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        gallery: [],
        technologies: ["Next.js", "TypeScript", "PostgreSQL"],
        category: "Web Development",
        featured: true,
      },
    ];
    for (const project of portfolio) {
      await prisma.portfolio.create({ data: project });
    }
  }

  const blogCount = await prisma.blog.count();
  if (blogCount === 0) {
    await prisma.blog.create({
      data: {
        title: "10 Web Development Trends for 2025",
        slug: "web-development-trends-2025",
        excerpt: "Discover the latest trends shaping web development.",
        content: "<h2>The Future of Web Development</h2><p>AI tools are revolutionizing how we write code.</p>",
        category: "Web Development",
        tags: ["trends", "web development"],
        authorId: admin.id,
      },
    });
  }

  console.log("Seed completed!");
  console.log("\n── Staff Users (password: admin123) ──");
  for (const u of roleUsers) {
    console.log(`  ${u.role.padEnd(20)} ${u.email}`);
  }
  console.log("\n── Client Portal (password: client123) ──");
  console.log("  All 20 clients have portal login (e.g. client@demo.com, sarah.mitchell@techflow.io)");
  console.log("\n  Total: 20 clients | 10 staff roles | 20 client portal logins");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
