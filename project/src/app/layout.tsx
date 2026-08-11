import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MileMarker",
  description: "Track your per-mile split times in real-time while you run.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
