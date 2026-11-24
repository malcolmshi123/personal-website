import HillWave from "@/components/hill-wave";
import LinkIcon from "@/components/link-icon";
import { contactLinks } from "@/content/contact";
import { footerVerse } from "@/content/site";
import { newTabProps } from "@/lib/links";

const copyrightYear = new Date().getFullYear();

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <HillWave />
            <div className="site-footer-band">
                <div className="site-footer-inner">
                    <p className="site-footer-copyright">© {copyrightYear} Malcolm Shi</p>
                    <p className="site-footer-verse">
                        <span className="site-footer-verse-text">“{footerVerse.text}”</span>{" "}
                        <span className="site-footer-verse-reference">{footerVerse.reference}</span>
                    </p>
                    <ul className="site-footer-links">
                        {contactLinks.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} {...newTabProps(link.href)} aria-label={link.iconLabel} title={link.iconLabel}>
                                    <LinkIcon name={link.icon} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
