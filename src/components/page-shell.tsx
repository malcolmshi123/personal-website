type PageShellProps = {
    title: string;
    introduction: string;
};

export default function PageShell({ title, introduction }: PageShellProps) {
    return (
        <div className="page-content">
            <h1>{title}</h1>
            <p className="introduction">{introduction}</p>
            <p className="page-note">I’m still putting this page together.</p>
        </div>
    );
}
