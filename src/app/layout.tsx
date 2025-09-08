import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";
import NavbarFixed from "@/app/components/NavbarFixed";
import { Footer } from "@/devlink/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DiveGlobe",
  description: "Interactive globe of dive sites around the world",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased dg-body`}>
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
