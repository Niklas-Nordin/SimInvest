import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import {Plus_Jakarta_Sans} from "next/font/google";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap', 
});

export const metadata: Metadata = {
  title: "SimInvest",
  description: "Simulate your investments with SimInvest, the ultimate stock market simulator. Practice trading, test strategies, and learn without risking real money. Join our community of investors and start your journey to financial success today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className="h-full antialiased min-h-screen"
    >
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col`}>
        <Navbar />
        <main className="flex-grow mt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
