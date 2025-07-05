"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./button";
import { MobileHeader } from "./mobile-header";
import { MobileNav } from "./mobile-nav";
import { Shield, LogOut, User, Home, FileText } from "lucide-react";

interface User {
  fullName: string;
  email: string;
  role: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // User not authenticated, which is fine
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Don't render navbar on login page
  const isLoginPage = pathname === "/";
  const isRegisterPage = pathname === "/register";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For login/register pages, show minimal layout
  if (isLoginPage || isRegisterPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // For authenticated pages, show full layout with navigation
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title={getPageTitle(pathname, user?.role)}
        user={
          user
            ? {
                name: user.fullName,
                email: user.email,
                role: user.role,
              }
            : undefined
        }
      />

      <main className="mobile-content">{children}</main>

      <MobileNav userRole={user?.role} />
    </div>
  );
}

function getPageTitle(pathname: string, userRole?: string): string {
  if (pathname.startsWith("/admin")) {
    return "Admin";
  }
  if (pathname.startsWith("/user")) {
    return "Policies";
  }
  if (pathname.startsWith("/sub-admin")) {
    return "Sub Admin";
  }
  if (pathname.includes("/profile")) {
    return "Profile";
  }

  // Default based on role
  if (userRole === "admin") return "Admin";
  if (userRole === "sub-admin") return "Sub Admin";
  return "Policies";
}
