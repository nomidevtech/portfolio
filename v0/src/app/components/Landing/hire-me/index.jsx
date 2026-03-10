import React from 'react';
import { ExternalLink, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

const hireMeData = {
  heading: "Hire Me",
  message:
    "The fastest and safest way to work with me is through Fiverr or Upwork. These platforms ensure secure payments, clear communication, and structured milestones.",
  platforms: [
    {
      name: "Fiverr",
      url: "https://www.fiverr.com/yourusername",
      ctaText: "Hire me on Fiverr",
      priority: "primary",
      // Blends Fiverr green into your primary, then "back" with a subtle overlay
      brandColor: "#1dbf73"
    },
    {
      name: "Upwork",
      url: "https://www.upwork.com/freelancers/~yourprofileid",
      ctaText: "Hire me on Upwork",
      priority: "secondary",
      brandColor: "#14a800"
    }
  ],
  fallbackContact: {
    label: "Email",
    value: "yourname@email.com",
    note: "For general inquiries only"
  }
};

const HireMe = () => {
  return (
    <section className="py-24 px-6 bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-surface p-1 dark:bg-surface/50">
          
          <div className="flex items-center gap-2 px-8 pt-8 text-primary">
            <ShieldCheck size={18} />
            <span className="text-xs font-mono uppercase tracking-[0.2em] font-semibold">
              Secure Collaboration Protocol
            </span>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              {/* Left Column */}
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  {hireMeData.heading}<span className="text-primary">.</span>
                </h2>
                <p className="text-surface-foreground leading-relaxed text-lg">
                  {hireMeData.message}
                </p>
                
                <div className="pt-4 border-t border-foreground/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                      {hireMeData.fallbackContact.note}
                    </span>
                    <a 
                      href={`mailto:${hireMeData.fallbackContact.value}`}
                      className="group flex items-center gap-2 text-foreground hover:text-primary transition-colors mt-1"
                    >
                      <Mail size={16} className="text-primary" />
                      <span className="font-medium underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary">
                        {hireMeData.fallbackContact.value}
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column with Double Blending */}
              <div className="flex flex-col gap-4">
                {hireMeData.platforms.map((platform) => {
                  const isPrimary = platform.priority === "primary";
                  
                  return (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        group relative overflow-hidden flex items-center justify-between p-6 rounded-2xl border transition-all duration-500
                        ${isPrimary 
                          ? 'bg-cta text-cta-foreground border-transparent' 
                          : 'bg-foreground/5 text-foreground border-foreground/5'}
                      `}
                      // We use inline styles for the dynamic brand color to keep it clean
                      style={{ '--brand-color': platform.brandColor }}
                    >
                      {/* Layer 1: The Brand Gradient (The "Under-glow") */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(135deg,var(--brand-color)_0%,transparent_100%)]" />

                      {/* Layer 2: The "Blend Back" (The Palette Overlay) */}
                      {/* This uses your theme's primary color to wash over the brand color */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-primary mix-blend-overlay" />

                      <div className="flex flex-col z-10">
                        <span className={`text-xs font-mono mb-1 transition-colors duration-300
                          ${isPrimary ? 'opacity-80 group-hover:text-white/80' : 'text-primary group-hover:text-white/70'}`}>
                          Official {platform.name} Profile
                        </span>
                        <span className="text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-white">
                          {platform.ctaText}
                        </span>
                      </div>
                      
                      <div className={`
                        z-10 p-3 rounded-full transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-white/20 group-hover:text-white
                        ${isPrimary ? 'bg-cta-foreground/10' : 'bg-primary/10'}
                      `}>
                        <ArrowRight size={20} />
                      </div>

                      {/* Floating Decorative Icon */}
                      <div className="absolute top-0 right-0 p-1 opacity-[0.03] pointer-events-none group-hover:opacity-10 group-hover:text-white transition-opacity">
                         <ExternalLink size={80} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom decorative bar */}
          <div className="h-2 w-full flex">
            <div className="h-full w-1/3 bg-primary/20"></div>
            <div className="h-full w-1/3 bg-primary/40"></div>
            <div className="h-full w-1/3 bg-primary"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HireMe;