"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BottomDrawer,
  BottomDrawerContent,
  BottomDrawerHeader,
  BottomDrawerTitle,
  BottomDrawerTrigger,
  BottomDrawerDescription,
} from "@/components/ui/bottom-drawer";

import {
  Calendar,
  CarFront,
  FileText,
  User,
  MapPin,
  Mail,
  CreditCard,
  Car,
} from "lucide-react";

interface Policy {
  _id: string;
  policyNumber: string;
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  vehicleInfo: {
    make: string;
    model: string;
    colour: string;
    yearOfManufacture: number;
    vehicleRegistration?: string;
    registeredKeeper?: string;
    topSpeed?: string;
    acceleration?: string;
    gearbox?: string;
    power?: string;
    maxTorque?: string;
    engineCapacity?: string;
    cylinders?: number;
    fuelType?: string;
    consumptionCity?: string;
    consumptionExtraUrban?: string;
    consumptionCombined?: string;
    co2Emission?: string;
    co2Label?: string;
    motExpiryDate?: string;
    motPassRate?: string;
    motPassed?: number;
    motFailed?: number;
    totalAdviceItems?: number;
    totalItemsFailed?: number;
    taxStatus?: string;
    taxDue?: string;
    ncapRating?: {
      adult?: string;
      children?: string;
      pedestrian?: string;
      safetySystems?: string;
      overall?: string;
    };
    dimensions?: {
      width?: string;
      height?: string;
      length?: string;
      wheelBase?: string;
      maxAllowedWeight?: string;
    };
    fuelTankCapacity?: string;
    fuelDelivery?: string;
    numberOfDoors?: number;
    numberOfSeats?: number;
    numberOfAxles?: number;
    engineNumber?: string;
  };
}

interface User {
  fullName: string;
  email: string;
  address: string;
  dateOfBirth: string;
}

export default function UserDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "user") {
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

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/policies");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolicyClick = (policyId: string) => {
    router.push(`/user/policy/${policyId}`);
  };

  const getStatusColor = (status: string, endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (status === "expired" || daysUntilExpiry < 0)
      return "bg-gray-500 text-white";
    if (daysUntilExpiry <= 30) return "bg-amber-500 text-white";
    if (status === "active") return "bg-green-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getStatusText = (status: string, endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (status === "expired" || daysUntilExpiry < 0) return "EXPIRED";
    if (daysUntilExpiry <= 30) return "DUE TO RENEW";
    if (status === "active") return "ACTIVE";
    return status.toUpperCase();
  };

  const activePolicies = policies.filter((p) => {
    const today = new Date();
    const expiry = new Date(p.endDate);
    return p.status === "active" && expiry >= today;
  });

  const inactivePolicies = policies.filter((p) => {
    const today = new Date();
    const expiry = new Date(p.endDate);
    return p.status === "expired" || expiry < today;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mobile-content px-4 py-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">POLICIES</h1>

        {/* Active Policies */}
        {activePolicies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">
              Active policies
            </h2>
            <div className="space-y-4">
              {activePolicies.map((policy) => (
                <Card
                  key={policy._id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
                  onClick={() => handlePolicyClick(policy._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-gray-400 text-sm">
                      {policy.policyNumber}
                    </span>
                    <Badge
                      className={`${getStatusColor(
                        policy.status,
                        policy.endDate
                      )} border-0 rounded-full px-3 py-1 text-xs font-semibold`}
                    >
                      {getStatusText(policy.status, policy.endDate)}
                    </Badge>
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-4">
                    {policy.vehicleInfo.make} {policy.vehicleInfo.model}
                  </h3>
                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-gray-400">Start</p>
                      <p className="text-white font-medium">
                        {new Date(policy.startDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">End</p>
                      <p className="text-white font-medium">
                        {new Date(policy.endDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Policies */}
        {inactivePolicies.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-4">
              Inactive policies
            </h2>
            <div className="space-y-4">
              {inactivePolicies.map((policy) => (
                <Card
                  key={policy._id}
                  className="bg-gray-100 border-0 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                  onClick={() => handlePolicyClick(policy._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-gray-500 text-sm">
                      {policy.policyNumber}
                    </span>
                    <Badge className="bg-gray-500 text-white border-0 rounded-full px-3 py-1 text-xs font-semibold">
                      EXPIRED
                    </Badge>
                  </div>
                  <h3 className="text-gray-700 text-xl font-semibold mb-4">
                    {policy.vehicleInfo.make} {policy.vehicleInfo.model}
                  </h3>
                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-gray-500">Start</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(policy.startDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">End</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(policy.endDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Policies */}
        {policies.length === 0 && (
          <Card className="border-0 rounded-2xl p-8 text-center bg-gray-100">
            <CarFront className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No policies found
            </h3>
            <p className="text-sm text-gray-500">
              You don't have any insurance policies yet.
            </p>
          </Card>
        )}
      </main>

      {/* Floating Profile Button */}
      <BottomDrawer>
        <BottomDrawerTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-yellow-500 hover:bg-yellow-600 shadow-lg z-40"
            size="icon"
          >
            <User className="h-6 w-6" />
          </Button>
        </BottomDrawerTrigger>
        <BottomDrawerContent>
          <BottomDrawerHeader>
            <BottomDrawerTitle>Profile</BottomDrawerTitle>
            <BottomDrawerDescription>
              View your personal details and policy summary
            </BottomDrawerDescription>
          </BottomDrawerHeader>
          <div className="px-6 pb-6 space-y-6">
            {/* User Details */}
            {user && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{user.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(user.dateOfBirth).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Vehicle Registration
                      </p>
                      <p className="font-medium">
                        {policies[0]?.vehicleInfo?.vehicleRegistration ||
                          "Will be added"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Registered Keeper</p>
                      <p className="font-medium">
                        {policies[0]?.vehicleInfo?.registeredKeeper ||
                          "Will be added"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Summary Card */}
            <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-0 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6" />
                <h3 className="font-semibold text-lg">Invoice Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-100">Total Premium Paid</span>
                  <span className="font-bold text-xl">
                    £
                    {policies
                      .reduce((total, p) => total + p.price, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-100">Active Policies</span>
                  <span className="font-semibold">{activePolicies.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-100">Total Policies</span>
                  <span className="font-semibold">{policies.length}</span>
                </div>
                {policies.length > 0 && (
                  <div className="pt-3 border-t border-yellow-300/30">
                    <p className="text-yellow-100 text-sm">Latest Policy</p>
                    <p className="font-semibold">
                      {policies[0]?.vehicleInfo?.make}{" "}
                      {policies[0]?.vehicleInfo?.model}
                    </p>
                    <p className="text-yellow-100 text-sm">
                      {policies[0] &&
                        new Date(policies[0].startDate).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                      -{" "}
                      {policies[0] &&
                        new Date(policies[0].endDate).toLocaleDateString(
                          "en-GB"
                        )}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </BottomDrawerContent>
      </BottomDrawer>
    </div>
  );
}
