"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    const isLoginPage = pathname === "/login";
    const isAuthenticated = !!user;

    // Redirect to login if not authenticated and not on login page
    if (!isAuthenticated && !isLoginPage) {
      router.push("/login");
    }

    // Redirect to dashboard if authenticated and on login page
    if (isAuthenticated && isLoginPage) {
      router.push("/");
    }

    setIsReady(true);
  }, [user, pathname, isHydrated, router]);

  if (!isReady) {
    return null; // Don't render anything until we've checked auth status
  }

  return (
    <>
      {user && <Navbar />}
      <main className="flex-1">{children}</main>
    </>
  );
}
