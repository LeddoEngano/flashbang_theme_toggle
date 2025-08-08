import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-geist-sans", // reuse var name to keep Tailwind @theme mapping working
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flashbang Theme Toggle",
  description:
    "A playful theme switcher that plays a flashbang sound when leaving the dark mode.",
  metadataBase: new URL("https://flashbang-theme-toggle.local"),
  openGraph: {
    title: "Flashbang Theme Toggle",
    description:
      "A playful theme switcher that plays a flashbang sound when leaving the dark mode.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Persist theme ASAP to avoid wrong initial paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const persisted = localStorage.getItem('flashbang-theme');
                if (persisted === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (persisted === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  // Default: dark mode on first visit
                  document.documentElement.classList.add('dark');
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
