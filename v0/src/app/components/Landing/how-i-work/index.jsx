import React from 'react';

const HowIWork = () => {
  const steps = [
    {
      title: "Understanding Requirements",
      description: "I start by clearly understanding the project goals, target users, and technical constraints to avoid rework later.",
      icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    },
    {
      title: "Planning & Architecture",
      description: "I design the component structure, data flow, and API interactions before implementation.",
      icon: <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    },
    {
      title: "Development",
      description: "I build features incrementally using clean, readable, and scalable code practices.",
      icon: <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    },
    {
      title: "Testing & Refinement",
      description: "I test functionality across devices and browsers, fixing issues and optimizing performance.",
      icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" />
    },
    {
      title: "Deployment & Support",
      description: "I deploy the application and remain available for updates or improvements.",
      icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    }
  ];

  return (
    <section className="bg-background text-foreground py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">How I Work</h2>
          <div className="h-1 w-20 bg-primary mt-2" />
        </div>

        <div className="relative">
          {/* Persistent Spine: Left on mobile, Center on desktop */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`relative flex items-center w-full ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
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

export default HowIWork;