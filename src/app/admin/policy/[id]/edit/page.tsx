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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Search,
  CheckCircle,
  Loader2,
  Car,
} from "lucide-react";
import { ICar } from "@/lib/models/Car";

interface Policy {
  _id: string;
  policyNumber: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    vehicleRegistration?: string;
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
}

export default function AdminPolicyEditPage() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState({
    price: "",
    status: "",
    startDate: "",
    endDate: "",
    vehicleRegistration: "",
    registeredKeeper: "",
    // Vehicle Information
    make: "",
    model: "",
    colour: "",
    yearOfManufacture: "",
    topSpeed: "",
    acceleration: "",
    gearbox: "",
    power: "",
    maxTorque: "",
    engineCapacity: "",
    cylinders: "",
    fuelType: "",
    consumptionCity: "",
    consumptionExtraUrban: "",
    consumptionCombined: "",
    co2Emission: "",
    co2Label: "",
    motExpiryDate: "",
    motPassRate: "",
    motPassed: "",
    motFailed: "",
    totalAdviceItems: "",
    totalItemsFailed: "",
    taxStatus: "",
    taxDue: "",
    ncapAdult: "",
    ncapChildren: "",
    ncapPedestrian: "",
    ncapSafetySystems: "",
    ncapOverall: "",
    width: "",
    height: "",
    length: "",
    wheelBase: "",
    maxAllowedWeight: "",
    fuelTankCapacity: "",
    fuelDelivery: "",
    numberOfDoors: "",
    numberOfSeats: "",
    numberOfAxles: "",
    engineNumber: "",
  });
  const [vehicleData, setVehicleData] = useState<Partial<ICar> | null>(null);
  const [lookupRegistration, setLookupRegistration] = useState(""); // Separate field for lookup
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vehicleDataLoaded, setVehicleDataLoaded] = useState(false);
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
          const policyData = data.policies[0];
          setPolicy(policyData);

          // Populate form with existing data
          console.log("Loading policy data:", policyData);
          console.log(
            "Vehicle registration from DB:",
            policyData.vehicleInfo.vehicleRegistration
          );

          setFormData({
            price: policyData.price.toString(),
            status: policyData.status,
            startDate: policyData.startDate.split("T")[0],
            endDate: policyData.endDate.split("T")[0],
            vehicleRegistration:
              policyData.vehicleInfo.vehicleRegistration || "",
            registeredKeeper: policyData.vehicleInfo.registeredKeeper || "",
            // Vehicle Information
            make: policyData.vehicleInfo.make || "",
            model: policyData.vehicleInfo.model || "",
            colour: policyData.vehicleInfo.colour || "",
            yearOfManufacture:
              policyData.vehicleInfo.yearOfManufacture?.toString() || "",
            topSpeed: policyData.vehicleInfo.topSpeed || "",
            acceleration: policyData.vehicleInfo.acceleration || "",
            gearbox: policyData.vehicleInfo.gearbox || "",
            power: policyData.vehicleInfo.power || "",
            maxTorque: policyData.vehicleInfo.maxTorque || "",
            engineCapacity: policyData.vehicleInfo.engineCapacity || "",
            cylinders: policyData.vehicleInfo.cylinders?.toString() || "",
            fuelType: policyData.vehicleInfo.fuelType || "",
            consumptionCity: policyData.vehicleInfo.consumptionCity || "",
            consumptionExtraUrban:
              policyData.vehicleInfo.consumptionExtraUrban || "",
            consumptionCombined:
              policyData.vehicleInfo.consumptionCombined || "",
            co2Emission: policyData.vehicleInfo.co2Emission || "",
            co2Label: policyData.vehicleInfo.co2Label || "",
            motExpiryDate:
              policyData.vehicleInfo.motExpiryDate?.split("T")[0] || "",
            motPassRate: policyData.vehicleInfo.motPassRate || "",
            motPassed: policyData.vehicleInfo.motPassed?.toString() || "",
            motFailed: policyData.vehicleInfo.motFailed?.toString() || "",
            totalAdviceItems:
              policyData.vehicleInfo.totalAdviceItems?.toString() || "",
            totalItemsFailed:
              policyData.vehicleInfo.totalItemsFailed?.toString() || "",
            taxStatus: policyData.vehicleInfo.taxStatus || "",
            taxDue: policyData.vehicleInfo.taxDue?.split("T")[0] || "",
            ncapAdult: policyData.vehicleInfo.ncapRating?.adult || "",
            ncapChildren: policyData.vehicleInfo.ncapRating?.children || "",
            ncapPedestrian: policyData.vehicleInfo.ncapRating?.pedestrian || "",
            ncapSafetySystems:
              policyData.vehicleInfo.ncapRating?.safetySystems || "",
            ncapOverall: policyData.vehicleInfo.ncapRating?.overall || "",
            width: policyData.vehicleInfo.dimensions?.width || "",
            height: policyData.vehicleInfo.dimensions?.height || "",
            length: policyData.vehicleInfo.dimensions?.length || "",
            wheelBase: policyData.vehicleInfo.dimensions?.wheelBase || "",
            maxAllowedWeight:
              policyData.vehicleInfo.dimensions?.maxAllowedWeight || "",
            fuelTankCapacity: policyData.vehicleInfo.fuelTankCapacity || "",
            fuelDelivery: policyData.vehicleInfo.fuelDelivery || "",
            numberOfDoors:
              policyData.vehicleInfo.numberOfDoors?.toString() || "",
            numberOfSeats:
              policyData.vehicleInfo.numberOfSeats?.toString() || "",
            numberOfAxles:
              policyData.vehicleInfo.numberOfAxles?.toString() || "",
            engineNumber: policyData.vehicleInfo.engineNumber || "",
          });
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

  const fetchVehicleData = async () => {
    if (!lookupRegistration.trim()) {
      setError("Please enter a vehicle registration number for lookup");
      return;
    }

    setIsLoadingVehicle(true);
    setError("");
    setVehicleDataLoaded(false);

    try {
      const response = await fetch(
        `/api/car/${lookupRegistration.toUpperCase()}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setVehicleData(result.data);
        setVehicleDataLoaded(true);
        setSuccess(
          "Vehicle data loaded successfully! You can now update the form fields."
        );

        // Auto-populate form fields with vehicle data
        const newFormData = { ...formData };

        // Basic vehicle information
        if (result.data.make) newFormData.make = result.data.make;
        if (result.data.carModel) newFormData.model = result.data.carModel;
        if (result.data.colour) newFormData.colour = result.data.colour;
        if (result.data.yearOfManufacture)
          newFormData.yearOfManufacture =
            result.data.yearOfManufacture.toString();

        // Update the form data state
        setFormData(newFormData);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to fetch vehicle data");
      }
    } catch (error) {
      setError("Failed to fetch vehicle data. Please try again.");
    } finally {
      setIsLoadingVehicle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    // Prepare update data
    const updateData = {
      price: parseFloat(formData.price),
      status: formData.status,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      vehicleInfo: {
        make: formData.make,
        model: formData.model,
        colour: formData.colour,
        yearOfManufacture: formData.yearOfManufacture
          ? parseInt(formData.yearOfManufacture)
          : 0,
        vehicleRegistration: formData.vehicleRegistration,
        registeredKeeper: formData.registeredKeeper,
        topSpeed: formData.topSpeed,
        acceleration: formData.acceleration,
        gearbox: formData.gearbox,
        power: formData.power,
        maxTorque: formData.maxTorque,
        engineCapacity: formData.engineCapacity,
        cylinders: formData.cylinders ? parseInt(formData.cylinders) : 0,
        fuelType: formData.fuelType,
        consumptionCity: formData.consumptionCity,
        consumptionExtraUrban: formData.consumptionExtraUrban,
        consumptionCombined: formData.consumptionCombined,
        co2Emission: formData.co2Emission,
        co2Label: formData.co2Label,
        motExpiryDate: formData.motExpiryDate
          ? new Date(formData.motExpiryDate)
          : undefined,
        motPassRate: formData.motPassRate,
        motPassed: formData.motPassed ? parseInt(formData.motPassed) : 0,
        motFailed: formData.motFailed ? parseInt(formData.motFailed) : 0,
        totalAdviceItems: formData.totalAdviceItems
          ? parseInt(formData.totalAdviceItems)
          : 0,
        totalItemsFailed: formData.totalItemsFailed
          ? parseInt(formData.totalItemsFailed)
          : 0,
        taxStatus: formData.taxStatus,
        taxDue: formData.taxDue ? new Date(formData.taxDue) : undefined,
        ncapRating: {
          adult: formData.ncapAdult || "",
          children: formData.ncapChildren || "",
          pedestrian: formData.ncapPedestrian || "",
          safetySystems: formData.ncapSafetySystems || "",
          overall: formData.ncapOverall || "",
        },
        dimensions: {
          width: formData.width || "",
          height: formData.height || "",
          length: formData.length || "",
          wheelBase: formData.wheelBase || "",
          maxAllowedWeight: formData.maxAllowedWeight || "",
        },
        fuelTankCapacity: formData.fuelTankCapacity,
        fuelDelivery: formData.fuelDelivery,
        numberOfDoors: formData.numberOfDoors
          ? parseInt(formData.numberOfDoors)
          : 0,
        numberOfSeats: formData.numberOfSeats
          ? parseInt(formData.numberOfSeats)
          : 0,
        numberOfAxles: formData.numberOfAxles
          ? parseInt(formData.numberOfAxles)
          : 0,
        engineNumber: formData.engineNumber,
      },
    };

    try {
      console.log("Sending updateData:", updateData);
      console.log(
        "Vehicle registration in updateData:",
        updateData.vehicleInfo.vehicleRegistration
      );

      const response = await fetch("/api/admin/policies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ policyId, updateData }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setSuccess("Policy updated successfully!");
        console.log(
          "Updated policy vehicleRegistration:",
          data.policy?.vehicleInfo?.vehicleRegistration
        );
        setTimeout(() => {
          router.push(`/admin/policy/${policyId}`);
        }, 2000);
      } else {
        setError(data.error || "Failed to update policy");
      }
    } catch (error) {
      setError("An error occurred while updating the policy");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const testApiEndpoint = async () => {
    try {
      console.log("Testing API endpoint...");
      const testResponse = await fetch("/api/admin/policies", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Test response status:", testResponse.status);
      const testData = await testResponse.json();
      console.log("Test response data:", testData);
    } catch (error) {
      console.error("Test API error:", error);
    }
  };

  const testPutRequest = async () => {
    try {
      console.log("Testing PUT request...");
      const testUpdateData = {
        price: 555,
        status: "active",
        startDate: new Date("2022-04-19"),
        endDate: new Date("2028-04-19"),
        vehicleInfo: {
          make: "BMW",
          model: "320D M SPORT",
          colour: "-",
          yearOfManufacture: 2024,
          vehicleRegistration: "TESTPUT123",
          topSpeed: "1123",
          power: "111",
          fuelType: "electric",
          taxStatus: "Valid",
          ncapRating: {
            adult: "",
            children: "",
            pedestrian: "",
            safetySystems: "",
            overall: "",
          },
          dimensions: {
            width: "",
            height: "",
            length: "",
            wheelBase: "",
            maxAllowedWeight: "",
          },
        },
      };

      const response = await fetch("/api/admin/policies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ policyId, updateData: testUpdateData }),
      });

      console.log("PUT Response status:", response.status);
      const data = await response.json();
      console.log("PUT Response data:", data);
    } catch (error) {
      console.error("PUT Test error:", error);
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Policy</h1>
              <p className="text-gray-600">
                Policy #{policy.policyNumber} - {policy.userId.fullName}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/policy/${policyId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Policy
            </Button>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Policy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>
                  Update the policy details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Policy Price (£) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Data Lookup */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Data Lookup</CardTitle>
                <CardDescription>
                  Enter a registration number to fetch and auto-populate vehicle
                  data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="lookupRegistration">
                    Registration Number for Lookup
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="lookupRegistration"
                      value={lookupRegistration}
                      onChange={(e) =>
                        setLookupRegistration(e.target.value.toUpperCase())
                      }
                      placeholder="e.g., AK62UKZ"
                      className={vehicleDataLoaded ? "border-green-500" : ""}
                    />
                    <Button
                      type="button"
                      onClick={fetchVehicleData}
                      disabled={isLoadingVehicle || !lookupRegistration}
                      variant={vehicleDataLoaded ? "outline" : "default"}
                      size="sm"
                      className="min-w-[120px]"
                    >
                      {isLoadingVehicle ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : vehicleDataLoaded ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Loaded
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Lookup
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    This field is only for looking up vehicle data. The actual
                    registration saved to the policy is in the form below.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
                <CardDescription>
                  Edit vehicle information and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Vehicle Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) =>
                          handleInputChange("make", e.target.value)
                        }
                        placeholder="e.g., Honda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        placeholder="e.g., Civic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="colour">Colour</Label>
                      <Input
                        id="colour"
                        value={formData.colour}
                        onChange={(e) =>
                          handleInputChange("colour", e.target.value)
                        }
                        placeholder="e.g., Blue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearOfManufacture">
                        Year of Manufacture
                      </Label>
                      <Input
                        id="yearOfManufacture"
                        type="number"
                        value={formData.yearOfManufacture}
                        onChange={(e) =>
                          handleInputChange("yearOfManufacture", e.target.value)
                        }
                        placeholder="e.g., 2015"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleRegistrationEdit">
                        Vehicle Registration (Saved to Policy)
                      </Label>
                      <Input
                        id="vehicleRegistrationEdit"
                        value={formData.vehicleRegistration}
                        onChange={(e) =>
                          handleInputChange(
                            "vehicleRegistration",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="e.g., AB12 CDE"
                      />
                      <p className="text-xs text-gray-500">
                        This is the registration number that will be saved to
                        the policy database.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registeredKeeper">
                        Registered Keeper
                      </Label>
                      <Input
                        id="registeredKeeper"
                        value={formData.registeredKeeper}
                        onChange={(e) =>
                          handleInputChange("registeredKeeper", e.target.value)
                        }
                        placeholder="e.g., John Smith"
                      />
                      <p className="text-xs text-gray-500">
                        The name of the person who is the registered keeper of
                        the vehicle.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Engine & Performance */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Engine & Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <Input
                        id="fuelType"
                        value={formData.fuelType}
                        onChange={(e) =>
                          handleInputChange("fuelType", e.target.value)
                        }
                        placeholder="e.g., Petrol"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="power">Power</Label>
                      <Input
                        id="power"
                        value={formData.power}
                        onChange={(e) =>
                          handleInputChange("power", e.target.value)
                        }
                        placeholder="e.g., 140 HP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topSpeed">Top Speed</Label>
                      <Input
                        id="topSpeed"
                        value={formData.topSpeed}
                        onChange={(e) =>
                          handleInputChange("topSpeed", e.target.value)
                        }
                        placeholder="e.g., 120 mph"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engineCapacity">Engine Capacity</Label>
                      <Input
                        id="engineCapacity"
                        value={formData.engineCapacity}
                        onChange={(e) =>
                          handleInputChange("engineCapacity", e.target.value)
                        }
                        placeholder="e.g., 2.0L"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cylinders">Cylinders</Label>
                      <Input
                        id="cylinders"
                        type="number"
                        value={formData.cylinders}
                        onChange={(e) =>
                          handleInputChange("cylinders", e.target.value)
                        }
                        placeholder="e.g., 4"
                        min="1"
                        max="16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumptionCombined">
                        Fuel Consumption (Combined)
                      </Label>
                      <Input
                        id="consumptionCombined"
                        value={formData.consumptionCombined}
                        onChange={(e) =>
                          handleInputChange(
                            "consumptionCombined",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 45.6 mpg"
                      />
                    </div>
                  </div>
                </div>

                {/* MOT & Tax */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    MOT & Tax Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motExpiryDate">MOT Expiry Date</Label>
                      <Input
                        id="motExpiryDate"
                        type="date"
                        value={formData.motExpiryDate}
                        onChange={(e) =>
                          handleInputChange("motExpiryDate", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxStatus">Tax Status</Label>
                      <Input
                        id="taxStatus"
                        value={formData.taxStatus}
                        onChange={(e) =>
                          handleInputChange("taxStatus", e.target.value)
                        }
                        placeholder="e.g., Valid"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxDue">Tax Due Date</Label>
                      <Input
                        id="taxDue"
                        type="date"
                        value={formData.taxDue}
                        onChange={(e) =>
                          handleInputChange("taxDue", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={testApiEndpoint}>
                Test GET
              </Button>
              <Button type="button" variant="outline" onClick={testPutRequest}>
                Test PUT
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/policy/${policyId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
