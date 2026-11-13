import Link from "next/link";
import HillWave from "@/components/hill-wave";
import PhotoStack from "@/components/photo-stack";
import { featuredLinks } from "@/content/home";

export default function Home() {
    return (
        <div className="home">
            <section className="home-hero" aria-labelledby="greeting">
                <div className="home-hero-text">
                    <div className="greeting-row">
                        <h1 id="greeting" className="greeting">
                            Hi, I’m <br /><span className="greeting-accent">Malcolm!</span>
                        </h1>
                        <div className="greeting-portrait">
                            <span>portrait coming soon</span>
                        </div>
                    </div>
                    <p className="home-description">
                        I’m a computer engineering graduate from Waterloo.
                        I like to write <Link href="/blog/">blogs</Link> and take <Link href="/photos/">photos</Link>.
                        Have a look around!
                    </p>
                    <Link className="home-link" href="/contact/">Contact me</Link>
                </div>
                <PhotoStack />
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
                    </div>
                </div>
            </section>
        </div>
    );
}
