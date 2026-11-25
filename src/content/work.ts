type Experience = {
    company: string;
    role: string;
    dates: string;
    location: string;
    description: string;
    skills: string;
};

export const work = {
    introduction: "GPU performance and graphics at Huawei, plus earlier work in web apps, security, and testing.",
    education: {
        school: "University of Waterloo",
        degree: "BASc in Computer Engineering, Co-op",
        date: "Jun 2026",
        location: "Waterloo, ON",
        detail: "Coursework in high-performance computing, machine learning, and distributed systems. Graduated with distinction.",
    },
};

export const experience: Experience[] = [
    {
        company: "Huawei",
        role: "Software Engineer Intern",
        dates: "Jan – Apr 2025",
        location: "Markham, ON",
        description: "I worked on neural rendering models, compute shaders, and an occlusion culling system, then profiled them to run faster on proprietary GPUs.",
        skills: "Performance Optimization, GPU Programming, Computer Graphics",
    },
    {
        company: "Nest Wealth",
        role: "Software Engineer Intern",
        dates: "May – Aug 2023",
        location: "Toronto, ON",
        description: "I maintained the DocuSign integration, built an asset allocation visualizer, and reviewed third-party applications for security issues.",
        skills: "Full-Stack Development, Security & Compliance, Wealth Management",
    },
    {
        company: "OpenText",
        role: "Software Engineer Intern",
        dates: "Sep – Dec 2022",
        location: "Waterloo, ON",
        description: "I automated workflows that test enterprise software, generate reports, and restore virtual environments.",
        skills: "QA & Automation, Content Management",
    },
];
