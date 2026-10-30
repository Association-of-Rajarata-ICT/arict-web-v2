import type { ContactInput } from "../validations/public";

/**
 * EmailJS configuration. These are browser-safe identifiers (EmailJS is designed
 * to be called from the client); no private keys are used anywhere.
 * Restrict allowed origins to https://arict.lk in the EmailJS dashboard.
 */
export const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};

export const isEmailjsConfigured = () =>
  Boolean(emailjsConfig.serviceId && emailjsConfig.templateId && emailjsConfig.publicKey);

/** Template parameters expected by the "Contact Us" EmailJS template (see README). */
export function contactTemplateParams(data: ContactInput, sourcePage: string) {
  return {
    from_name: data.name,
    from_email: data.email,
    reply_to: data.email,
    phone: data.phone || "Not provided",
    subject: data.subject,
    message: data.message,
    submitted_at: new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Colombo",
    }).format(new Date()),
    source_page: sourcePage,
  };
}

export async function sendContactEmail(data: ContactInput, sourcePage: string) {
  const { default: emailjs } = await import("@emailjs/browser");
  return emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, contactTemplateParams(data, sourcePage), {
    publicKey: emailjsConfig.publicKey,
    blockHeadless: true,
    limitRate: { id: "arict-contact", throttle: 60_000 },
  });
}
