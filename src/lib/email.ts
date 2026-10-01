import { SITE_CONFIG } from "./constants";

interface LeadEmailData {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
}

export async function notifyNewLead(lead: LeadEmailData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || SITE_CONFIG.email;
  const resendKey = process.env.RESEND_API_KEY;

  const subject = `[${SITE_CONFIG.name}] New ${lead.type} Lead from ${lead.name}`;
  const html = `
    <h2>New Lead: ${lead.type}</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ""}
    ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ""}
    ${lead.service ? `<p><strong>Service/Package:</strong> ${lead.service}</p>` : ""}
    ${lead.budget ? `<p><strong>Budget:</strong> ${lead.budget}</p>` : ""}
    ${lead.message ? `<p><strong>Message:</strong><br/>${lead.message.replace(/\n/g, "<br/>")}</p>` : ""}
    <p><a href="${SITE_CONFIG.url}/admin/leads">View in Admin Dashboard</a></p>
  `;

  if (!resendKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Email] Lead notification (RESEND_API_KEY not set):", subject);
    }
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || `${SITE_CONFIG.name} <onboarding@resend.dev>`,
        to: [adminEmail],
        subject,
        html,
      }),
    });
  } catch (error) {
    console.error("[Email] Failed to send lead notification:", error);
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Email]", subject, "to", to);
    }
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || `${SITE_CONFIG.name} <onboarding@resend.dev>`,
      to: [to],
      subject,
      html,
    }),
  });
}

export async function sendConfirmationEmail(
  to: string,
  name: string,
  type: string
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const messages: Record<string, string> = {
    CONTACT: "We received your message and will respond within 24 hours.",
    INQUIRY: "We received your project inquiry. Our team will review it shortly.",
    AUDIT: "We received your free audit request. We'll analyze your site and get back to you soon.",
    CHECKOUT: "We received your payment request. We'll send you an invoice shortly.",
    NEWSLETTER: "You're subscribed to our newsletter. Welcome aboard!",
    CONSULTATION: "Your consultation request has been received.",
  };

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || `${SITE_CONFIG.name} <onboarding@resend.dev>`,
        to: [to],
        subject: `Thank you for contacting ${SITE_CONFIG.name}`,
        html: `<p>Hi ${name},</p><p>${messages[type] || "Thank you for reaching out."}</p><p>— ${SITE_CONFIG.name}</p>`,
      }),
    });
  } catch {
    // non-critical
  }
}
