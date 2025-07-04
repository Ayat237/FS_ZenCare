
import dotenv from "dotenv";
import { User, UserModel } from "./database/models/user.model.js";
import { systemRoles, Provider } from "./src/utils/index.js";
import { hashSync } from "bcryptjs";
import database from "./database/databaseConnection.js";

dotenv.config();

const userModel = new UserModel(database);
async function createAdmin() {
  
  const email = "zencare117@gmail.com";
  const password = "HealthMinistry!11zencare7"; 
  const userName = "admin117";
  const firstName = "Admin";
  const lastName = "User";
  const gender = "other"; 

  // Check if admin already exists
  const existing = await userModel.findOne({ email });
  if (existing) {
    console.log("Admin user already exists.");
    process.exit(0);
  }

  const admin = new User({
    firstName,
    lastName,
    userName,
    email,
    password,
    mobilePhone: "01000000000",
    role: [systemRoles.ADMIN],
    activeRole: systemRoles.ADMIN,
    isVerified: true,
    provider: Provider.LOCAL,
    gender,
  });

  await userModel.save(admin);
  console.log("Admin user created successfully!");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
}); 