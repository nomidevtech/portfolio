"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AboutMe() {
  return (
    <section
      id="about"
      className="bg-background text-foreground py-16 px-6 md:py-24 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header - Now Left-Aligned for Consistency */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
            About Me
          </h2>
          <div className="h-1 w-20 bg-primary mt-2" />
        </div>

        {/* Horizontal Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-xl md:text-2xl leading-relaxed text-foreground">
              Hi, I'm <span className="font-black text-primary">Muhammad Nauman (Nomi)</span>, 
              a full-stack web developer focused on building modern, fast, and scalable web applications.
            </p>

            <p className="text-surface-foreground text-base md:text-lg leading-relaxed">
              I work with technologies like <span className="text-primary font-semibold">Next.js, React, Tailwind CSS, Node.js, and SQL/Databases</span> to deliver websites and apps that are not only visually clean, but also structured for long-term growth.
            </p>

            <p className="text-surface-foreground text-base md:text-lg leading-relaxed">
              As a CS student and self-driven developer, I've built real-world projects including landing pages, authentication systems, and full CRUD applications — giving me strong hands-on experience with both frontend and backend development.
            </p>

            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary font-bold uppercase tracking-wider text-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Currently available for freelance work
              </div>
            </div>
          </motion.div>

          {/* Video Content */}
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
              <figcaption className="mt-4 pb-2 px-4 text-sm text-surface-foreground/80 italic flex items-center gap-2 group-hover:text-surface-foreground transition-colors">
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