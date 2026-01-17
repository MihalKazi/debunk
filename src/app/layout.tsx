import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google"; // Import Source Serif
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "AIFNR | AI Fake News Repository",
  description: "Tracking AI images and videos used for misinformation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${inter.variable} ${sourceSerif.variable} font-sans bg-slate-50 text-slate-700`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}