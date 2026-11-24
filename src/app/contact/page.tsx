import { createPageMetadata } from "@/lib/site-metadata";
import ContactForm from "@/components/contact-form";
import LinkIcon from "@/components/link-icon";
import { contactLinks } from "@/content/contact";
import { newTabProps } from "@/lib/links";

export const metadata = createPageMetadata(
    "Contact",
    "Get in touch with Malcolm Shi.",
    "/contact",
);

export default function Contact() {
    return (
        <div className="page-content reading-page">
            <h1>Contact</h1>
            <p className="introduction">Let’s get in touch!</p>
            <div className="related-links contact-links">
                {contactLinks.map((link) => (
                    <a href={link.href} {...newTabProps(link.href)} key={link.href}>
                        <LinkIcon name={link.icon} />
                        {link.label}
                    </a>
                ))}
            </div>
            <section className="prose" aria-labelledby="send-a-message">
                <h2 className="contact-heading" id="send-a-message">Send a message</h2>
                <ContactForm />
            </section>
        </div>
    );
}
