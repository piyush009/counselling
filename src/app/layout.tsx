import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

export const metadata: Metadata = {
  title: "Counselling Desk",
  description: "Multi-table counselling verification system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <div
          style={
            {
              ["--font-display" as string]: "var(--font-fraunces), Georgia, serif",
              ["--font-body" as string]: 'var(--font-source), "Segoe UI", sans-serif',
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </body>
    </html>
  );
}
