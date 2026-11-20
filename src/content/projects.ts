type Project = {
    name: string;
    status?: string;
    description: string;
    technologies: string;
    href: string;
};

export const projectsIntroduction = "Some things I’ve built.";

export const projects: Project[] = [
    {
        name: "LLM Inference Optimization Lab",
        description: "I built a GPU model-serving setup and an asynchronous benchmarking framework to study how serving decisions affect latency and throughput. I experiment with concurrency, scheduling token budgets, and prefix-cache reuse, and read the results through server metrics and GPU profiling.",
        technologies: "Python, vLLM, Modal, PyTorch Profiler, Prometheus",
        href: "https://github.com/malcolmshi123/llm-inference-optimization-lab",
    },
    {
        name: "TFTeacher",
        status: "in progress",
        description: "I’m building a web app that reviews finished Teamfight Tactics games round by round. It finds the few decisions that cost you placements, like a loss streak held too long or gold you never spent, and points each one to the round it came from.",
        technologies: "TypeScript, Next.js, Tailwind CSS, Claude API",
        href: "https://github.com/malcolmshi123/tfteacher",
    },
    {
        name: "GojoBracken",
        description: "I made a cosmetic mod for Lethal Company that replaces the Bracken with Gojo Satoru. When the Bracken turns aggressive, Gojo plays a Japanese voice line over looping music, and as it gets angrier, the music gets louder and his aura grows stronger.",
        technologies: "C#, Unity, Blender",
        href: "https://github.com/malcolmshi123/GojoBracken",
    },
    {
        name: "Personal Website",
        description: "I designed and built this site to bring my faith, engineering work, writing, and photos together in one place. It’s a static Next.js site with light and dark themes and a homepage that fits on one screen.",
        technologies: "TypeScript, Next.js, Formspree",
        href: "https://github.com/malcolmshi123/personal-website",
    },
];
