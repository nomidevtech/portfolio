import NavBar from "./components/nav-bar";
import Sidebar from "./components/side-navigation";
import "./globals.css";
import { getUser } from "./lib/getUser";

export default async function RootLayout({ children }) {
  const currentUser = await getUser();

  return (
    <html lang="en">
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
