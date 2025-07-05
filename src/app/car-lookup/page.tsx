import { CarLookup } from "../../components/CarLookup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Car, Database, Shield, FileCheck } from "lucide-react";

export default function CarLookupPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Car className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Vehicle Data Lookup</h1>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          Get comprehensive vehicle information including MOT history, tax
          status, specifications, and more by simply entering a UK registration
          number.
        </p>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">MOT History</h3>
              </div>
              <p className="text-sm text-gray-600">
                Complete MOT test history with pass/fail status and detailed
                issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Vehicle Specs</h3>
              </div>
              <p className="text-sm text-gray-600">
                Engine details, fuel consumption, emissions, and performance
                data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Safety Ratings</h3>
              </div>
              <p className="text-sm text-gray-600">
                NCAP safety ratings for adult, child, and pedestrian protection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold">Tax & Legal</h3>
              </div>
              <p className="text-sm text-gray-600">
                Current tax status, expiry dates, and vehicle classification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Example Usage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  1
                </Badge>
                <div>
                  <h4 className="font-semibold">Enter Registration</h4>
                  <p className="text-sm text-gray-600">
                    Type in a UK vehicle registration number (e.g., AK62UKZ)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  2
                </Badge>
                <div>
                  <h4 className="font-semibold">Data Retrieval</h4>
                  <p className="text-sm text-gray-600">
                    Our system fetches data from CarCheck.co.uk and parses all
                    available information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  3
                </Badge>
                <div>
                  <h4 className="font-semibold">Comprehensive Report</h4>
                  <p className="text-sm text-gray-600">
                    View detailed vehicle information including history,
                    specifications, and current status
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">GET Request</h4>
                <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                  GET /api/car/[registration]
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Automatically fetches data from CarCheck.co.uk and returns
                  cached results if available
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  POST Request (Manual HTML)
                </h4>
                <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                  POST /api/car/[registration]
                  <br />
                  Content-Type: application/json
                  <br />
                  {`{ "html": "<CarCheck.co.uk HTML content>" }`}
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Parse custom HTML content from CarCheck.co.uk manually
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Car Lookup Component */}
      <CarLookup defaultRegistration="AK62UKZ" />
    </div>
  );
}
