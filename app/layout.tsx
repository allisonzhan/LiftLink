import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiftLink - Find Your Gym Buddy",
  description: "Connect with fellow students for workouts and fitness on campus",
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

