import { jsPDF } from "jspdf";
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

export class PdfProcessor {
  private logoPath: string;
  private signaturePath: string;

  constructor() {
    this.logoPath = path.join(process.cwd(), "public", "Aviva_Logo.png");
    this.signaturePath = path.join(process.cwd(), "public", "sig.png");
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  private checkPageBreak(
    doc: jsPDF,
    yPos: number,
    requiredSpace: number = 20
  ): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      return 20; // Reset to top margin
    }
    return yPos;
  }

  private addText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    options: any = {}
  ): number {
    const {
      fontSize = 8,
      fontStyle = "normal",
      align = "left",
      maxWidth = null,
      lineHeight = 1.1,
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);

    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      const totalHeight = lines.length * fontSize * lineHeight * 0.352778;

      // Check if we need a page break
      y = this.checkPageBreak(doc, y, totalHeight);

      doc.text(lines, x, y, { align });
      return y + totalHeight;
    } else {
      y = this.checkPageBreak(doc, y, fontSize * 0.352778);
      doc.text(text, x, y, { align });
      return y + fontSize * lineHeight * 0.352778;
    }
  }

  private addHeading(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    fontSize: number = 10
  ): number {
    y = this.checkPageBreak(doc, y, 10);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 152); // Aviva blue
    doc.text(text, x, y);
    return y + 4;
  }

  private addBulletPoint(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    options: any = {}
  ): number {
    const { fontSize = 8, maxWidth = 165 } = options;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    return this.addText(doc, `• ${text}`, x, y, {
      fontSize,
      maxWidth,
      lineHeight: 1.1,
    });
  }

  async generatePolicyDocument(policy: PolicyData): Promise<Buffer> {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 35; // Start content lower to give logo more space

      // Add logo on the left side with adjusted dimensions, aligned with title
      try {
        const logoData = fs.readFileSync(this.logoPath);
        const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
        doc.addImage(logoBase64, "PNG", 20, 15, 35, 18); // Better position - closer to title but not colliding
      } catch (error) {
        console.warn("Could not load logo:", error);
      }

      // Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 51, 152); // Aviva blue
      doc.text("Your certificate of car insurance", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 8;

      // Intro paragraph
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      yPos = this.addText(
        doc,
        "This vehicle insurance certificate is evidence of your cover with us. Please read it and keep it safe with your other policy documents.",
        20,
        yPos,
        { maxWidth: 170, lineHeight: 1.1, fontSize: 8 }
      );
      yPos += 5;

      // Get UK time from documentGeneratedAt (just HH:MM format)
      const ukTime = new Date(policy.documentGeneratedAt).toLocaleString(
        "en-GB",
        {
          timeZone: "Europe/London",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      );

      // Policy details table
      const fields = [
        ["Your policy number", policy.policyNumber],
        ["Vehicle policyholder", policy.userId.fullName],
        [
          "Vehicle registration",
          policy.vehicleInfo.vehicleRegistration || "Not provided",
        ],
        [
          "Make of vehicle",
          `${policy.vehicleInfo.yearOfManufacture} ${policy.vehicleInfo.make} ${policy.vehicleInfo.model}`,
        ],
        ["Start of cover", `${this.formatDate(policy.startDate)} - ${ukTime}`],
        ["End of cover", `${this.formatDate(policy.endDate)} - ${ukTime}`],
      ];

      // Check space for table
      yPos = this.checkPageBreak(doc, yPos, fields.length * 8 + 10);

      const tableX = 20;
      const tableWidth = 170;
      const rowHeight = 8;
      const labelWidth = 70;
      const tableStartY = yPos;

      fields.forEach((field, index) => {
        // Alternate row colors
        if (index === 0) {
          // Policy number row - yellow highlight
          doc.setFillColor(255, 215, 0);
          doc.rect(tableX, yPos - 2, tableWidth, rowHeight, "F");
          doc.setTextColor(0, 51, 152);
        } else if (index === fields.length - 1) {
          // End of cover row - light blue highlight
          doc.setFillColor(230, 240, 255);
          doc.rect(tableX, yPos - 2, tableWidth, rowHeight, "F");
          doc.setTextColor(0, 51, 152);
        } else if (index % 2 === 1) {
          doc.setFillColor(248, 249, 250);
          doc.rect(tableX, yPos - 2, tableWidth, rowHeight, "F");
          doc.setTextColor(0, 0, 0);
        } else {
          doc.setTextColor(0, 0, 0);
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(field[0], tableX + 2, yPos + 3);

        doc.setFont("helvetica", "normal");
        doc.text(field[1], tableX + labelWidth + 2, yPos + 3);

        yPos += rowHeight;
      });

      // Draw table borders
      doc.setDrawColor(0, 51, 152);
      doc.setLineWidth(0.5);
      doc.rect(tableX, tableStartY - 2, tableWidth, fields.length * rowHeight);
      doc.line(
        tableX + labelWidth,
        tableStartY - 2,
        tableX + labelWidth,
        yPos - 2
      );

      for (let i = 1; i < fields.length; i++) {
        const lineY = tableStartY - 2 + i * rowHeight;
        doc.line(tableX, lineY, tableX + tableWidth, lineY);
      }

      yPos += 5;

      // The insured vehicle section
      yPos = this.addHeading(doc, "The insured vehicle", 20, yPos);

      yPos = this.addText(
        doc,
        "The vehicle registration mark described above or",
        20,
        yPos
      );
      yPos += 2;

      yPos = this.addText(
        doc,
        "1. any vehicle loaned to the vehicle policyholder for a maximum of seven days from a garage, motor engineer or vehicle repairer while the vehicle registration described above is being either serviced, repaired or having a MOT test.",
        25,
        yPos,
        { maxWidth: 165 }
      );
      yPos += 2;

      yPos = this.addText(
        doc,
        "2. any vehicle loaned to the vehicle policyholder or, any other person entitled to drive as described in permitted drivers, by the insurer's nominated supplier as a result of a claim under this policy:",
        25,
        yPos,
        { maxWidth: 165 }
      );
      yPos += 2;

      yPos = this.addText(
        doc,
        "i) whilst the vehicle described above is being repaired or replaced or",
        35,
        yPos,
        { maxWidth: 155 }
      );
      yPos += 2;

      yPos = this.addText(
        doc,
        "ii) following theft of the vehicle described above",
        35,
        yPos,
        { maxWidth: 155 }
      );
      yPos += 5;

      // Description of use
      yPos = this.addHeading(doc, "Description of use", 20, yPos);

      yPos = this.addBulletPoint(
        doc,
        "Use for social, domestic and pleasure purposes.",
        25,
        yPos
      );
      yPos += 2;
      yPos = this.addBulletPoint(
        doc,
        "Use for travel to or from a place of paid employment.",
        25,
        yPos
      );
      yPos += 2;
      yPos = this.addBulletPoint(
        doc,
        `Use by ${policy.userId.fullName} or their spouse/domestic/civil partner in connection with their occupation(s).`,
        25,
        yPos
      );
      yPos += 5;

      // Exclusions
      yPos = this.addHeading(doc, "Exclusions", 20, yPos);

      const exclusions = [
        "Use for hiring of the vehicle, the carriage of passengers or goods for payment, the carriage of goods or property which does not belong to you as a courier or for takeaway food or fast food delivery.",
        "Use for any purpose in connection with the buying and selling, repair, servicing, cleaning, maintenance, inspection, testing, alteration or treatment of motor vehicles.",
        "Use for any competitions, trial, performance test, race or trial of speed, including off-road events whether between motor vehicles or otherwise, and irrespective of whether this takes place on any circuit or track, formed or otherwise, and regardless of any statutory authorisation of any such event.",
        "Use to secure the release of a motor vehicle, other than the vehicle identified above by its registration number, which has been seized by, or on behalf of, any government or public authority unless the effective date of the certificate pre-dates the date of the seizure",
      ];

      exclusions.forEach((exclusion) => {
        yPos = this.addBulletPoint(doc, exclusion, 25, yPos);
        yPos += 2;
      });
      yPos += 5;

      // Start Permitted drivers on first page if there's space
      yPos = this.addHeading(doc, "Permitted drivers", 20, yPos);

      yPos = this.addText(
        doc,
        "As below provided that the person holds a licence to drive the car or has held and is not disqualified from holding or obtaining such a licence",
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 3;

      yPos = this.addBulletPoint(doc, policy.userId.fullName, 25, yPos);
      yPos += 2;
      yPos = this.addBulletPoint(doc, "Named drivers: N/A", 25, yPos);
      yPos += 4;

      yPos = this.addText(
        doc,
        `Under the terms of section 2 of the policy - Your Liability – ${policy.userId.fullName} may also drive a Motor Car which`,
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 2;

      yPos = this.addBulletPoint(doc, "does not belong to them", 25, yPos);
      yPos += 2;
      yPos = this.addBulletPoint(doc, "is not a rental car", 25, yPos);
      yPos += 2;
      yPos = this.addBulletPoint(
        doc,
        "is not hired to them under a hire purchase or leasing agreement",
        25,
        yPos
      );
      yPos += 2;
      yPos = this.addText(
        doc,
        "Providing they are driving with the owner's express consent",
        25,
        yPos,
        { maxWidth: 165 }
      );
      yPos += 5;

      // Force new page for certification and remaining content
      doc.addPage();
      yPos = 20;

      // Certification paragraph
      yPos = this.addText(
        doc,
        "I hereby certify that the policy to which this certificate relates satisfies the requirements of the relevant law applicable in Great Britain, Northern Ireland, the Isle of Man, the Island of Guernsey, the Island of Jersey and the Island of Alderney. Aviva Insurance Limited - authorised insurers.",
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 5;

      // Add signature at original size (no page break check)
      try {
        const signatureData = fs.readFileSync(this.signaturePath);
        const signatureBase64 = `data:image/png;base64,${signatureData.toString("base64")}`;
        doc.addImage(signatureBase64, "PNG", 20, yPos, 50, 20);
        yPos += 25;
      } catch (error) {
        console.warn("Could not load signature:", error);
        yPos += 20;
      }

      // Signer name & title
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 51, 152);
      doc.text("Adam Winslow", 20, yPos);
      yPos += 3;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("CEO, UK & Ireland General Insurance", 20, yPos);
      yPos += 5;

      // Note to third parties
      yPos = this.addText(
        doc,
        "Please note: For full details of the insurance cover, refer to your policy. Advice to third parties: Nothing contained in this certificate affects your right as a third party to make a claim",
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 4;

      // Important section
      yPos = this.addHeading(doc, "Important", 20, yPos);
      yPos = this.addText(
        doc,
        "Please report all accidents to us immediately online at www.aviva.co.uk/make-a-claim or call us on 0345 030 6925.",
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 4;

      // European wording intro
      yPos = this.addText(
        doc,
        "The following wording is evidence that your policy provides the minimum level of compulsory motor insurance required in EU countries. It is similar to Third Party only cover in the UK. Please call us on 0345 030 7077 in advance of any trip abroad to ensure that you have the right level of cover for your needs. We also offer European breakdown cover at very competitive rates.",
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 4;

      // To whom it may concern
      yPos = this.addHeading(doc, "To whom it may concern", 20, yPos, 8);
      yPos = this.addText(
        doc,
        "This insurance certificate provides evidence that motor insurance operates in the United Kingdom for the dates shown and this cover extends to and includes the compulsory insurance requirements of:",
        20,
        yPos,
        { maxWidth: 170 }
      );
      yPos += 3;

      yPos = this.addBulletPoint(
        doc,
        "Any member country of the European Union",
        25,
        yPos
      );
      yPos += 2;
      yPos = this.addBulletPoint(
        doc,
        "Andorra, Iceland, Liechtenstein, Norway, Serbia and Switzerland",
        25,
        yPos
      );
      yPos += 4;

      // Multilingual sections
      const multilingualSections = [
        {
          title:
            "La présente attestation est faite pour server et valoir ce que de droit",
          content:
            "Cette attestation d'assurance apporte la preuve que l'assurance automobile est valable au Royaume-Uni aux dates indiquées et que cette couverture est étendue pour inclure les conditions obligatoires d'assurance de:",
          bullets: [
            "Tous les autres pays membres de l'Union européenne",
            "Andorre, l'Islande, le Liechtenstein, la Norvège, la Serbie et la Suisse",
          ],
        },
        {
          title: "An alle, die es angeht",
          content:
            "Dieses Versicherungszertifikat ist der Nachweis, dass die Kraftfahrzeugversicherung im Vereinigten Königreich an den gezeigten Daten gültig ist, und diese Deckung auch die Pflichtversicherungsvorschriften in:",
          bullets: [
            "Jedem anderen Mitgliedsstaat der Europäischen Union",
            "Andorra, Island, Liechtenstein, Norwegen, Serbien und der Schweiz",
          ],
        },
        {
          title: "A quien corresponda",
          content:
            "Este Certificado de Seguro provee evidencia que seguro de automóvil opera en el Reino Unido para las fechas que aparecen y esta cobertura se extiende para incluir los requerimientos de seguro obligatorios de:",
          bullets: [
            "Cualquier otro país miembro de la Unión Europea",
            "Andorra, Islandia, Liechtenstein, Noruega, Serbia y Suiza",
          ],
        },
        {
          title: "A chiunque possa interessare",
          content:
            "Questo Certificato di Assicurazione costituisce la prova dell'esistenza dell'assicurazione automobilistica nel Regno Unito per le date indicate e che la copertura è estesa in modo da includere i requisiti assicurativi obbligatori di:",
          bullets: [
            "Qualsiasi altro Paese facente parte dell'Unione Europea",
            "Andorra, Islanda, Liechtenstein, Norvegia, Serbia e Svizzera",
          ],
        },
      ];

      multilingualSections.forEach((section) => {
        // No page break check - keep everything on page 2

        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(0, 51, 152);
        doc.text(section.title, 20, yPos);
        yPos += 3;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        yPos = this.addText(doc, section.content, 25, yPos, {
          maxWidth: 165,
          fontSize: 7,
        });
        yPos += 2;

        section.bullets.forEach((bullet) => {
          doc.setFontSize(7);
          doc.text(`a) ${bullet}`, 25, yPos);
          yPos += 2;
        });
        yPos += 3;
      });

      // Contact information (no page break check)
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 51, 152);
      doc.text("In the event of an accident call", 20, yPos);
      yPos += 3;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("0345 030 6925, or visit aviva.co.uk/myaviva", 20, yPos);
      yPos += 4;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 51, 152);
      doc.text("For changes to your policy call", 20, yPos);
      yPos += 3;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("0345 030 7077, or visit aviva.co.uk/myaviva", 20, yPos);
      yPos += 4;

      // Footer (no page break check)
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      yPos = this.addText(
        doc,
        "Aviva Insurance Limited. Registered in Scotland, No. 2116. Registered Office: Pitheavlis, Perth PH2 0NH. Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority.",
        20,
        yPos,
        { maxWidth: 170, fontSize: 6 }
      );

      return Buffer.from(doc.output("arraybuffer"));
    } catch (error) {
      console.error("Error generating policy PDF:", error);
      throw new Error("Failed to generate policy PDF");
    }
  }
}

export const pdfProcessor = new PdfProcessor();
