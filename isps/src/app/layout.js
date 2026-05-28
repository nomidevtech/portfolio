import NavBar from "./components/nav-bar";
import Sidebar from "./components/side-navigation";
import "./globals.css";
import { getUser } from "./lib/getUser";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "NetAdmin - ISP Management Dashboard",
  description: "A premium subscriber and billing management platform for local internet service providers.",
  keywords: ["ISP management", "billing tracking", "subscriber management", "dashboard", "Next.js"],
  authors: [{ name: "NetAdmin Team" }],
  openGraph: {
    title: "NetAdmin - ISP Management Dashboard",
    description: "A subscriber and billing management platform for local ISPs.",
    type: "website",
  },
};

export default async function RootLayout({ children }) {
  const currentUser = await getUser();

  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 min-h-screen">
        <NavBar />
        <div className="flex pt-14">
          {currentUser?.id && <Sidebar />}
          <main className={`flex-1 min-h-[calc(100vh-56px)] ${currentUser?.id ? "pb-20 md:pb-6" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
