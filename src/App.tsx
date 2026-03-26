import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BannerProvider } from "@/contexts/BannerContext";
import { ToastContainer } from "react-toastify";
import HomePage from "@/app/page";
import EventsPage from "@/app/events/page";
import TicketingPage from "@/app/ticketing/page";
import CrewPage from "@/app/crew/page";
import BudgetPage from "@/app/budget/page";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import ForgotPasswordPage from "@/app/forgot-password/page";
import ResetPasswordPage from "@/app/reset-password/page";
import VerifyEmailPage from "@/app/verify-email/page";
import DashboardPage from "@/app/dashboard/page";
import ErrorPage from "@/app/error/page";
import CheckoutPage from "@/app/checkout/[orderId]/page";
import CheckoutSuccessPage from "@/app/checkout/success/page";
import CheckoutCancelPage from "@/app/checkout/cancel/page";
import OrderPage from "@/app/order/[orderId]/page";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BannerProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/ticketing" element={<TicketingPage />} />
            <Route path="/crew" element={<CrewPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/checkout/:orderId" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
            <Route path="/order/:orderId" element={<OrderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </BannerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
