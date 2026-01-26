'use client'

import React from 'react';

const MyStack = () => {
  const skills = {
    frontend: [
      { name: "HTML5", icon: <path d="M1.5 22L3.892 4h16.216l2.392 18L12 24l-10.5-2zM19.333 19.5l1.667-12.5H6.5v2.5h11.5l-.667 5H6.5v2.5h10.167l-.667 5L12 21.5l-4-1.5-.333-2.5H5.167l.5 4 6.333 2.5 7.333-2z" /> },
      { name: "CSS3", icon: <path d="M1.5 22L3.892 4h16.216l2.392 18L12 24l-10.5-2zM19.333 19.5l1.667-12.5H6.5v2.5h11.5l-.667 5H6.5v2.5h10.167l-.667 5L12 21.5l-4-1.5-.333-2.5H5.167l.5 4 6.333 2.5 7.333-2z" /> },
      { name: "Tailwind CSS", icon: <path d="M12.001 21.484c-1.155 0-2.228-.451-3.045-1.27l-4.14-4.14a4.306 4.306 0 010-6.09l4.14-4.14a4.306 4.306 0 016.09 0l4.14 4.14a4.306 4.306 0 010 6.09l-4.14 4.14a4.306 4.306 0 01-3.045 1.27z" /> },
      { name: "JavaScript (ES6+)", icon: <path d="M3 3h18v18H3V3zm15.125 14.25c-.25-.375-.625-.75-1-.875l-.625.375c.125.25.375.375.5.625.125.125.25.375.25.625 0 .5-.375.875-.875.875-.5 0-.75-.25-.875-.75l-.875.25c.125.75.625 1.25 1.625 1.25 1 0 1.75-.625 1.75-1.625 0-.375-.125-.625-.125-.75z" /> },
      { name: "React", icon: <><circle cx="12" cy="12" r="2" /><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" opacity=".2" /><path d="M7 12c0-1.333.667-2 2-2s2 .667 2 2-.667 2-2 2-2-.667-2-2zM13 12c0-1.333.667-2 2-2s2 .667 2 2-.667 2-2 2-2-.667-2-2z" /></> },
      { name: "Next.js", icon: <path d="M18.665 21.978l-10.957-14.532v12.336h-1.928v-15.424h1.928l10.957 14.532v-12.336h1.928v15.424z" /> }
    ],
    backend: [
      { name: "Node.js", icon: <path d="M12 2L4.5 6.25v8.5L12 19l7.5-4.25v-8.5L12 2zm-1 14.5l-4-2.25V8.5l4 2.25v5.75zm1-7.25L8.5 7.5l3.5-2 3.5 2L12 9.25zm5 5l-4 2.25v-5.75l4-2.25v4.5z" /> },
      { name: "Express.js", icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /> },
      { name: "MongoDB", icon: <path d="M12 22s-4-4.5-4-9c0-4.5 4-9 4-9s4 4.5 4 9c0 4.5-4 9-4 9z" /> },
      { name: "REST APIs", icon: <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" fill="none" /> }
    ],
    tooling: [
      { name: "Git & GitHub", icon: <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" /> },
      { name: "Vercel", icon: <path d="M24 22.525H0L12 .475l12 22.05z" /> },
      { name: "Env Vars", icon: <path d="M12.65 6.5c-.56-.16-1.15-.25-1.77-.25-3.31 0-6 2.69-6 6s2.69 6 6 6c.62 0 1.21-.09 1.77-.25l1.63 1.63c-1.03.4-2.14.62-3.4.62-5.52 0-10-4.48-10-10s4.48-10 10-10c1.26 0 2.37.22 3.4.62l-1.63 1.63z" /> },
      { name: "SEO Basics", icon: <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" /> }
    ]
  };

  return (
    <section className="bg-background text-foreground py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center md:text-left">Tech Stack</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mapping through sections */}
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="bg-surface p-6 rounded-xl border border-foreground/5 shadow-sm">
              <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-6 pb-2 border-b border-foreground/10">
                {category.replace(/([A-Z])/g, ' $1')}
              </h3>
              
              <div className="flex flex-col gap-4">
                {items.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        {skill.icon}
                      </svg>
                    </div>
                    <span className="text-surface-foreground font-medium group-hover:text-primary transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyStack;