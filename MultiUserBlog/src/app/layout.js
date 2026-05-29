import { Instrument_Sans, Lora } from "next/font/google";
import NavBar from "./components/nav/NavBar";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: `${siteName} | Multi-user blog platform`,
    description,
    type: "website",
    siteName,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary",
    title: `${siteName} | Multi-user blog platform`,
    description,
    images: ['/og-image.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${lora.variable}`} suppressHydrationWarning>
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
