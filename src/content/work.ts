type Project = {
    name: string;
    date: string;
    description: string;
    technologies: string;
    href: string;
};

type Experience = {
    company: string;
    role: string;
    team: string;
    dates: string;
    description: string;
};

export const work = {
    introduction: "My recent work focuses on GPU performance and LLM inference. I’ve also worked on graphics and rendering, web applications, and test automation.",
    education: {
        school: "University of Waterloo",
        degree: "BASc in Computer Engineering, Co-op",
        date: "June 2026",
        detail: "Graduated with distinction.",
    },
};

export const projects: Project[] = [
    {
        name: "LLM Inference Optimization Lab",
        date: "October 2026",
        description: "I built a GPU model-serving setup and an asynchronous benchmarking framework to study how serving decisions affect latency and throughput. My experiments look at concurrency, scheduling token budgets, and prefix-cache reuse, using server metrics and GPU profiling to understand the results.",
        technologies: "Python, vLLM, Modal, PyTorch Profiler, Prometheus",
        href: "https://github.com/malcolmshi123/llm-inference-optimization-lab",
    },
];

export const experience: Experience[] = [
    {
        company: "Huawei",
        role: "Software Engineer Intern",
        team: "Software-Hardware Optimization Lab",
        dates: "January – April 2025",
        description: "I worked on neural rendering models with 3D Gaussian Splatting and NeRF, Vulkan compute shaders on Android, and an occlusion culling system using DirectX 12 Work Graphs. Much of the work involved profiling GPU execution and improving rendering performance on embedded systems.",
    },
    {
        company: "Nest Wealth",
        role: "Software Engineer Intern",
        team: "Pro 1.0 Platform",
        dates: "May – August 2023",
        description: "I worked on APIs and document-signing workflows, built an Angular visualization for asset allocation, and reviewed third-party applications for security issues. The work spanned the backend, the interface, and the infrastructure supporting the platform.",
    },
    {
        company: "OpenText",
        role: "Software Engineer Intern",
        team: "Content Server Core",
        dates: "September – December 2022",
        description: "I automated tests for enterprise software with Selenium, built tools to turn test failures into useful reports, and scripted the setup and reset of test environments. This helped make regression testing and debugging easier to repeat.",
    },
];
