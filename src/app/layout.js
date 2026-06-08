import Header from "../components/Header";
import "./globals.css";

export const metadata = {
  title: "OAuth 2.0 Authentication System",
  description: "Secure authentication using Google OAuth 2.0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}