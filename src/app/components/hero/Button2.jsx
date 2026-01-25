export default function Button2() {
    return (
        <a
            href="#"
            className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-foreground rounded-lg border border-surface-foreground/20 hover:bg-surface focus:ring-4 focus:ring-surface transition-colors"
        >
            <svg 
                className="mr-2 -ml-1 w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact Me
        </a>
    )
}