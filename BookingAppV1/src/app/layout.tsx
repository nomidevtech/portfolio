import Link from "next/link";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dentist Booking App",
  description: "Book your dental appointment online — choose a day, pick a time slot, and confirm your visit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col mb-80">
        <Link href="/">Home</Link>
        {children}
      </body>
    </html>
  );
}
