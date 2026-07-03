import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClientOnly } from "@/components/layout/client-only";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Post Scheduler-LinkedIn",
  description: "Manage scheduled posts for LinkedIn workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClientOnly>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
