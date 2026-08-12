import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "White Whale — Procurement",
  description: "White Whale procurement management system",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- loaded once here in the root layout, which wraps every route */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Barlow', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
