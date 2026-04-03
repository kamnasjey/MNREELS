import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MNREELS — Богино контент платформ",
  description: "Монголын анхны богино контент платформ. Бүтээгчид өөрсдийн контентийг төлбөртэйгээр хүртээнэ.",
  manifest: "/manifest.json",
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
        <ServiceWorkerInit />
      </body>
    </html>
  );
}

function ServiceWorkerInit() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}))`,
      }}
    />
  );
}
