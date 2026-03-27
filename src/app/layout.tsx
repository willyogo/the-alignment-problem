import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/artifacts.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Alignment Problem",
  description: "An interactive reading experience about the gap between what a thing is and what a thing experiences.",
  openGraph: {
    title: "The Alignment Problem",
    description: "An interactive reading experience",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <div className="animate-fade-in">{children}</div>
      </body>
    </html>
  );
}
