"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PolicyCard } from "@/components/ui/policy-card";
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Plus,
  RefreshCw,
  Download,
  Users,
} from "lucide-react";

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
  };
  createdBy?: {
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchPolicies();
  }, []);

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

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/policies");
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      } else {
        setError("Failed to fetch policies");
      }
    } catch (error) {
      setError("An error occurred while fetching policies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this policy? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch("/api/admin/policies", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ policyId }),
        });

        if (response.ok) {
          // Refresh the policies list
          fetchPolicies();
        } else {
          const data = await response.json();
          setError(data.error || "Failed to delete policy");
        }
      } catch (error) {
        setError("An error occurred while deleting the policy");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Filter and sort policies
  const filteredPolicies = policies
    .filter((policy) => {
      const matchesSearch =
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.userId.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        policy.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.vehicleInfo.make
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        policy.vehicleInfo.model
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (policy.createdBy?.fullName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        policy.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "policy-asc":
          return a.policyNumber.localeCompare(b.policyNumber);
        case "policy-desc":
          return b.policyNumber.localeCompare(a.policyNumber);
        case "customer":
          return a.userId.fullName.localeCompare(b.userId.fullName);
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        default:
          return 0;
      }
    });

  // Statistics
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const expiredPolicies = policies.filter((p) => p.status === "expired").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Policies</h1>
              <p className="text-gray-600">
                Manage and view all insurance policies
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={fetchPolicies}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={() => router.push("/admin/create-policy-for-user")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Policy
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Policies
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPolicies}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Policies
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePolicies}</div>
                <p className="text-xs text-muted-foreground">
                  {totalPolicies > 0
                    ? Math.round((activePolicies / totalPolicies) * 100)
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expired Policies
                </CardTitle>
                <Badge className="bg-red-100 text-red-800">Expired</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiredPolicies}</div>
                <p className="text-xs text-muted-foreground">
                  {totalPolicies > 0
                    ? Math.round((expiredPolicies / totalPolicies) * 100)
                    : 0}
                  % of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies, customers, vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="policy-asc">Policy # (A-Z)</SelectItem>
                  <SelectItem value="policy-desc">Policy # (Z-A)</SelectItem>
                  <SelectItem value="customer">Customer Name</SelectItem>
                  <SelectItem value="price-high">Price (High-Low)</SelectItem>
                  <SelectItem value="price-low">Price (Low-High)</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-center md:justify-start">
                <Badge variant="secondary" className="px-3 py-2">
                  {filteredPolicies.length}{" "}
                  {filteredPolicies.length === 1 ? "result" : "results"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Policies Grid */}
          {filteredPolicies.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No policies found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first policy."}
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <Button
                    onClick={() => router.push("/admin/create-policy-and-user")}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Policy
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <Card
                  key={policy._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {policy.policyNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {policy.userId.fullName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Vehicle Info */}
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {policy.vehicleInfo.yearOfManufacture}{" "}
                        {policy.vehicleInfo.make} {policy.vehicleInfo.model}
                      </span>
                    </div>

                    {/* Policy Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Premium:</span>
                        <p className="font-medium">
                          £{policy.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <p className="font-medium">
                          {formatDate(policy.endDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Created by:
                        </span>
                        <p className="font-medium text-xs">
                          {policy.createdBy?.fullName || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium text-xs">
                          {formatDate(policy.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/policy/${policy._id}`)
                        }
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/policy/${policy._id}/edit`)
                        }
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePolicy(policy._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button (if needed for pagination in the future) */}
          {filteredPolicies.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Showing all {filteredPolicies.length} policies
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
