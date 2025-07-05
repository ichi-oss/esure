import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Policy from "@/lib/models/Policy";
import { pdfProcessor } from "@/lib/pdfProcessor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: policyId } = await params;

    // Fetch the policy and ensure it belongs to the authenticated user
    const policy = await Policy.findOne({
      _id: policyId,
      userId: decoded.userId,
    })
      .populate("userId", "fullName email address dateOfBirth")
      .populate("createdBy", "fullName email")
      .lean();

    if (!policy) {
      return NextResponse.json(
        { error: "Policy not found or access denied" },
        { status: 404 }
      );
    }

    // Generate the policy document
    const documentBuffer = await pdfProcessor.generatePolicyDocument(
      policy as any
    );

    // Return the PDF as a downloadable file
    return new NextResponse(documentBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Policy Certificate ${(policy as any).policyNumber}.pdf"`,
        "Content-Length": documentBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
