export default function AboutMe() {
    return (
        <section id="about" className="bg-background text-foreground py-16 px-6 md:py-24 transition-colors duration-300">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">

                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-8 tracking-tight">
                    About Me
                </h2>

                <div className="w-full flex flex-col items-center gap-12">

                    <div className="max-w-2xl space-y-6">
                        <p className="text-xl leading-relaxed font-medium">
                            I am a self-taught full-stack web developer focused on building
                            fast, accessible, and SEO-friendly web applications.
                        </p>

                        <p className="text-surface-foreground text-lg leading-relaxed">
                            I specialize in JavaScript, React, Next.js, and Node.js, and I
                            enjoy turning unclear requirements into structured, maintainable solutions.
                        </p>

                        <p className="inline-block px-6 py-3 rounded-full border-2 border-cta text-cta font-bold uppercase tracking-wide text-sm">
                            I am currently available for freelance work and small-to-medium projects.
                        </p>
                    </div>

                    <div className="w-full max-w-3xl">
                        <figure className="bg-surface p-3 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-primary/20">

                            <div className="aspect-video w-full">
                                <iframe
                                    src="https://www.youtube.com/embed/VIDEO_ID"
                                    title="Introductory video"
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                    className="w-full h-full rounded-2xl border-0"
                                ></iframe>
                            </div>

                            <figcaption className="mt-4 pb-2 text-sm text-surface-foreground italic">
                                A short introduction to who I am and how I work
                            </figcaption>

                        </figure>
                    </div>

                </div>
            </div>
        </section>
    )
}