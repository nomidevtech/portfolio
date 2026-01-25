export default function Hero() {
  return (
    <section className="bg-background transition-colors duration-300 mt-18">
      <div className="py-8 px-4 mx-auto max-w-7xl text-center lg:py-16 lg:px-12">
        {/* Main Heading */}
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-foreground md:text-5xl lg:text-6xl">
          We invest in the world’s potential
        </h1>
        
        {/* Subtext - Using foreground with opacity for hierarchy */}
        <p className="mb-8 text-lg font-normal text-foreground/80 lg:text-xl sm:px-16 xl:px-48">
          Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.
        </p>

        <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          {/* Primary CTA Button */}
          <a
            href="#"
            className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-cta-foreground rounded-lg bg-cta hover:bg-cta-hover focus:ring-4 focus:ring-cta/30 transition-colors"
          >
            Learn more
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </a>

          {/* Secondary Button */}
          <a
            href="#"
            className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-foreground rounded-lg border border-surface-foreground/20 hover:bg-surface focus:ring-4 focus:ring-surface transition-colors"
          >
            <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
            </svg>
            Watch video
          </a>
        </div>

        <div className="px-4 mx-auto text-center md:max-w-3xl lg:max-w-5xl lg:px-36">
          <span className="font-semibold text-foreground/50 uppercase text-sm tracking-wider">FEATURED IN</span>
          <div className="flex flex-wrap justify-center items-center mt-8 text-foreground/40 sm:justify-between space-x-4">
            {/* Logos - Now using current text color with hover effects */}
            <a href="#" className="mb-5 lg:mb-0 hover:text-primary transition-colors">
               {/* SVG 1 ... */}
            </a>
            <a href="#" className="mb-5 lg:mb-0 hover:text-primary transition-colors">
               {/* SVG 2 ... */}
            </a>
            <a href="#" className="mb-5 lg:mb-0 hover:text-primary transition-colors">
               {/* SVG 3 ... */}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}