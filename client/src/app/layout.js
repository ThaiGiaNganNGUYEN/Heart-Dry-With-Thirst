import "./globals.css";
import { DM_Sans } from "next/font/google";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Yoghurt",
  description: "Next Gen Water Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="description" content="Next Gen Water Management System" />
        <meta name="keywords" content="water, infrastructure, management, dashboard" />
        <meta name="author" content="Team Yoghurt" />
        <meta property="og:title" content="Yoghurt" />
        <meta property="og:description" content="Next Gen Water Management System" />
      </Head>
      <body
        className={`${dmSans.variable} font-sans`}
        src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/ping.js"
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
