const Blog = () => {
  return (
    <section className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full bg-surface text-surface-foreground rounded-2xl shadow-xl p-10">
        
        {/* Header Section */}
        <h1 className="text-4xl font-bold mb-6 border-b-4 border-primary pb-2 inline-block">
          Blog
        </h1>

        {/* Bio Section */}
        <div className="space-y-6 text-lg">
          <p>
            I am a **full stack web developer** in JavaScript, dedicated to building 
            performant and scalable web applications [1].
          </p>
          
          <p>
            My core toolset includes **Next.js and Tailwind CSS**, which I am currently 
            using to architect my personal portfolio website [1]. I focus on creating 
            seamless user experiences with modern architecture [1].
          </p>
        </div>

        {/* Skills/Tools Highlight */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background border border-primary/20">
            <h3 className="text-primary font-bold text-xl mb-2">My Stack</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Next.js</li>
              <li>Tailwind CSS</li>
              <li>Full Stack JS Development</li>
            </ul>
          </div>
          
          <div className="flex flex-col justify-center items-center md:items-start">
            <p className="mb-4 font-medium">Interested in working together?</p>
            {/* CTA Button using theme colors */}
            <button className="px-6 py-3 bg-cta text-cta-foreground font-bold rounded-lg transition-colors hover:bg-cta-hover hover:text-cta-hover-foreground">
              Let's Connect
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;