import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"; // Ajout de Instrument_Serif
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configuration de la police pour les titres Booster Talent
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  style: "italic",
});

export const metadata: Metadata = {
  title: "Woutty | Plateforme d'Influence",
  description: "Connectez votre marque aux meilleurs créateurs.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body
        translate="no"
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased font-sans bg-booster-bg`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Conseil : Forcez le dark mode par défaut pour le look Booster Talent
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}