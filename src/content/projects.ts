type Project = {
    name: string;
    // A short phrase for the page description, like "a Lethal Company mod".
    label: string;
    status?: string;
    description: string;
    technologies: string;
    href: string;
    thunderstoreHref?: string;
    // srcInLightTheme replaces src while the site is in light mode.
    image: { src: string; alt: string; srcInLightTheme?: string };
};

export const projectsIntroduction = "What I’ve built.";

// Search results cut descriptions off around 155 characters, so only the first three projects are named.
export function projectsDescription(list: { label: string }[]): string {
    const labels = list.slice(0, 3).map((project) => project.label);
    const joined = labels.length < 3 ? labels.join(" and ") : `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
    return `What I’ve built: ${joined}.`;
}

export const projects: Project[] = [
    {
        name: "LLM Inference Optimization Lab",
        label: "LLM inference benchmarks",
        description: "I built a GPU model-serving setup and an asynchronous benchmarking framework to study how configuration choices affect latency and throughput. I experiment with concurrency, token budgets, and KV cache reuse, and analyze the results with server metrics and GPU profiling.",
        technologies: "Python, vLLM, Modal, Prometheus, PyTorch Profiler",
        href: "https://github.com/malcolmshi123/llm-inference-optimization-lab",
        image: { src: "/projects/llm-inference-optimization-lab.webp", alt: "System architecture diagram: a Python benchmark client streams requests from a vLLM server on Modal GPUs, and the results and Prometheus metrics feed offline analysis" },
    },
    {
        name: "GojoBracken",
        label: "a Lethal Company mod",
        description: "I made a cosmetic mod for Lethal Company that replaces the Bracken with Gojo Satoru. When the Bracken enters aggro, Gojo plays a Japanese voice line over looping music. As the Bracken gets angrier, the music gets louder and Gojo’s aura grows stronger.",
        technologies: "C#, Unity, Blender",
        href: "https://github.com/malcolmshi123/GojoBracken",
        thunderstoreHref: "https://thunderstore.io/c/lethal-company/p/FreakyFriday/GojoBracken",
        image: { src: "/projects/gojobracken.webp", alt: "Gojo standing in the Lethal Company ship, surrounded by a blue aura" },
    },
    {
        name: "Personal Website",
        label: "this site",
        description: "I designed and built this site to bring my faith, work, writing, and photos together in one place. It’s a static Next.js site on Vercel that pulls my latest Medium posts every day and sends messages through Formspree.",
        technologies: "TypeScript, Next.js, Vercel, Formspree",
        href: "https://github.com/malcolmshi123/personal-website",
        image: { src: "/projects/personal-website.webp", srcInLightTheme: "/projects/personal-website-dark.webp", alt: "The landing page of this website" },
    },
];
