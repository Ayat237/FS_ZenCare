import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { LoginCredentials } from "@/types/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "zencare117@gmail.com",
    password: "HealthMinistry!11zencare7",
  });
  const [error, setError] = useState<string>("");

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      console.log("🔍 Login mutation success:", data);
      console.log("🔍 Token stored, triggering auth change event...");

      // Longer delay to ensure localStorage is updated and state can change
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify token is actually stored
      const storedToken = localStorage.getItem("adminToken");
      console.log(
        "🔍 Verifying stored token:",
        storedToken ? "EXISTS" : "NOT_FOUND"
      );

      if (!storedToken) {
        console.error("🔍 ERROR: Token not stored properly!");
        setError("Authentication failed - please try again");
        return;
      }

      // Dispatch custom event to notify App.tsx of auth state change
      window.dispatchEvent(new CustomEvent("authChange"));

      // Additional delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use React Router navigation instead of full page reload
      navigate("/", { replace: true });
    },
    onError: (error: Error) => {
      console.error("🔍 Login mutation error:", error);
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }

    loginMutation.mutate(credentials);
  };

  const handleChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🏥</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ZenCare Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the administration panel
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={credentials.email}
              onChange={handleChange("email")}
              placeholder="admin@zencare.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={credentials.password}
              onChange={handleChange("password")}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-600">
              🔒 Test credentials pre-filled. Click "Sign In" to login as admin.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Email: zencare117@gmail.com
            </p>
            <div className="mt-2 space-y-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  console.log(
                    "🔍 DEBUG: Current token:",
                    authService.getToken()
                  );
                  console.log(
                    "🔍 DEBUG: Is authenticated:",
                    authService.isAuthenticated()
                  );
                  console.log(
                    "🔍 DEBUG: LocalStorage:",
                    localStorage.getItem("adminToken")
                  );
                }}
              >
                Debug Auth Status
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Force Refresh
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
