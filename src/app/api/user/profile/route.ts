import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["user"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    // Get user information
    const user = await User.findById(authResult.user.userId).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's policy
    const policy = await Policy.findOne({ userId: authResult.user.userId });

    return NextResponse.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        vehicleRegistration: user.vehicleRegistration,
      },
      policy,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
