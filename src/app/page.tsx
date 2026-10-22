export default function Home() {
    return (
        <div className="welcome">
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
        </div>
    );
}
