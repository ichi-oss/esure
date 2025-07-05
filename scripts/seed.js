const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

// Generate a random policy number
function generateRandomPolicyNumber() {
  // Generate a 6-digit random number
  const randomNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `POL-${randomNumber}`;
}

// Import models (we'll need to create JS versions or use a different approach)
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "sub-admin", "user"],
      default: "user",
    },
    address: {
      type: String,
      required: function () {
        return this.role === "user";
      },
    },
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "user";
      },
    },
    vehicleRegistration: {
      type: String,
      required: function () {
        return this.role === "user";
      },
    },
    lastFourDigits: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      maxlength: 4,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const policySchema = new mongoose.Schema(
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
    vehicleInfo: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      colour: { type: String, required: true },
      yearOfManufacture: { type: Number, required: true },
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
policySchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      this.policyNumber = generateRandomPolicyNumber();
    } catch (error) {
      console.error("Error generating policy number:", error);
      return next(error);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);
const Policy = mongoose.model("Policy", policySchema);

// Sample data
const adminData = [
  {
    fullName: "John Administrator",
    email: "john.admin@insurance.com",
    password: "admin123",
    role: "admin",
  },
  {
    fullName: "Sarah Manager",
    email: "sarah.admin@insurance.com",
    password: "admin123",
    role: "admin",
  },
  {
    fullName: "Michael Director",
    email: "michael.admin@insurance.com",
    password: "admin123",
    role: "admin",
  },
];

const subAdminData = [
  {
    fullName: "Emma Wilson",
    email: "emma.subadmin@insurance.com",
    password: "subadmin123",
    role: "sub-admin",
  },
  {
    fullName: "David Thompson",
    email: "david.subadmin@insurance.com",
    password: "subadmin123",
    role: "sub-admin",
  },
  {
    fullName: "Lisa Garcia",
    email: "lisa.subadmin@insurance.com",
    password: "subadmin123",
    role: "sub-admin",
  },
];

const userData = [
  {
    fullName: "Robert Johnson",
    email: "robert.johnson@email.com",
    password: "user123",
    role: "user",
    address: "123 Main Street, Manchester, M1 2AB, United Kingdom",
    dateOfBirth: new Date("1985-03-15"),
    vehicleRegistration: "AB12 CDE",
    lastFourDigits: "1234",
  },
  {
    fullName: "Jennifer Smith",
    email: "jennifer.smith@email.com",
    password: "user123",
    role: "user",
    address: "456 Oak Avenue, Birmingham, B1 3CD, United Kingdom",
    dateOfBirth: new Date("1990-07-22"),
    vehicleRegistration: "FG34 HIJ",
    lastFourDigits: "5678",
  },
  {
    fullName: "William Brown",
    email: "william.brown@email.com",
    password: "user123",
    role: "user",
    address: "789 Pine Road, Liverpool, L1 4EF, United Kingdom",
    dateOfBirth: new Date("1988-11-08"),
    vehicleRegistration: "KL56 MNO",
    lastFourDigits: "9012",
  },
];

