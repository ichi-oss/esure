const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Icon sizes needed for PWA and iOS
const iconSizes = [
  { size: 72, name: "icon-72x72.png" },
  { size: 96, name: "icon-96x96.png" },
  { size: 128, name: "icon-128x128.png" },
  { size: 144, name: "icon-144x144.png" },
  { size: 152, name: "icon-152x152.png" },
  { size: 192, name: "icon-192x192.png" },
  { size: 384, name: "icon-384x384.png" },
  { size: 512, name: "icon-512x512.png" },
  // iOS specific sizes
  { size: 57, name: "apple-touch-icon-57x57.png" },
  { size: 60, name: "apple-touch-icon-60x60.png" },
  { size: 72, name: "apple-touch-icon-72x72.png" },
  { size: 76, name: "apple-touch-icon-76x76.png" },
  { size: 114, name: "apple-touch-icon-114x114.png" },
  { size: 120, name: "apple-touch-icon-120x120.png" },
  { size: 144, name: "apple-touch-icon-144x144.png" },
  { size: 152, name: "apple-touch-icon-152x152.png" },
  { size: 180, name: "apple-touch-icon-180x180.png" },
  // Favicon
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 48, name: "favicon-48x48.png" },
];

async function generateIcons() {
  const inputPath = path.join(__dirname, "../public/icon_logo.png");
  const outputDir = path.join(__dirname, "../public");

  console.log("Generating icons from icon_logo.png...");

  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Generate each icon size
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);

      await sharp(inputPath)
        .resize(icon.size, icon.size, {
          fit: "contain",
          background: { r: 255, g: 251, b: 240, alpha: 1 }, // #FFFBF0 background
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate favicon.ico
    const faviconPath = path.join(outputDir, "favicon.ico");
    await sharp(inputPath)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 255, g: 251, b: 240, alpha: 1 },
      })
      .png()
      .toFile(faviconPath);

    console.log("✓ Generated favicon.ico");
    console.log("\n🎉 All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
