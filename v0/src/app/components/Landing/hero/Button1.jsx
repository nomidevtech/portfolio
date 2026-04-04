export default function Button1() {
    return (
        <a
            href="#"
            className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-cta-foreground rounded-lg bg-cta hover:bg-cta-hover focus:ring-4 focus:ring-cta/30 transition-colors"
        >
            View Projects
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
        </a>
    )
}