import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leadgen — B2B clients in a minute",
  description:
    "AI-driven B2B lead generation for agencies. Pick a niche and a city, get a qualified base with outreach-ready advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
