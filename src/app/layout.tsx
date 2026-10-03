import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

const serif = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Lexora",
    template: "%s · Lexora",
  },
  description: "Kişisel İngilizce kelime öğrenme ve tekrar paneli.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
