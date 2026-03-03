import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subham — Portfolio",
  description: "A dark fantasy portfolio world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
