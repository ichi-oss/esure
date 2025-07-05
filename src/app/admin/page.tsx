"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PolicyCard } from "@/components/ui/policy-card";
import {
  Users,
  FileText,
  Plus,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  HelpCircle,
  ChevronRight,
  Shield,
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
  };
  createdBy: {
    fullName: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
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
        setCurrentUser(data.user);
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  };

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch("/api/admin/users");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch policies
      const policiesResponse = await fetch("/api/admin/policies");
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

  const handleDeletePolicy = async (policyId: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      try {
        const response = await fetch(`/api/admin/policies/${policyId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting policy:", error);
      }
    }
  };

  const activeUsers = users.filter((user) => user.isActive).length;
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const totalRevenue = policies.reduce(
    (sum, policy) => sum + (policy.price || 0),
    0
  );

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.vehicleInfo.make
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      policy.vehicleInfo.model
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      policy.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      policy.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="flex-1 overflow-auto pb-16">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Admin</h1>
          <button className="text-primary hover:text-primary/80 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content with fixed header spacing */}
      <div className="pt-4 pb-20">
        {/* Overview Section */}
        <div className="px-4 mb-4 mt-4">
          <h3 className="text-sm text-muted-foreground mb-1.5">Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Total Users
                </span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-bold">{activeUsers}</p>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Active Policies
                </span>
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-bold">{activePolicies}</p>
            </div>
          </div>
        </div>

        {/* Streamlined Workflow Section */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-muted-foreground mb-1.5">
            Streamlined Workflow
          </h3>
          <div className="bg-card rounded-lg overflow-hidden border border-border/50">
            {/* <div className="border-b border-border/50">
              <button
                className="w-full text-left hover:bg-accent/50 transition-colors"
                onClick={() => router.push("/admin/create-user")}
              >
                <div className="flex justify-between items-center py-3 px-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">
                        Create User
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Create standalone user account
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground w-4 h-4" />
                </div>
              </button>
            </div> */}
            <div className="border-b border-border/50">
              <button
                className="w-full text-left hover:bg-accent/50 transition-colors"
                onClick={() => router.push("/admin/create-policy-for-user")}
              >
                <div className="flex justify-between items-center py-3 px-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">
                        Create Policy for User
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Add policy to existing user
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground w-4 h-4" />
                </div>
              </button>
            </div>
            <div>
              <button
                className="w-full text-left hover:bg-accent/50 transition-colors"
                onClick={() => router.push("/admin/create-policy-and-user")}
              >
                <div className="flex justify-between items-center py-3 px-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Plus className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">
                        Create User & Policy
                      </span>
                      <span className="text-xs text-muted-foreground">
                        All-in-one user and policy creation
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-muted-foreground mb-1.5">
            User Management
          </h3>
          <div className="bg-card rounded-lg overflow-hidden border border-border/50">
            <div
              className="flex justify-between items-center py-2.5 px-3 border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push("/admin/users")}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm">Manage Users</span>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/20 text-primary rounded px-1.5 py-0.5 mr-1.5 text-[10px] font-bold">
                  {users.filter((u) => u.role === "user" && u.isActive).length}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div
              className="flex justify-between items-center py-2.5 px-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push("/admin/sub-admins")}
            >
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm">Manage Sub-Admins</span>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/20 text-primary rounded px-1.5 py-0.5 mr-1.5 text-[10px] font-bold">
                  {users.filter((u) => u.role === "sub-admin").length}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Policy Management Section */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-muted-foreground mb-1.5">
            Policy Management
          </h3>
          <div className="bg-card rounded-lg overflow-hidden border border-border/50">
            <div className="border-b border-border/50">
              <button
                className="w-full text-left hover:bg-accent/50 transition-colors"
                onClick={() => router.push("/admin/policies")}
              >
                <div className="flex justify-between items-center py-2.5 px-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm">All Policies</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-primary/20 text-primary rounded px-1.5 py-0.5 mr-1.5 text-[10px] font-bold">
                      {totalPolicies}
                    </div>
                    <ChevronRight className="text-muted-foreground w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>
            {/* <div className="border-b border-border/50">
              <button
                className="flex justify-between items-center py-2.5 px-3 w-full text-left hover:bg-accent/50 transition-colors"
                onClick={() => router.push("/admin/create-policy-for-user")}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Create Policy for User</span>
                </div>
                <ChevronRight className="text-muted-foreground w-4 h-4" />
              </button>
            </div>
            <div>
              <button
                className="flex justify-between items-center py-2.5 px-3 w-full text-left hover:bg-accent/50 transition-colors"
                onClick={() => router.push("/admin/create-policy-and-user")}
              >
                <div className="flex items-center">
                  <Plus className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm">Create User & Policy</span>
                </div>
                <ChevronRight className="text-muted-foreground w-4 h-4" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="px-4 mb-4">
          <h3 className="text-sm text-muted-foreground mb-1.5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => router.push("/admin/create-user")}
              variant="outline"
              className="h-12 rounded-lg font-semibold"
            >
              <Users className="w-4 h-4 mr-2" />
              Create User
            </Button>
            <Button
              onClick={() => router.push("/admin/create-policy-for-user")}
              className="h-12 rounded-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </div> */}

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-0 bg-card shadow-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 rounded-lg border-0 bg-card shadow-sm">
                <Filter className="w-4 h-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="renewed">Renewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recent Policies */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-muted-foreground">Recent Policies</h3>
            <Badge variant="secondary" className="px-2 py-1 rounded-lg text-xs">
              {filteredPolicies.length}
            </Badge>
          </div>

          {filteredPolicies.length === 0 ? (
            <Card className="mobile-card">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No policies found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPolicies.slice(0, 5).map((policy) => (
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
