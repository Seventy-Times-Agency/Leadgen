import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leadgen — B2B prospects in under two minutes",
  description:
    "Describe a niche and a region — Leadgen pulls matching companies, reads their websites and reviews, and hands back AI-scored prospects with outreach advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
