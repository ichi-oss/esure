import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Policy from "@/lib/models/Policy";
import User from "@/lib/models/User";
import { generateRandomPolicyNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get the auth token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if user is a sub-admin
    if (decoded.role !== "sub-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, price, startDate, endDate, vehicleInfo } = body;

    // Validate required fields
    if (!userId || !price || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the user exists and was created by this sub-admin
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify that this sub-admin created this user
    if (user.createdBy?.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "You can only create policies for users you created" },
        { status: 403 }
      );
    }

    // Create the policy
    const policy = new Policy({
      policyNumber: generateRandomPolicyNumber(),
      userId: userId,
      price: parseFloat(price),
      status: "active",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      vehicleInfo: {
        make: vehicleInfo.make || "",
        model: vehicleInfo.model || "",
        colour: vehicleInfo.colour || "",
        yearOfManufacture: vehicleInfo.yearOfManufacture || 0,
        vehicleRegistration: vehicleInfo.vehicleRegistration || "",
        registeredKeeper: vehicleInfo.registeredKeeper || "",
        topSpeed: vehicleInfo.topSpeed || "",
        acceleration: vehicleInfo.acceleration || "",
        gearbox: vehicleInfo.gearbox || "",
        power: vehicleInfo.power || "",
        maxTorque: vehicleInfo.maxTorque || "",
        engineCapacity: vehicleInfo.engineCapacity || "",
        cylinders: vehicleInfo.cylinders || 0,
        fuelType: vehicleInfo.fuelType || "",
        consumptionCity: vehicleInfo.consumptionCity || "",
        consumptionExtraUrban: vehicleInfo.consumptionExtraUrban || "",
        consumptionCombined: vehicleInfo.consumptionCombined || "",
        co2Emission: vehicleInfo.co2Emission || "",
        co2Label: vehicleInfo.co2Label || "",
        motExpiryDate: vehicleInfo.motExpiryDate || undefined,
        motPassRate: vehicleInfo.motPassRate || "",
        motPassed: vehicleInfo.motPassed || 0,
        motFailed: vehicleInfo.motFailed || 0,
        totalAdviceItems: vehicleInfo.totalAdviceItems || 0,
        totalItemsFailed: vehicleInfo.totalItemsFailed || 0,
        taxStatus: vehicleInfo.taxStatus || "",
        taxDue: vehicleInfo.taxDue || undefined,
        ncapRating: vehicleInfo.ncapRating || {
          adult: "",
          children: "",
          pedestrian: "",
          safetySystems: "",
          overall: "",
        },
        dimensions: vehicleInfo.dimensions || {
          width: "",
          height: "",
          length: "",
          wheelBase: "",
          maxAllowedWeight: "",
        },
        fuelTankCapacity: vehicleInfo.fuelTankCapacity || "",
        fuelDelivery: vehicleInfo.fuelDelivery || "",
        numberOfDoors: vehicleInfo.numberOfDoors || 0,
        numberOfSeats: vehicleInfo.numberOfSeats || 0,
        numberOfAxles: vehicleInfo.numberOfAxles || 0,
        engineNumber: vehicleInfo.engineNumber || "",
      },
      createdBy: decoded.userId, // Track which sub-admin created this policy
    });

    await policy.save();

    // Populate the policy with user details for the response
    const populatedPolicy = await Policy.findById(policy._id).populate(
      "userId",
      "fullName email"
    );

    return NextResponse.json(
      {
        message: "Policy created successfully",
        policy: populatedPolicy,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
