import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MNREELS — Монголын богино кино",
  description: "Монголын анхны богино хэмжээний кино платформ. Swipe хийж, шилдэг бүтээгчдийн кино үзээрэй.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MNREELS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
