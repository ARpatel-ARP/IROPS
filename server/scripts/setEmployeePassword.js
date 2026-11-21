import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";

dotenv.config();

const setEmployeePassword = async () => {
  try {
    const { EMPLOYEE_EMAIL, INITIAL_PASSWORD } = process.env;

    if (!EMPLOYEE_EMAIL || !INITIAL_PASSWORD) {
      throw new Error("Employee email or initial password is missing.");
    }

    if (INITIAL_PASSWORD.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const employee = await Employee.findOne({
      email: EMPLOYEE_EMAIL.toLowerCase().trim(),
    });

    if (!employee) {
      throw new Error("Employee not found.");
    }

    const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, 12);

    employee.passwordHash = passwordHash;
    await employee.save();

    console.log(`Password successfully set for ${employee.email}.`);
  } catch (error) {
    console.error("Password provisioning error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

setEmployeePassword();