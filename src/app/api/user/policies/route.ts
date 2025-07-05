import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const policies = await Policy.find({ userId: decoded.userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        vehicleRegistration: user.vehicleRegistration,
      },
      policies: policies || [],
    });
  } catch (error) {
    console.error("Error fetching user policies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
