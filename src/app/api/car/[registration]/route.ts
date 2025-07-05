import { NextRequest, NextResponse } from "next/server";
import { fetchCarData, CarScraper } from "../../../../lib/carScraper";
import Car from "../../../../lib/models/Car";
import connectToDatabase from "../../../../lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registration: string }> }
) {
  try {
    const { registration } = await params;
    const upperRegistration = registration.toUpperCase();

    // Validate registration format (basic UK registration pattern)
    const ukRegPattern = /^[A-Z]{1,3}[0-9]{1,4}[A-Z]{1,3}$/;
    if (!ukRegPattern.test(upperRegistration)) {
      return NextResponse.json(
        { error: "Invalid UK registration format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Add debug flag to force fresh scraping for testing
    const url = new URL(request.url);
    const debug = url.searchParams.get("debug") === "true";

    // Check if we already have this car in our database
    let car = await Car.findOne({ registration: upperRegistration });

    if (car && !debug) {
      // Check if the data is recent (less than 7 days old) - skip cache if debug mode
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (car.lastUpdated > weekAgo) {
        return NextResponse.json({
          success: true,
          data: car,
          cached: true,
        });
      }
    }

    // Fetch fresh data from CarCheck.co.uk
    const scrapingResult = await fetchCarData(upperRegistration);

    // Get the raw HTML for debugging
    let rawHtml = "";
    if (debug) {
      try {
        const debugResponse = await fetch(
          `https://www.carcheck.co.uk/Audi/${upperRegistration}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          }
        );
        rawHtml = await debugResponse.text();
        console.log("Raw HTML:", rawHtml);
      } catch (e) {
        console.error("Failed to fetch HTML for debug:", e);
      }
    }

    if (!scrapingResult.success || !scrapingResult.data) {
      return NextResponse.json(
        {
          error: scrapingResult.error || "Failed to fetch car data",
          success: false,
          debug: debug
            ? {
                scrapingResult,
                htmlLength: rawHtml.length,
                htmlPreview: rawHtml.substring(0, 2000),
                fullHtml:
                  rawHtml.length < 50000
                    ? rawHtml
                    : "HTML too large to include",
              }
            : undefined,
        },
        { status: 404 }
      );
    }

    // ALWAYS ensure the registration matches what was requested
    scrapingResult.data.registration = upperRegistration;
    scrapingResult.data.lastUpdated = new Date();

    // Use findOneAndUpdate with upsert to handle duplicates gracefully
    car = await Car.findOneAndUpdate(
      { registration: upperRegistration },
      scrapingResult.data,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: car,
      cached: false,
      debug: debug
        ? {
            scrapedKeys: Object.keys(scrapingResult.data),
            extractedData: scrapingResult.data,
            htmlLength: rawHtml.length,
            htmlPreview: rawHtml.substring(0, 2000),
            fullHtml:
              rawHtml.length < 50000 ? rawHtml : "HTML too large to include",
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error fetching car data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

// Endpoint to manually scrape HTML content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ registration: string }> }
) {
  try {
    const { registration } = await params;
    const upperRegistration = registration.toUpperCase();
    const body = await request.json();

    if (!body.html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Parse the provided HTML
    const scraper = new CarScraper(body.html, upperRegistration);
    const scrapingResult = scraper.scrapeCarData();

    if (!scrapingResult.success || !scrapingResult.data) {
      return NextResponse.json(
        {
          error: scrapingResult.error || "Failed to parse car data",
          success: false,
        },
        { status: 400 }
      );
    }

    // Ensure the registration matches
    if (
      scrapingResult.data.registration &&
      scrapingResult.data.registration !== upperRegistration
    ) {
      return NextResponse.json(
        { error: "Registration mismatch" },
        { status: 400 }
      );
    }

    // Set the registration if not extracted
    if (!scrapingResult.data.registration) {
      scrapingResult.data.registration = upperRegistration;
    }

    // Update or create the car record
    const car = await Car.findOneAndUpdate(
      { registration: upperRegistration },
      { ...scrapingResult.data, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: car,
      cached: false,
    });
  } catch (error) {
    console.error("Error processing car data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
