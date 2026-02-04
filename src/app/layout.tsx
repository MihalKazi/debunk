import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

// --- SEO MASTER CONFIGURATION ---
export const metadata: Metadata = {
  metadataBase: new URL('https://aigng.activaterights.org'),
  title: {
    default: "GNG | Generated, not Genuine | AI Verification Repository",
    template: "%s | GNG Archive"
  },
  description: "The global GNG archive documenting the boundary between synthetic media and digital truth. Tracking deepfakes, AI misinformation, and synthetic content worldwide.",
  keywords: ["AI verification", "deepfake archive", "GNG repository", "fact check AI", "synthetic media detection", "digital truth"],
  authors: [{ name: "GNG Repository Team" }],
  creator: "GNG Archive",
  publisher: "Activate Rights",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  // --- VERIFICATION (Consolidated - No Duplicates) ---
  verification: {
    google: "syAxFMkHHfRic0escmy-2X1IoiMpHdtD52L71JDTbCY",
  },
  // OpenGraph (Facebook/LinkedIn/Discord previews)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aigng.activaterights.org",
    siteName: "GNG | Generated, not Genuine",
    title: "GNG | AI & Synthetic Media Permanent Archive",
    description: "Documenting the boundary between synthetic media and digital truth through verification.",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "GNG Repository Dashboard",
      },
    ],
  },
  // Twitter/X Card
  twitter: {
    card: "summary_large_image",
    title: "GNG | Generated, not Genuine",
    description: "Global repository for verifying AI-generated misinformation.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        className={`${inter.variable} ${sourceSerif.variable} font-sans bg-slate-50 text-slate-900 antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}