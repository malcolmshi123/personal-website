import { createPageMetadata } from "@/lib/site-metadata";
import { contactLinks } from "@/content/contact";

export const metadata = createPageMetadata(
    "Contact",
    "Get in touch with Malcolm Shi.",
    "/contact/",
);

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
                <form
                    className="contact-form"
                    action="https://formspree.io/f/xzeebqoe"
                    method="POST"
                    aria-label="Send a message"
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
                        <button type="submit">Send message</button>
                    </fieldset>
                </form>
            </section>
        </div>
    );
}
