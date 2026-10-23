import Link from "next/link";
import { homeLinks } from "@/content/home";

export default function Home() {
    return (
        <div className="welcome">
            <div className="welcome-intro">
                <div>
                    <p className="eyebrow">Faith · Engineering · Writing · Photography</p>
                    <h1>Hi, I’m <em>Malcolm.</em></h1>
                    <p className="introduction">
                        I’m a computer engineering graduate from the University of Waterloo.
                        This is where I share my faith, my work, and a few things I enjoy.
                    </p>
                    <Link className="welcome-about" href="/about/">More about me</Link>
                </div>
                <div className="welcome-photo">
                    <span>Photo coming soon</span>
                </div>
            </div>
            <section className="welcome-sections" aria-labelledby="around-the-site">
                <h2 id="around-the-site">Have a look around!</h2>
                <ul className="welcome-links">
                    {homeLinks.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href}>
                                <h3>{link.title} <span aria-hidden="true">↗</span></h3>
                                <p>{link.description}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
