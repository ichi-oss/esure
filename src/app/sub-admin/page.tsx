"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Policy {
  _id: string;
  policyNumber: string;
  userId: {
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
}

export default function SubAdminDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        if (data.user.role !== "sub-admin") {
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

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/sub-admin/policies");
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sub-Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {currentUser?.fullName}</p>
            </div>
            <div className="grid grid-cols-2 lg:flex lg:space-x-4 gap-2 lg:gap-0">
              <Button
                onClick={() => router.push("/sub-admin/users")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Manage Users
              </Button>
              <Button
                onClick={() => router.push("/sub-admin/create-user")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create User
              </Button>
              <Button
                onClick={() => router.push("/sub-admin/create-policy")}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Policy
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Policies</CardTitle>
                <CardDescription>Policies created by you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{policies.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Policies</CardTitle>
                <CardDescription>Currently active policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    policies.filter((policy) => policy.status === "active")
                      .length
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>From all policies created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £
                  {policies
                    .reduce((sum, policy) => sum + policy.price, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Policy Management</CardTitle>
              <CardDescription>Manage policies you've created</CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No policies created yet</p>
                  <Button
                    onClick={() => router.push("/sub-admin/create-policy")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Your First Policy
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow
                        key={policy._id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          router.push(`/sub-admin/policy/${policy._id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {policy.policyNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {policy.userId.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {policy.userId.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {policy.vehicleInfo.yearOfManufacture}{" "}
                          {policy.vehicleInfo.make} {policy.vehicleInfo.model}
                        </TableCell>
                        <TableCell>£{policy.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              policy.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {policy.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(policy.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(policy.endDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
