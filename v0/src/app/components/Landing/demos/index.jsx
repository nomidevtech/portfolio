'use client'
import React, { useState } from 'react';

const DEMOS = [
  {
    id: 1,
    title: "Analytics Dashboard",
    image: "https://via.placeholder.com/1200x675/1e293b/60a5fa?text=Analytics+Dashboard",
    link: "#demo-dashboard" 
  },
  {
    id: 2,
    title: "SaaS Landing Page",
    image: "https://via.placeholder.com/1200x675/334155/34d399?text=SaaS+Landing+Page",
    link: "#demo-landing"
  },
  {
    id: 3,
    title: "Mobile App Interface",
    image: "https://via.placeholder.com/1200x675/475569/f472b6?text=Mobile+App+UI",
    link: "#demo-mobile"
  }
];

const Demo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirst = currentIndex === 0;
    setCurrentIndex(isFirst ? DEMOS.length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    const isLast = currentIndex === DEMOS.length - 1;
    setCurrentIndex(isLast ? 0 : currentIndex + 1);
  };

  const activeDemo = DEMOS[currentIndex];

  return (
    <section className="bg-background text-foreground py-12 px-4 md:py-24 md:px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            Live UI Demos
          </h2>
          <p className="text-surface-foreground mt-3 text-base md:text-lg">
            Explore functional prototypes and live interface concepts.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="w-full relative max-w-4xl">
          
          {/* Main Card: Stacks on mobile, Overlay on desktop */}
          <div className="flex flex-col bg-surface rounded-2xl shadow-2xl overflow-hidden border border-surface-foreground/10 md:relative md:block">
            
            {/* 1. Image Area */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img 
                src={activeDemo.image} 
                alt={activeDemo.title} 
                className="w-full h-full object-cover"
              />
              
              {/* Mobile Arrows: Inside the image so they don't break layout */}
              <div className="absolute inset-0 flex items-center justify-between px-2 md:hidden">
                <button onClick={prevSlide} className="bg-black/40 text-white p-2 rounded-full backdrop-blur-sm">←</button>
                <button onClick={nextSlide} className="bg-black/40 text-white p-2 rounded-full backdrop-blur-sm">→</button>
              </div>
            </div>
            
            {/* 2. Content Area: Below on mobile, Overlay on md+ */}
            <div className="p-5 md:p-8 md:absolute md:bottom-0 md:left-0 md:w-full md:bg-gradient-to-t md:from-black/90 md:via-black/60 md:to-transparent flex flex-col md:flex-row md:items-end justify-between gap-5">
               <div className="text-left">
                 <h3 className="text-foreground md:text-white font-bold text-xl md:text-2xl">
                    {activeDemo.title}
                 </h3>
                 <p className="text-surface-foreground/70 md:text-gray-300 text-sm">
                    Interactive Prototype
                 </p>
               </div>

               {/* The Button: Full width on mobile, auto width on desktop */}
               <a 
                href={activeDemo.link}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-cta text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
              >
                Check Live Demo
                <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Desktop Only Navigation Arrows (Outside) */}
          <button 
            onClick={prevSlide}
            className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 bg-surface text-primary p-4 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
          >
            &#8592;
          </button>
          
          <button 
            onClick={nextSlide}
            className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 bg-surface text-primary p-4 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
          >
            &#8594;
          </button>
        </div>

        {/* Indicators (Dots) */}
        <div className="flex gap-2 mt-8">
          {DEMOS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all rounded-full ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Demo;