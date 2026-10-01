import type { PermissionKey } from "@/lib/rbac/permissions";

export interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  permission?: PermissionKey;
  roles?: string[];
  children?: NavItem[];
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard", permission: "dashboard:read" },
  {
    label: "CRM",
    icon: "Users",
    permission: "clients:read",
    children: [
      { label: "Overview", href: "/admin/crm", permission: "clients:read" },
      { label: "Clients", href: "/admin/crm/clients", permission: "clients:read" },
      { label: "Leads", href: "/admin/crm/leads", permission: "leads:read" },
      { label: "Deals", href: "/admin/crm/deals", permission: "deals:read" },
      { label: "Pipeline", href: "/admin/crm/pipeline", permission: "leads:read" },
    ],
  },
  {
    label: "Services",
    icon: "Wrench",
    permission: "services:read",
    children: [
      { label: "Overview", href: "/admin/services-mgmt", permission: "services:read" },
      { label: "Web Development", href: "/admin/services-mgmt/web-development", permission: "services:read" },
      { label: "Automation", href: "/admin/services-mgmt/automation", permission: "services:read" },
      { label: "AI Integrations", href: "/admin/services-mgmt/ai-integrations", permission: "services:read" },
      { label: "Video Editing", href: "/admin/services-mgmt/video-editing", permission: "services:read" },
      { label: "Photo Editing", href: "/admin/services-mgmt/photo-editing", permission: "services:read" },
      { label: "Digital Marketing", href: "/admin/services-mgmt/digital-marketing", permission: "services:read" },
    ],
  },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingCart", permission: "orders:read" },
  {
    label: "Projects",
    icon: "FolderKanban",
    permission: "projects:read",
    children: [
      { label: "Overview", href: "/admin/projects", permission: "projects:read" },
      { label: "Tasks", href: "/admin/projects/tasks", permission: "tasks:read" },
      { label: "Kanban", href: "/admin/projects/kanban", permission: "tasks:read" },
      { label: "Calendar", href: "/admin/projects/calendar", permission: "calendar:read" },
      { label: "Milestones", href: "/admin/projects/milestones", permission: "projects:read" },
    ],
  },
  {
    label: "Team",
    icon: "UserCircle",
    permission: "team:read",
    children: [
      { label: "Overview", href: "/admin/team/overview", permission: "team:read" },
      { label: "Employees", href: "/admin/users/employees", permission: "users:read" },
      { label: "Roles", href: "/admin/users/roles", permission: "users:read" },
      { label: "Attendance", href: "/admin/team/attendance", permission: "team:read" },
      { label: "Time Tracking", href: "/admin/team/time-tracking", permission: "team:read" },
      { label: "My Work", href: "/admin/my-work", permission: "tasks:read" },
    ],
  },
  {
    label: "Finance",
    icon: "DollarSign",
    permission: "finance:read",
    children: [
      { label: "Overview", href: "/admin/finance", permission: "finance:read" },
      { label: "Invoices", href: "/admin/finance/invoices", permission: "invoices:read" },
      { label: "Payments", href: "/admin/finance/payments", permission: "finance:read" },
      { label: "Expenses", href: "/admin/finance/expenses", permission: "finance:write" },
      { label: "Revenue", href: "/admin/finance/revenue", permission: "finance:read" },
      { label: "AI Costs", href: "/admin/finance/ai-costs", permission: "finance:read" },
      { label: "Proposals", href: "/admin/proposals", permission: "proposals:read" },
      { label: "Contracts", href: "/admin/contracts", permission: "contracts:read" },
    ],
  },
  {
    label: "Reports",
    icon: "BarChart3",
    permission: "reports:read",
    children: [
      { label: "Overview", href: "/admin/reports", permission: "reports:read" },
      { label: "Revenue", href: "/admin/reports/revenue", permission: "reports:read" },
      { label: "Clients", href: "/admin/reports/clients", permission: "reports:read" },
      { label: "Services", href: "/admin/reports/services", permission: "reports:read" },
      { label: "Team", href: "/admin/reports/team", permission: "reports:read" },
      { label: "Marketing", href: "/admin/reports/marketing", permission: "reports:read" },
    ],
  },
  {
    label: "Tools",
    icon: "Wrench",
    permission: "files:read",
    children: [
      { label: "Overview", href: "/admin/tools", permission: "files:read" },
      { label: "Files", href: "/admin/files", permission: "files:read" },
      { label: "Messages", href: "/admin/messages", permission: "messages:read" },
      { label: "Calendar", href: "/admin/calendar", permission: "calendar:read" },
      { label: "Automation", href: "/admin/automation", permission: "automation:read" },
      { label: "AI Tools", href: "/admin/ai-tools", permission: "ai:read" },
    ],
  },
  {
    label: "Website CMS",
    icon: "Globe",
    permission: "cms:read",
    children: [
      { label: "Overview", href: "/admin/cms", permission: "cms:read" },
      { label: "Portfolio", href: "/admin/portfolio", permission: "cms:read" },
      { label: "Blog", href: "/admin/blog", permission: "cms:read" },
      { label: "Services Page", href: "/admin/services", permission: "cms:read" },
      { label: "Team Page", href: "/admin/team", permission: "cms:read" },
      { label: "Testimonials", href: "/admin/testimonials", permission: "cms:read" },
      { label: "Careers", href: "/admin/careers", permission: "cms:read" },
    ],
  },
  { label: "Settings", href: "/admin/settings", icon: "Settings", permission: "settings:read" },
  {
    label: "Super Admin",
    icon: "Shield",
    roles: ["SUPER_ADMIN"],
    children: [
      { label: "Overview", href: "/admin/super-admin", roles: ["SUPER_ADMIN"] },
      { label: "System Logs", href: "/admin/super-admin/logs", roles: ["SUPER_ADMIN"] },
      { label: "Audit Logs", href: "/admin/super-admin/audit", roles: ["SUPER_ADMIN"] },
      { label: "Security", href: "/admin/super-admin/security", roles: ["SUPER_ADMIN"] },
    ],
  },
];
