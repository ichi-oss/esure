import * as cheerio from "cheerio";
import {
  ICar,
  MOTTest,
  MileageRecord,
  SafetyRating,
  CarDimensions,
  DamageRecord,
} from "./models/Car";

export interface CarScrapingResult {
  success: boolean;
  data?: Partial<ICar>;
  error?: string;
}

export class CarScraper {
  private $: cheerio.CheerioAPI;
  private requestedRegistration: string;

  constructor(html: string, requestedRegistration?: string) {
    this.$ = cheerio.load(html);
    this.requestedRegistration = requestedRegistration?.toUpperCase() || "";
  }

  public scrapeCarData(): CarScrapingResult {
    try {
      console.log("🔍 Starting car data scraping...");

      const carData: Partial<ICar> = {
        registration: this.requestedRegistration || this.extractRegistration(),
        make: this.extractMake() || undefined,
        carModel: this.extractModel() || undefined,
        colour: this.extractColour() || undefined,
        yearOfManufacture: this.extractYear() || undefined,

        // Basic performance data
        topSpeed: this.extractTopSpeed() || undefined,
        acceleration0to60: this.extractAcceleration() || undefined,
        gearbox: this.extractGearbox() || undefined,

        // Engine specifications
        engine: this.extractEngineSpecs(),

        // Fuel consumption
        fuelConsumption: this.extractFuelConsumption(),

        // Emissions
        emissions: this.extractEmissions(),

        // MOT information
        mot: this.extractMOTInfo(),

        // Tax information
        tax: this.extractTaxInfo(),

        // Metadata
        dataSource: "CarCheck.co.uk",
        reportDate: this.extractReportDate() || undefined,
        lastUpdated: new Date(),
      };

      console.log("📊 Extracted car data:", {
        registration: carData.registration,
        make: carData.make,
        carModel: carData.carModel,
        colour: carData.colour,
        yearOfManufacture: carData.yearOfManufacture,
      });

      // Clean up undefined values
      Object.keys(carData).forEach((key) => {
        if (carData[key as keyof Partial<ICar>] === undefined) {
          delete carData[key as keyof Partial<ICar>];
        }
      });

      console.log("✅ Final cleaned car data keys:", Object.keys(carData));

      return {
        success: true,
        data: carData,
      };
    } catch (error) {
      console.error("❌ Error in scrapeCarData:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private extractTableValue(headerText: string): string {
    console.log(`🔍 Looking for table value: "${headerText}"`);

    // Find all tables
    const tables = this.$("table");
    console.log(`📋 Found ${tables.length} tables in document`);

    for (let i = 0; i < tables.length; i++) {
      const table = tables.eq(i);
      const rows = table.find("tr");

      for (let j = 0; j < rows.length; j++) {
        const row = rows.eq(j);
        const header = row.find("th").text().trim().toLowerCase();
        const value = row.find("td").text().trim();

        if (header.includes(headerText.toLowerCase())) {
          console.log(`✅ Found "${headerText}": "${value}"`);
          return value;
        }
      }
    }

    console.log(`❌ Not found: "${headerText}"`);
    return "";
  }

  private extractRegistration(): string {
    console.log("🔍 Extracting registration...");

    // Try app_top_plate first (most reliable)
    let registration = this.$(".app_top_plate").text().trim();
    if (registration) {
      console.log(
        `✅ Found registration from .app_top_plate: "${registration}"`
      );
      return registration.toUpperCase();
    }

    // Try kenteken div
    registration = this.$(".kenteken").text().trim();
    if (registration) {
      // Clean up registration - remove report date and other text
      registration = registration.split("report date:")[0].trim();
      console.log(`✅ Found registration from .kenteken: "${registration}"`);
      return registration.toUpperCase();
    }

    // Try to extract from title
    const title = this.$("title").text();
    const regMatch = title.match(/([A-Z0-9\s]{2,8})/);
    if (regMatch) {
      registration = regMatch[1].replace(/\s/g, "");
      console.log(`✅ Found registration from title: "${registration}"`);
      return registration.toUpperCase();
    }

    // Fallback to body text search
    const bodyText = this.$("body").text();
    const regBodyMatch = bodyText.match(/([A-Z]{1,3}[0-9]{1,4}[A-Z]{1,3})/);
    if (regBodyMatch) {
      registration = regBodyMatch[1];
      console.log(`✅ Found registration from body text: "${registration}"`);
      return registration.toUpperCase();
    }

    console.log("❌ Could not extract registration");
    return "";
  }

  private extractMake(): string {
    console.log("🔍 Extracting make...");

    // First try to get from general information table
    let make = this.extractTableValue("make");
    if (make) {
      console.log(`✅ Found make from table: "${make}"`);
      return make;
    }

    // Try to extract from title header
    const titleElement = this.$("h1.title-header-first span").text().trim();
    if (titleElement) {
      const titleParts = titleElement.split(" ");
      if (titleParts.length >= 1) {
        make = titleParts[0];
        console.log(`✅ Found make from title: "${make}"`);
        return make;
      }
    }

    // Try meta description
    const metaDesc = this.$('meta[name="description"]').attr("content") || "";
    const makeMatch = metaDesc.match(/(\w+)\s+\w+\s+for\s+sale/i);
    if (makeMatch) {
      make = makeMatch[1];
      console.log(`✅ Found make from meta description: "${make}"`);
      return make;
    }

    console.log("❌ Could not extract make");
    return "";
  }

  private extractModel(): string {
    console.log("🔍 Extracting model...");

    // First try to get from general information table
    let model = this.extractTableValue("model");
    if (model) {
      console.log(`✅ Found model from table: "${model}"`);
      return model;
    }

    // Try to extract from title header
    const titleElement = this.$("h1.title-header-first span").text().trim();
    if (titleElement) {
      const titleParts = titleElement.split(" ");
      if (titleParts.length >= 2) {
        model = titleParts.slice(1).join(" ");
        console.log(`✅ Found model from title: "${model}"`);
        return model;
      }
    }

    // Try meta description
    const metaDesc = this.$('meta[name="description"]').attr("content") || "";
    const modelMatch = metaDesc.match(/\w+\s+(\w+)\s+for\s+sale/i);
    if (modelMatch) {
      model = modelMatch[1];
      console.log(`✅ Found model from meta description: "${model}"`);
      return model;
    }

    console.log("❌ Could not extract model");
    return "";
  }

  private extractColour(): string {
    console.log("🔍 Extracting colour...");
    const colour =
      this.extractTableValue("colour") || this.extractTableValue("color");
    if (colour) {
      console.log(`✅ Found colour: "${colour}"`);
      return colour;
    }
    console.log("❌ Could not extract colour");
    return "";
  }

  private extractYear(): number | undefined {
    console.log("🔍 Extracting year...");

    const yearStr =
      this.extractTableValue("year of manufacture") ||
      this.extractTableValue("year") ||
      this.extractTableValue("first registration");

    if (yearStr) {
      const yearMatch = yearStr.match(/(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        console.log(`✅ Found year: ${year}`);
        return year;
      }
    }

    console.log("❌ Could not extract year");
    return undefined;
  }

  private extractTopSpeed(): number | undefined {
    const speedStr =
      this.extractTableValue("top speed") ||
      this.extractTableValue("maximum speed");
    if (speedStr) {
      const speedMatch = speedStr.match(/(\d+)/);
      if (speedMatch) {
        return parseInt(speedMatch[1]);
      }
    }
    return undefined;
  }

  private extractAcceleration(): number | undefined {
    const accelStr =
      this.extractTableValue("acceleration") ||
      this.extractTableValue("0-60 mph");
    if (accelStr) {
      const accelMatch = accelStr.match(/(\d+\.?\d*)/);
      if (accelMatch) {
        return parseFloat(accelMatch[1]);
      }
    }
    return undefined;
  }

  private extractGearbox(): string {
    return (
      this.extractTableValue("gearbox") ||
      this.extractTableValue("transmission") ||
      ""
    );
  }

  private extractEngineSpecs(): ICar["engine"] | undefined {
    const power = this.extractTableValue("power");
    const capacity =
      this.extractTableValue("engine capacity") ||
      this.extractTableValue("capacity");
    const cylinders = this.extractTableValue("cylinders");
    const fuelType =
      this.extractTableValue("fuel type") || this.extractTableValue("fuel");

    if (power || capacity || cylinders || fuelType) {
      return {
        power: power ? parseInt(power.match(/(\d+)/)?.[1] || "0") : undefined,
        capacity: capacity
          ? parseInt(capacity.match(/(\d+)/)?.[1] || "0")
          : undefined,
        cylinders: cylinders ? parseInt(cylinders) : undefined,
        fuelType: fuelType || undefined,
      };
    }

    return undefined;
  }

  private extractFuelConsumption(): ICar["fuelConsumption"] | undefined {
    const cityMpg =
      this.extractTableValue("city mpg") || this.extractTableValue("urban");
    const extraUrbanMpg =
      this.extractTableValue("extra urban") ||
      this.extractTableValue("highway");
    const combinedMpg =
      this.extractTableValue("combined mpg") ||
      this.extractTableValue("combined");

    if (cityMpg || extraUrbanMpg || combinedMpg) {
      return {
        city: cityMpg
          ? parseFloat(cityMpg.match(/(\d+\.?\d*)/)?.[1] || "0")
          : undefined,
        extraUrban: extraUrbanMpg
          ? parseFloat(extraUrbanMpg.match(/(\d+\.?\d*)/)?.[1] || "0")
          : undefined,
        combined: combinedMpg
          ? parseFloat(combinedMpg.match(/(\d+\.?\d*)/)?.[1] || "0")
          : undefined,
      };
    }

    return undefined;
  }

  private extractEmissions(): ICar["emissions"] | undefined {
    const co2 =
      this.extractTableValue("co2 emissions") || this.extractTableValue("co2");
    const co2Label =
      this.extractTableValue("co2 label") ||
      this.extractTableValue("emission class");

    if (co2 || co2Label) {
      return {
        co2: co2 ? parseInt(co2.match(/(\d+)/)?.[1] || "0") : undefined,
        co2Label: co2Label || undefined,
      };
    }

    return undefined;
  }

  private extractMOTInfo(): ICar["mot"] | undefined {
    const expiryDate =
      this.extractTableValue("mot expiry") ||
      this.extractTableValue("mot expires");
    const passRate = this.extractTableValue("mot pass rate");

    if (expiryDate || passRate) {
      return {
        expiryDate: expiryDate || undefined,
        passRate: passRate
          ? parseFloat(passRate.match(/(\d+\.?\d*)/)?.[1] || "0")
          : undefined,
      };
    }

    return undefined;
  }

  private extractTaxInfo(): ICar["tax"] | undefined {
    const status =
      this.extractTableValue("tax status") ||
      this.extractTableValue("road tax");
    const dueDate =
      this.extractTableValue("tax due") ||
      this.extractTableValue("tax expires");
    const annualCost =
      this.extractTableValue("annual tax") ||
      this.extractTableValue("tax cost");

    if (status || dueDate || annualCost) {
      return {
        status: status || undefined,
        dueDate: dueDate || undefined,
        annualCost: annualCost
          ? parseInt(annualCost.match(/(\d+)/)?.[1] || "0")
          : undefined,
      };
    }

    return undefined;
  }

  private extractReportDate(): string {
    const reportElement = this.$(".kenteken small").text();
    const match = reportElement.match(/report date:\s*(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : new Date().toISOString().split("T")[0];
  }
}

// Utility function to fetch and scrape car data from CarCheck.co.uk
export async function fetchCarData(
  registration: string
): Promise<CarScrapingResult> {
  try {
    const upperRegistration = registration.toUpperCase();

    // Use the same URL pattern as the working Python script
    const url = `https://www.carcheck.co.uk/Audi/${upperRegistration}`;

    console.log(`🌐 Fetching data from: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      method: "GET",
    });

    console.log(
      `📡 Response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log(`📄 Received HTML length: ${html.length} characters`);

    // Check if this is an error page
    if (
      html.includes("failedtofind") ||
      html.includes("Registration number not found") ||
      html.includes("CAR CHECK - Biggest FREE vehicle reg check")
    ) {
      console.log("❌ CarCheck returned error page - registration not found");
      return {
        success: false,
        error: `Registration ${upperRegistration} not found in CarCheck database`,
      };
    }

    console.log("✅ Valid vehicle page detected");

    const scraper = new CarScraper(html, upperRegistration);
    const result = scraper.scrapeCarData();

    // Ensure the registration is always set to what was requested
    if (result.success && result.data) {
      result.data.registration = upperRegistration;
    }

    return result;
  } catch (error) {
    console.error("🚨 Error in fetchCarData:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch car data",
    };
  }
}
