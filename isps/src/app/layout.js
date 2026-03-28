import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html
      lang="en">
      <body className="my-30">{children}</body>
    </html>
  );
}
