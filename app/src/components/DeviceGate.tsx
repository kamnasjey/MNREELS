"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/app/landing/page";

export default function DeviceGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      // ?mobile=true query param нэмвэл desktop дээр mobile preview харуулна
      const params = new URLSearchParams(window.location.search);
      if (params.get("mobile") === "true") {
        setIsMobile(true);
        return;
      }
      const ua = navigator.userAgent;
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-3">MNREELS</h1>
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return <LandingPage />;
  }

  return <>{children}</>;
}
