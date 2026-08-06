import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreen from "./components/SplashScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Md. Riad Shekh | Full Stack Web Developer & Frontend Specialist",
    template: "%s | Md. Riad Shekh",
  },
  description:
    "Portfolio of Md. Riad Shekh — Full Stack Web Developer specializing in React.js, Next.js, TypeScript, Node.js, and MongoDB. Explore projects, technical skills, and background.",
  keywords: [
    "Md. Riad Shekh",
    "Frontend Developer",
    "Full Stack Developer",
    "React.js",
    "Next.js",
    "TypeScript",
    "Portfolio",
    "Web Developer Bangladesh",
  ],
  authors: [{ name: "Md. Riad Shekh" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
