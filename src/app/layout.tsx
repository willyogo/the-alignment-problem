import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/artifacts.css";

export const metadata: Metadata = {
  title: "The Alignment Problem",
  description: "An interactive reading experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
