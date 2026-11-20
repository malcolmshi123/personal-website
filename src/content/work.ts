type Experience = {
    company: string;
    role: string;
    dates: string;
    location: string;
    description: string;
    skills: string;
};

export const work = {
    introduction: "GPU performance and LLM inference, plus earlier work in graphics, web apps, and testing.",
    education: {
        school: "University of Waterloo",
        degree: "BASc in Computer Engineering, Co-op",
        date: "Jun 2026",
        location: "Waterloo, ON",
        detail: "Graduated with distinction. My coursework included high-performance computing, machine learning, and distributed systems.",
    },
};

export const experience: Experience[] = [
    {
        company: "Huawei",
        role: "Software Engineer Intern",
        dates: "Jan – Apr 2025",
        location: "Markham, ON",
        description: "I built neural rendering models, compute shaders, and an occlusion culling system, and profiled them to run faster on proprietary GPUs.",
        skills: "Computer Graphics, GPU Programming, Performance Optimization",
    },
    {
        company: "Nest Wealth",
        role: "Software Engineer Intern",
        dates: "May – Aug 2023",
        location: "Toronto, ON",
        description: "I set up document signing, built an asset allocation visualizer, and reviewed third-party applications for security issues.",
        skills: "Wealth Management, Full-Stack Development, Security & Compliance",
    },
    {
        company: "OpenText",
        role: "Software Engineer Intern",
        dates: "Sep – Dec 2022",
        location: "Waterloo, ON",
        description: "I automated end-to-end testing for enterprise software, built tools that summarize failures into reports, and scripted virtual machine resets between runs.",
        skills: "Content Management, QA & Automation",
    },
];
