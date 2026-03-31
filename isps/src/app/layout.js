import NavBar from "./components/nav-bar";
import Sidebar from "./components/side-navigation";
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div className="flex">
          <Sidebar />
          <main className="my-30 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}