import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1Fi - Loan Management System",
  description: "Mutual Fund backed loans for everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
