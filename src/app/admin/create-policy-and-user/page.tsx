"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Car, Search, CheckCircle } from "lucide-react";
import { ICar } from "@/lib/models/Car";

export default function AdminCreatePolicyPage() {
  const [formData, setFormData] = useState({
    // User Information
    fullName: "",
    email: "",
    address: "",
    dateOfBirth: "",
    vehicleRegistration: "",
    lastFourDigits: "",

    // Policy Information
    price: "",
    startDate: "",
    endDate: "",

    // Vehicle Information - Basic
    make: "",
    model: "",
    colour: "",
    yearOfManufacture: "",
    registeredKeeper: "",

    // Vehicle Specs
    power: "",
    gearbox: "",

    // Engine & Fuel
    engineCapacity: "",
    cylinders: "",
    fuelType: "",

    // MOT & Tax
    motExpiryDate: "",
    taxStatus: "",
    taxDue: "",
  });

  const [vehicleData, setVehicleData] = useState<Partial<ICar> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [vehicleDataLoaded, setVehicleDataLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "admin") {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  };

  const fetchVehicleData = async () => {
    if (!formData.vehicleRegistration.trim()) {
      setError("Please enter a vehicle registration number");
      return;
    }

    setIsLoadingVehicle(true);
    setError("");
    setVehicleDataLoaded(false);

    try {
      const response = await fetch(
        `/api/car/${formData.vehicleRegistration.toUpperCase()}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setVehicleData(result.data);
        setVehicleDataLoaded(true);
        setSuccess(
          "Vehicle data loaded successfully! Form fields auto-populated."
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

        // Vehicle specs
        if (result.data.engine?.power)
          newFormData.power = result.data.engine.power.toString();
        if (result.data.gearbox) newFormData.gearbox = result.data.gearbox;

        // Engine & Fuel
        if (result.data.engine?.capacity)
          newFormData.engineCapacity = result.data.engine.capacity.toString();
        if (result.data.engine?.cylinders)
          newFormData.cylinders = result.data.engine.cylinders.toString();
        if (result.data.engine?.fuelType)
          newFormData.fuelType = result.data.engine.fuelType;

        // MOT & Tax information
        if (result.data.mot?.expiryDate)
          newFormData.motExpiryDate = result.data.mot.expiryDate;
        if (result.data.tax?.status)
          newFormData.taxStatus = result.data.tax.status;
        if (result.data.tax?.dueDate)
          newFormData.taxDue = result.data.tax.dueDate;

        // Update the form data state
        setFormData(newFormData);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
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
    setIsLoading(true);
    setError("");
    setSuccess("");
    setCredentials(null);

    // Transform vehicle data to match Policy schema
    const vehicleInfo = {
      make: formData.make || "",
      model: formData.model || "",
      colour: formData.colour || "",
      yearOfManufacture: formData.yearOfManufacture
        ? parseInt(formData.yearOfManufacture)
        : 0,
      vehicleRegistration: formData.vehicleRegistration || "",
      registeredKeeper: formData.registeredKeeper || "",
      power: formData.power ? `${formData.power} BHP` : "",
      gearbox: formData.gearbox || "",
      engineCapacity: formData.engineCapacity
        ? `${formData.engineCapacity}L`
        : "",
      cylinders: formData.cylinders ? parseInt(formData.cylinders) : 0,
      fuelType: formData.fuelType || "",
      motExpiryDate: formData.motExpiryDate
        ? new Date(formData.motExpiryDate)
        : undefined,
      taxStatus: formData.taxStatus || "",
      taxDue: formData.taxDue ? new Date(formData.taxDue) : undefined,
    };

    try {
      const response = await fetch("/api/admin/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          lastFourDigits: formData.lastFourDigits,
          price: formData.price,
          startDate: formData.startDate,
          endDate: formData.endDate,
          vehicleInfo,
          sendEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `Policy and user created successfully! ${
            sendEmail
              ? "User account created and confirmation email sent."
              : "User credentials shown below."
          }`
        );
        if (!sendEmail && data.credentials) {
          setCredentials(data.credentials);
        }
        setTimeout(() => {
          router.push("/admin");
        }, 5000);
      } else {
        setError(data.error || "Failed to create policy");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset vehicle data if registration changes
    if (field === "vehicleRegistration" && vehicleDataLoaded) {
      setVehicleDataLoaded(false);
      setVehicleData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Policy & User (Admin)
              </h1>
              <p className="text-gray-600">
                Create a new insurance policy and user account
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Enter the customer's personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleRegistration">
                    Vehicle Registration *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="vehicleRegistration"
                      value={formData.vehicleRegistration}
                      onChange={(e) =>
                        handleInputChange(
                          "vehicleRegistration",
                          e.target.value.toUpperCase()
                        )
                      }
                      required
                      placeholder="e.g., AK62UKZ"
                      className={vehicleDataLoaded ? "border-green-500" : ""}
                    />
                    <Button
                      type="button"
                      onClick={fetchVehicleData}
                      disabled={
                        isLoadingVehicle || !formData.vehicleRegistration
                      }
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
                  {vehicleDataLoaded && (
                    <p className="text-sm text-green-600 mt-1">
                      Vehicle data loaded successfully
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastFourDigits">
                    Last 4 Digits of Credit Card *
                  </Label>
                  <Input
                    id="lastFourDigits"
                    value={formData.lastFourDigits}
                    onChange={(e) =>
                      handleInputChange("lastFourDigits", e.target.value)
                    }
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Policy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>
                  Set the policy price and duration
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="startDate">Policy Start Date *</Label>
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
                  <Label htmlFor="endDate">Policy End Date *</Label>
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

            {/* Vehicle Information Preview */}
            {vehicleDataLoaded && vehicleData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Information Preview
                  </CardTitle>
                  <CardDescription>
                    Automatically loaded from registration{" "}
                    {formData.vehicleRegistration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    {vehicleData.make && (
                      <div>
                        <Label className="text-sm text-gray-600">Make</Label>
                        <p className="font-medium">{vehicleData.make}</p>
                      </div>
                    )}
                    {vehicleData.carModel && (
                      <div>
                        <Label className="text-sm text-gray-600">Model</Label>
                        <p className="font-medium">{vehicleData.carModel}</p>
                      </div>
                    )}
                    {vehicleData.colour && (
                      <div>
                        <Label className="text-sm text-gray-600">Colour</Label>
                        <p className="font-medium">{vehicleData.colour}</p>
                      </div>
                    )}
                    {vehicleData.yearOfManufacture && (
                      <div>
                        <Label className="text-sm text-gray-600">Year</Label>
                        <p className="font-medium">
                          {vehicleData.yearOfManufacture}
                        </p>
                      </div>
                    )}

                    {/* Engine Info */}
                    {vehicleData.engine?.fuelType && (
                      <div>
                        <Label className="text-sm text-gray-600">
                          Fuel Type
                        </Label>
                        <p className="font-medium">
                          {vehicleData.engine.fuelType}
                        </p>
                      </div>
                    )}
                    {vehicleData.engine?.power && (
                      <div>
                        <Label className="text-sm text-gray-600">Power</Label>
                        <p className="font-medium">
                          {vehicleData.engine.power} BHP
                        </p>
                      </div>
                    )}
                    {vehicleData.gearbox && (
                      <div>
                        <Label className="text-sm text-gray-600">Gearbox</Label>
                        <p className="font-medium">{vehicleData.gearbox}</p>
                      </div>
                    )}

                    {/* MOT & Tax */}
                    {vehicleData.mot?.expiryDate && (
                      <div>
                        <Label className="text-sm text-gray-600">
                          MOT Expires
                        </Label>
                        <p className="font-medium">
                          {vehicleData.mot.expiryDate}
                        </p>
                      </div>
                    )}
                    {vehicleData.tax?.status && (
                      <div>
                        <Label className="text-sm text-gray-600">
                          Tax Status
                        </Label>
                        <p className="font-medium">{vehicleData.tax.status}</p>
                      </div>
                    )}
                    {vehicleData.tax?.dueDate && (
                      <div>
                        <Label className="text-sm text-gray-600">Tax Due</Label>
                        <p className="font-medium">{vehicleData.tax.dueDate}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
                <CardDescription>
                  Vehicle information - automatically populated when vehicle
                  data is loaded. You can edit these fields if needed.
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
                      <Label htmlFor="colour">Color</Label>
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
                      <Label htmlFor="yearOfManufacture">Year</Label>
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
                    </div>
                  </div>
                </div>

                {/* Vehicle Specs */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Vehicle Specs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="power">Power (BHP)</Label>
                      <Input
                        id="power"
                        type="number"
                        value={formData.power}
                        onChange={(e) =>
                          handleInputChange("power", e.target.value)
                        }
                        placeholder="e.g., 140"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gearbox">Gearbox</Label>
                      <Input
                        id="gearbox"
                        value={formData.gearbox}
                        onChange={(e) =>
                          handleInputChange("gearbox", e.target.value)
                        }
                        placeholder="e.g., Manual"
                      />
                    </div>
                  </div>
                </div>

                {/* Engine & Fuel */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Engine & Fuel
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="engineCapacity">
                        Engine Capacity (L)
                      </Label>
                      <Input
                        id="engineCapacity"
                        type="number"
                        step="0.1"
                        value={formData.engineCapacity}
                        onChange={(e) =>
                          handleInputChange("engineCapacity", e.target.value)
                        }
                        placeholder="e.g., 1.8"
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
                      />
                    </div>
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
                  </div>
                </div>

                {/* MOT & Tax */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    MOT & Tax
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motExpiryDate">MOT Expiry</Label>
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
                      <Label htmlFor="taxDue">Tax Due</Label>
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

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            {credentials && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  User Login Credentials
                </h3>
                <div className="text-sm text-blue-700">
                  <p>
                    <strong>Email:</strong> {credentials.email}
                  </p>
                  <p>
                    <strong>Password:</strong> {credentials.password}
                  </p>
                  <p className="mt-2 text-xs">
                    Please save these credentials securely. The user can log in
                    with these details.
                  </p>
                </div>
              </div>
            )}

            {/* Email Option */}
            <Card>
              <CardHeader>
                <CardTitle>Email Options</CardTitle>
                <CardDescription>
                  Choose whether to send confirmation email to the user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="sendEmail">
                    Send confirmation email with PDF certificate
                  </Label>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  If unchecked, user credentials will be displayed here instead
                  of being emailed.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading
                  ? "Creating Policy & User..."
                  : "Create Policy & User"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
