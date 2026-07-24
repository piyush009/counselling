import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BTSC Counselling Desk v2",
  description: "BTSC multi-table counselling verification system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${font.variable} antialiased`}>
        <div
          style={
            {
              ["--font-display" as string]:
                'var(--font-jakarta), "Segoe UI", sans-serif',
              ["--font-body" as string]:
                'var(--font-jakarta), "Segoe UI", sans-serif',
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </body>
    </html>
  );
}
