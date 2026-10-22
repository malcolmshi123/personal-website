export default function Home() {
    return (
        <div className="site-shell">
            <header className="site-header">
                <a className="wordmark" href="/" aria-label="Malcolm Shi, home">
                    Malcolm Shi<span aria-hidden="true">.</span>
                </a>
                <span className="site-note">Welcome</span>
            </header>
            <main id="main-content" className="welcome">
                <p className="eyebrow">Faith · Engineering · Writing · Photography</p>
                <h1>Hi, I’m <em>Malcolm.</em></h1>
                <p className="introduction">
                    I’m putting this site together to share a bit about my faith,
                    my work, and the things I enjoy.
                </p>
                <div className="preview-note">
                    <span className="status-dot" aria-hidden="true" />
                    <p>I’m still working on the site. More pages and photos coming soon.</p>
                </div>
            </main>
            <footer className="site-footer">
                <span>Malcolm Shi</span>
            </footer>
        </div>
    );
}
