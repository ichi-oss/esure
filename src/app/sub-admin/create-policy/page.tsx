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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Search, CheckCircle, Loader2, Car } from "lucide-react";
import { ICar } from "@/lib/models/Car";

interface User {
  _id: string;
  fullName: string;
  email: string;
}

export default function SubAdminCreatePolicyPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    price: "",
    startDate: "",
    endDate: "",
    vehicleRegistration: "",
    // Basic vehicle info (required)
    make: "",
    model: "",
    colour: "",
    yearOfManufacture: "",
  });
  const [vehicleData, setVehicleData] = useState<Partial<ICar> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vehicleDataLoaded, setVehicleDataLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsers();
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
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/sub-admin/users");
      if (response.ok) {
        const data = await response.json();
        // Filter only users (not admins or sub-admins) that this sub-admin created
        const regularUsers = data.users.filter(
          (user: any) => user.role === "user"
        );
        setUsers(regularUsers);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      setError("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u._id === userId);
    setSelectedUser(user || null);

    if (user) {
      // Vehicle registration will be entered manually for this policy

      // Reset vehicle data when user changes
      setVehicleData(null);
      setVehicleDataLoaded(false);
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
        setSuccess("Vehicle data loaded successfully!");

        // Auto-populate form fields with vehicle data
        const newFormData = { ...formData };
        if (result.data.make) newFormData.make = result.data.make;
        if (result.data.carModel) newFormData.model = result.data.carModel;
        if (result.data.colour) newFormData.colour = result.data.colour;
        if (result.data.yearOfManufacture)
          newFormData.yearOfManufacture =
            result.data.yearOfManufacture.toString();

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

    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    // Validate required vehicle fields
    if (
      !formData.make ||
      !formData.model ||
      !formData.colour ||
      !formData.yearOfManufacture
    ) {
      setError(
        "Please fill in all required vehicle fields (Make, Model, Colour, Year)"
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    // Transform vehicle data to match Policy schema
    let vehicleInfo: any = {
      // Use form data for basic required fields (can be manually entered)
      make: formData.make || "",
      model: formData.model || "",
      colour: formData.colour || "",
      yearOfManufacture: formData.yearOfManufacture
        ? parseInt(formData.yearOfManufacture)
        : 0,
      vehicleRegistration: formData.vehicleRegistration || "",
    };

    // Add additional data from vehicle lookup if available
    if (vehicleData) {
      vehicleInfo = {
        ...vehicleInfo,
        topSpeed: vehicleData.topSpeed || "",
        acceleration: vehicleData.acceleration0to60 || "",
        gearbox: vehicleData.gearbox || "",
        power: vehicleData.engine?.power
          ? `${vehicleData.engine.power} HP`
          : "",
        maxTorque: vehicleData.engine?.maxTorque?.value
          ? `${vehicleData.engine.maxTorque.value} Nm`
          : "",
        engineCapacity: vehicleData.engine?.capacity
          ? `${vehicleData.engine.capacity}L`
          : "",
        cylinders: vehicleData.engine?.cylinders || 0,
        fuelType: vehicleData.engine?.fuelType || "",
        consumptionCity: vehicleData.fuelConsumption?.city
          ? `${vehicleData.fuelConsumption.city}L/100km`
          : "",
        consumptionExtraUrban: vehicleData.fuelConsumption?.extraUrban
          ? `${vehicleData.fuelConsumption.extraUrban}L/100km`
          : "",
        consumptionCombined: vehicleData.fuelConsumption?.combined
          ? `${vehicleData.fuelConsumption.combined}L/100km`
          : "",
        co2Emission: vehicleData.emissions?.co2
          ? `${vehicleData.emissions.co2} g/km`
          : "",
        co2Label: vehicleData.emissions?.co2Label || "",
        motExpiryDate: vehicleData.mot?.expiryDate
          ? new Date(vehicleData.mot.expiryDate)
          : undefined,
        motPassRate: vehicleData.mot?.passRate
          ? `${vehicleData.mot.passRate}%`
          : "",
        motPassed: vehicleData.mot?.totalPassed || 0,
        motFailed: vehicleData.mot?.totalFailed || 0,
        totalAdviceItems: vehicleData.mot?.totalAdviceItems || 0,
        totalItemsFailed: vehicleData.mot?.totalFailedItems || 0,
        taxStatus: vehicleData.tax?.status || "",
        taxDue: vehicleData.tax?.dueDate
          ? new Date(vehicleData.tax.dueDate)
          : undefined,
        ncapRating: vehicleData.safety
          ? {
              adult: vehicleData.safety.adult
                ? `${vehicleData.safety.adult}%`
                : "",
              children: vehicleData.safety.children
                ? `${vehicleData.safety.children}%`
                : "",
              pedestrian: vehicleData.safety.pedestrian
                ? `${vehicleData.safety.pedestrian}%`
                : "",
              safetySystems: vehicleData.safety.safetySystems
                ? `${vehicleData.safety.safetySystems}%`
                : "",
              overall: vehicleData.safety.overall
                ? `${vehicleData.safety.overall} stars`
                : "",
            }
          : undefined,
        dimensions: vehicleData.dimensions
          ? {
              width: vehicleData.dimensions.width
                ? `${vehicleData.dimensions.width}mm`
                : "",
              height: vehicleData.dimensions.height
                ? `${vehicleData.dimensions.height}mm`
                : "",
              length: vehicleData.dimensions.length
                ? `${vehicleData.dimensions.length}mm`
                : "",
              wheelBase: vehicleData.dimensions.wheelBase
                ? `${vehicleData.dimensions.wheelBase}mm`
                : "",
              maxAllowedWeight: vehicleData.dimensions.maxAllowedWeight
                ? `${vehicleData.dimensions.maxAllowedWeight}kg`
                : "",
            }
          : undefined,
        fuelTankCapacity: vehicleData.specifications?.fuelTankCapacity
          ? `${vehicleData.specifications.fuelTankCapacity}L`
          : "",
        fuelDelivery: vehicleData.engine?.fuelDelivery || "",
        numberOfDoors: vehicleData.specifications?.numberOfDoors || 0,
        numberOfSeats: vehicleData.specifications?.numberOfSeats || 0,
        numberOfAxles: vehicleData.specifications?.numberOfAxles || 0,
        engineNumber: vehicleData.engine?.engineNumber || "",
      };
    }

    try {
      const response = await fetch("/api/sub-admin/create-policy-for-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          price: formData.price,
          startDate: formData.startDate,
          endDate: formData.endDate,
          vehicleInfo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Policy created successfully!");
        // Reset form
        setFormData({
          price: "",
          startDate: "",
          endDate: "",
          vehicleRegistration: "",
          make: "",
          model: "",
          colour: "",
          yearOfManufacture: "",
        });
        setSelectedUserId("");
        setSelectedUser(null);
        setVehicleData(null);
        setVehicleDataLoaded(false);

        setTimeout(() => {
          router.push("/sub-admin");
        }, 2000);
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
                Create Policy for User
              </h1>
              <p className="text-gray-600">
                Create a new insurance policy for an existing user you manage
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/sub-admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select User</CardTitle>
                <CardDescription>
                  Choose the user for whom you want to create a policy (only
                  users you created)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="user">User *</Label>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading users...</span>
                    </div>
                  ) : (
                    <Select
                      value={selectedUserId}
                      onValueChange={handleUserSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.fullName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedUser && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">
                      Selected User:
                    </h4>
                    <p className="text-blue-700">{selectedUser.fullName}</p>
                    <p className="text-blue-600 text-sm">
                      {selectedUser.email}
                    </p>
                    <p className="text-blue-600 text-sm">
                      Vehicle registration will be set per policy
                    </p>
                  </div>
                )}
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
                    placeholder="e.g., 500.00"
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

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>
                  Vehicle registration and basic details (required fields)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleRegistration">
                      Vehicle Registration
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
                        Vehicle data loaded successfully and form auto-populated
                      </p>
                    )}
                  </div>

                  {/* Basic Vehicle Details - Required Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) =>
                          handleInputChange("make", e.target.value)
                        }
                        required
                        placeholder="e.g., BMW"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        required
                        placeholder="e.g., 320D"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="colour">Colour *</Label>
                      <Input
                        id="colour"
                        value={formData.colour}
                        onChange={(e) =>
                          handleInputChange("colour", e.target.value)
                        }
                        required
                        placeholder="e.g., Black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearOfManufacture">Year *</Label>
                      <Input
                        id="yearOfManufacture"
                        type="number"
                        value={formData.yearOfManufacture}
                        onChange={(e) =>
                          handleInputChange("yearOfManufacture", e.target.value)
                        }
                        required
                        placeholder="e.g., 2020"
                        min="1900"
                        max="2030"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    * Required fields. Use the vehicle lookup above to
                    auto-populate these fields, or enter them manually.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Data Preview */}
            {vehicleDataLoaded && vehicleData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Details Preview
                  </CardTitle>
                  <CardDescription>
                    Data loaded from registration {formData.vehicleRegistration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/sub-admin")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedUserId}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Creating Policy..." : "Create Policy"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
