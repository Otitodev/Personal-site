import type { SiteConfig, SiteContent } from "../types";

export const SITE_CONFIG: SiteConfig = {
  title: "Otito Ogene — Backend & AI Automation Engineer",
  author: "Otito Ogene",
  description:
    "Backend & AI Automation Engineer specializing in scalable API systems, workflow automation, and healthcare-focused software solutions.",
  lang: "en",
  siteLogo: "/otito-small.png",
  navLinks: [
    { text: "Experience", href: "#experience" },
    { text: "Projects", href: "/projects" },
    { text: "Blog", href: "/blog" },
    { text: "About", href: "#about" },
  ],
  socialLinks: [
    { text: "Upwork", href: "https://www.upwork.com/freelancers/~016f4dd94b74630944" },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/otito-ogene-315122201" },
    { text: "Github", href: "https://github.com/otitodev" }, // change if different
  ],
  socialImage: "/og-image.png",
  canonicalURL: "https://personal-site-3xu.pages.dev/", // update if hosting live
};

export const SITE_CONTENT: SiteContent = {
  hero: {
    name: "Otito Ogene",
    specialty: "Backend & AI Automation Engineer",
    summary:
      "I architect scalable backend systems, automate workflows, and build data-driven and enterprise solutions.",
    email: "otitodrichukwu@gmail.com",
  },

  experience: [
    {
      company: "Techbridge Nigeria",
      position: "Software Engineer",
      startDate: "Jan 2025",
      endDate: "Present",
      summary: [
        "Engineered scalable backend systems using Python (Django & FastAPI) to support high-volume data workloads.",
        "Optimized and deployed REST APIs processing 50M+ records monthly, improving reporting speed by 40%.",
        "Migrated legacy data workflows to AWS Glue and Redshift, cutting infrastructure costs by 25%.",
        "Collaborated across product teams to ensure seamless integration between services and client applications.",
      ],
    },
    {
      company: "Freelance",
      position: "Backend & Automation Engineer",
      startDate: "Nov 2023",
      endDate: "Present",
      summary: [
        "Developed backend architectures for healthcare, AI-driven, and e-commerce platforms.",
        "Integrated MistralAI, cloud APIs, payment systems, and automated workflows, reducing manual operations by 30%.",
        "Deployed scalable applications using Docker, Kubernetes, AWS, GCP, and Supabase.",
        "Designed and optimized data storage using PostgreSQL and MongoDB for performance and reliability.",
      ],
    },
    {
      company: "Hammer Games Nigeria",
      position: "Software Engineer Intern",
      startDate: "Mar 2024",
      endDate: "Oct 2024",
      summary: [
        "Built secure RESTful APIs supporting authentication and high-frequency transactions for 50K+ daily users.",
        "Implemented Redis caching and data pipelines, reducing response time by 35%.",
        "Collaborated with frontend teams to ship stable features and improve user experience.",
      ],
    },
  ],

  projects: [
    {
      name: "Triage AI",
      summary:
        "AI-assisted patient triage and clinical decision support system designed for low-resource healthcare facilities.",
      linkPreview: "/",
      linkSource: "https://github.com/otitogene", // replace when repo ready
      image: "/place_holder.png",
    },
    {
      name: "WhatsApp OrderBot Automation",
      summary:
        "Automated WhatsApp ordering, customer replies, and inventory updates for small businesses using Make.com & cloud functions.",
      linkPreview: "/",
      linkSource: "https://github.com/otitogene",
      image: "/place_holder.png",
    },
    {
      name: "Property Manager Lite",
      summary:
        "Offline-first property and tenant management system tailored for Nigerian landlords and estate caretakers.",
      linkPreview: "/",
      linkSource: "https://github.com/otitogene",
      image: "/place_holder.png",
    },
  ],

  about: {
    description: `
      I’m a Backend & AI Automation Engineer who enjoys turning complex workflows into simple, scalable systems that just work. I build APIs, automate processes, and deploy cloud-native applications that help businesses run smarter with less manual effort.
I care a lot about reliability, clarity, and maintainability — software should feel clean and predictable, not chaotic. Whether it’s workflow automation, platform backend architecture, or integrating AI models into real-world systems, I like solving the kinds of problems that make everything run smoother.
When I’m not writing code, you’ll probably find me playing the piano, watching football, or just exploring new ideas and tools to sharpen my craft.
    `,
    image: "/otito-big.png",
  },
};
