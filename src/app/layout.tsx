import type { Metadata } from "next";
import "./globals.css";
import NetworkMonitor from "@/components/NetworkMonitor";

export const metadata: Metadata = {
  title: "the game",
  description: "A dark fantasy world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Global top-left network quality monitor */}
        <NetworkMonitor />
      </body>
    </html>
  );
}
