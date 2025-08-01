import { Property } from "../model/properties.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const pakistaniMaleNames = [
  "Ali Khan",
  "Ahmed Raza",
  "Usman Malik",
  "Bilal Ahmed",
  "Farhan Sheikh",
  "Kamran Abbas",
  "Nasir Hussain",
  "Omar Farooq",
  "Tariq Mahmood",
  "Zubair Iqbal"
];

async function migratePropertyDealerNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const properties = await Property.find({ propertyDealerName: { $exists: false } });
    
    for (const property of properties) {
      const randomName = pakistaniMaleNames[Math.floor(Math.random() * pakistaniMaleNames.length)];
      property.propertyDealerName = randomName;
      await property.save();
    }
    
    console.log(`Updated ${properties.length} properties with dealer names`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.disconnect();
  }
}

migratePropertyDealerNames();