import NavBar from "./components/nav-bar";
import Sidebar from "./components/side-navigation";
import "./globals.css";
import { getUser } from "./lib/getUser";


export default async function RootLayout({ children }) {

  const currentUser = await getUser();


  return (
    <html lang="en">
      <body>
        <NavBar />
        <div className="flex">
          {currentUser?.id && <  Sidebar />}
          <main className="my-30 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}