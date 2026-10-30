"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { isEmailjsConfigured, sendContactEmail } from "@/lib/emailjs";
import { contactSchema } from "@/lib/validations/public";
import { fieldErrorsFrom, type FieldErrors } from "@/lib/validations/common";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Honeypot, Input, Textarea } from "@/components/ui/form";

const COOLDOWN_MS = 60_000;
const MIN_FILL_MS = 3_000;
const STORAGE_KEY = "arict-contact-last-sent";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm({ fallbackEmail }: { fallbackEmail?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const mountedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const configured = isEmailjsConfigured();

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function lastSent() {
    try {
      return Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    } catch {
      return 0;
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setNotice(null);
    const form = event.currentTarget;
    const fd = new FormData(form);

    // Honeypot: pretend success for bots.
    if (String(fd.get("company_website") ?? "").trim()) {
      setStatus("success");
      return;
    }

    const parsed = contactSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      const errs = fieldErrorsFrom(parsed.error);
      setErrors(errs);
      setStatus("idle");
      form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setErrors({});

    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      setNotice("Please take a moment to review your message, then send it again.");
      return;
    }
    const wait = lastSent() + COOLDOWN_MS - Date.now();
    if (wait > 0) {
      setNotice(`Please wait ${Math.ceil(wait / 1000)} seconds before sending another message.`);
      return;
    }

    setStatus("sending");
    try {
      await sendContactEmail(parsed.data, window.location.href);
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {}
      form.reset();
      setStatus("success");
    } catch (error) {
      console.error("EmailJS send failed", error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-line bg-white p-8 text-center shadow-soft sm:p-10">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-emerald-600" />
        <p className="mt-5 text-lg font-semibold">Message sent</p>
        <p className="mx-auto mt-2 max-w-sm text-muted">Your message has been sent successfully. We&apos;ll get back to you soon.</p>
        <Button variant="outline" className="mt-7" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-5 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <Honeypot />
      {!configured && (
        <FormMessage tone="info">
          The contact form isn&apos;t configured yet.
          {fallbackEmail ? (
            <>
              {" "}
              Please email us at{" "}
              <a className="font-medium underline" href={`mailto:${fallbackEmail}`}>
                {fallbackEmail}
              </a>
              .
            </>
          ) : null}
        </FormMessage>
      )}
      {status === "error" && (
        <FormMessage tone="error">We couldn&apos;t send your message. Please try again.</FormMessage>
      )}
      {notice && <FormMessage tone="info">{notice}</FormMessage>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required error={errors.name}>
          <Input name="name" autoComplete="name" required maxLength={100} error={errors.name} disabled={sending} />
        </Field>
        <Field label="Email" name="email" required error={errors.email}>
          <Input name="email" type="email" autoComplete="email" required maxLength={254} error={errors.email} disabled={sending} />
        </Field>
        <Field label="Phone" name="phone" error={errors.phone}>
          <Input name="phone" type="tel" autoComplete="tel" maxLength={20} error={errors.phone} disabled={sending} />
        </Field>
        <Field label="Subject" name="subject" required error={errors.subject}>
          <Input name="subject" required maxLength={150} error={errors.subject} disabled={sending} />
        </Field>
      </div>
      <Field label="Message" name="message" required error={errors.message}>
        <Textarea name="message" required rows={6} maxLength={3000} error={errors.message} disabled={sending} />
      </Field>
      <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">We usually reply within a few working days.</p>
        <Button type="submit" variant="dark" size="lg" arrow={!sending} disabled={sending || !configured}>
          {sending ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
