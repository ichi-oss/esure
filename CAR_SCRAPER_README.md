# 🚗 Car Data Scraping System

A comprehensive vehicle data extraction system that scrapes car information from CarCheck.co.uk using just a UK registration number. Built with Next.js, TypeScript, MongoDB, and React.

## 🌟 Features

### Comprehensive Vehicle Data

- **Basic Information**: Make, model, year, color, registration
- **Engine Specifications**: Power (BHP), torque, capacity, cylinders, fuel type
- **Performance**: 0-60 mph times, top speed, gearbox type
- **Fuel Consumption**: City, extra urban, and combined MPG ratings
- **Emissions**: CO₂ levels and environmental labels
- **Dimensions**: Length, width, height, weight specifications

### MOT Information

- Current MOT status and expiry date
- Complete MOT test history with pass/fail records
- Detailed breakdown of issues (Advice, Minor, Major, Fail)
- MOT pass rate statistics
- Historical test data with dates and test numbers

### Tax & Legal Status

- Current tax status and expiry dates
- Vehicle tax band and annual costs
- Days remaining until tax/MOT expiry
- Vehicle classification information

### Safety & Additional Data

- NCAP safety ratings (Adult, Child, Pedestrian protection)
- Safety systems ratings
- Mileage history and registrations
- Vehicle specifications (doors, seats, fuel tank capacity)

## 📁 Project Structure

```
src/
├── lib/
│   ├── models/
│   │   └── Car.ts                 # MongoDB schema for vehicle data
│   ├── carScraper.ts             # Core scraping functionality
│   └── mongodb.ts                # Database connection
├── app/
│   ├── api/
│   │   └── car/
│   │       └── [registration]/
│   │           └── route.ts      # API endpoints for car data
│   └── car-lookup/
│       └── page.tsx              # Demo page
└── components/
    └── CarLookup.tsx             # React component for car lookup
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Environment variables configured

### Installation

1. **Install dependencies**:

```bash
npm install jsdom @types/jsdom
```

2. **Set up environment variables** in `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
```

3. **Import the components** in your project:

```typescript
import { CarLookup } from "./components/CarLookup";
import { fetchCarData } from "./lib/carScraper";
```

## 🔧 API Usage

### GET Request - Automatic Scraping

Fetches vehicle data automatically from CarCheck.co.uk:

```bash
GET /api/car/AK62UKZ
```

**Response**:

```json
{
  "success": true,
  "cached": false,
  "data": {
    "registration": "AK62UKZ",
    "make": "HONDA",
    "carModel": "JAZZ IMA HS",
    "yearOfManufacture": 2012,
    "colour": "Blue",
    "engine": {
      "power": 87,
      "capacity": 1339,
      "fuelType": "Hybrid / Electric"
    },
    "mot": {
      "expiryDate": "2025-10-08",
      "passRate": 83,
      "history": [...]
    },
    // ... more data
  }
}
```

### POST Request - Manual HTML Parsing

Parse custom HTML content from CarCheck.co.uk:

```bash
POST /api/car/AK62UKZ
Content-Type: application/json

{
  "html": "<html>CarCheck.co.uk HTML content here...</html>"
}
```

## 💻 React Component Usage

### Basic Usage

```tsx
import { CarLookup } from "./components/CarLookup";

export default function Page() {
  return (
    <div>
      <CarLookup
        defaultRegistration="AK62UKZ"
        onCarSelected={(car) => console.log("Selected car:", car)}
      />
    </div>
  );
}
```

### Programmatic Data Fetching

```typescript
import { fetchCarData } from "./lib/carScraper";

