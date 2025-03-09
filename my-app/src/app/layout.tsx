import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Template",
  description: "Created with Project Initializer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-5 h-screen overflow-hidden my-3">{children}</body>
    </html>
  );
}
