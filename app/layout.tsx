import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacities – Your space to think",
  description: "A connected knowledge management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full bg-[#0f0f1a]">
        {children}
      </body>
    </html>
  );
}
