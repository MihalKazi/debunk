import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  // Updated Title and Description for GNG Branding
  title: "GNG | Generated, not Genuine",
  description: "Global repository documenting the boundary between synthetic media and digital truth.",
  icons: {
    icon: "/logo.svg", // This points to your SVG logo in the public folder
  },
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