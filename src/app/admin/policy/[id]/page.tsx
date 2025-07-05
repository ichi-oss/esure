"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Car,
  FileText,
  Calendar,
  Mail,
} from "lucide-react";

interface Policy {
  _id: string;
  policyNumber: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    address?: string;
    dateOfBirth?: string;
    vehicleRegistration?: string;
    lastFourDigits?: string;
  };
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
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminPolicyDetailPage() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;

  useEffect(() => {
    checkAuth();
    if (policyId) {
      fetchPolicy();
    }
  }, [policyId]);

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

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/policies?policyId=${policyId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.policies && data.policies.length > 0) {
          setPolicy(data.policies[0]);
        } else {
          setError("Policy not found");
        }
      } else {
        setError("Failed to fetch policy");
      }
    } catch (error) {
      setError("An error occurred while fetching the policy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this policy? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/policies", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ policyId }),
      });

      if (response.ok) {
        setSuccess("Policy deleted successfully");
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete policy");
      }
    } catch (error) {
      setError("An error occurred while deleting the policy");
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/policies/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ policyId }),
      });

      if (response.ok) {
        setSuccess("Policy certificate sent successfully to customer's email");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send email");
      }
    } catch (error) {
      setError("An error occurred while sending the email");
    } finally {
      setIsSendingEmail(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Policy Not Found
              </h1>
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              The requested policy could not be found.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Policy Details
              </h1>
              <p className="text-gray-600">Policy #{policy.policyNumber}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Mail className="h-4 w-4" />
                {isSendingEmail ? "Sending..." : "Send Email"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/policy/${policyId}/edit`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Policy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/policies")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Policies
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Policy Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Policy Number
                    </Label>
                    <p className="font-medium">{policy.policyNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <Badge className={`${getStatusColor(policy.status)} mt-1`}>
                      {policy.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Premium</Label>
                    <p className="font-medium">
                      £{policy.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Start Date</Label>
                    <p className="font-medium">
                      {formatDate(policy.startDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">End Date</Label>
                    <p className="font-medium">{formatDate(policy.endDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Created By</Label>
                    <p className="font-medium">{policy.createdBy.fullName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Full Name</Label>
                    <p className="font-medium">{policy.userId.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="font-medium">{policy.userId.email}</p>
                  </div>
                  {policy.userId.address && (
                    <div>
                      <Label className="text-sm text-gray-600">Address</Label>
                      <p className="font-medium">{policy.userId.address}</p>
                    </div>
                  )}
                  {policy.userId.dateOfBirth && (
                    <div>
                      <Label className="text-sm text-gray-600">
                        Date of Birth
                      </Label>
                      <p className="font-medium">
                        {formatDate(policy.userId.dateOfBirth)}
                      </p>
                    </div>
                  )}
                  {policy.vehicleInfo.vehicleRegistration && (
                    <div>
                      <Label className="text-sm text-gray-600">
                        Vehicle Registration
                      </Label>
                      <p className="font-medium">
                        {policy.vehicleInfo.vehicleRegistration}
                      </p>
                    </div>
                  )}
                  {policy.vehicleInfo.registeredKeeper && (
                    <div>
                      <Label className="text-sm text-gray-600">
                        Registered Keeper
                      </Label>
                      <p className="font-medium">
                        {policy.vehicleInfo.registeredKeeper}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Basic Details</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-gray-600">Make</Label>
                        <p className="font-medium">
                          {policy.vehicleInfo.make || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Model</Label>
                        <p className="font-medium">
                          {policy.vehicleInfo.model || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Year</Label>
                        <p className="font-medium">
                          {policy.vehicleInfo.yearOfManufacture || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Colour</Label>
                        <p className="font-medium">
                          {policy.vehicleInfo.colour || "N/A"}
                        </p>
                      </div>
                      {policy.vehicleInfo.vehicleRegistration && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Vehicle Registration
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.vehicleRegistration}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.registeredKeeper && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Registered Keeper
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.registeredKeeper}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Engine Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Engine & Performance
                    </h4>
                    <div className="space-y-2">
                      {policy.vehicleInfo.fuelType && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Fuel Type
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.fuelType}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.power && (
                        <div>
                          <Label className="text-sm text-gray-600">Power</Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.power}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.topSpeed && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Top Speed
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.topSpeed}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.acceleration && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            0-60 mph
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.acceleration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MOT & Tax */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">MOT & Tax</h4>
                    <div className="space-y-2">
                      {policy.vehicleInfo.motExpiryDate && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            MOT Expiry
                          </Label>
                          <p className="font-medium">
                            {formatDate(policy.vehicleInfo.motExpiryDate)}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.taxStatus && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Tax Status
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.taxStatus}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.taxDue && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Tax Due
                          </Label>
                          <p className="font-medium">
                            {formatDate(policy.vehicleInfo.taxDue)}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.motPassRate && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            MOT Pass Rate
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.motPassRate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emissions */}
                  {(policy.vehicleInfo.co2Emission ||
                    policy.vehicleInfo.co2Label) && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Emissions</h4>
                      <div className="space-y-2">
                        {policy.vehicleInfo.co2Emission && (
                          <div>
                            <Label className="text-sm text-gray-600">
                              CO₂ Emissions
                            </Label>
                            <p className="font-medium">
                              {policy.vehicleInfo.co2Emission}
                            </p>
                          </div>
                        )}
                        {policy.vehicleInfo.co2Label && (
                          <div>
                            <Label className="text-sm text-gray-600">
                              CO₂ Label
                            </Label>
                            <p className="font-medium">
                              {policy.vehicleInfo.co2Label}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Safety */}
                  {policy.vehicleInfo.ncapRating && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">
                        Safety Ratings
                      </h4>
                      <div className="space-y-2">
                        {policy.vehicleInfo.ncapRating.overall && (
                          <div>
                            <Label className="text-sm text-gray-600">
                              Overall Rating
                            </Label>
                            <p className="font-medium">
                              {policy.vehicleInfo.ncapRating.overall}
                            </p>
                          </div>
                        )}
                        {policy.vehicleInfo.ncapRating.adult && (
                          <div>
                            <Label className="text-sm text-gray-600">
                              Adult Protection
                            </Label>
                            <p className="font-medium">
                              {policy.vehicleInfo.ncapRating.adult}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Specifications
                    </h4>
                    <div className="space-y-2">
                      {policy.vehicleInfo.numberOfDoors && (
                        <div>
                          <Label className="text-sm text-gray-600">Doors</Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.numberOfDoors}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.numberOfSeats && (
                        <div>
                          <Label className="text-sm text-gray-600">Seats</Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.numberOfSeats}
                          </p>
                        </div>
                      )}
                      {policy.vehicleInfo.gearbox && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            Gearbox
                          </Label>
                          <p className="font-medium">
                            {policy.vehicleInfo.gearbox}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
