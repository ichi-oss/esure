import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";
import { requireAuth } from "@/lib/auth";
import { sendPolicyEmail } from "@/lib/email";
import { generatePassword } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin", "sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    // If admin, show all policies; if sub-admin, show only their created policies
    const query =
      authResult.user.role === "admin"
        ? {}
        : { createdBy: authResult.user.userId };

    const policies = await Policy.find(query)
      .populate("userId", "fullName email")
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

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["admin", "sub-admin"])(request);

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
      "vehicleRegistration",
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
      vehicleRegistration: formData.vehicleRegistration,
      lastFourDigits: formData.lastFourDigits,
      createdBy: authResult.user.userId,
    });

    await newUser.save();

    // Store the plain password temporarily for email (will be cleaned up)
    newUser.tempPassword = generatedPassword;

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

    // Send confirmation email with PDF (only if sendEmail is true)
    if (sendEmail) {
      try {
        await sendPolicyEmail(newUser, newPolicy);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return NextResponse.json({
      message: "Policy created successfully",
      credentials: !sendEmail
        ? {
            email: newUser.email,
            password: generatedPassword,
          }
        : undefined,
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
