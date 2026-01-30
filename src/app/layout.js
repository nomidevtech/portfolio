import "./globals.css";
import { ThemeProvider } from "next-themes";
import { NavBar } from "./components/Landing";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import('./components/Landing/footer'), {
  loading: () => <p>Loading....</p>
});

export const metadata = {
  title: "Nomi — Full-Stack Web Developer",

  description:
    "Portfolio of Nomi, a full-stack web developer building modern, performant web applications using JavaScript, React, and Next.js.",

  metadataBase: new URL("https://www.nomidev.com"),

  openGraph: {
    title: "Nomi — Full-Stack Web Developer",
    description:
      "Full-stack web developer specializing in modern JavaScript, React, and Next.js.",
    url: "https://www.nomidev.com",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
}




export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="w-screen h-screen bg-background text-foreground">
        <ThemeProvider attribute={'class'}>
          <NavBar/>
          {children}
          <Footer/>
        </ThemeProvider>
      </body>
    </html>
  );
}
