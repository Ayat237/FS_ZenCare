export interface LoginCredentials {
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

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  token: string;
}
