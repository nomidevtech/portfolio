"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Social Links Configuration with Brand Gradients
  const socialLinks = [
    {
      name: "GitHub",
      icon: <Github className="w-5 h-5" />,
      url: "https://github.com/yourusername",
      gradient: "from-gray-900 to-black", // GitHub Black
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      url: "https://linkedin.com/in/yourusername",
      gradient: "from-blue-900 to-[#0077b5]", // LinkedIn Blue
    },
    {
      name: "Fiverr",
      icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M21.5 15a3 3 0 0 0-1.7-2.6l1-5.1h-3.4l-.6 4c-.6.3-1.3.5-2 .5-2 0-3.3-1.6-3.3-4.2V7.3H8.3v1.8c0 1.2.2 2 .7 2.6-.6.4-1.2.9-1.6 1.5-.5-.8-.7-1.7-.7-2.7V7.3H3.5v9.4h3.2v-3c0-1.6 1.1-2.9 2.5-2.9 1.4 0 1.9 1 1.9 2.5v3.4h3.3v-3.2c0-1.2 1-1.7 1.8-1.7.9 0 1.3.6 1.3 1.9v3h3.2v-.2h.8z"/></svg>,
      url: "https://fiverr.com/yourusername",
      gradient: "from-green-900 to-[#1dbf73]", // Fiverr Green
    },
    {
      name: "Upwork",
      icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.077.008-.042c.209-1.187.847-2.552 2.113-3.033a2.979 2.979 0 0 1 2.915.281c.216.142.392.345.505.584.145.305.215.65.204 1.006-.023.73-.296 1.41-.77 1.916-.761.81-1.396 1.592-2.129 1.592zm-2.822-5.495c-1.77 0-2.887 1.637-3.425 2.879l-.273-1.287H9.284l-.391 1.84c-.05.234-.339 1.604-.471 2.228-.622 2.95-1.993 5.164-4.28 5.164H2v3.085h2.142c3.967 0 6.136-3.41 7.145-6.529.28-.868.513-1.77.697-2.695.441.745 1.144 1.332 2.062 1.642 1.966.666 3.655.155 4.871-1.13.914-.966 1.554-2.583 1.599-4.043.018-.588-.098-1.157-.336-1.659-.387-.818-1.066-1.428-1.92-1.727-1.196-.419-2.225-.137-3.232.484-.666.41-1.391 1.173-1.895 1.907V2.55h-3.32v5.113z"/></svg>,
      url: "https://upwork.com/yourusername",
      gradient: "from-green-900 to-[#14a800]", // Upwork Green
    },
  ];

  return (
    <footer className="bg-surface text-surface-foreground border-t border-foreground/5 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Top Section: CTA & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
              Ready to scale your business?
            </h3>
            <p className="text-lg opacity-80 max-w-sm">
              Let&apos;s build something scalable, performant, and user-centric together.
            </p>
            <Link 
              href="mailto:contact@yourdomain.com" 
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
            >
              contact@yourdomain.com <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 md:place-items-end">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#projects" className="hover:text-primary transition-colors">Projects</Link></li>
                <li><Link href="#services" className="hover:text-primary transition-colors">Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Socials</h4>
              <ul className="space-y-2 text-sm">
                {/* Simple Text Links for Accessibility/SEO */}
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-foreground/10 mb-8" />

        {/* Bottom Section: Social Icons & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Animated Social Icons */}
          <div className="flex gap-4">
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-background border border-foreground/10 overflow-hidden transition-all hover:border-transparent"
              >
                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className="relative z-10 text-surface-foreground group-hover:text-white transition-colors duration-300">
                  {link.icon}
                </div>
              </motion.a>
            ))}
          </div>

          {/* Copyright & Tech Stack */}
          <div className="text-sm opacity-60 flex flex-col md:items-end text-center md:text-right">
            <p>&copy; {currentYear} Your Name. All rights reserved.</p>
            <p className="flex items-center justify-center md:justify-end gap-1 mt-1 text-xs">
              Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> using Next.js & Tailwind
            </p>
          </div>
          
        </div>
      </div>
    </footer >
  );
}