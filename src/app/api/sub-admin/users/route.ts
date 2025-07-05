import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    // Sub-admins can only see users they created
    const users = await User.find({
      createdBy: authResult.user.userId,
      role: "user", // Only show regular users, not sub-admins or admins
    })
      .select("-password")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const requestData = await request.json();
    const {
      fullName,
      email,
      password,
      role,
      address,
      dateOfBirth,
      vehicleRegistration,
      lastFourDigits,
    } = requestData;

    if (!fullName || !email || !role) {
      return NextResponse.json(
        { error: "Full name, email, and role are required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Sub-admins can only create users (not other sub-admins or admins)
    if (role !== "user") {
      return NextResponse.json(
        {
          error: "Sub-admins can only create regular users",
        },
        { status: 400 }
      );
    }

    // Validate user-specific fields
    if (!address || !dateOfBirth || !vehicleRegistration || !lastFourDigits) {
      return NextResponse.json(
        {
          error:
            "Address, date of birth, vehicle registration, and last four digits are required for users",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user with the sub-admin as the creator
    const userData = {
      fullName,
      email: email.toLowerCase(),
      password: password,
      role,
      address,
      dateOfBirth: new Date(dateOfBirth),
      vehicleRegistration,
      lastFourDigits,
      createdBy: authResult.user.userId, // Set the sub-admin as creator
    };

    const newUser = new User(userData);
    await newUser.save();

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      address: newUser.address,
      dateOfBirth: newUser.dateOfBirth,
      vehicleRegistration: newUser.vehicleRegistration,
      lastFourDigits: newUser.lastFourDigits,
    };

    return NextResponse.json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
