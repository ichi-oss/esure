import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST() {
  try {
    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 400 }
      );
    }

    // Create admin user
    const adminUser = new User({
      fullName: "System Administrator",
      email: "admin@insurance.com",
      password: "admin123", // This will be hashed by the pre-save hook
      role: "admin",
    });

    await adminUser.save();

    return NextResponse.json({
      message: "Admin user created successfully",
      credentials: {
        email: "admin@insurance.com",
        password: "admin123",
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
