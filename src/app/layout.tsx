import { Inter } from "next/font/google";
import { DevLinkProvider } from "@/devlink";
import NavbarFixed from "@/app/components/NavbarFixed";
import { Footer } from "@/devlink/Footer";
import "@/devlink/global.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  ),
  title: "Dive Globe",
  description:
    "Explore the world's best scuba diving sites. Read reviews, plan your trip, and discover your next underwater adventure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased dg-body`}
      >
        <DevLinkProvider>
          <header>
            <NavbarFixed />
          </header>
          <div className="dg-content">{children}</div>
          <footer>
            <Footer />
          </footer>
        </DevLinkProvider>
      </body>
    </html>
  );
}
