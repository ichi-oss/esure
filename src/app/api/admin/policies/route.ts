import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Policy from "@/lib/models/Policy";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { generatePassword } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get URL search params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const policyId = searchParams.get("policyId");

    await connectToDatabase();

    // Build filter query
    let filter = {};
    if (userId) {
      filter = { userId };
    } else if (policyId) {
      filter = { _id: policyId };
    }

    const policies = await Policy.find(filter)
      .populate(
        "userId",
        "fullName email address dateOfBirth vehicleRegistration lastFourDigits"
      )
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log("=== PUT /api/admin/policies called ===");
  try {
    console.log("1. Starting auth check...");
    const authResult = await requireAuth(["admin"])(request);

    if ("error" in authResult) {
      console.log("Auth failed:", authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    console.log("2. Auth successful, parsing request body...");
    const { policyId, updateData } = await request.json();

    console.log("Received updateData:", updateData);
    console.log(
      "Vehicle registration in updateData:",
      updateData.vehicleInfo?.vehicleRegistration
    );

    if (!policyId) {
      return NextResponse.json(
        { error: "Policy ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Update policy fields
    console.log("4. Updating policy fields...");
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        if (key === "vehicleInfo" && typeof updateData[key] === "object") {
          // Update individual vehicleInfo fields instead of replacing the entire object
          console.log(
            "Updating individual vehicleInfo fields:",
            updateData[key]
          );

          Object.keys(updateData[key]).forEach((vehicleField) => {
            const fieldPath = `vehicleInfo.${vehicleField}`;
            const fieldValue = updateData[key][vehicleField];

            console.log(`Setting ${fieldPath} to:`, fieldValue);

            if (
              vehicleField === "ncapRating" ||
              vehicleField === "dimensions"
            ) {
              // Handle nested objects specially
              if (typeof fieldValue === "object" && fieldValue !== null) {
                Object.keys(fieldValue).forEach((nestedField) => {
                  const nestedPath = `${fieldPath}.${nestedField}`;
                  console.log(
                    `Setting nested ${nestedPath} to:`,
                    fieldValue[nestedField]
                  );
                  policy.set(nestedPath, fieldValue[nestedField]);
                });
              }
            } else {
              // Handle regular fields
              policy.set(fieldPath, fieldValue);
            }

            console.log(`After setting ${fieldPath}:`, policy.get(fieldPath));
          });

          console.log(
            "Final vehicleInfo after individual updates:",
            policy.vehicleInfo
          );
          console.log(
            "Final vehicleRegistration:",
            policy.vehicleInfo.vehicleRegistration
          );
        } else {
          policy[key] = updateData[key];
        }
      }
    });

    console.log("5. Saving policy to database...");
    console.log(
      "Policy vehicleRegistration before save:",
      policy.vehicleInfo.vehicleRegistration
    );

    // Try using findByIdAndUpdate instead of save() to bypass strict mode issues
    const updateQuery: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      if (key === "vehicleInfo" && typeof updateData[key] === "object") {
        Object.keys(updateData[key]).forEach((vehicleField) => {
          updateQuery[`vehicleInfo.${vehicleField}`] =
            updateData[key][vehicleField];
        });
      } else {
        updateQuery[key] = updateData[key];
      }
    });

    console.log("Update query:", updateQuery);
    console.log(
      "vehicleRegistration in update query:",
      updateQuery["vehicleInfo.vehicleRegistration"]
    );

    // First, let's try a direct MongoDB update to see if it works
    const { ObjectId } = require("mongodb");
    const directUpdate = await Policy.collection.updateOne(
      { _id: new ObjectId(policyId) },
      { $set: { "vehicleInfo.vehicleRegistration": "TESTPUT123" } }
    );

    console.log("Direct MongoDB update result:", directUpdate);

    const finalUpdatedPolicy = await Policy.findByIdAndUpdate(
      policyId,
      { $set: updateQuery },
      { new: true, runValidators: true, strict: false }
    );

    console.log("6. Policy updated successfully using findByIdAndUpdate");
    console.log(
      "Updated policy vehicleRegistration:",
      finalUpdatedPolicy?.vehicleInfo?.vehicleRegistration
    );

    console.log("Policy after save - vehicleInfo:", policy.vehicleInfo);
    console.log(
      "Policy after save - vehicleRegistration:",
      policy.vehicleInfo.vehicleRegistration
    );

    const populatedPolicy = await Policy.findById(policyId)
      .populate("userId", "fullName email")
      .populate("createdBy", "fullName email");

    console.log(
      "Final populated policy vehicleRegistration:",
      populatedPolicy?.vehicleInfo?.vehicleRegistration
    );

    return NextResponse.json({
      message: "Policy updated successfully",
      policy: populatedPolicy,
    });
  } catch (error) {
    console.error("Error updating policy:", error);
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

    const { policyId } = await request.json();

    if (!policyId) {
      return NextResponse.json(
        { error: "Policy ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    await Policy.findByIdAndDelete(policyId);

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
    const { sendEmail = false, vehicleInfo } = formData;

    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "address",
      "dateOfBirth",
      "lastFourDigits",
      "price",
      "startDate",
      "endDate",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: formData.email.toLowerCase(),
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate password automatically
    const generatedPassword = generatePassword();

    // Create new user
    const newUser = new User({
      fullName: formData.fullName,
      email: formData.email.toLowerCase(),
      password: generatedPassword,
      role: "user",
      address: formData.address,
      dateOfBirth: new Date(formData.dateOfBirth),
      lastFourDigits: formData.lastFourDigits,
      createdBy: authResult.user.userId,
    });

    await newUser.save();

    // Create policy with new vehicleInfo structure
    const newPolicy = new Policy({
      userId: newUser._id,
      price: parseFloat(formData.price),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      vehicleInfo: vehicleInfo || {
        // Fallback if no vehicleInfo provided (manual entry)
        make: formData.make || "",
        model: formData.model || "",
        colour: formData.colour || "",
        yearOfManufacture: formData.yearOfManufacture
          ? parseInt(formData.yearOfManufacture)
          : 0,
      },
      createdBy: authResult.user.userId,
    });

    await newPolicy.save();

    // Optional: Send confirmation email with PDF (only if sendEmail is true)
    if (sendEmail) {
      try {
        const { sendPolicyEmail } = await import("@/lib/email");
        newUser.tempPassword = generatedPassword;
        await sendPolicyEmail(newUser, newPolicy);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return NextResponse.json({
      message: "Policy created successfully",
      credentials: {
        email: newUser.email,
        password: generatedPassword,
      },
      policy: {
        _id: newPolicy._id,
        policyNumber: newPolicy.policyNumber,
        userId: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
        price: newPolicy.price,
        status: newPolicy.status,
        startDate: newPolicy.startDate,
        endDate: newPolicy.endDate,
      },
    });
  } catch (error) {
    console.error("Error creating policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
