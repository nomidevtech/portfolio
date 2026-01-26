import React from 'react';
// import { ExternalLink, Mail, ArrowRight } from 'lucide-react';

const HireMeSection = () => {
  const hireMeData = {
    heading: "Hire Me",
    message:
      "The fastest and safest way to work with me is through Fiverr or Upwork. These platforms ensure secure payments, clear communication, and structured milestones.",
    platforms: [
      {
        name: "Fiverr",
        url: "https://www.fiverr.com/yourusername",
        ctaText: "Hire me on Fiverr",
        priority: "primary"
      },
      {
        name: "Upwork",
        url: "https://www.upwork.com/freelancers/~yourprofileid",
        ctaText: "Hire me on Upwork",
        priority: "secondary"
      }
    ],
    fallbackContact: {
      label: "Email",
      value: "yourname@email.com",
      note: "For general inquiries only"
    }
  };

  return (
    <section className="py-20 px-6 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context & Intent */}
          <div className="md:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase border-l-2 border-primary text-primary">
              Availability: Open
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              {hireMeData.heading}
            </h2>
            <p className="text-lg leading-relaxed text-surface-foreground opacity-90 max-w-md">
              {hireMeData.message}
            </p>
          </div>

          {/* Right Column: Platform Interaction */}
          <div className="md:col-span-7 grid gap-4">
            {hireMeData.platforms.map((platform, idx) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden p-8 rounded-2xl transition-all duration-300 border border-surface 
                  ${idx === 0 ? 'bg-surface md:translate-x-4' : 'bg-background hover:bg-surface'}`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium opacity-60 block mb-1">Trusted Platform</span>
                    <h3 className="text-2xl font-bold">{platform.name}</h3>
                  </div>
                  <div className={`p-3 rounded-full transition-all duration-300 
                    ${idx === 0 ? 'bg-cta text-cta-foreground' : 'bg-surface text-surface-foreground group-hover:bg-cta group-hover:text-cta-foreground'}`}>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                {/* Subtle background text for "Not Basic" feel */}
                <span className="absolute -bottom-4 -right-2 text-6xl font-black opacity-[0.03] select-none uppercase tracking-tighter">
                  {platform.name}
                </span>
              </a>
            ))}

            {/* Fallback Section - Integrated but distinct */}
            <div className="mt-4 p-6 rounded-2xl border-2 border-dashed border-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-surface rounded-lg">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight">{hireMeData.fallbackContact.label}</p>
                  <p className="text-surface-foreground opacity-80">{hireMeData.fallbackContact.value}</p>
                </div>
              </div>
              <p className="text-xs italic opacity-60 sm:text-right max-w-[150px]">
                {hireMeData.fallbackContact.note}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HireMeSection;