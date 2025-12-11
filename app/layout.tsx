import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/ui/Toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "021 AI - Your AI-Powered Business Advisor",
  description: "Get expert business advice from AI-powered investor personas",
  generator: "EVO-A",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://021.evoa.co.in"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>{children}</ToastProvider>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
