import { createReport } from "docx-templates";
import * as fs from "fs";
import * as path from "path";

interface PolicyData {
  _id: string;
  policyNumber: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    address?: string;
    dateOfBirth?: string;
  };
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  documentGeneratedAt: string;
  vehicleInfo: {
    make: string;
    model: string;
    colour: string;
    yearOfManufacture: number;
    vehicleRegistration?: string;
    registeredKeeper?: string;
    [key: string]: any;
  };
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class DocxProcessor {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(process.cwd(), "src", "Family Policy.docx");
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  private prepareTemplateData(policy: PolicyData) {
    const startDate = new Date(policy.startDate);

    // Calculate end date as one year from start date
    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1);
    calculatedEndDate.setDate(calculatedEndDate.getDate() - 1); // One day before anniversary

    // Format dates for the template
    const formattedStartDate = this.formatDate(policy.startDate);
    const formattedEndDate = this.formatDate(calculatedEndDate.toISOString());
    const startTime = this.formatTime(policy.documentGeneratedAt);

    // Create vehicle description
    const vehicleDescription =
      `${policy.vehicleInfo.yearOfManufacture || ""} ${policy.vehicleInfo.make || ""} ${policy.vehicleInfo.model || ""}`.trim();

    return {
      // Use simple variable names for docx-templates default {{}} syntax
      policyNumber: policy.policyNumber,
      fullName: policy.userId.fullName,
      vehicleRegNumber:
        policy.vehicleInfo.vehicleRegistration || "Not provided",
      makeOfVehicle: vehicleDescription || "Not specified",
      startDate: `${startTime} on ${formattedStartDate}`,
      endDate: `23.59 on ${formattedEndDate}`,
    };
  }

  async generatePolicyDocument(policy: PolicyData): Promise<Buffer> {
    try {
      // Read the template file
      const template = await fs.promises.readFile(this.templatePath);

      // Prepare data for template
      const templateData = this.prepareTemplateData(policy);

      // Generate the document with replaced data
      const buffer = await createReport({
        template,
        data: templateData,
        // Use default delimiters and process the template differently
      });

      return Buffer.from(buffer);
    } catch (error) {
      console.error("Error generating policy document:", error);
      throw new Error("Failed to generate policy document");
    }
  }

  async generatePolicyPDF(policy: PolicyData): Promise<Buffer> {
    try {
      // First generate the DOCX
      const docxBuffer = await this.generatePolicyDocument(policy);

      // For now, we'll return the DOCX buffer
      // In a production environment, you might want to convert to PDF
      // using a service like LibreOffice or a cloud conversion service
      return docxBuffer;
    } catch (error) {
      console.error("Error generating policy PDF:", error);
      throw new Error("Failed to generate policy PDF");
    }
  }
}

export const docxProcessor = new DocxProcessor();
