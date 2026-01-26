// components/WhyHireMe.tsx
"use client";

import { motion } from "framer-motion";

const whyHireMePoints = [
  {
    title: "Clear Communication",
    description:
      "I focus on understanding requirements clearly and keep communication simple and transparent throughout the project.",
  },
  {
    title: "Production-Ready Code",
    description:
      "I write clean, maintainable code that follows best practices and is ready for real-world use.",
  },
  {
    title: "Modern Tech Stack",
    description:
      "I work with modern tools like React, Next.js, and Node.js to build fast and scalable applications.",
  },
  {
    title: "Structured Development Process",
    description:
      "I follow a clear step-by-step workflow to avoid surprises and ensure timely delivery.",
  },
  {
    title: "Platform-Safe Collaboration",
    description:
      "I work entirely through Fiverr and Upwork to ensure secure payments, clear milestones, and buyer protection.",
  },
];

export default function WhyHireMe() {
  return (
    <section className="bg-[var(--color-background)] text-[var(--color-foreground)] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Why Hire Me
        </h2>

        <div className="relative grid gap-8 md:grid-cols-2">
          {whyHireMePoints.map((point, idx) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-lg bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Decorative step number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold">
                {idx + 1}
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-surface-foreground)] mb-2">
                {point.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
                {point.description}
              </p>

              {/* Subtle underline animation */}
              <span className="block mt-4 h-1 w-0 bg-[var(--color-primary)] transition-all group-hover:w-full"></span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}