async function getCarInfo(registration: string) {
  const result = await fetchCarData(registration);

  if (result.success && result.data) {
    console.log("Car data:", result.data);
    return result.data;
  } else {
    console.error("Error:", result.error);
  }
}
```

## 🔍 Data Scraping Details

### How It Works

1. **URL Construction**: Builds CarCheck.co.uk URL using registration
2. **HTTP Request**: Fetches HTML content with proper headers
3. **DOM Parsing**: Uses JSDOM to parse HTML structure
4. **Data Extraction**: Systematically extracts data from tables and elements
5. **Data Validation**: Cleans and validates extracted information
6. **Database Storage**: Stores complete vehicle data in MongoDB

### Extracted Data Fields

The scraper extracts over 50 different data points including:

- **Registration Details**: Number, make, model, year, color
- **Engine Data**: Power, torque, capacity, cylinders, fuel type
- **Performance**: Acceleration, top speed, gearbox
- **Efficiency**: Fuel consumption (city/urban/combined)
- **Environmental**: CO₂ emissions and labels
- **MOT History**: Complete test history with issues
- **Tax Information**: Status, costs, expiry dates
- **Safety Ratings**: NCAP scores for all categories
- **Physical Specs**: Dimensions, weight, capacity
- **Mileage Records**: Historical odometer readings

### Example HTML Parsing

The scraper handles complex HTML structures:

```typescript
// Extract MOT information
private extractMOTInfo(): ICar['mot'] {
  const expiryDate = this.extractTableValue('MOT expiry date');
  const passRate = this.extractTableValue('MOT pass rate').match(/(\d+)/)?.[1] || '0';

  return {
    expiryDate,
    passRate: parseInt(passRate),
    history: this.extractMOTHistory()
  };
}

// Extract complex MOT history with issues
private extractMOTHistory(): MOTTest[] {
  const motTests: MOTTest[] = [];
  const motTables = this.document.querySelectorAll('.mot-test-table');

  // Parse each MOT test record...
}
```

## 📊 Database Schema

The `Car` model stores comprehensive vehicle data:

```typescript
interface ICar {
  registration: string; // Primary key
  make: string; // Vehicle manufacturer
  carModel: string; // Model name
  yearOfManufacture: number; // Manufacturing year

  engine: {
    power: number; // BHP
    maxTorque: { value: number; rpm: number };
    capacity: number; // Engine size in cc
    cylinders: number;
    fuelType: string;
    engineNumber: string;
  };

  mot: {
    expiryDate: string;
    passRate: number; // Percentage
    history: MOTTest[]; // Complete test history
  };

  // ... and many more fields
}
```

## 🛡️ Caching & Performance

- **Intelligent Caching**: Data cached for 7 days to reduce API calls
- **Efficient Parsing**: Optimized DOM traversal and data extraction
- **Error Handling**: Comprehensive error handling for network and parsing issues
- **Rate Limiting**: Respectful of source website resources

## 🔐 Security & Compliance

- **No Personal Data**: Only public vehicle information is collected
- **Respectful Scraping**: Follows robots.txt and rate limiting
- **Data Protection**: Secure storage and handling of vehicle data
- **GDPR Compliant**: No personal owner information stored

## 🚦 Usage Examples

### Example 1: Vehicle History Check

```typescript
const carData = await fetchCarData("AK62UKZ");

if (carData.success) {
  const { mot, tax } = carData.data;

  console.log(`MOT expires: ${mot.expiryDate}`);
  console.log(`Tax expires: ${tax.dueDate}`);
  console.log(`MOT pass rate: ${mot.passRate}%`);
}
```

### Example 2: Fleet Management

```typescript
const registrations = ["AK62UKZ", "AB12CDE", "XY98ZAB"];

const fleetData = await Promise.all(
  registrations.map((reg) => fetchCarData(reg))
);

const validVehicles = fleetData
  .filter((result) => result.success)
  .map((result) => result.data);
```

### Example 3: Insurance Quote Integration

```typescript
function calculatePremium(carData: ICar) {
  const riskFactors = {
    age: new Date().getFullYear() - carData.yearOfManufacture,
    power: carData.engine.power,
    motFailures: carData.mot.totalFailed,
    safetyRating: carData.safety?.overall || 0,
  };

  // Calculate insurance premium based on vehicle data...
}
```

## 🌐 Demo

Visit `/car-lookup` in your application to see the system in action with the example registration `AK62UKZ`.

## 📝 Notes

- **Data Source**: CarCheck.co.uk (free tier limitations apply)
- **Coverage**: UK vehicles only
- **Accuracy**: Data accuracy depends on source availability
- **Updates**: Cached data refreshes every 7 days automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Submit a pull request

## 📄 License

This project is for educational and legitimate business purposes. Respect the terms of service of data sources.

---

**Built with**: Next.js, TypeScript, MongoDB, React, Tailwind CSS, JSDOM
