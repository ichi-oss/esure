"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PolicyCard } from "@/components/ui/policy-card";
import {
  HelpCircle,
  ArrowLeft,
  Search,
  Plus,
  FileText,
  User,
  Mail,
  Car,
  Calendar,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  address?: string;
  dateOfBirth?: string;
  vehicleRegistration?: string;
  lastFourDigits?: string;
  phoneNumber?: string;
}

interface Policy {
  _id: string;
  policyNumber: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  vehicleInfo: {
    make: string;
    model: string;
    yearOfManufacture: number;
    colour?: string;
  };
  createdBy: {
    fullName: string;
    email: string;
  };
}

export default function UserPoliciesManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    checkAuth();
    fetchUserAndPolicies();
  }, [userId]);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  };

  const fetchUserAndPolicies = async () => {
    try {
      // Fetch user details
      const userResponse = await fetch(`/api/admin/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      // Fetch user's policies
      const policiesResponse = await fetch(
        `/api/admin/policies?userId=${userId}`
      );
      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json();
        setPolicies(policiesData.policies);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPolicies = () => {
    if (!searchTerm) {
      setFilteredPolicies(policies);
      return;
    }

    const filtered = policies.filter(
      (policy) =>
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.vehicleInfo.make
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        policy.vehicleInfo.model
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        policy.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPolicies(filtered);
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      try {
        const response = await fetch(`/api/admin/policies/${policyId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchUserAndPolicies();
        }
      } catch (error) {
        console.error("Error deleting policy:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "expired":
        return "bg-destructive/20 text-destructive";
      case "renewed":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading user policies...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pb-16">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">User Policies</h1>
          </div>
          <button className="text-primary hover:text-primary/80 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-20">
        {/* User Info */}
        <div className="px-4 mb-4 mt-4">
          <Card className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{user.fullName}</h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.role.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                {user.vehicleRegistration && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground uppercase">
                      {user.vehicleRegistration}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {policies.length}{" "}
                    {policies.length === 1 ? "Policy" : "Policies"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold">{policies.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {policies.filter((p) => p.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">
                  £
                  {policies
                    .reduce((sum, p) => sum + p.price, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Add Policy */}
        <div className="px-4 mb-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-0 bg-card shadow-sm"
              />
            </div>
            <Button
              onClick={() =>
                router.push(`/admin/create-policy?userId=${userId}`)
              }
              className="w-full h-12 rounded-lg font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Policy for {user.fullName}
            </Button>
          </div>
        </div>

        {/* Policies List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-muted-foreground">
              Policies ({filteredPolicies.length})
            </h3>
          </div>

          {filteredPolicies.length === 0 ? (
            <Card className="mobile-card">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No policies found matching your search"
                    : "No policies found for this user"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() =>
                      router.push(`/admin/create-policy?userId=${userId}`)
                    }
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Policy
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPolicies.map((policy) => (
                <PolicyCard
                  key={policy._id}
                  policy={policy}
                  onEdit={() => router.push(`/admin/policy/${policy._id}/edit`)}
                  onDelete={() => handleDeletePolicy(policy._id)}
                  onView={() => router.push(`/admin/policy/${policy._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
