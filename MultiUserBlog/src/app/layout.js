import NavBar from "./components/nav/page";
import "./globals.css";

export const metadata = { title: "MyApp", description: "A blog platform" };

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
