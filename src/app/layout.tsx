import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "primeicons/primeicons.css";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EVM Distributor Portal",
  description: "Distributor portal for managing orders, viewing promotions, and tracking inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased isolate`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
