import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KSP Wines — Premium Vietnamese Wines",
  description:
    "Experience the unique terroir of Vietnam, bottled with passion and tradition. Discover our curated collection of premium wines.",
  keywords: ["wine", "Vietnamese wine", "premium wine", "KSP Wines", "red wine", "white wine"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#2D2926',
                    color: '#FAF7F2',
                    borderRadius: '12px',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: { primary: '#722F37', secondary: '#FAF7F2' },
                  },
                }}
              />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
