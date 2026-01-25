import "./globals.css";
import { ThemeProvider } from "next-themes";



export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute={'class'}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
