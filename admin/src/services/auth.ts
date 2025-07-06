import { LoginCredentials, AdminLoginResponse } from "@/types/auth";

// Dummy credentials for development
const DUMMY_ADMIN_CREDENTIALS = {
  email: "zencare117@gmail.com",
  password: "HealthMinistry!11zencare7",
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AdminLoginResponse> {
    try {
      console.log("🔍 ADMIN WEB: Attempting login with credentials:", {
        email: credentials.email,
        password: "[HIDDEN]",
      });

      // Always use dummy credentials for this setup - no API calls
      if (
        credentials.email === DUMMY_ADMIN_CREDENTIALS.email &&
        credentials.password === DUMMY_ADMIN_CREDENTIALS.password
      ) {
        const dummyToken = "dummy-admin-token-" + Date.now();
        localStorage.setItem("adminToken", dummyToken);
        console.log(
          "🔍 ADMIN WEB: Dummy login successful, token stored:",
          dummyToken
        );

        return {
          success: true,
          message: "Login successful (dummy mode)",
          data: {
            token: dummyToken,
          },
        };
      } else {
        throw new Error(
          "Invalid credentials. Please use the correct admin credentials."
        );
      }
    } catch (error: any) {
      console.error("🔍 ADMIN WEB: Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  logout(): void {
    console.log("🔍 ADMIN WEB: Logout called");
    console.trace("🔍 ADMIN WEB: Logout call stack");
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  },

  getToken(): string | null {
    const token = localStorage.getItem("adminToken");
    console.log(
      "🔍 ADMIN WEB: Getting token from localStorage:",
      token ? "EXISTS" : "NOT_FOUND"
    );
    return token;
  },

  isAuthenticated(): boolean {
    try {
      const token = this.getToken();
      console.log(
        "🔍 ADMIN WEB: Checking authentication, token:",
        token ? "EXISTS" : "NOT_FOUND"
      );

      if (!token) {
        console.log("🔍 ADMIN WEB: No token found");
        return false;
      }

      // For dummy mode, just check if it exists and starts with our dummy prefix
      if (token.startsWith("dummy-admin-token-")) {
        console.log("🔍 ADMIN WEB: Dummy token is valid");
        return true;
      }

      console.log(
        "🔍 ADMIN WEB: Non-dummy token found, treating as invalid in dummy mode"
      );
      return false;
    } catch (error) {
      console.error("🔍 ADMIN WEB: Error checking authentication:", error);
      return false;
    }
  },
};
