"use client";

import { useState, type FormEvent } from "react";

const formspreeEndpoint = "https://formspree.io/f/xzeebqoe";

type Status = "idle" | "sending" | "sent" | "failed";

const statusMessages: Record<Status, string> = {
    idle: "",
    sending: "Sending…",
    sent: "Thanks! Your message was sent. I’ll get back to you soon.",
    failed: "Sorry, your message didn’t send. Please try again in a moment.",
};

export default function ContactForm() {
    const [status, setStatus] = useState<Status>("idle");

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const form = event.currentTarget;
        setStatus("sending");
        try {
            const response = await fetch(formspreeEndpoint, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
            });
            if (!response.ok) {
                setStatus("failed");
                return;
            }
            form.reset();
            setStatus("sent");
        } catch {
            setStatus("failed");
        }
    }

    return (
        <form
            className="contact-form"
            action={formspreeEndpoint}
            method="POST"
            aria-label="Send a message"
            onSubmit={handleSubmit}
        >
            <fieldset>
                <label htmlFor="contact-name">
                    Name
                    <input id="contact-name" name="name" type="text" autoComplete="name" maxLength={100} required />
                </label>
                <label htmlFor="contact-email">
                    Email
                    <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required />
                </label>
                <label htmlFor="contact-message">
                    Message
                    <textarea id="contact-message" name="message" rows={6} maxLength={5000} required />
                </label>
                <input className="contact-trap" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <button type="submit" disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Send message"}
                </button>
                <p className="contact-status" role="status" aria-live="polite">
                    {/* Keyed by status so each new message eases in; the live region itself stays put so it's announced. */}
                    {statusMessages[status] && <span key={status} className="contact-status-message">{statusMessages[status]}</span>}
                </p>
            </fieldset>
        </form>
    );
}
