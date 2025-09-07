// Admin service - Currently using regular auth service for admin login
// This file exists to prevent import errors but admin functionality
// is handled through the main auth service with role checking

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

// Note: Admin login is currently handled through authService.login()
// with role verification in the AdminLoginScreen component
