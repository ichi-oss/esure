import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    // Fetch all users except passwords
    const users = await User.find({})
      .select("-password")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    // Fetch policies for each user
    const usersWithPolicies = await Promise.all(
      users.map(async (user) => {
        const policies = await Policy.find({ userId: user._id })
          .select("policyNumber price status startDate endDate vehicleInfo")
          .sort({ createdAt: -1 });

        return {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          vehicleRegistration: user.vehicleRegistration,
          lastFourDigits: user.lastFourDigits,
          phoneNumber: user.phoneNumber,
          policies: policies,
        };
      })
    );

    return NextResponse.json({ users: usersWithPolicies });
  } catch (error) {
    console.error("Error fetching users with policies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
