import React from 'react';

const WhyHireMe = () => {
  const steps = [
  {
    title: "End-to-End Development",
    description:
      "I handle everything from UI design and frontend development to backend APIs, database integration, and deployment — so you don’t need to hire multiple people.",
    icon: (
      <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm0 9a2 2 0 012-2h4a2 2 0 012 2v3H6a2 2 0 01-2-2v-1zm10-2h4a2 2 0 012 2v1a2 2 0 01-2 2h-4v-5z" />
    ),
  },
  {
    title: "Clean & Scalable Code",
    description:
      "I write structured, modular code that is easy to maintain, debug, and extend — making your project scalable for future growth.",
    icon: (
      <path d="M6 6h12M6 12h12M6 18h12M4 6h.01M4 12h.01M4 18h.01" />
    ),
  },
  {
    title: "Technical SEO Implementation",
    description:
      "I implement proper meta tags, semantic HTML, clean URL structure, and SEO-friendly architecture so your website is ready for ranking on Google.",
    icon: (
      <path d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 000-7.07 5 5 0 00-7.07 0L10 5m4 6a5 5 0 01-7.07 0L5.52 9.59a5 5 0 010-7.07 5 5 0 017.07 0L14 4" />
    ),
  },
  {
    title: "Security-Focused Development",
    description:
      "I follow modern security practices like environment variables, secure authentication patterns, input validation, and safe database handling to protect sensitive data.",
    icon: (
      <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4zm0 8v4m0 4h.01" />
    ),
  },
  {
    title: "Performance & Core Web Vitals",
    description:
      "I build fast-loading websites by optimizing rendering, minimizing unnecessary loading, and following Core Web Vitals best practices for better UX and SEO.",
    icon: (
      <path d="M12 3v3m6.364.636l-2.121 2.121M21 12h-3M18.364 17.364l-2.121-2.121M12 21v-3M5.757 18.364l2.121-2.121M3 12h3M5.757 5.757l2.121 2.121M12 8a4 4 0 100 8 4 4 0 000-8z" />
    ),
  },
];

  return (
    <section className="bg-background text-foreground py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Why Hire ME</h2>
          <div className="h-1 w-20 bg-primary mt-2" />
        </div>

        <div className="relative">
          {/* Persistent Spine: Left on mobile, Center on desktop */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex items-center w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
              >
                {/* Connecting Dot: Always visible */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 border-2 border-background z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

                {/* Content Block */}
                <div className="w-full md:w-[45%] pl-10 md:pl-0">
                  <div className="bg-surface p-6 rounded-xl border border-foreground/5 shadow-sm hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-background rounded-lg text-primary shadow-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          {step.icon}
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-primary-hover uppercase tracking-[0.2em]">Step {index + 1}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-surface-foreground text-sm leading-relaxed opacity-90">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Spacer to maintain grid symmetry on desktop */}
                <div className="hidden md:block md:w-[10%]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyHireMe;