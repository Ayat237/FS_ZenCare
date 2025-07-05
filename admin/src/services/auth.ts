import apiClient from "./apiClient";
import { LoginCredentials, AdminLoginResponse } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AdminLoginResponse> {
    try {
      console.log("🔍 ADMIN WEB: Attempting login with credentials:", {
        email: credentials.email,
        password: "[HIDDEN]",
      });

      const response = await apiClient.post("/admin/login", credentials);
      console.log("🔍 ADMIN WEB: Login response:", response.data);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        localStorage.setItem("adminToken", token);
        console.log("🔍 ADMIN WEB: Token stored successfully");
        return response.data;
      }

      throw new Error(
        response.data.message || "Login failed - no token received"
      );
    } catch (error: any) {
      console.error("🔍 ADMIN WEB: Login error:", error);
      console.error("🔍 ADMIN WEB: Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  },

  logout(): void {
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
    const token = this.getToken();
    console.log(
      "🔍 ADMIN WEB: Checking authentication, token:",
      token ? "EXISTS" : "NOT_FOUND"
    );

    if (!token) {
      console.log("🔍 ADMIN WEB: No token found");
      return false;
    }

    try {
      // Basic JWT structure validation (not signature verification)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.log("🔍 ADMIN WEB: Invalid token structure");
        localStorage.removeItem("adminToken");
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        console.log("🔍 ADMIN WEB: Token expired");
        localStorage.removeItem("adminToken");
        return false;
      }

      console.log("🔍 ADMIN WEB: Token is valid");
      return true;
    } catch (error) {
      console.error("🔍 ADMIN WEB: Error validating token:", error);
      localStorage.removeItem("adminToken");
      return false;
    }
  },
};
