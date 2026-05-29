import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "./components/Nav";
import Footer from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "ClinicFlow | Clinic Booking Platform",
    template: "%s | ClinicFlow",
  },
  description:
    "ClinicFlow helps patients book appointments and clinics manage doctors, treatments, schedules, and verified bookings.",
  applicationName: "ClinicFlow",
  keywords: ["clinic booking", "appointment scheduling", "doctor schedule", "patient appointments"],
  authors: [{ name: "ClinicFlow" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ClinicFlow",
    description: "Clinic booking and schedule management for patients, doctors, and clinics.",
    type: "website",
    siteName: "ClinicFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClinicFlow | Clinic Booking Platform",
    description: "Clinic booking and schedule management for patients, doctors, and clinics.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#f6faf8] text-slate-900 antialiased">
        <NavBar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
