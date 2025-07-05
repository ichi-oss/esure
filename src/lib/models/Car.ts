import { Schema, model, models, Document } from "mongoose";

export interface MOTTest {
  testNumber: string;
  date: string;
  result: "Passed" | "Failed";
  expiryDate?: string;
  issues: {
    type: "Advice" | "Minor" | "Major" | "Fail";
    description: string;
  }[];
}

export interface MileageRecord {
  registrationNumber: number;
  date: string;
  mileage: number;
}

export interface SafetyRating {
  adult: number;
  children: number;
  pedestrian: number;
  safetySystems: number;
  overall: number;
  crashVideoUrl?: string;
}

export interface CarDimensions {
  width: number;
  height: number;
  length: number;
  wheelBase: number;
  maxAllowedWeight: number;
}

export interface DamageRecord {
  date?: string;
  category?: string;
  type?: string;
}

export interface ICar extends Document {
  // Registration and basic info
  registration: string;
  make?: string;
  carModel?: string;
  colour?: string;
  yearOfManufacture?: number;

  // Performance specs
  topSpeed?: number; // mph
  acceleration0to60?: number; // seconds
  gearbox?: string;

  // Engine specifications
  engine?: {
    power?: number; // BHP
    maxTorque?: {
      value: number; // Nm
      rpm: number;
    };
    capacity?: number; // cc
    cylinders?: number;
    fuelType?: string;
    fuelDelivery?: string;
    engineNumber?: string;
  };

  // Fuel consumption
  fuelConsumption?: {
    city?: number; // mpg
    extraUrban?: number; // mpg
    combined?: number; // mpg
  };

  // Emissions
  emissions?: {
    co2?: number; // g/km
    co2Label?: string;
  };

  // MOT information
  mot?: {
    expiryDate?: string;
    passRate?: number; // percentage
    totalPassed?: number;
    totalFailed?: number;
    totalAdviceItems?: number;
    totalFailedItems?: number;
    history?: MOTTest[];
  };

  // Tax information
  tax?: {
    status?: string;
    dueDate?: string;
    daysLeft?: number;
    vehicleClass?: string;
    band?: string;
    annualCost?: number;
    sixMonthCost?: number;
    monthlyInstallments?: number;
  };

  // Mileage tracking
  mileage?: {
    odometer?: string; // "In miles"
    totalRegistrations?: number;
    firstRegistration?: string;
    lastRegistration?: string;
    history?: MileageRecord[];
  };

  // Safety ratings
  safety?: SafetyRating;

  // Dimensions and specifications
  dimensions?: CarDimensions;

  // Additional specifications
  specifications?: {
    fuelTankCapacity?: number; // litres
    numberOfDoors?: number;
    numberOfSeats?: number;
    numberOfAxles?: number;
  };

  // Premium data (may be limited in free version)
  damageHistory?: DamageRecord[];
  ownerHistory?: {
    numberOfOwners?: number;
    currentOwnerSince?: string;
  };
  plateChanges?: {
    numberOfPlates?: number;
    currentPlate: string;
    plateSince?: string;
  }[];
  financeCheck?: {
    financeCompany?: string;
    agreementDate?: string;
    agreementType?: string;
    agreementTerm?: string;
    agreementNumber?: string;
    contactInfo?: string;
  };
  valuation?: {
    tradeRetailValue?: number;
    auctionValue?: number;
    averagePrivateTradeValue?: number;
  };

  // Metadata
  lastUpdated: Date;
  dataSource: string;
  reportDate?: string;

  // Statistics
  viewStatistics?: {
    totalViews: number;
    viewsLast30Days: number;
  };
}

