# Agency Automation (n8n)

n8n is wired to this Next.js agency website for end-to-end automation.

## Quick Start

1. Copy n8n env vars from `.env.example` into your `.env`
2. Start n8n: `npx n8n start` (or `docker compose up -d n8n` if Docker installed)
3. Open **http://localhost:5678** and create your n8n account
4. Import workflows from `n8n/workflows/` (Workflows → Import from File)
5. **Publish** the master workflow (n8n 2.x uses Publish, not an Active toggle):

```powershell
# Option A — script
powershell -File scripts/n8n-publish.ps1

# Option B — CLI (workflow ID from n8n URL)
$env:N8N_ENCRYPTION_KEY="nexus-n8n-encryption-key-dev"
npx n8n publish:workflow --id=YOUR_WORKFLOW_ID
```

6. **Restart n8n** after publish (Ctrl+C then `npx n8n start` again)
7. Set `N8N_ENABLED=true` in `.env` and restart Next.js (`npm run dev`)

## Architecture

```
Website Forms / CRM Events
        ↓
  src/lib/n8n (emitN8nEvent)
        ↓
  n8n Webhook (Master Router)
        ↓
  Category Workflows (Lead, Sales, Project, HR…)
        ↓
  POST /api/webhooks/n8n (actions back to CRM)
```

## Website → n8n Events

| Trigger | Event | Category |
|---------|-------|----------|
| Contact form | `form.contact` | website, lead_management |
| Inquiry | `form.inquiry` | website, lead_management |
| Quote request | `form.quote` | website, sales |
| Support form | `form.support` | website, support |
| Booking form | `form.booking` | website, client_onboarding |
| Live chat | `chat.message` | website, communication |
| Newsletter | `form.newsletter` | marketing |
| Checkout | `form.checkout` | lead_management |
| Calendly webhook | `consultation.booked` | client_onboarding |
| Client created | `client.created` | client_onboarding |
| Order accepted | `order.accepted` | sales, project |
| Invoice paid | `invoice.paid` | finance |
| Job application | `application.received` | hr |

## n8n → Website Actions (`POST /api/webhooks/n8n`)

| Action | Purpose |
|--------|---------|
| `lead.update` | Update status, score, follow-up |
| `lead.assign` | Assign to sales user |
| `lead.qualify` | AI qualification + score |
| `client.create_from_lead` | Convert lead to client |
| `task.create` | Create project task |
| `meeting.create` | Schedule kickoff meeting |
| `notification.admin` | Notify admin team |
| `project.create_from_order` | Create project from order |

## External Lead Channels

Route Facebook/WhatsApp/LinkedIn leads through n8n workflow **04-lead-generation** → `POST /api/webhooks/inbound`

## Env Variables

```env
N8N_ENABLED=true
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=your-shared-secret
N8N_WEBHOOK_MASTER=/webhook/agency-automation
CRON_SECRET=your-cron-secret
```

## Workflow Map (your requirement tree)

| Folder | Workflow file |
|--------|---------------|
| Master Router | `01-master-router.json` |
| Lead Management | `02-lead-management.json` |
| Client Onboarding | `03-client-onboarding.json` |
| Lead Generation | `04-lead-generation.json` |
| Monitoring | `05-monitoring.json` |

Extend with Gmail, OpenAI, Stripe, Slack, WhatsApp nodes in n8n UI for:
- Sales Automation (proposals, payment reminders)
- Project Management (tasks, weekly reports)
- AI Automation (chatbot, proposal writer)
- Marketing (email campaigns, social posts)
- Customer Support (ticket routing, auto-reply)
- Finance (invoice reminders, reports)
- HR (resume parsing, interview scheduling)

## Calendly

Point Calendly webhook to: `https://yourdomain.com/api/webhooks/calendly`

## Security

All outbound events include `X-N8N-Signature` (HMAC-SHA256).
Inbound `/api/webhooks/n8n` and `/api/webhooks/inbound` verify this signature when `N8N_WEBHOOK_SECRET` is set.
