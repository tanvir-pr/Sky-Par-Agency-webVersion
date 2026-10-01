export const PERMISSIONS = [
  { resource: "dashboard", action: "read", description: "View dashboard" },
  { resource: "clients", action: "read", description: "View clients" },
  { resource: "clients", action: "write", description: "Manage clients" },
  { resource: "leads", action: "read", description: "View leads" },
  { resource: "leads", action: "write", description: "Manage leads" },
  { resource: "deals", action: "read", description: "View deals" },
  { resource: "deals", action: "write", description: "Manage deals" },
  { resource: "orders", action: "read", description: "View orders" },
  { resource: "orders", action: "write", description: "Manage orders" },
  { resource: "projects", action: "read", description: "View projects" },
  { resource: "projects", action: "write", description: "Manage projects" },
  { resource: "tasks", action: "read", description: "View tasks" },
  { resource: "tasks", action: "write", description: "Manage tasks" },
  { resource: "services", action: "read", description: "View services" },
  { resource: "services", action: "write", description: "Manage services" },
  { resource: "finance", action: "read", description: "View finance" },
  { resource: "finance", action: "write", description: "Manage finance" },
  { resource: "invoices", action: "read", description: "View invoices" },
  { resource: "invoices", action: "write", description: "Manage invoices" },
  { resource: "reports", action: "read", description: "View reports" },
  { resource: "reports", action: "write", description: "Manage reports" },
  { resource: "team", action: "read", description: "View team" },
  { resource: "team", action: "write", description: "Manage team" },
  { resource: "users", action: "read", description: "View users" },
  { resource: "users", action: "write", description: "Manage users" },
  { resource: "messages", action: "read", description: "View messages" },
  { resource: "messages", action: "write", description: "Send messages" },
  { resource: "files", action: "read", description: "View files" },
  { resource: "files", action: "write", description: "Manage files" },
  { resource: "automation", action: "read", description: "View automation" },
  { resource: "automation", action: "write", description: "Manage automation" },
  { resource: "ai", action: "read", description: "View AI tools" },
  { resource: "ai", action: "write", description: "Use AI tools" },
  { resource: "settings", action: "read", description: "View settings" },
  { resource: "settings", action: "write", description: "Manage settings" },
  { resource: "superadmin", action: "read", description: "Super admin access" },
  { resource: "superadmin", action: "write", description: "Super admin write" },
  { resource: "proposals", action: "read", description: "View proposals" },
  { resource: "proposals", action: "write", description: "Manage proposals" },
  { resource: "contracts", action: "read", description: "View contracts" },
  { resource: "contracts", action: "write", description: "Manage contracts" },
  { resource: "calendar", action: "read", description: "View calendar" },
  { resource: "calendar", action: "write", description: "Manage calendar" },
  { resource: "cms", action: "read", description: "View CMS content" },
  { resource: "cms", action: "write", description: "Manage CMS content" },
] as const;

export type PermissionKey = `${(typeof PERMISSIONS)[number]["resource"]}:${(typeof PERMISSIONS)[number]["action"]}`;

const ALL_PERMISSIONS: PermissionKey[] = PERMISSIONS.map(
  (p) => `${p.resource}:${p.action}` as PermissionKey
);

export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter((p) => !p.startsWith("superadmin:")),
  PROJECT_MANAGER: [
    "dashboard:read", "clients:read", "projects:read", "projects:write",
    "tasks:read", "tasks:write", "team:read", "messages:read", "messages:write",
    "files:read", "files:write", "calendar:read", "calendar:write", "orders:read",
  ],
  SALES_MANAGER: [
    "dashboard:read", "clients:read", "clients:write", "leads:read", "leads:write",
    "deals:read", "deals:write", "proposals:read", "proposals:write",
    "orders:read", "orders:write", "messages:read", "messages:write", "calendar:read",
  ],
  SEO_SPECIALIST: [
    "dashboard:read", "projects:read", "tasks:read", "tasks:write",
    "reports:read", "reports:write", "clients:read", "messages:read",
  ],
  SMM_MANAGER: [
    "dashboard:read", "projects:read", "tasks:read", "tasks:write",
    "reports:read", "reports:write", "clients:read", "messages:read",
  ],
  CONTENT_WRITER: [
    "dashboard:read", "projects:read", "tasks:read", "tasks:write",
    "cms:read", "cms:write", "messages:read",
  ],
  VIDEO_EDITOR: [
    "dashboard:read", "projects:read", "tasks:read", "tasks:write",
    "files:read", "files:write", "messages:read",
  ],
  PHOTO_EDITOR: [
    "dashboard:read", "projects:read", "tasks:read", "tasks:write",
    "files:read", "files:write", "messages:read",
  ],
  AUTOMATION_SPECIALIST: [
    "dashboard:read", "projects:read", "projects:write", "tasks:read", "tasks:write",
    "clients:read", "messages:read",
  ],
  AI_ENGINEER: [
    "dashboard:read", "projects:read", "tasks:read", "tasks:write",
    "ai:read", "ai:write", "clients:read", "messages:read",
  ],
  FINANCE: [
    "dashboard:read", "finance:read", "finance:write", "invoices:read", "invoices:write",
    "clients:read", "reports:read",
  ],
  CLIENT: [],
  EDITOR: ["dashboard:read", "cms:read", "cms:write", "leads:read"],
};

export const STAFF_ROLES = [
  "SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES_MANAGER",
  "SEO_SPECIALIST", "SMM_MANAGER", "CONTENT_WRITER", "VIDEO_EDITOR",
  "PHOTO_EDITOR", "AUTOMATION_SPECIALIST", "AI_ENGINEER", "FINANCE", "EDITOR",
] as const;

export function isStaffRole(role: string): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isClientRole(role: string): boolean {
  return role === "CLIENT";
}
