import React from 'react';

const HowIWork = () => {
  const steps = [
    {
      title: "Understanding Your Exact Goal",
      description: "Before writing code, I clarify what you need, who your users are, and what result you want (sales, leads, branding, speed, SEO).",
      icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    },
    {
      title: "Clean Structure, Built Step-by-Step",
      description: "I don't rush messy code. I build modularly so the project stays stable, easy to update, and scalable later.",
      icon: <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7H4V5zm6 0a1 1 0 011-1h4a1 1 0 011 1v7h-6V5zm6 0a1 1 0 011-1h2a1 1 0 011 1v7h-4V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3H4v-3zm6 0a1 1 0 011-1h4a1 1 0 011 1v3h-6v-3zm6 0a1 1 0 011-1h2a1 1 0 011 1v3h-4v-3z" />
    },
    {
      title: "Clear Communication Throughout",
      description: "I share regular updates and confirm changes early, so you always know what's happening and nothing is 'surprising' at the end.",
      icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    },
    {
      title: "Performance, SEO & Real-World Usability",
      description: "I build mobile-first, optimize speed, and apply technical SEO so your website looks good and works well in real use.",
      icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    },
    {
      title: "Professional Testing & Delivery",
      description: "I check responsiveness, forms, links, and edge cases, fix bugs properly, then deploy your project live and guide you on the next steps.",
      icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  ];

  return (
    <section className="bg-background text-foreground py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">How I Work</h2>
          <div className="h-1 w-20 bg-primary mt-2" />
        </div>

        {/* Mobile: Stacked Cards */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-surface border border-foreground/10 rounded-xl p-6 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                    {step.icon}
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-surface-foreground text-sm leading-relaxed opacity-90">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Horizontal Stepped Flow */}
        <div className="hidden md:block">
          {/* Connecting Line */}
          <div className="relative mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -translate-y-1/2" />
            <div className="relative flex justify-between">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                />
              ))}
            </div>
          </div>

          {/* Step Cards */}
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group"
              >
                <div className="bg-surface border border-foreground/10 rounded-xl p-5 h-full hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                      {step.icon}
                    </svg>
                  </div>

                  {/* Step Number */}
                  <div className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-3">
                    Step {index + 1}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-surface-foreground text-xs leading-relaxed opacity-90">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowIWork;