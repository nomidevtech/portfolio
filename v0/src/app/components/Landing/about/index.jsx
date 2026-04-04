"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AboutMe() {
  return (
    <section id="about" className="bg-background text-foreground py-16 px-6 md:py-24 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header - Stays Centered */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
            About Me
          </h2>
          <div className="h-1 w-20 bg-cta mx-auto mt-4 rounded-full" />
        </div>

        {/* Horizontal Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content - Always first in DOM, naturally first on Mobile */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <p className="text-xl md:text-2xl leading-relaxed font-semibold text-foreground">
              I am a self-taught full-stack web developer focused on building
              fast, accessible, and SEO-friendly web applications.
            </p>

            <p className="text-surface-foreground text-lg leading-relaxed">
              I specialize in <span className="text-primary font-medium">JavaScript, React, Next.js, and Node.js</span>. 
              I thrive on turning unclear requirements into structured, maintainable solutions that actually solve business problems.
            </p>

            <div className="pt-4">
              <p className="inline-block px-6 py-3 rounded-xl border-2 border-cta/30 bg-cta/5 text-cta font-bold uppercase tracking-wide text-xs md:text-sm">
                🚀 Currently available for freelance work
              </p>
            </div>
          </motion.div>

          {/* Video Content - Naturally second on Mobile, right side on Desktop */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <figure className="bg-surface p-2 md:p-3 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-primary/20 group">
              <div className="aspect-video w-full overflow-hidden rounded-[1.5rem] relative">
                <iframe
                  src="https://www.youtube.com/embed/VIDEO_ID"
                  title="Introductory video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0 grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
              <figcaption className="mt-4 pb-2 px-4 text-sm text-surface-foreground italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                A short introduction to who I am and how I work
              </figcaption>
            </figure>
          </motion.div>

        </div>
      </div>
    </section>
  );
}