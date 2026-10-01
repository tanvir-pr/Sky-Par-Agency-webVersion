import { TaskPriority, TaskType } from "@prisma/client";

export interface TaskTemplate {
  title: string;
  description?: string;
  type: TaskType;
  priority?: TaskPriority;
  order: number;
}

export const TASK_TEMPLATES: Record<string, TaskTemplate[]> = {
  "web-development": [
    { title: "UI/UX Design", description: "Wireframes, mockups, and design system", type: "WEB_UI_DESIGN", order: 0 },
    { title: "Frontend Development", description: "Implement responsive UI components", type: "WEB_FRONTEND", order: 1 },
    { title: "Backend Development", description: "API, database, and server logic", type: "WEB_BACKEND", order: 2 },
    { title: "Testing & QA", description: "Cross-browser and device testing", type: "WEB_TESTING", order: 3 },
    { title: "Deployment", description: "Production deploy and handoff", type: "WEB_DEPLOYMENT", order: 4 },
  ],
  automation: [
    { title: "Requirements Gathering", description: "Document workflows and integrations", type: "AUTO_REQUIREMENT", order: 0 },
    { title: "Workflow Design", description: "Build automation workflows", type: "AUTO_WORKFLOW", order: 1 },
    { title: "API Setup", description: "Connect third-party APIs and webhooks", type: "AUTO_API_SETUP", order: 2 },
    { title: "Testing & Validation", description: "End-to-end automation testing", type: "AUTO_TESTING", order: 3 },
  ],
  "ai-integrations": [
    { title: "AI Setup & Configuration", description: "Model selection and environment setup", type: "AI_SETUP", order: 0 },
    { title: "Prompt Engineering", description: "Design and refine prompts", type: "AI_PROMPT", order: 1 },
    { title: "API Integration", description: "Integrate AI APIs into product", type: "AI_API_INTEGRATION", order: 2 },
    { title: "Deployment & Monitoring", description: "Deploy AI features and monitor usage", type: "AI_DEPLOYMENT", order: 3 },
  ],
  "video-editing": [
    { title: "Footage Review", description: "Review raw footage and plan edits", type: "VIDEO_REVIEW", order: 0 },
    { title: "Video Editing", description: "Primary edit and assembly", type: "VIDEO_EDITING", order: 1 },
    { title: "Effects & Color", description: "Motion graphics and color grading", type: "VIDEO_EFFECTS", order: 2 },
    { title: "Export & Delivery", description: "Final export in required formats", type: "VIDEO_EXPORT", order: 3 },
  ],
  "photo-editing": [
    { title: "Photo Retouching", description: "Basic cleanup and retouching", type: "PHOTO_RETOUCH", order: 0 },
    { title: "Color Correction", description: "Color grading and consistency", type: "PHOTO_COLOR", order: 1 },
    { title: "Export & Delivery", description: "Deliver final assets", type: "PHOTO_EXPORT", order: 2 },
  ],
  "digital-marketing": [
    { title: "SEO Audit & Strategy", description: "Keyword research and on-page SEO", type: "MKT_SEO", order: 0 },
    { title: "Content Creation", description: "Blog posts, copy, and creatives", type: "MKT_CONTENT", order: 1 },
    { title: "Ad Campaign Setup", description: "PPC and paid social campaigns", type: "MKT_ADS", order: 2 },
    { title: "Reporting & Analytics", description: "Performance reports and insights", type: "MKT_REPORTING", order: 3 },
  ],
};

const DEFAULT_TEMPLATES: TaskTemplate[] = [
  { title: "Project Kickoff", description: "Initial discovery and planning", type: "GENERAL", order: 0 },
  { title: "Execution", description: "Core deliverable work", type: "GENERAL", order: 1 },
  { title: "Review & Handoff", description: "Client review and final delivery", type: "GENERAL", order: 2 },
];

export function getTasksForCategory(categorySlug: string): TaskTemplate[] {
  return TASK_TEMPLATES[categorySlug] ?? DEFAULT_TEMPLATES;
}
