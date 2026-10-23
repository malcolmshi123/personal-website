import type { Metadata } from "next";
import { contactLinks } from "@/content/contact";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with Malcolm Shi.",
};

export default function Contact() {
    return (
        <div className="page-content reading-page">
            <h1>Contact</h1>
            <p className="introduction">Want to chat? You can find me here.</p>
            <div className="related-links contact-links">
                {contactLinks.map((link) => (
                    <a href={link.href} key={link.href}>{link.label}</a>
                ))}
            </div>
            <section className="prose" aria-labelledby="send-a-message">
                <h2 className="contact-heading" id="send-a-message">Send a message</h2>
                <p className="contact-notice" id="contact-notice">
                    I’m still setting up this form. You can message me on LinkedIn in the meantime.
                </p>
                <form className="contact-form" aria-label="Send a message" aria-describedby="contact-notice">
                    <fieldset disabled>
                        <label htmlFor="contact-name">
                            Name
                            <input id="contact-name" name="name" type="text" autoComplete="name" />
                        </label>
                        <label htmlFor="contact-email">
                            Email
                            <input id="contact-email" name="email" type="email" autoComplete="email" />
                        </label>
                        <label htmlFor="contact-message">
                            Message
                            <textarea id="contact-message" name="message" rows={6} />
                        </label>
                        <button type="button" disabled>Send message</button>
                    </fieldset>
                </form>
            </section>
        </div>
    );
}
