import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MoodFlix \u2014 Movie Recommendations Based on Your Mood",
  description:
    "Tell us how you feel, and we'll recommend the perfect movie or series. Mood-based discovery with trailers, ratings, and a personal watchlist.",
  keywords: ["movies", "recommendations", "mood", "streaming", "watchlist"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
