import NavBar from "./components/Nav";
import "./globals.css";


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
  openGraph: {
    title: "ClinicFlow",
    description: "Clinic booking and schedule management for patients, doctors, and clinics.",
    type: "website",
  },
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" >
      <body className="min-h-screen bg-[#f6faf8] text-slate-900 antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
