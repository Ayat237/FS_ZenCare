import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PendingDoctorsPage from "@/pages/PendingDoctorsPage";

function App() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuthState = () => {
    console.log("🔍 App: Checking auth state");
    const token = localStorage.getItem("adminToken");
    console.log(
      "🔍 App: Token in localStorage:",
      token ? "EXISTS" : "NOT_FOUND"
    );
    const isAuth = authService.isAuthenticated();
    console.log("🔍 App: Auth result:", isAuth);
    setAuthState({
      isAuthenticated: isAuth,
      isLoading: false,
    });
  };

  useEffect(() => {
    checkAuthState();

    // Listen for custom auth change events
    const handleAuthChange = () => {
      console.log("🔍 App: Auth change event received");
      // Small delay to ensure localStorage operations are complete
      setTimeout(() => {
        checkAuthState();
      }, 50);
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("🔍 App: Rendering with auth state:", authState);

  return (
    <Router>
      <Routes>
        {authState.isAuthenticated ? (
          // Authenticated routes
          <>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route
              path="/"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />
            <Route
              path="/doctors/pending"
              element={
                <Layout>
                  <PendingDoctorsPage />
                </Layout>
              }
            />
            <Route
              path="/doctors"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">
                      All Doctors
                    </h2>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/analytics"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Analytics
                    </h2>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Settings
                    </h2>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Not authenticated routes
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
