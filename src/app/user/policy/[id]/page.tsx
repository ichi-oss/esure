"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  ArrowLeft,
  Car,
  Shield,
  Calendar,
  DollarSign,
  Info,
  FileText,
  Download,
  Gauge,
  Fuel,
  Wrench,
  AlertCircle,
  User,
  MapPin,
  Mail,
  CreditCard,
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

export default function PolicyDetail() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;

  useEffect(() => {
    checkAuth();
    fetchPolicyDetail();
  }, [policyId]);

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

  const fetchPolicyDetail = async () => {
    try {
      // Fetch specific policy
      const policyResponse = await fetch(`/api/user/policy/${policyId}`);
      if (policyResponse.ok) {
        const policyData = await policyResponse.json();
        setPolicy(policyData.policy);
        console.log("Policy data:", policyData.policy);
        console.log(
          "Vehicle registration from policy:",
          policyData.policy?.vehicleInfo?.vehicleRegistration
        );
      }

      // Fetch user data and all policies
      const userResponse = await fetch("/api/user/policies");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
        setAllPolicies(userData.policies || []);
        console.log(userData.policies);
      }
    } catch (error) {
      console.error("Error fetching policy detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (status === "expired" || daysUntilExpiry < 0) return "bg-gray-500";
    if (daysUntilExpiry <= 30) return "bg-amber-500";
    if (status === "active") return "bg-green-500";
    return "bg-gray-500";
  };

  const getDaysUntilExpiry = () => {
    if (!policy) return 0;
    const today = new Date();
    const expiryDate = new Date(policy.endDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDownloadPolicy = async () => {
    if (!policy || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/user/policy/${policy._id}/download`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `Policy Certificate ${policy.policyNumber}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to download policy");
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error downloading policy:", error);
      // You could add a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-0 rounded-2xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Policy not found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This policy could not be found.
          </p>
          <Button
            onClick={() => router.push("/user")}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mobile-content px-4 py-6 space-y-4">
        {/* Policy Status Badge */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">{policy.policyNumber}</p>
          <Badge
            className={`${getStatusColor(
              policy.status,
              policy.endDate
            )} text-white border-0`}
          >
            {policy.status.toUpperCase()}
          </Badge>
        </div>

        {/* Policy Overview Card */}
        <Card className="border-0 rounded-2xl p-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {policy.vehicleInfo.make} {policy.vehicleInfo.model}
              </h2>
              <p className="text-yellow-100">
                {policy.vehicleInfo.yearOfManufacture} •{" "}
                {policy.vehicleInfo.colour}
              </p>
            </div>
            <Car className="h-8 w-8 text-yellow-200" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-yellow-100 text-sm">Premium</p>
              <p className="text-xl font-bold">
                £{policy.price.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-yellow-100 text-sm">Days Remaining</p>
              <p className="text-xl font-bold">
                {daysUntilExpiry > 0 ? daysUntilExpiry : "Expired"}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <BottomDrawer>
            <BottomDrawerTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl h-auto py-4 flex flex-col gap-2"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">Profile</span>
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
                            {policy?.vehicleInfo?.vehicleRegistration ||
                              "Will be added"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Registered Keeper
                          </p>
                          <p className="font-medium">
                            {policy?.vehicleInfo?.registeredKeeper ||
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
                      <span className="text-yellow-100">
                        Total Premium Paid
                      </span>
                      <span className="font-bold text-xl">
                        £
                        {allPolicies
                          .reduce((total, p) => total + p.price, 0)
                          .toLocaleString()}
                      </span>
                    </div>

                    {allPolicies.length > 0 && (
                      <div className="pt-3 border-t border-yellow-300/30">
                        <p className="text-yellow-100 text-sm">Latest Policy</p>
                        <p className="font-semibold">
                          {policy.vehicleInfo.make} {policy.vehicleInfo.model}
                          {policy.vehicleInfo.yearOfManufacture}
                        </p>
                        {/* add start and end date */}
                        <p className="text-yellow-100 text-sm">
                          Vehicle Registration:{" "}
                          {policy.vehicleInfo.vehicleRegistration}
                          <br />
                          Policy Period:{" "}
                          {new Date(policy.startDate).toLocaleDateString(
                            "en-GB"
                          )}{" "}
                          -{" "}
                          {new Date(policy.endDate).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </BottomDrawerContent>
          </BottomDrawer>
          <Button
            variant="outline"
            className="rounded-xl h-auto py-4 flex flex-col gap-2"
            onClick={handleDownloadPolicy}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span className="text-sm">
              {isDownloading ? "Downloading..." : "Download Policy"}
            </span>
          </Button>
        </div>

        {/* Policy Period */}
        <Card className="border-0 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Policy Period</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date</span>
              <span className="font-medium">
                {new Date(policy.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End Date</span>
              <span className="font-medium">
                {new Date(policy.endDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-amber-800">
                  Your policy expires soon. Contact us to renew.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Vehicle Specifications */}
        <Card className="border-0 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Vehicle Specifications</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {policy.vehicleInfo.topSpeed && (
              <div>
                <p className="text-sm text-gray-600">Top Speed</p>
                <p className="font-medium">{policy.vehicleInfo.topSpeed}</p>
              </div>
            )}
            {policy.vehicleInfo.acceleration && (
              <div>
                <p className="text-sm text-gray-600">0-60 mph</p>
                <p className="font-medium">{policy.vehicleInfo.acceleration}</p>
              </div>
            )}
            {policy.vehicleInfo.power && (
              <div>
                <p className="text-sm text-gray-600">Power</p>
                <p className="font-medium">{policy.vehicleInfo.power}</p>
              </div>
            )}
            {policy.vehicleInfo.gearbox && (
              <div>
                <p className="text-sm text-gray-600">Gearbox</p>
                <p className="font-medium">{policy.vehicleInfo.gearbox}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Engine & Fuel */}
        {(policy.vehicleInfo.engineCapacity || policy.vehicleInfo.fuelType) && (
          <Card className="border-0 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Fuel className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">Engine & Fuel</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {policy.vehicleInfo.engineCapacity && (
                <div>
                  <p className="text-sm text-gray-600">Engine Capacity</p>
                  <p className="font-medium">
                    {policy.vehicleInfo.engineCapacity}
                  </p>
                </div>
              )}
              {policy.vehicleInfo.cylinders && (
                <div>
                  <p className="text-sm text-gray-600">Cylinders</p>
                  <p className="font-medium">{policy.vehicleInfo.cylinders}</p>
                </div>
              )}
              {policy.vehicleInfo.fuelType && (
                <div>
                  <p className="text-sm text-gray-600">Fuel Type</p>
                  <p className="font-medium">{policy.vehicleInfo.fuelType}</p>
                </div>
              )}
              {policy.vehicleInfo.consumptionCombined && (
                <div>
                  <p className="text-sm text-gray-600">Consumption</p>
                  <p className="font-medium">
                    {policy.vehicleInfo.consumptionCombined}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* MOT & Tax */}
        {(policy.vehicleInfo.motExpiryDate || policy.vehicleInfo.taxStatus) && (
          <Card className="border-0 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">MOT & Tax</h3>
            </div>
            <div className="space-y-3">
              {policy.vehicleInfo.motExpiryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">MOT Expiry</span>
                  <span className="font-medium">
                    {new Date(
                      policy.vehicleInfo.motExpiryDate
                    ).toLocaleDateString("en-GB")}
                  </span>
                </div>
              )}
              {policy.vehicleInfo.taxStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Status</span>
                  <span className="font-medium">
                    {policy.vehicleInfo.taxStatus}
                  </span>
                </div>
              )}
              {policy.vehicleInfo.taxDue && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Due</span>
                  <span className="font-medium">
                    {new Date(policy.vehicleInfo.taxDue).toLocaleDateString(
                      "en-GB"
                    )}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Cover Details */}
        <Card className="border-0 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Cover Details</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Comprehensive Cover</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Personal Accident Cover</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Third Party Cover</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Fire & Theft Protection</span>
            </div>
          </div>
        </Card>

        {/* Add-ons */}
        <Card className="border-0 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Add-ons</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Motor Legal Protection</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Breakdown Cover</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
