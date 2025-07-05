import mongoose from "mongoose";
import { generateRandomPolicyNumber } from "@/lib/utils";

interface IPolicy extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  policyNumber: string;
  price: number;
  status: "active" | "expired" | "cancelled";
  startDate: Date;
  endDate: Date;
  documentGeneratedAt: Date;
  vehicleInfo: {
    make: string;
    model: string;
    colour: string;
    yearOfManufacture: number;
    vehicleRegistration?: string;
    registeredKeeper?: string;
    topSpeed?: string;
    acceleration?: string;
    gearbox?: string;
    power?: string;
    maxTorque?: string;
    engineCapacity?: string;
    cylinders?: number;
    fuelType?: string;
    consumptionCity?: string;
    consumptionExtraUrban?: string;
    consumptionCombined?: string;
    co2Emission?: string;
    co2Label?: string;
    motExpiryDate?: Date;
    motPassRate?: string;
    motPassed?: number;
    motFailed?: number;
    totalAdviceItems?: number;
    totalItemsFailed?: number;
    taxStatus?: string;
    taxDue?: Date;
    ncapRating?: {
      adult?: string;
      children?: string;
      pedestrian?: string;
      safetySystems?: string;
      overall?: string;
    };
    dimensions?: {
      width?: string;
      height?: string;
      length?: string;
      wheelBase?: string;
      maxAllowedWeight?: string;
    };
    fuelTankCapacity?: string;
    fuelDelivery?: string;
    numberOfDoors?: number;
    numberOfSeats?: number;
    numberOfAxles?: number;
    engineNumber?: string;
  };
  createdBy: mongoose.Types.ObjectId;
}

const policySchema = new mongoose.Schema<IPolicy>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    policyNumber: { type: String, unique: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    documentGeneratedAt: { type: Date, default: Date.now },
    vehicleInfo: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      colour: { type: String, required: true },
      yearOfManufacture: { type: Number, required: true },
      vehicleRegistration: { type: String },
      registeredKeeper: { type: String },
      topSpeed: { type: String },
      acceleration: { type: String },
      gearbox: { type: String },
      power: { type: String },
      maxTorque: { type: String },
      engineCapacity: { type: String },
      cylinders: { type: Number },
      fuelType: { type: String },
      consumptionCity: { type: String },
      consumptionExtraUrban: { type: String },
      consumptionCombined: { type: String },
      co2Emission: { type: String },
      co2Label: { type: String },
      motExpiryDate: { type: Date },
      motPassRate: { type: String },
      motPassed: { type: Number },
      motFailed: { type: Number },
      totalAdviceItems: { type: Number },
      totalItemsFailed: { type: Number },
      taxStatus: { type: String },
      taxDue: { type: Date },
      ncapRating: {
        adult: { type: String },
        children: { type: String },
        pedestrian: { type: String },
        safetySystems: { type: String },
        overall: { type: String },
      },
      dimensions: {
        width: { type: String },
        height: { type: String },
        length: { type: String },
        wheelBase: { type: String },
        maxAllowedWeight: { type: String },
      },
      fuelTankCapacity: { type: String },
      fuelDelivery: { type: String },
      numberOfDoors: { type: Number },
      numberOfSeats: { type: Number },
      numberOfAxles: { type: Number },
      engineNumber: { type: String },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Generate policy number before saving
policySchema.pre<IPolicy>("save", async function (next) {
  if (this.isNew) {
    try {
      this.policyNumber = generateRandomPolicyNumber();
    } catch (error) {
      console.error("Error generating policy number:", error);
      return next(error as Error);
    }
  }
  next();
});

const Policy =
  mongoose.models.Policy || mongoose.model<IPolicy>("Policy", policySchema);

export default Policy;
export type { IPolicy };
