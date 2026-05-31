import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";

export const metadata: Metadata = {
  title: "考点成歌",
  description: "把考点变成洗脑神曲，循环听就记住",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
