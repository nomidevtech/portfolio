import NavBar from "./components/nav/NavBar";
import "./globals.css";

const siteName = "Inkline";
const description =
  "A polished multi-user publishing platform for essays, comments, tags, favorites, and personal writing workflows.";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: `${siteName} | Multi-user blog platform`,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: ["blog", "publishing", "multi-user", "Next.js", "portfolio project"],
  authors: [{ name: siteName }],
  creator: siteName,
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: `${siteName} | Multi-user blog platform`,
    description,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary",
    title: `${siteName} | Multi-user blog platform`,
    description,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] min-h-screen transition-colors duration-200">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
