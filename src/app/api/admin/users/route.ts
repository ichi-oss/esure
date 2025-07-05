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

    const users = await User.find({})
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
    const authResult = await requireAuth(["admin"])(request);

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

    if (!["sub-admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate user-specific fields if role is "user"
    if (role === "user") {
      if (!address || !dateOfBirth || !lastFourDigits) {
        return NextResponse.json(
          {
            error:
              "Address, date of birth, and last four digits are required for users",
          },
          { status: 400 }
        );
      }
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

    // Create new user with role-specific fields
    const userData: any = {
      fullName,
      email: email.toLowerCase(),
      password: password,
      role,
      createdBy: authResult.user.userId,
    };

    // Add user-specific fields if role is "user"
    if (role === "user") {
      userData.address = address;
      userData.dateOfBirth = new Date(dateOfBirth);
      userData.lastFourDigits = lastFourDigits;
    }

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
      ...(role === "user" && {
        address: newUser.address,
        dateOfBirth: newUser.dateOfBirth,
        lastFourDigits: newUser.lastFourDigits,
      }),
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

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId, updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent editing admin users except by other admins
    if (user.role === "admin" && authResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Cannot modify admin users" },
        { status: 403 }
      );
    }

    // Update user fields (exclude password updates through this route for security)
    const allowedFields = [
      "fullName",
      "email",
      "role",
      "isActive",
      "address",
      "dateOfBirth",
      "lastFourDigits",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "email") {
          user[field] = updateData[field].toLowerCase();
        } else {
          user[field] = updateData[field];
        }
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 403 }
      );
    }

    // Delete associated policies first
    await Policy.deleteMany({ userId: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: "User and associated policies deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
