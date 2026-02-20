// // components/WhyHireMe.tsx
// "use client";

// import { motion } from "framer-motion";

// const whyHireMePoints = [
//   {
//     title: "End-to-End Web Development",
//     description:
//       "I can handle everything from UI design and frontend development to backend APIs, database integration, and deployment — so you don’t need multiple freelancers.",
//   },
//   {
//     title: "Clean, Modular & Scalable Code",
//     description:
//       "I write structured and maintainable code that is easy to debug, extend, and scale later without needing a full rewrite.",
//   },
//   {
//     title: "Technical SEO Implementation",
//     description:
//       "I implement industry-standard technical SEO (semantic HTML, meta tags, clean structure) so your website is SEO-ready and won’t block ranking on Google.",
//   },
//   {
//     title: "Security-Focused Development",
//     description:
//       "I follow best practices like environment variables, secure authentication patterns, and safe database handling to protect sensitive data.",
//   },
//   {
//     title: "High Performance & Core Web Vitals",
//     description:
//       "I optimize speed and user experience using modern performance practices and Core Web Vitals improvements for faster load times and better UX.",
//   },
// ];

// export default function WhyHireMe() {
//   return (
//     <section className="bg-background text-foreground py-16 px-6">
//       <div className="max-w-5xl mx-auto">
//         <h2 className="text-3xl font-bold mb-10 text-center">
//           Why Hire Me
//         </h2>

//         <div className="relative grid gap-8 md:grid-cols-2">
//           {whyHireMePoints.map((point, idx) => (
//             <motion.div
//               key={point.title}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: idx * 0.1 }}
//               viewport={{ once: true }}
//               className="group relative rounded-lg bg-surface p-6 shadow-sm hover:shadow-md transition-shadow"
//             >
//               {/* Decorative step number */}
//               <div className="absolute -top-3 -left-3 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
//                 {idx + 1}
//               </div>

//               <h3 className="text-xl font-semibold text-surface-foreground mb-2">
//                 {point.title}
//               </h3>
//               <p className="text-sm leading-relaxed text-foreground">
//                 {point.description}
//               </p>

//               {/* Subtle underline animation */}
//               <span className="block mt-4 h-1 w-0 bg-primary transition-all group-hover:w-full"></span>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }