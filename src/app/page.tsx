import Link from "next/link";
import HillWave from "@/components/hill-wave";
import { featuredLinks, homeDescription, homeLinks } from "@/content/home";

export default function Home() {
    return (
        <div className="home">
            <section className="home-hero" aria-labelledby="greeting">
                <div className="home-hero-text">
                    <h1 id="greeting" className="greeting">
                        Hi, I’m <span className="greeting-accent">Malcolm!</span>
                    </h1>
                    <p className="home-description">{homeDescription}</p>
                    <Link className="home-link" href="/about/">About me</Link>
                </div>
                <div className="hero-photo">
                    <span>photo coming soon</span>
                </div>
            </section>
            <section className="home-ground full-bleed" aria-labelledby="around-the-site">
                <HillWave />
                <div className="home-ground-band">
                    <div className="home-ground-inner">
                        <h2 id="around-the-site" className="visually-hidden">Around the site</h2>
                        <ul className="home-entries">
                            {featuredLinks.map((link) => (
                                <li key={link.href} className="home-entry">
                                    <h3>{link.title}</h3>
                                    <p>{link.description}</p>
                                    <Link href={link.href}>
                                        {link.action}
                                        {link.actionContext && <span className="visually-hidden">{link.actionContext}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="home-also">
                            Also:{" "}
                            {homeLinks.map((link, index) => (
                                <span key={link.href}>
                                    {index > 0 && <span aria-hidden="true"> · </span>}
                                    <Link href={link.href}>{link.title}</Link>
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