const carSchema = new Schema<ICar>(
  {
    registration: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    make: { type: String, required: false },
    carModel: { type: String, required: false },
    colour: { type: String, required: false },
    yearOfManufacture: { type: Number, required: false },

    topSpeed: { type: Number, required: false },
    acceleration0to60: { type: Number, required: false },
    gearbox: { type: String, required: false },

    engine: {
      type: {
        power: { type: Number, required: false },
        maxTorque: {
          value: { type: Number, required: false },
          rpm: { type: Number, required: false },
        },
        capacity: { type: Number, required: false },
        cylinders: { type: Number, required: false },
        fuelType: { type: String, required: false },
        fuelDelivery: { type: String, required: false },
        engineNumber: { type: String, required: false },
      },
      required: false,
    },

    fuelConsumption: {
      type: {
        city: { type: Number, required: false },
        extraUrban: { type: Number, required: false },
        combined: { type: Number, required: false },
      },
      required: false,
    },

    emissions: {
      type: {
        co2: { type: Number, required: false },
        co2Label: { type: String, required: false },
      },
      required: false,
    },

    mot: {
      type: {
        expiryDate: { type: String, required: false },
        passRate: { type: Number, required: false },
        totalPassed: { type: Number, required: false },
        totalFailed: { type: Number, required: false },
        totalAdviceItems: { type: Number, required: false },
        totalFailedItems: { type: Number, required: false },
        history: [
          {
            testNumber: { type: String, required: false },
            date: { type: String, required: false },
            result: {
              type: String,
              enum: ["Passed", "Failed"],
              required: false,
            },
            expiryDate: { type: String, required: false },
            issues: [
              {
                type: {
                  type: String,
                  enum: ["Advice", "Minor", "Major", "Fail"],
                  required: false,
                },
                description: { type: String, required: false },
              },
            ],
          },
        ],
      },
      required: false,
    },

    tax: {
      type: {
        status: { type: String, required: false },
        dueDate: { type: String, required: false },
        daysLeft: { type: Number, required: false },
        vehicleClass: { type: String, required: false },
        band: { type: String, required: false },
        annualCost: { type: Number, required: false },
        sixMonthCost: { type: Number, required: false },
        monthlyInstallments: { type: Number, required: false },
      },
      required: false,
    },

    mileage: {
      type: {
        odometer: { type: String, required: false },
        totalRegistrations: { type: Number, required: false },
        firstRegistration: { type: String, required: false },
        lastRegistration: { type: String, required: false },
        history: [
          {
            registrationNumber: { type: Number, required: false },
            date: { type: String, required: false },
            mileage: { type: Number, required: false },
          },
        ],
      },
      required: false,
    },

    safety: {
      type: {
        adult: { type: Number, required: false },
        children: { type: Number, required: false },
        pedestrian: { type: Number, required: false },
        safetySystems: { type: Number, required: false },
        overall: { type: Number, required: false },
        crashVideoUrl: { type: String, required: false },
      },
      required: false,
    },

    dimensions: {
      type: {
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        length: { type: Number, required: false },
        wheelBase: { type: Number, required: false },
        maxAllowedWeight: { type: Number, required: false },
      },
      required: false,
    },

    specifications: {
      type: {
        fuelTankCapacity: { type: Number, required: false },
        numberOfDoors: { type: Number, required: false },
        numberOfSeats: { type: Number, required: false },
        numberOfAxles: { type: Number, required: false },
      },
      required: false,
    },

    damageHistory: [
      {
        date: { type: String, required: false },
        category: { type: String, required: false },
        type: { type: String, required: false },
      },
    ],

    ownerHistory: {
      type: {
        numberOfOwners: { type: Number, required: false },
        currentOwnerSince: { type: String, required: false },
      },
      required: false,
    },

    plateChanges: [
      {
        numberOfPlates: { type: Number, required: false },
        currentPlate: { type: String, required: false },
        plateSince: { type: String, required: false },
      },
    ],

    financeCheck: {
      type: {
        financeCompany: { type: String, required: false },
        agreementDate: { type: String, required: false },
        agreementType: { type: String, required: false },
        agreementTerm: { type: String, required: false },
        agreementNumber: { type: String, required: false },
        contactInfo: { type: String, required: false },
      },
      required: false,
    },

    valuation: {
      type: {
        tradeRetailValue: { type: Number, required: false },
        auctionValue: { type: Number, required: false },
        averagePrivateTradeValue: { type: Number, required: false },
      },
      required: false,
    },

    lastUpdated: { type: Date, default: Date.now },
    dataSource: { type: String, default: "CarCheck.co.uk" },
    reportDate: { type: String, required: false },

    viewStatistics: {
      type: {
        totalViews: { type: Number, required: false },
        viewsLast30Days: { type: Number, required: false },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
carSchema.index({ make: 1, carModel: 1 });
carSchema.index({ yearOfManufacture: 1 });

export default models.Car || model<ICar>("Car", carSchema);
