"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Loader2,
  Car,
  AlertCircle,
  CheckCircle,
  Clock,
  Fuel,
  Gauge,
  Calendar,
  Shield,
  Wrench,
} from "lucide-react";
import { ICar } from "../lib/models/Car";

interface CarLookupProps {
  onCarSelected?: (car: ICar) => void;
  defaultRegistration?: string;
}

interface CarDataResponse {
  success: boolean;
  data?: ICar;
  cached?: boolean;
  error?: string;
}

export function CarLookup({
  onCarSelected,
  defaultRegistration = "",
}: CarLookupProps) {
  const [registration, setRegistration] = useState(defaultRegistration);
  const [carData, setCarData] = useState<ICar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const handleSearch = async () => {
    if (!registration.trim()) {
      setError("Please enter a registration number");
      return;
    }

    setLoading(true);
    setError(null);
    setCarData(null);

    try {
      const response = await fetch(`/api/car/${registration.toUpperCase()}`);
      const result: CarDataResponse = await response.json();

      if (result.success && result.data) {
        setCarData(result.data);
        setCached(result.cached || false);

        if (onCarSelected) {
          onCarSelected(result.data);
        }
      } else {
        setError(result.error || "Car not found");
      }
    } catch (err) {
      setError("Failed to fetch car data. Please try again.");
      console.error("Car lookup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB");
    } catch {
      return dateStr;
    }
  };

  const getMotStatusBadge = (motData: ICar["mot"]) => {
    const expiryDate = new Date(motData.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">MOT Expired</Badge>;
    } else if (daysUntilExpiry < 30) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          MOT Due Soon ({daysUntilExpiry} days)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700">
          MOT Valid ({daysUntilExpiry} days)
        </Badge>
      );
    }
  };

  const getTaxStatusBadge = (taxData: ICar["tax"]) => {
    if (taxData.daysLeft < 0) {
      return <Badge variant="destructive">Tax Expired</Badge>;
    } else if (taxData.daysLeft < 30) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          Tax Due Soon ({taxData.daysLeft} days)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700">
          Tax Valid ({taxData.daysLeft} days)
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter registration number (e.g., AK62UKZ)"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {cached && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <Clock className="h-4 w-4" />
              Data from cache (updated within 7 days)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Car Data Display */}
      {carData && (
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vehicle Information</span>
                <div className="flex gap-2">
                  {carData.mot && getMotStatusBadge(carData.mot)}
                  {carData.tax && getTaxStatusBadge(carData.tax)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Registration
                  </label>
                  <p className="text-lg font-mono font-bold">
                    {carData.registration}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Make & Model
                  </label>
                  <p className="text-lg font-semibold">
                    {carData.make} {carData.carModel}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Year
                  </label>
                  <p className="text-lg">{carData.yearOfManufacture}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Colour
                  </label>
                  <p className="text-lg">{carData.colour}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Fuel Type
                  </label>
                  <p className="text-lg">{carData.engine?.fuelType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Gearbox
                  </label>
                  <p className="text-lg">{carData.gearbox}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Engine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance & Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Power
                  </label>
                  <p className="text-lg font-semibold">
                    {carData.engine?.power} BHP
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    0-60 mph
                  </label>
                  <p className="text-lg">{carData.acceleration0to60}s</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Top Speed
                  </label>
                  <p className="text-lg">{carData.topSpeed} mph</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Engine Size
                  </label>
                  <p className="text-lg">{carData.engine?.capacity}cc</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Max Torque
                  </label>
                  <p className="text-lg">
                    {carData.engine?.maxTorque?.value} Nm @{" "}
                    {carData.engine?.maxTorque?.rpm} rpm
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Cylinders
                  </label>
                  <p className="text-lg">{carData.engine?.cylinders}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    CO₂ Emissions
                  </label>
                  <p className="text-lg">{carData.emissions?.co2} g/km</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    CO₂ Label
                  </label>
                  <Badge variant="outline">{carData.emissions?.co2Label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fuel Consumption */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Consumption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    City
                  </label>
                  <p className="text-lg">{carData.fuelConsumption?.city} mpg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Extra Urban
                  </label>
                  <p className="text-lg">
                    {carData.fuelConsumption?.extraUrban} mpg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Combined
                  </label>
                  <p className="text-lg font-semibold">
                    {carData.fuelConsumption?.combined} mpg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MOT History */}
          {carData.mot && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  MOT Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Expiry Date
                    </label>
                    <p className="text-lg">
                      {formatDate(carData.mot.expiryDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Pass Rate
                    </label>
                    <p className="text-lg">{carData.mot.passRate}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tests Passed
                    </label>
                    <p className="text-lg text-green-600">
                      {carData.mot.totalPassed}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tests Failed
                    </label>
                    <p className="text-lg text-red-600">
                      {carData.mot.totalFailed}
                    </p>
                  </div>
                </div>

                {carData.mot.history && carData.mot.history.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recent MOT History</h4>
                    <div className="space-y-3">
                      {carData.mot.history.slice(0, 3).map((test, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {formatDate(test.date)}
                            </span>
                            <Badge
                              variant={
                                test.result === "Passed"
                                  ? "outline"
                                  : "destructive"
                              }
                              className={
                                test.result === "Passed"
                                  ? "border-green-500 text-green-700"
                                  : ""
                              }
                            >
                              {test.result === "Passed" ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Passed
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Failed
                                </>
                              )}
                            </Badge>
                          </div>
                          {test.issues && test.issues.length > 0 && (
                            <div className="text-sm space-y-1">
                              {test.issues
                                .slice(0, 3)
                                .map((issue, issueIndex) => (
                                  <div
                                    key={issueIndex}
                                    className="flex items-start gap-2"
                                  >
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        issue.type === "Fail"
                                          ? "border-red-500 text-red-700"
                                          : issue.type === "Major"
                                          ? "border-orange-500 text-orange-700"
                                          : issue.type === "Minor"
                                          ? "border-yellow-500 text-yellow-700"
                                          : "border-blue-500 text-blue-700"
                                      }`}
                                    >
                                      {issue.type}
                                    </Badge>
                                    <span className="text-gray-600">
                                      {issue.description}
                                    </span>
                                  </div>
                                ))}
                              {test.issues.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{test.issues.length - 3} more issues
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tax Information */}
          {carData.tax && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tax Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Due Date
                    </label>
                    <p className="text-lg">{formatDate(carData.tax.dueDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tax Band
                    </label>
                    <p className="text-lg">{carData.tax.band}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Annual Cost
                    </label>
                    <p className="text-lg">£{carData.tax.annualCost}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Days Left
                    </label>
                    <p className="text-lg">{carData.tax.daysLeft}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Ratings */}
          {carData.safety && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Adult
                    </label>
                    <p className="text-lg">{carData.safety.adult}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Children
                    </label>
                    <p className="text-lg">{carData.safety.children}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Pedestrian
                    </label>
                    <p className="text-lg">{carData.safety.pedestrian}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Safety Systems
                    </label>
                    <p className="text-lg">{carData.safety.safetySystems}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Overall
                    </label>
                    <p className="text-lg font-semibold">
                      {carData.safety.overall}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mileage Information */}
          {carData.mileage && (
            <Card>
              <CardHeader>
                <CardTitle>Mileage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Registrations
                    </label>
                    <p className="text-lg">
                      {carData.mileage.totalRegistrations}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      First Registration
                    </label>
                    <p className="text-lg">
                      {formatDate(carData.mileage.firstRegistration)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Last Registration
                    </label>
                    <p className="text-lg">
                      {formatDate(carData.mileage.lastRegistration)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Current Mileage
                    </label>
                    <p className="text-lg font-semibold">
                      {carData.mileage.history[
                        carData.mileage.history.length - 1
                      ]?.mileage.toLocaleString()}{" "}
                      miles
                    </p>
                  </div>
                </div>

                {carData.mileage.history &&
                  carData.mileage.history.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Mileage History</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Date</th>
                              <th className="text-right py-2">Mileage</th>
                              <th className="text-right py-2">Annual Miles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {carData.mileage.history
                              .slice(-5)
                              .map((record, index, arr) => {
                                const previousRecord = arr[index - 1];
                                const annualMiles = previousRecord
                                  ? Math.round(
                                      (record.mileage -
                                        previousRecord.mileage) /
                                        ((new Date(record.date).getTime() -
                                          new Date(
                                            previousRecord.date
                                          ).getTime()) /
                                          (1000 * 60 * 60 * 24 * 365))
                                    )
                                  : null;

                                return (
                                  <tr key={index} className="border-b">
                                    <td className="py-2">
                                      {formatDate(record.date)}
                                    </td>
                                    <td className="text-right py-2">
                                      {record.mileage.toLocaleString()}
                                    </td>
                                    <td className="text-right py-2">
                                      {annualMiles
                                        ? `${annualMiles.toLocaleString()}`
                                        : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Vehicle Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Dimensions (L×W×H)
                  </label>
                  <p className="text-lg">
                    {carData.dimensions?.length} × {carData.dimensions?.width} ×{" "}
                    {carData.dimensions?.height} mm
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Max Weight
                  </label>
                  <p className="text-lg">
                    {carData.dimensions?.maxAllowedWeight} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Doors/Seats
                  </label>
                  <p className="text-lg">
                    {carData.specifications?.numberOfDoors} doors,{" "}
                    {carData.specifications?.numberOfSeats} seats
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Fuel Tank
                  </label>
                  <p className="text-lg">
                    {carData.specifications?.fuelTankCapacity}L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
