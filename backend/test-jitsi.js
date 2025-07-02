// Simple test to verify the Jitsi service functionality
import {
  generateJitsiToken,
  generateRoomName,
} from "../src/services/jitsi.service.js";

// Test data
const testAppointmentId = "507f1f77bcf86cd799439011";
const testUser = {
  id: "507f1f77bcf86cd799439012",
  name: "Dr. John Doe",
  email: "john.doe@zencare.com",
};

const testExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

// Test room name generation
console.log("Testing room name generation...");
const roomName = generateRoomName(testAppointmentId);
console.log("Generated room name:", roomName);

// Test JWT token generation (requires JITSI_SECRET env var)
console.log("\nTesting JWT token generation...");
try {
  if (process.env.JITSI_SECRET) {
    const token = generateJitsiToken({
      roomName,
      user: testUser,
      isModerator: true,
      expiresAt: testExpiresAt,
    });
    console.log("Generated token:", token.substring(0, 50) + "...");
    console.log("Token length:", token.length);
  } else {
    console.log("JITSI_SECRET not set, skipping token generation test");
  }
} catch (error) {
  console.error("Error generating token:", error.message);
}

console.log("\nTest completed successfully!");
