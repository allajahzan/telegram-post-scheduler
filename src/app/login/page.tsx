"use client";

import { useUser } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoHeader } from "@/components/layout/logo-header";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ui/particle-bg";
import { Loader2 } from "lucide-react";
import { LinkedInIcon } from "@/components/common/linkedin-icon";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function LoginPage() {
  const { data, isLoading } = useUser();
  const user = data?.user;

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      router.replace("/posts");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Reset loading if user navigates back via browser back button (bfcache)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", handlePageShow);

    // Also reset on unmount
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      setLoading(false);
    };
  }, []);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/api/auth/linkedin";
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden">
      <ParticleBackground />

      <div className="relative">
        <Navbar />
      </div>

      <div className="mt-14 relative z-10 w-full max-w-lg p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
        <p className="text-sm text-muted-foreground text-center font-medium">
          Schedule smarter & Post at the perfect moment.
        </p>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full hover:brightness-110 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Redirecting
            </>
          ) : (
            <>
              <LinkedInIcon size={20} className="z-10" />
              <span className="z-10 relative">Continue with LinkedIn</span>
            </>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-muted-foreground/20 rounded-full" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Secure OAuth 2.0
          </span>
          <div className="h-px flex-1 bg-muted-foreground/20 rounded-full" />
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          We never store your LinkedIn password.
          <br />
          By continuing, you agree to our{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>

      <Footer />
    </div>
  );
}
