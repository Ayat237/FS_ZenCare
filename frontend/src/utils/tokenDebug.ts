// Token debugging utility
export const debugToken = (token: string | null | undefined) => {
  console.log("🔍 TOKEN DEBUG UTILITY");
  console.log("Token exists:", !!token);
  console.log("Token type:", typeof token);
  console.log("Token length:", token?.length || 0);

  if (!token) {
    console.log("❌ No token provided");
    return;
  }

  try {
    // Try to decode the JWT token payload (without verification)
    const parts = token.split(".");
    console.log("Token parts count:", parts.length);

    if (parts.length !== 3) {
      console.log(
        "❌ Invalid JWT format - should have 3 parts separated by dots"
      );
      return;
    }

    // Decode header
    try {
      const header = JSON.parse(atob(parts[0]));
      console.log("JWT Header:", header);
    } catch (e) {
      console.log("❌ Failed to decode JWT header:", e);
    }

    // Decode payload
    try {
      const payload = JSON.parse(atob(parts[1]));
      console.log("JWT Payload:", payload);

      // Check expiration
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        console.log("Token expires at:", expDate.toISOString());
        console.log("Current time:", now.toISOString());
        console.log("Token expired:", now > expDate);

        if (now > expDate) {
          console.log("❌ TOKEN IS EXPIRED!");
        } else {
          console.log("✅ Token is still valid");
        }
      }

      // Check issued at
      if (payload.iat) {
        const issuedDate = new Date(payload.iat * 1000);
        console.log("Token issued at:", issuedDate.toISOString());
      }
    } catch (e) {
      console.log("❌ Failed to decode JWT payload:", e);
    }

    console.log("Full token value:", token);
    console.log("Token starts with:", token.substring(0, 20) + "...");
    console.log("Token ends with:", "..." + token.substring(token.length - 20));
  } catch (error) {
    console.log("❌ Error debugging token:", error);
  }
};
