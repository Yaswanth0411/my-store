import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "MyStore — Quality products delivered fast",
  description: "Curated electronics, fashion, home goods and food.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 min-h-screen">

        {/* CartProvider makes cart available to ALL pages */}
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>

      </body>
    </html>
  );
}