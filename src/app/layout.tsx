import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavigationBar } from '../components/Main/Navigation';
import '../../wdyr'
import ServerMiddleware from '@/lib/serverMiddleware'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pul Topdingmi ?",
  description: "Ha Ishlab Ozgina Pul Topding Endi Uni Boshqar va Analiz Qil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServerMiddleware>
          <div className="flex flex-row ">
            <NavigationBar />
            {children}
          </div>
        </ServerMiddleware>
      </body>
    </html>
  );
}
