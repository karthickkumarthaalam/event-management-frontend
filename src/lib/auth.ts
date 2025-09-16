import api from "./api";

export interface RegisterData {
  email: string;
  password: string;
  tenantName: string;
  name: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
  tenantName: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export const authservice = {
  async register(data: RegisterData) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post("/auth/login", data);
    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);
    return response.data;
  },

  async verifyEmail(data: VerifyEmailData) {
    const response = await api.post("/auth/verify-email", data);
    return response.data;
  },

  async resendOtp(email: string) {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordData) {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordData) {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("selected_event");
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  },

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  },
};
