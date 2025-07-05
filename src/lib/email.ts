import { Resend } from "resend";
import { pdfProcessor } from "@/lib/pdfProcessor";

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPolicyEmail(user: any, policy: any) {
  try {
    // Generate PDF certificate using the new PDF processor
    const pdfBuffer = await pdfProcessor.generatePolicyDocument(policy);

    const emailHtml = generateEmailTemplate(user, policy);

    const { data, error } = await resend.emails.send({
      from: "Aviva Insurance <noreply@avivaflex.com>",
      to: [user.email],
      subject: `🎉 Your Aviva Insurance Policy is Ready - ${policy.policyNumber}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Policy_Certificate_${policy.policyNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Error sending policy email:", error);
      throw error;
    }

    console.log("Policy email sent successfully to:", user.email);
    return data;
  } catch (error) {
    console.error("Error sending policy email:", error);
    throw error;
  }
}

function generateEmailTemplate(user: any, policy: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aviva Insurance Policy Certificate</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          line-height: 1.6;
          color: #2c2c2c;
          background-color: #fefef9;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }
        
        .header h1 {
          color: #2c2c2c;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        
        .header p {
          color: #4a4a4a;
          font-size: 16px;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          font-weight: 500;
          color: #2c2c2c;
          margin-bottom: 20px;
        }
        
        .main-message {
          font-size: 16px;
          color: #4a4a4a;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .policy-card {
          background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 25px;
          margin: 25px 0;
          position: relative;
          overflow: hidden;
        }
        
        .policy-card::before {
          content: '🚗';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          opacity: 0.3;
        }
        
        .policy-card h3 {
          color: #2c2c2c;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          border-bottom: 2px solid #FFD700;
          padding-bottom: 8px;
        }
        
        .policy-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .policy-detail:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .policy-label {
          font-weight: 500;
          color: #666;
          flex: 1;
        }
        
        .policy-value {
          font-weight: 600;
          color: #2c2c2c;
          flex: 1;
          text-align: right;
        }
        
        .credentials-card {
          background: linear-gradient(135deg, #e8f5e8 0%, #f0fdf4 100%);
          border: 2px solid #22c55e;
          border-radius: 16px;
          padding: 25px;
          margin: 25px 0;
          position: relative;
        }
        
        .credentials-card::before {
          content: '🔐';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          opacity: 0.3;
        }
        
        .credentials-card h3 {
          color: #166534;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .credential-item {
          background: rgba(255, 255, 255, 0.7);
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #22c55e;
        }
        
        .credential-label {
          font-weight: 500;
          color: #166534;
          font-size: 14px;
        }
        
        .credential-value {
          font-weight: 600;
          color: #2c2c2c;
          font-size: 16px;
          word-break: break-all;
        }
        
        .portal-link {
          display: inline-block;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #2c2c2c;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-weight: 600;
          margin: 15px 0;
          transition: transform 0.2s ease;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }
        
        .portal-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
        }
        
        .important-notice {
          background: linear-gradient(135deg, #fef3c7 0%, #fef7cd 100%);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          position: relative;
        }
        
        .important-notice::before {
          content: '⚠️';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 20px;
        }
        
        .important-notice h4 {
          color: #92400e;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 16px;
        }
        
        .important-notice p {
          color: #92400e;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .footer {
          background: linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        
        .footer h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .footer p {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 5px;
        }
        
        .footer-links {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .footer-links a {
          color: #FFD700;
          text-decoration: none;
          margin: 0 10px;
          font-weight: 500;
        }
        
        .footer-links a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          
          .header, .content, .footer {
            padding: 25px 20px;
          }
          
          .policy-card, .credentials-card, .important-notice {
            padding: 20px;
          }
          
          .policy-detail {
            flex-direction: column;
            gap: 5px;
          }
          
          .policy-value {
            text-align: left;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
                 <!-- Header -->
         <div class="header">
           <h1>🎉 Policy Confirmed!</h1>
           <p>Your Aviva insurance certificate is ready</p>
         </div>
        
        <!-- Main Content -->
        <div class="content">
          <div class="greeting">
            Hello ${user.fullName}! 👋
          </div>
          
                     <div class="main-message">
             Congratulations! Your Aviva insurance policy has been successfully created and is now active. We're excited to have you protected with our comprehensive coverage.
           </div>
          
          <!-- Policy Details Card -->
          <div class="policy-card">
            <h3>📋 Policy Details</h3>
            <div class="policy-detail">
              <span class="policy-label">Policy Number</span>
              <span class="policy-value">${policy.policyNumber}</span>
            </div>
            <div class="policy-detail">
              <span class="policy-label">Vehicle</span>
              <span class="policy-value">${policy.vehicleInfo.yearOfManufacture} ${policy.vehicleInfo.make} ${policy.vehicleInfo.model}</span>
            </div>
            <div class="policy-detail">
              <span class="policy-label">Registration</span>
              <span class="policy-value">${policy.vehicleInfo.vehicleRegistration || "Not specified"}</span>
            </div>
            <div class="policy-detail">
              <span class="policy-label">Color</span>
              <span class="policy-value">${policy.vehicleInfo.colour}</span>
            </div>
            <div class="policy-detail">
              <span class="policy-label">Start Date</span>
              <span class="policy-value">${new Date(policy.startDate).toLocaleDateString("en-GB")}</span>
            </div>
            <div class="policy-detail">
              <span class="policy-label">End Date</span>
              <span class="policy-value">${new Date(policy.endDate).toLocaleDateString("en-GB")}</span>
            </div>
            <div class="policy-detail">
              <span class="policy-label">Premium</span>
              <span class="policy-value">£${policy.price.toLocaleString()}</span>
            </div>
          </div>
          
          <!-- Login Credentials -->
          <div class="credentials-card">
            <h3>🔑 Your Customer Portal Access</h3>
            <div class="credential-item">
              <div class="credential-label">Email Address</div>
              <div class="credential-value">${user.email}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Temporary Password</div>
              <div class="credential-value">${user.tempPassword || user.password}</div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                             <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://avivaflex.com"}" class="portal-link">
                 🚀 Access Your Aviva Portal
               </a>
            </div>
          </div>
          
          <!-- Important Notice -->
          <div class="important-notice">
            <h4>🔒 Security Notice</h4>
            <p>For your security, please log in and change your password immediately after accessing your account for the first time. You can manage your policies, view coverage details, and update your information anytime through the customer portal.</p>
          </div>
          
          <div class="main-message">
            Your policy certificate is attached to this email as a PDF. Keep it safe and easily accessible - you may need it for verification purposes.
          </div>
        </div>
        
                 <!-- Footer -->
         <div class="footer">
           <h4>📞 Need Help?</h4>
           <p>Our Aviva customer support team is here to assist you</p>
           <p><strong>Email:</strong> support@avivaflex.com</p>
           <p><strong>Phone:</strong> 0800 123 4567</p>
           <p><strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM</p>
           
           <div class="footer-links">
             <a href="https://avivaflex.com/terms">Policy Terms</a> |
             <a href="https://avivaflex.com/faq">FAQ</a> |
             <a href="https://avivaflex.com/contact">Contact Us</a>
           </div>
           
           <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
             <p>This email was sent from Aviva Insurance. Please do not reply to this email.</p>
             <p>© ${new Date().getFullYear()} Aviva Insurance. All rights reserved.</p>
           </div>
         </div>
      </div>
    </body>
    </html>
  `;
}
