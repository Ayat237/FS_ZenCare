import axios from "axios";

// Test login and profile fetch for doctor
async function testDoctorLoginAndProfile() {
  try {
    console.log("Testing doctor login and profile fetch...");

    // Step 1: Login
    const loginData = {
      email: "loaytamer569@gmail.com",
      password: "123456789",
    };

    console.log("1. Attempting login...");
    const loginResponse = await axios.post(
      "http://localhost:3000/auth/login",
      loginData
    );

    if (loginResponse.data.success) {
      console.log("✅ Login successful!");
      console.log("User data:", loginResponse.data.data);

      const token = loginResponse.data.data.token;
      console.log("Token received:", token);

      // Step 2: Test profile fetch
      console.log("\n2. Testing profile fetch...");

      const profileResponse = await axios.get(
        "http://localhost:3000/auth/user-profile",
        {
          headers: {
            token: `Bearer_${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Profile fetch successful!");
      console.log(
        "Profile data:",
        JSON.stringify(profileResponse.data, null, 2)
      );
    } else {
      console.log("❌ Login failed:", loginResponse.data);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response data:", error.response.data);
    }
  }
}

// Run the test
testDoctorLoginAndProfile();
