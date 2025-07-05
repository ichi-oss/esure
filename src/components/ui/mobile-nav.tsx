"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Shield, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  action?: () => void;
}

interface MobileNavProps {
  userRole?: string;
}

export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Debug logging
  console.log("MobileNav - userRole:", userRole);
  console.log("MobileNav - pathname:", pathname);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/user",
      icon: Home,
      roles: ["user"],
    },
    {
      label: "Admin",
      href: "/admin",
      icon: Shield,
      roles: ["admin"],
    },
    {
      label: "Sub-Admin",
      href: "/sub-admin",
      icon: FileText,
      roles: ["sub-admin"],
    },
    {
      label: "FAQ",
      href: "/user/faq",
      icon: HelpCircle,
      roles: ["user"],
    },
    {
      label: "Logout",
      href: "",
      icon: LogOut,
      roles: ["user", "admin", "sub-admin"],
      action: handleLogout,
    },
  ];

  // Filter items based on user role
  const filteredItems = navItems.filter((item) => {
    if (!userRole) return false;
    return item.roles?.includes(userRole);
  });

  // Debug logging
  console.log(
    "MobileNav - filteredItems:",
    filteredItems.map((item) => ({ label: item.label, roles: item.roles }))
  );

  return (
    <nav className="mobile-nav safe-area-bottom bg-card/95 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around h-full px-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              item.href !== "" &&
              pathname.startsWith(item.href));

          return (
            <button
              key={`${item.href}-${item.label}`}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  router.push(item.href);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                "hover:bg-accent/50 active:scale-95",
                item.label === "Logout"
                  ? "text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  : isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
