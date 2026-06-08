import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased min-h-screen`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-grow mt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
