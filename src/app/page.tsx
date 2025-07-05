"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, HelpCircle, Mail, Lock } from "lucide-react";

// Social login icons as SVG components
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect based on user role
        switch (data.user.role) {
          case "admin":
            router.push("/admin");
            break;
          case "sub-admin":
            router.push("/sub-admin");
            break;
          case "user":
            router.push("/user");
            break;
          default:
            router.push("/user");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login
    alert(`${provider} login coming soon!`);
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto pb-16">
        <div className="flex flex-col h-full bg-background text-foreground p-5">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-12">
            <button className="text-primary hover:text-primary/80 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <button className="text-primary hover:text-primary/80 transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3">Welcome to Aviva!</h1>
            <p className="text-muted-foreground text-lg">
              Access your insurance policy portal.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                className="w-full bg-muted/50 rounded-lg px-4 py-4 pl-10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-0"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full bg-muted/50 rounded-lg px-4 py-4 pl-10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-0"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-lg font-medium transition-colors disabled:bg-primary/70 disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4 mb-12">
            <Button
              type="button"
              onClick={() => handleSocialLogin("Apple")}
              className="w-full bg-muted/50 hover:bg-muted/70 text-foreground py-4 rounded-lg font-medium flex items-center justify-center transition-colors border-0"
              variant="outline"
            >
              <span className="mr-3">
                <AppleIcon />
              </span>
              Sign in with Apple
            </Button>

            <Button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="w-full bg-muted/50 hover:bg-muted/70 text-foreground py-4 rounded-lg font-medium flex items-center justify-center transition-colors border-0"
              variant="outline"
            >
              <span className="mr-3">
                <GoogleIcon />
              </span>
              Sign in with Google
            </Button>
          </div>

          {/* Bottom Link */}
          <div className="text-center">
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              New here? Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
