import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";
import NavbarFixed from "@/app/components/NavbarFixed";
import { Footer } from "@/devlink/Footer";
import { AuthProvider } from "@/lib/auth/AuthContext";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for Webflow's Supabase to be available
              console.log('[Layout Script] Checking for Webflow Supabase...');
              
              // Check if we're in an iframe (embedded in Webflow)
              const isEmbedded = window !== window.parent;
              console.log('[Layout Script] Is embedded in iframe:', isEmbedded);
              
              // If embedded, try to get Supabase from parent
              if (isEmbedded && window.parent.supabase) {
                console.log('[Layout Script] Found Supabase in parent frame');
                window.supabase = window.parent.supabase;
              }
              
              // Log current state
              console.log('[Layout Script] window.supabase available:', !!window.supabase);
              console.log('[Layout Script] localStorage dg:isAuth:', typeof localStorage !== 'undefined' ? localStorage.getItem('dg:isAuth') : 'N/A');
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased dg-body`}>
        <DevLinkProvider>
          <AuthProvider>
            <header>
              <NavbarFixed />
            </header>
            <div className="dg-content">{children}</div>
            <footer>
              <Footer />
            </footer>
          </AuthProvider>
        </DevLinkProvider>
      </body>
    </html>
  );
}
