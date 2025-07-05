import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Policy from "@/lib/models/Policy";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const formData = await request.json();
    const { userId, price, startDate, endDate, vehicleInfo } = formData;

    // Validate required fields
    if (!userId || !price || !startDate || !endDate) {
      return NextResponse.json(
        { error: "User ID, price, start date, and end date are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create policy with vehicleInfo structure
    const newPolicy = new Policy({
      userId: user._id,
      price: parseFloat(price),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      vehicleInfo: vehicleInfo || {
        // Fallback with minimal required fields
        make: "",
        model: "",
        colour: "",
        yearOfManufacture: 0,
      },
      createdBy: authResult.user.userId,
    });

    await newPolicy.save();

    // Populate the policy with user details for response
    const populatedPolicy = await Policy.findById(newPolicy._id)
      .populate("userId", "fullName email")
      .populate("createdBy", "fullName email");

    return NextResponse.json({
      message: "Policy created successfully",
      policy: populatedPolicy,
    });
  } catch (error) {
    console.error("Error creating policy for user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
