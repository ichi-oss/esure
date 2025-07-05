import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    // Sub-admins can only access users they created
    const user = await User.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
      role: "user",
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { updateData } = await request.json();

    await connectToDatabase();

    // Sub-admins can only update users they created
    const user = await User.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
      role: "user",
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or access denied" },
        { status: 404 }
      );
    }

    // Update user fields (exclude password updates and role changes)
    const allowedFields = [
      "fullName",
      "email",
      "isActive",
      "address",
      "dateOfBirth",
      "vehicleRegistration",
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

    const updatedUser = await User.findById(params.id).select("-password");

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const updateData = await request.json();

    await connectToDatabase();

    // Sub-admins can only update users they created
    const user = await User.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
      role: "user",
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or access denied" },
        { status: 404 }
      );
    }

    // Update only the provided fields (for status toggle, etc.)
    Object.keys(updateData).forEach((key) => {
      if (key === "isActive") {
        user[key] = updateData[key];
      }
    });

    await user.save();

    return NextResponse.json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    // Sub-admins can only delete users they created
    const user = await User.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
      role: "user",
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or access denied" },
        { status: 404 }
      );
    }

    // Delete associated policies first
    await Policy.deleteMany({ userId: params.id });

    // Delete the user
    await User.findByIdAndDelete(params.id);

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