const vehicleData = [
  // User 1 - Robert Johnson (3 policies)
  [
    {
      make: "BMW",
      model: "X5",
      colour: "Black",
      yearOfManufacture: 2020,
      topSpeed: "250 km/h",
      acceleration: "6.5s (0-100 km/h)",
      gearbox: "Automatic",
      power: "265 HP",
      maxTorque: "620 Nm",
      engineCapacity: "3.0L",
      cylinders: 6,
      fuelType: "Diesel",
      consumptionCity: "8.2L/100km",
      consumptionExtraUrban: "6.1L/100km",
      consumptionCombined: "6.9L/100km",
      co2Emission: "181 g/km",
      co2Label: "D",
      motExpiryDate: new Date("2025-06-15"),
      motPassRate: "85%",
      motPassed: 2,
      motFailed: 0,
      totalAdviceItems: 1,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-03-31"),
      ncapRating: {
        adult: "96%",
        children: "87%",
        pedestrian: "84%",
        safetySystems: "82%",
        overall: "5 stars",
      },
      dimensions: {
        width: "2004mm",
        height: "1745mm",
        length: "4922mm",
        wheelBase: "2975mm",
        maxAllowedWeight: "2995kg",
      },
      fuelTankCapacity: "83L",
      fuelDelivery: "Direct Injection",
      numberOfDoors: 5,
      numberOfSeats: 7,
      numberOfAxles: 2,
      engineNumber: "BMW6-2020-001",
      price: 1250.5,
      endDate: new Date("2025-12-31"),
    },
    {
      make: "Audi",
      model: "A4",
      colour: "Silver",
      yearOfManufacture: 2019,
      topSpeed: "240 km/h",
      acceleration: "7.3s (0-100 km/h)",
      gearbox: "Manual",
      power: "190 HP",
      maxTorque: "400 Nm",
      engineCapacity: "2.0L",
      cylinders: 4,
      fuelType: "Petrol",
      consumptionCity: "7.8L/100km",
      consumptionExtraUrban: "5.5L/100km",
      consumptionCombined: "6.4L/100km",
      co2Emission: "145 g/km",
      co2Label: "C",
      motExpiryDate: new Date("2025-08-20"),
      motPassRate: "92%",
      motPassed: 3,
      motFailed: 0,
      totalAdviceItems: 0,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-04-30"),
      ncapRating: {
        adult: "94%",
        children: "89%",
        pedestrian: "82%",
        safetySystems: "85%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1847mm",
        height: "1427mm",
        length: "4762mm",
        wheelBase: "2820mm",
        maxAllowedWeight: "2080kg",
      },
      fuelTankCapacity: "58L",
      fuelDelivery: "Multi-Point Injection",
      numberOfDoors: 4,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "AUD4-2019-002",
      price: 980.75,
      endDate: new Date("2026-01-15"),
    },
    {
      make: "Mercedes-Benz",
      model: "C-Class",
      colour: "White",
      yearOfManufacture: 2021,
      topSpeed: "250 km/h",
      acceleration: "6.9s (0-100 km/h)",
      gearbox: "Automatic",
      power: "204 HP",
      maxTorque: "300 Nm",
      engineCapacity: "1.5L",
      cylinders: 4,
      fuelType: "Hybrid",
      consumptionCity: "6.4L/100km",
      consumptionExtraUrban: "4.8L/100km",
      consumptionCombined: "5.4L/100km",
      co2Emission: "123 g/km",
      co2Label: "B",
      motExpiryDate: new Date("2026-02-10"),
      motPassRate: "96%",
      motPassed: 1,
      motFailed: 0,
      totalAdviceItems: 0,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-05-31"),
      ncapRating: {
        adult: "96%",
        children: "91%",
        pedestrian: "87%",
        safetySystems: "89%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1860mm",
        height: "1447mm",
        length: "4751mm",
        wheelBase: "2865mm",
        maxAllowedWeight: "2175kg",
      },
      fuelTankCapacity: "66L",
      fuelDelivery: "Direct Injection + Electric",
      numberOfDoors: 4,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "MBC4-2021-003",
      price: 1350.25,
      endDate: new Date("2025-11-30"),
    },
  ],
  // User 2 - Jennifer Smith (3 policies)
  [
    {
      make: "Volkswagen",
      model: "Golf",
      colour: "Blue",
      yearOfManufacture: 2018,
      topSpeed: "210 km/h",
      acceleration: "8.5s (0-100 km/h)",
      gearbox: "Manual",
      power: "150 HP",
      maxTorque: "250 Nm",
      engineCapacity: "1.4L",
      cylinders: 4,
      fuelType: "Petrol",
      consumptionCity: "6.8L/100km",
      consumptionExtraUrban: "4.9L/100km",
      consumptionCombined: "5.6L/100km",
      co2Emission: "128 g/km",
      co2Label: "B",
      motExpiryDate: new Date("2025-09-12"),
      motPassRate: "88%",
      motPassed: 4,
      motFailed: 1,
      totalAdviceItems: 2,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-06-30"),
      ncapRating: {
        adult: "95%",
        children: "85%",
        pedestrian: "72%",
        safetySystems: "68%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1799mm",
        height: "1452mm",
        length: "4258mm",
        wheelBase: "2637mm",
        maxAllowedWeight: "1918kg",
      },
      fuelTankCapacity: "50L",
      fuelDelivery: "Direct Injection",
      numberOfDoors: 5,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "VWG4-2018-004",
      price: 650.0,
      endDate: new Date("2025-10-31"),
    },
    {
      make: "Toyota",
      model: "Prius",
      colour: "Silver",
      yearOfManufacture: 2020,
      topSpeed: "180 km/h",
      acceleration: "10.6s (0-100 km/h)",
      gearbox: "CVT",
      power: "122 HP",
      maxTorque: "142 Nm",
      engineCapacity: "1.8L",
      cylinders: 4,
      fuelType: "Hybrid",
      consumptionCity: "4.4L/100km",
      consumptionExtraUrban: "4.1L/100km",
      consumptionCombined: "4.3L/100km",
      co2Emission: "98 g/km",
      co2Label: "A",
      motExpiryDate: new Date("2025-12-05"),
      motPassRate: "94%",
      motPassed: 2,
      motFailed: 0,
      totalAdviceItems: 1,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-07-31"),
      ncapRating: {
        adult: "94%",
        children: "89%",
        pedestrian: "87%",
        safetySystems: "77%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1760mm",
        height: "1470mm",
        length: "4575mm",
        wheelBase: "2700mm",
        maxAllowedWeight: "1865kg",
      },
      fuelTankCapacity: "43L",
      fuelDelivery: "Multi-Point Injection + Electric",
      numberOfDoors: 5,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "TOY4-2020-005",
      price: 750.8,
      endDate: new Date("2026-02-28"),
    },
    {
      make: "Ford",
      model: "Focus",
      colour: "Red",
      yearOfManufacture: 2019,
      topSpeed: "208 km/h",
      acceleration: "9.1s (0-100 km/h)",
      gearbox: "Automatic",
      power: "125 HP",
      maxTorque: "210 Nm",
      engineCapacity: "1.0L",
      cylinders: 3,
      fuelType: "Petrol",
      consumptionCity: "6.2L/100km",
      consumptionExtraUrban: "4.6L/100km",
      consumptionCombined: "5.2L/100km",
      co2Emission: "118 g/km",
      co2Label: "B",
      motExpiryDate: new Date("2025-11-18"),
      motPassRate: "91%",
      motPassed: 3,
      motFailed: 0,
      totalAdviceItems: 1,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-08-31"),
      ncapRating: {
        adult: "94%",
        children: "84%",
        pedestrian: "73%",
        safetySystems: "71%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1825mm",
        height: "1468mm",
        length: "4378mm",
        wheelBase: "2648mm",
        maxAllowedWeight: "1964kg",
      },
      fuelTankCapacity: "52L",
      fuelDelivery: "Direct Injection",
      numberOfDoors: 5,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "FOR3-2019-006",
      price: 580.9,
      endDate: new Date("2025-12-15"),
    },
  ],
  // User 3 - William Brown (3 policies)
  [
    {
      make: "Nissan",
      model: "Qashqai",
      colour: "Grey",
      yearOfManufacture: 2021,
      topSpeed: "195 km/h",
      acceleration: "9.9s (0-100 km/h)",
      gearbox: "CVT",
      power: "140 HP",
      maxTorque: "240 Nm",
      engineCapacity: "1.3L",
      cylinders: 4,
      fuelType: "Petrol",
      consumptionCity: "7.1L/100km",
      consumptionExtraUrban: "5.4L/100km",
      consumptionCombined: "6.1L/100km",
      co2Emission: "139 g/km",
      co2Label: "C",
      motExpiryDate: new Date("2026-01-22"),
      motPassRate: "93%",
      motPassed: 1,
      motFailed: 0,
      totalAdviceItems: 0,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-09-30"),
      ncapRating: {
        adult: "91%",
        children: "86%",
        pedestrian: "69%",
        safetySystems: "76%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1838mm",
        height: "1635mm",
        length: "4425mm",
        wheelBase: "2666mm",
        maxAllowedWeight: "2080kg",
      },
      fuelTankCapacity: "55L",
      fuelDelivery: "Direct Injection",
      numberOfDoors: 5,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "NIS4-2021-007",
      price: 820.6,
      endDate: new Date("2026-01-31"),
    },
    {
      make: "Honda",
      model: "Civic",
      colour: "Black",
      yearOfManufacture: 2020,
      topSpeed: "200 km/h",
      acceleration: "8.2s (0-100 km/h)",
      gearbox: "Manual",
      power: "182 HP",
      maxTorque: "240 Nm",
      engineCapacity: "1.5L",
      cylinders: 4,
      fuelType: "Petrol",
      consumptionCity: "6.9L/100km",
      consumptionExtraUrban: "5.1L/100km",
      consumptionCombined: "5.8L/100km",
      co2Emission: "132 g/km",
      co2Label: "C",
      motExpiryDate: new Date("2025-10-08"),
      motPassRate: "89%",
      motPassed: 2,
      motFailed: 0,
      totalAdviceItems: 2,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-10-31"),
      ncapRating: {
        adult: "92%",
        children: "86%",
        pedestrian: "81%",
        safetySystems: "85%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1802mm",
        height: "1415mm",
        length: "4518mm",
        wheelBase: "2700mm",
        maxAllowedWeight: "1929kg",
      },
      fuelTankCapacity: "47L",
      fuelDelivery: "Direct Injection",
      numberOfDoors: 5,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "HON4-2020-008",
      price: 695.4,
      endDate: new Date("2025-11-15"),
    },
    {
      make: "Hyundai",
      model: "Tucson",
      colour: "White",
      yearOfManufacture: 2022,
      topSpeed: "185 km/h",
      acceleration: "10.5s (0-100 km/h)",
      gearbox: "Automatic",
      power: "136 HP",
      maxTorque: "280 Nm",
      engineCapacity: "1.6L",
      cylinders: 4,
      fuelType: "Diesel",
      consumptionCity: "6.8L/100km",
      consumptionExtraUrban: "5.2L/100km",
      consumptionCombined: "5.8L/100km",
      co2Emission: "153 g/km",
      co2Label: "C",
      motExpiryDate: new Date("2026-03-15"),
      motPassRate: "97%",
      motPassed: 1,
      motFailed: 0,
      totalAdviceItems: 0,
      totalItemsFailed: 0,
      taxStatus: "Taxed",
      taxDue: new Date("2025-11-30"),
      ncapRating: {
        adult: "89%",
        children: "85%",
        pedestrian: "65%",
        safetySystems: "87%",
        overall: "5 stars",
      },
      dimensions: {
        width: "1865mm",
        height: "1650mm",
        length: "4500mm",
        wheelBase: "2680mm",
        maxAllowedWeight: "2215kg",
      },
      fuelTankCapacity: "62L",
      fuelDelivery: "Common Rail Direct Injection",
      numberOfDoors: 5,
      numberOfSeats: 5,
      numberOfAxles: 2,
      engineNumber: "HYU4-2022-009",
      price: 920.15,
      endDate: new Date("2026-03-31"),
    },
  ],
];

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Policy.deleteMany({});
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Create admins
    console.log("Creating admins...");
    const createdAdmins = [];
    for (const admin of adminData) {
      const newAdmin = new User(admin);
      await newAdmin.save();
      createdAdmins.push(newAdmin);
      console.log(`✅ Created admin: ${admin.fullName} (${admin.email})`);
    }

    // Create sub-admins (created by first admin)
    console.log("\nCreating sub-admins...");
    const createdSubAdmins = [];
    for (const subAdmin of subAdminData) {
      const newSubAdmin = new User({
        ...subAdmin,
        createdBy: createdAdmins[0]._id,
      });
      await newSubAdmin.save();
      createdSubAdmins.push(newSubAdmin);
      console.log(
        `✅ Created sub-admin: ${subAdmin.fullName} (${subAdmin.email})`
      );
    }

    // Create users (created by different sub-admins)
    console.log("\nCreating users...");
    const createdUsers = [];
    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      const createdBy = createdSubAdmins[i % createdSubAdmins.length]; // Rotate between sub-admins

      const newUser = new User({
        ...user,
        createdBy: createdBy._id,
      });
      await newUser.save();
      createdUsers.push(newUser);
      console.log(`✅ Created user: ${user.fullName} (${user.email})`);
    }

    // Create policies for each user (3 policies per user)
    console.log("\nCreating policies...");
    let policyCount = 0;
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const userVehicles = vehicleData[i];
      const createdBy = createdSubAdmins[i % createdSubAdmins.length]; // Same sub-admin who created the user

      for (const vehicle of userVehicles) {
        const newPolicy = new Policy({
          userId: user._id,
          price: vehicle.price,
          endDate: vehicle.endDate,
          vehicleInfo: {
            make: vehicle.make,
            model: vehicle.model,
            colour: vehicle.colour,
            yearOfManufacture: vehicle.yearOfManufacture,
            topSpeed: vehicle.topSpeed,
            acceleration: vehicle.acceleration,
            gearbox: vehicle.gearbox,
            power: vehicle.power,
            maxTorque: vehicle.maxTorque,
            engineCapacity: vehicle.engineCapacity,
            cylinders: vehicle.cylinders,
            fuelType: vehicle.fuelType,
            consumptionCity: vehicle.consumptionCity,
            consumptionExtraUrban: vehicle.consumptionExtraUrban,
            consumptionCombined: vehicle.consumptionCombined,
            co2Emission: vehicle.co2Emission,
            co2Label: vehicle.co2Label,
            motExpiryDate: vehicle.motExpiryDate,
            motPassRate: vehicle.motPassRate,
            motPassed: vehicle.motPassed,
            motFailed: vehicle.motFailed,
            totalAdviceItems: vehicle.totalAdviceItems,
            totalItemsFailed: vehicle.totalItemsFailed,
            taxStatus: vehicle.taxStatus,
            taxDue: vehicle.taxDue,
            ncapRating: vehicle.ncapRating,
            dimensions: vehicle.dimensions,
            fuelTankCapacity: vehicle.fuelTankCapacity,
            fuelDelivery: vehicle.fuelDelivery,
            numberOfDoors: vehicle.numberOfDoors,
            numberOfSeats: vehicle.numberOfSeats,
            numberOfAxles: vehicle.numberOfAxles,
            engineNumber: vehicle.engineNumber,
          },
          createdBy: createdBy._id,
        });

        await newPolicy.save();
        policyCount++;
        console.log(
          `✅ Created policy ${newPolicy.policyNumber} for ${user.fullName} (${vehicle.make} ${vehicle.model})`
        );
      }
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - ${createdAdmins.length} Admins created`);
    console.log(`   - ${createdSubAdmins.length} Sub-admins created`);
    console.log(`   - ${createdUsers.length} Users created`);
    console.log(`   - ${policyCount} Policies created`);

    console.log(`\n🔐 Login Credentials:`);
    console.log(`\nAdmins:`);
    adminData.forEach((admin) => {
      console.log(`   ${admin.email} / ${admin.password}`);
    });

    console.log(`\nSub-Admins:`);
    subAdminData.forEach((subAdmin) => {
      console.log(`   ${subAdmin.email} / ${subAdmin.password}`);
    });

    console.log(`\nUsers:`);
    userData.forEach((user) => {
      console.log(`   ${user.email} / ${user.password}`);
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function main() {
  try {
    await connectToDatabase();

    console.log("Do you want to clear the existing database? (y/N)");
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question("Clear database? (y/N): ", async (answer) => {
      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        await clearDatabase();
      }

      await seedDatabase();
      readline.close();
      mongoose.connection.close();
    });
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

main();
