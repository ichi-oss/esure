import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Policy from "@/lib/models/Policy";
import User from "@/lib/models/User";
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

    // Sub-admins can only access policies they created
    const policy = await Policy.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
    })
      .populate("userId", "fullName email address dateOfBirth")
      .populate("createdBy", "fullName email");

    if (!policy) {
      return NextResponse.json(
        { error: "Policy not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Error fetching policy:", error);
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

    const updateData = await request.json();

    await connectToDatabase();

    // Sub-admins can only update policies they created
    const policy = await Policy.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Policy not found or access denied" },
        { status: 404 }
      );
    }

    // Update policy fields using the same logic as admin API
    const allowedFields = [
      "price",
      "startDate",
      "endDate",
      "status",
      "vehicleInfo",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "vehicleInfo" && typeof updateData[field] === "object") {
          // Update individual vehicleInfo fields to ensure proper saving
          Object.keys(updateData[field]).forEach((vehicleField) => {
            policy.set(
              `vehicleInfo.${vehicleField}`,
              updateData[field][vehicleField]
            );
          });
        } else if (field === "startDate" || field === "endDate") {
          policy[field] = new Date(updateData[field]);
        } else {
          policy[field] = updateData[field];
        }
      }
    });

    await policy.save();

    const updatedPolicy = await Policy.findById(params.id)
      .populate("userId", "fullName email address dateOfBirth")
      .populate("createdBy", "fullName email");

    return NextResponse.json({
      message: "Policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    console.error("Error updating policy:", error);
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

    // Sub-admins can only delete policies they created
    const policy = await Policy.findOne({
      _id: params.id,
      createdBy: authResult.user.userId,
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Policy not found or access denied" },
        { status: 404 }
      );
    }

    await Policy.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Policy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
