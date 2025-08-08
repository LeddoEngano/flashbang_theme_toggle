import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flashbang Theme Toggle",
  description:
    "Um theme-toggle bem humorado que te dá uma 'flashada' sonora ao sair do modo noturno.",
  metadataBase: new URL("https://flashbang-theme-toggle.local"),
  openGraph: {
    title: "Flashbang Theme Toggle",
    description:
      "Um theme-toggle bem humorado que te dá uma 'flashada' sonora ao sair do modo noturno.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
