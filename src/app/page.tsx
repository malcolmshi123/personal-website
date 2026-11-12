import Link from "next/link";
import ArrowIcon from "@/components/arrow-icon";
import { featuredLinks, homeLinks } from "@/content/home";

export default function Home() {
    return (
        <div className="welcome">
            <section className="welcome-intro" aria-labelledby="welcome-heading">
                <div className="welcome-text">
                    <h1 id="welcome-heading">Hi, I’m Malcolm.</h1>
                    <p className="introduction">
                        I’m a computer engineering graduate from the University of Waterloo.
                        This is where I share my faith, my work, and a few things I enjoy.
                    </p>
                    <div className="welcome-actions">
                        <Link className="button button-primary" href="/work/">See my work</Link>
                        <Link className="button button-secondary" href="/gospel/">Read the good news</Link>
                    </div>
                </div>
                <div className="welcome-photo">
                    <span>Photo coming soon</span>
                </div>
            </section>
            <section className="welcome-sections" aria-labelledby="around-the-site">
                <h2 id="around-the-site">Have a look around!</h2>
                <ul className="featured-links">
                    {featuredLinks.map((link) => (
                        <li key={link.href}>
                            <Link className={`featured-card featured-card-${link.tone}`} href={link.href}>
                                <h3>{link.title}</h3>
                                <p>{link.description}</p>
                                <span className="featured-detail">{link.detail}</span>
                                <span className="card-action">
                                    {link.action}
                                    <ArrowIcon />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <ul className="welcome-links">
                    {homeLinks.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href}>
                                <h3>
                                    {link.title}
                                    <ArrowIcon />
                                </h3>
                                <p>{link.description}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
