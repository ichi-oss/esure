import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Policy from "@/lib/models/Policy";
import User from "@/lib/models/User";
import { pdfProcessor } from "@/lib/pdfProcessor";
import { Resend } from "resend";
import { requireAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["sub-admin"])(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    const { policyId } = await request.json();

    if (!policyId) {
      return NextResponse.json(
        { error: "Policy ID is required" },
        { status: 400 }
      );
    }

    // Fetch the policy with populated user data
    // Sub-admins can only access policies they created
    const policy = await Policy.findOne({
      _id: policyId,
      createdBy: authResult.user.userId,
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

    // Read the additional terms PDF file
    const termsFilePath = path.join(process.cwd(), "public", "NMDMG10249.pdf");
    const termsBuffer = fs.readFileSync(termsFilePath);

    // Prepare email content
    const policyData = policy as any;
    const emailSubject = `Your Aviva Insurance Policy Certificate - ${policyData.policyNumber}`;

    // Calculate policy duration
    const startDate = new Date(policyData.startDate);
    const endDate = new Date(policyData.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Aviva Insurance Policy - ${policyData.policyNumber}</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #f8f9fa;
                  color: #333;
              }
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: white;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  border-radius: 8px;
                  overflow: hidden;
              }
              .header {
                  background: linear-gradient(135deg, #FFD700, #FFC107);
                  padding: 40px 30px;
                  text-align: center;
                  position: relative;
              }
              .logo-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 15px;
              }
              .logo-img {
                  width: 150px;
                  height: auto;
              }
              .tagline {
                  color: #003398;
                  font-size: 16px;
                  font-weight: 500;
                  margin-top: 10px;
              }
              .banner-section {
                  position: relative;
                  width: 100%;
                  height: 200px;
                  overflow: hidden;
              }
              .banner-img {
                  width: 100%;
                  height: 200px;
                  object-fit: cover;
                  display: block;
              }
              .banner-overlay {
                  background: linear-gradient(135deg, rgba(0, 51, 152, 0.8), rgba(0, 51, 152, 0.6));
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .banner-text {
                  color: white;
                  text-align: center;
                  z-index: 2;
                  position: relative;
              }
              .banner-title {
                  font-size: 32px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              .banner-subtitle {
                  font-size: 18px;
                  font-weight: 500;
                  opacity: 0.95;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
              }
              .content {
                  padding: 40px 30px;
              }
              .thank-you {
                  font-size: 28px;
                  color: #003398;
                  margin-bottom: 30px;
                  text-align: center;
                  font-weight: 600;
              }
              .vehicle-card {
                  background: linear-gradient(135deg, #003398, #0056d6);
                  border-radius: 16px;
                  padding: 30px;
                  margin: 30px 0;
                  color: white;
                  position: relative;
                  overflow: hidden;
                  box-shadow: 0 8px 25px rgba(0, 51, 152, 0.2);
              }
              .vehicle-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  right: 0;
                  width: 120px;
                  height: 120px;
                  background: linear-gradient(45deg, rgba(255, 215, 0, 0.2), transparent);
                  border-radius: 50%;
                  transform: translate(50%, -50%);
              }
              .policy-number {
                  font-size: 14px;
                  color: rgba(255, 255, 255, 0.8);
                  margin-bottom: 10px;
                  font-weight: 500;
              }
              .status-badge {
                  background: linear-gradient(135deg, #FFD700, #FFC107);
                  color: #003398;
                  padding: 8px 18px;
                  border-radius: 25px;
                  font-size: 12px;
                  font-weight: bold;
                  float: right;
                  margin-top: -5px;
                  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
              }
              .vehicle-name {
                  font-size: 28px;
                  font-weight: bold;
                  margin: 15px 0;
                  clear: both;
              }
              .dates {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
              }
              .date-block {
                  text-align: center;
              }
              .date-label {
                  font-size: 14px;
                  color: #9ca3af;
                  margin-bottom: 5px;
              }
              .date-value {
                  font-size: 18px;
                  font-weight: bold;
              }
              .details-section {
                  background-color: #f8fafc;
                  border-radius: 12px;
                  padding: 25px;
                  margin: 25px 0;
              }
              .details-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 20px;
              }
              .detail-item {
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 10px;
              }
              .detail-label {
                  font-size: 12px;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 5px;
              }
              .detail-value {
                  font-size: 16px;
                  font-weight: 600;
                  color: #1e293b;
              }
              .payment-section {
                  background: linear-gradient(135deg, #FFD700, #FFC107);
                  color: #003398;
                  border-radius: 16px;
                  padding: 25px;
                  margin: 30px 0;
                  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);
              }
              .payment-title {
                  font-size: 20px;
                  font-weight: bold;
                  margin-bottom: 18px;
              }
              .payment-details {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
              }
              .payment-method {
                  font-size: 14px;
                  opacity: 0.8;
                  font-weight: 500;
              }
              .total-price {
                  font-size: 28px;
                  font-weight: bold;
              }
              .footer {
                  background-color: #003398;
                  color: rgba(255, 255, 255, 0.9);
                  padding: 40px 30px;
                  font-size: 13px;
                  line-height: 1.7;
              }
              .footer h3 {
                  color: #FFD700;
                  margin-bottom: 18px;
                  font-size: 18px;
              }
              .footer p {
                  margin-bottom: 10px;
              }
              .contact-info {
                  margin-top: 25px;
                  padding-top: 25px;
                  border-top: 1px solid rgba(255, 215, 0, 0.3);
              }
              @media (max-width: 600px) {
                  .email-container {
                      margin: 0;
                      border-radius: 0;
                      box-shadow: none;
                  }
                  .header {
                      padding: 30px 20px;
                  }
                  .logo-img {
                      width: 120px;
                  }
                  .tagline {
                      font-size: 14px;
                  }
                  .banner-section {
                      height: 150px;
                  }
                  .banner-img {
                      height: 150px;
                  }
                  .banner-title {
                      font-size: 24px;
                      margin-bottom: 8px;
                  }
                  .banner-subtitle {
                      font-size: 16px;
                  }
                  .content {
                      padding: 30px 20px;
                  }
                  .thank-you {
                      font-size: 22px;
                      margin-bottom: 25px;
                  }
                  .vehicle-card {
                      padding: 25px 20px;
                      margin: 25px 0;
                      border-radius: 12px;
                  }
                  .vehicle-card::before {
                      width: 80px;
                      height: 80px;
                  }
                  .policy-number {
                      font-size: 13px;
                  }
                  .status-badge {
                      padding: 6px 14px;
                      font-size: 11px;
                      margin-top: -3px;
                  }
                  .vehicle-name {
                      font-size: 22px;
                      margin: 12px 0;
                      line-height: 1.2;
                  }
                  .dates {
                      flex-direction: column;
                      gap: 15px;
                      margin-top: 15px;
                  }
                  .date-block {
                      background: rgba(255, 255, 255, 0.1);
                      padding: 12px;
                      border-radius: 8px;
                  }
                  .date-label {
                      font-size: 13px;
                  }
                  .date-value {
                      font-size: 16px;
                  }
                  .details-section {
                      padding: 20px;
                      margin: 20px 0;
                      border-radius: 10px;
                  }
                  .details-section h3 {
                      font-size: 18px !important;
                  }
                  .details-grid {
                      grid-template-columns: 1fr;
                      gap: 12px;
                      margin-bottom: 15px;
                  }
                  .detail-item {
                      padding-bottom: 8px;
                  }
                  .detail-label {
                      font-size: 11px;
                  }
                  .detail-value {
                      font-size: 15px;
                  }
                  .payment-section {
                      padding: 20px;
                      margin: 25px 0;
                      border-radius: 12px;
                  }
                  .payment-title {
                      font-size: 18px;
                      margin-bottom: 15px;
                  }
                  .payment-details {
                      flex-direction: column;
                      align-items: flex-start;
                      gap: 12px;
                  }
                  .payment-method {
                      font-size: 13px;
                  }
                  .total-price {
                      font-size: 24px;
                      align-self: flex-end;
                  }
                  .footer {
                      padding: 30px 20px;
                      font-size: 12px;
                  }
                  .footer h3 {
                      font-size: 16px !important;
                      margin-bottom: 15px !important;
                  }
                  .contact-info {
                      margin-top: 20px;
                      padding-top: 20px;
                  }
              }
              
              @media (max-width: 480px) {
                  .header {
                      padding: 25px 15px;
                  }
                  .logo-img {
                      width: 100px;
                  }
                  .content {
                      padding: 25px 15px;
                  }
                  .thank-you {
                      font-size: 20px;
                  }
                  .vehicle-card {
                      padding: 20px 15px;
                  }
                  .vehicle-name {
                      font-size: 20px;
                  }
                  .banner-title {
                      font-size: 22px;
                  }
                  .banner-subtitle {
                      font-size: 15px;
                  }
                  .details-section {
                      padding: 15px;
                  }
                  .payment-section {
                      padding: 15px;
                  }
                  .footer {
                      padding: 25px 15px;
                  }
                  .total-price {
                      font-size: 22px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <!-- Header with Logo -->
              <div class="header">
                  <div class="logo-container">
                      <img src="https://cdn.freebiesupply.com/logos/large/2x/aviva-logo-png-transparent.png" alt="Aviva Logo" class="logo-img">
                  </div>
                  <div class="tagline">Insurance You Can Trust</div>
              </div>

              <!-- Banner Section -->
              <div class="banner-section">
                  <img src="https://s6.imgcdn.dev/Y6dAhL.webp" alt="Aviva Insurance Banner" class="banner-img">
                  <div class="banner-overlay">
                      <div class="banner-text">
                          <div class="banner-title">Your Policy is Ready</div>
                          <div class="banner-subtitle">Comprehensive coverage you can trust</div>
                      </div>
                  </div>
              </div>

              <!-- Content -->
              <div class="content">
                  <div class="thank-you">Thank you for choosing Aviva Insurance!</div>
                  
                  <!-- Vehicle Card -->
                  <div class="vehicle-card">
                      <div class="policy-number">${policyData.policyNumber}</div>
                      <div class="status-badge">ACTIVE</div>
                      <div class="vehicle-name">${policyData.vehicleInfo.make.toUpperCase()} ${policyData.vehicleInfo.model.toUpperCase()}</div>
                      
                      <div class="dates">
                          <div class="date-block">
                              <div class="date-label">Start</div>
                              <div class="date-value">${startDate.toLocaleDateString("en-GB")}</div>
                          </div>
                          <div class="date-block">
                              <div class="date-label">End</div>
                              <div class="date-value">${endDate.toLocaleDateString("en-GB")}</div>
                          </div>
                      </div>
                  </div>

                  <!-- Policy Details -->
                  <div class="details-section">
                      <h3 style="margin-top: 0; color: #1e293b; font-size: 20px;">Policy Details</h3>
                      
                      <div class="details-grid">
                          <div class="detail-item">
                              <div class="detail-label">Full Name</div>
                              <div class="detail-value">${policyData.userId.fullName}</div>
                          </div>
                          <div class="detail-item">
                              <div class="detail-label">Date of Birth</div>
                              <div class="detail-value">${new Date(policyData.userId.dateOfBirth).toLocaleDateString("en-GB")}</div>
                          </div>
                          <div class="detail-item">
                              <div class="detail-label">Vehicle Year</div>
                              <div class="detail-value">${policyData.vehicleInfo.yearOfManufacture}</div>
                          </div>
                          <div class="detail-item">
                              <div class="detail-label">Vehicle Color</div>
                              <div class="detail-value">${policyData.vehicleInfo.colour}</div>
                          </div>
                      </div>

                      <div class="detail-item" style="grid-column: 1 / -1;">
                          <div class="detail-label">Address</div>
                          <div class="detail-value">${policyData.userId.address}</div>
                      </div>

                      <div class="details-grid" style="margin-top: 20px;">
                          <div class="detail-item">
                              <div class="detail-label">Policy Length</div>
                              <div class="detail-value">${diffDays} Days</div>
                          </div>
                          <div class="detail-item">
                              <div class="detail-label">Coverage Type</div>
                              <div class="detail-value">Comprehensive</div>
                          </div>
                      </div>
                  </div>

                  <!-- Payment Information -->
                  <div class="payment-section">
                      <div class="payment-title">Payment Confirmation</div>
                      <div class="payment-details">
                          <div>
                              <div class="payment-method">Policy Premium</div>
                              <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">Payment processed successfully</div>
                          </div>
                          <div class="total-price">£${policyData.price.toLocaleString()}</div>
                      </div>
                  </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                  <h3>Important Information</h3>
                  
                  <p><strong>Terms & Conditions:</strong> This insurance policy is subject to our standard terms and conditions. Please ensure you have read and understood all policy documents provided.</p>
                  
                  <p><strong>Claims:</strong> In the event of an incident, please contact our 24/7 claims hotline immediately on 0800 202 2040. Failure to report claims promptly may affect your coverage.</p>
                  
                  <p><strong>Policy Documents:</strong> Your full policy schedule and certificate of motor insurance is attached to this email. Please keep it safe and accessible.</p>
                  
                  <p><strong>Cancellation:</strong> You have a 14-day cooling off period during which you can cancel this policy for a full refund, provided no claims have been made.</p>
                  
                  <div class="contact-info">
                      <p><strong>Need Help?</strong></p>
                      <p>Customer Service: 0800 285 1088 (Mon-Fri 8am-8pm, Sat 9am-5pm)</p>
                      <p>Email: support@avivaflex.com</p>
                      <p>Website: www.avivaflex.com</p>
                  </div>
                  
                  <p style="margin-top: 20px; font-size: 11px; opacity: 0.7;">
                      Aviva Insurance Limited. Registered in England No. 2494086. 
                      Registered Office: Pitheavlis, Perth PH2 0NH. 
                      Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Send email with attachment
    const emailResponse = await resend.emails.send({
      from: "Aviva Insurance <noreply@myavivacover.com>",
      to: [policyData.userId.email],
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `Policy Certificate ${policyData.policyNumber}.pdf`,
          content: documentBuffer,
        },
        {
          filename: "Your Aviva Policy Terms.pdf",
          content: termsBuffer,
        },
      ],
    });

    if (emailResponse.error) {
      console.error("Email sending error:", emailResponse.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Policy certificate sent successfully",
      emailId: emailResponse.data?.id,
    });
  } catch (error) {
    console.error("Error sending policy email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
