type NewTabProps = { target?: "_blank"; rel?: "noopener" };

// Links that leave the site, and the resume PDF, open in a new tab so visitors keep their place here.
export function newTabProps(href: string): NewTabProps {
    return /^https?:|\.pdf$/.test(href) ? { target: "_blank", rel: "noopener" } : {};
}
