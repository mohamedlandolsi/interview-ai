import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterQ - Transform Your Hiring with AI-Powered Interviews",
  description: "Streamline your recruitment process with intelligent interviews that assess candidates fairly, consistently, and efficiently. Get deeper insights in half the time.",
  keywords: ["AI interviews", "HR technology", "talent acquisition", "recruitment", "hiring automation", "candidate assessment"],
  authors: [{ name: "InterQ" }],
  creator: "InterQ",
  openGraph: {
    title: "InterQ - Transform Your Hiring with AI-Powered Interviews",
    description: "Streamline your recruitment process with intelligent interviews that assess candidates fairly, consistently, and efficiently.",
    url: "https://interq.com",
    siteName: "InterQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterQ - Transform Your Hiring with AI-Powered Interviews",
    description: "Streamline your recruitment process with intelligent interviews that assess candidates fairly, consistently, and efficiently.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
