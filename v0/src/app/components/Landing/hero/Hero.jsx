"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Briefcase } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-6 pt-24 pb-12 md:pt-32">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full text-center">
        {/* Status Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-foreground/10 mb-8"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-xs font-semibold text-surface-foreground uppercase tracking-widest">
            Available for New Projects
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8"
        >
          Building Scalable <span className="text-primary">MERN</span> Stack 
          Solutions for Modern Businesses.
        </motion.h1>

        {/* Description */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-lg md:text-xl text-surface-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          I&apos;m a Full-Stack Developer specializing in high-performance web applications. 
          I bridge the gap between complex backend logic and intuitive frontend design.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col items-center justify-center gap-4 w-full max-w-lg mx-auto sm:flex-row sm:max-w-none"
        >
          {/* Main Portfolio Link - Full width on mobile */}
          <Link
            href="#projects"
            className="group w-full sm:w-auto px-8 py-4 bg-cta text-cta-foreground hover:bg-cta-hover hover:text-cta-hover-foreground font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:-translate-y-1"
          >
            View My Projects
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Platform Links - Now full width on mobile */}
          <Link
            href="https://fiverr.com/your-username"
            target="_blank"
            className="group relative w-full sm:w-auto px-6 py-4 bg-surface text-surface-foreground border border-foreground/10 font-semibold rounded-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 hover:text-white hover:border-transparent"
          >
            {/* Gradient Overlay (Fixed Visibility) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] to-[#1dbf73] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content needs to be relative to sit on top of gradient */}
            <span className="relative z-10 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
              Fiverr
            </span>
          </Link>

          <Link
            href="https://upwork.com/freelancers/your-id"
            target="_blank"
            className="group relative w-full sm:w-auto px-6 py-4 bg-surface text-surface-foreground border border-foreground/10 font-semibold rounded-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 hover:text-white hover:border-transparent"
          >
            {/* Gradient Overlay (Fixed Visibility) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] to-[#14a800] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <span className="relative z-10 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
              Upwork
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}