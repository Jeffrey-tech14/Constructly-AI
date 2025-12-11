// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import QuoteBuilder from "./pages/QuoteBuilder";
import ViewAllQuotes from "./pages/ViewAllQuotes";
import AdminDashboard from "./pages/AdminDashboard";
import Variables from "./pages/Variables";
import NotFound from "./pages/NotFound";
import UploadPlan from "./pages/UploadPage";
import Auth from "./pages/Auth";
import UpdatePassword from "./pages/auth/update-password"; // ✅ NEW IMPORT
import PaymentPage from "./pages/PaymentPage";
import PaymentAction from "./components/PaymentDialog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen scrollbar-hide bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100 dark:from-background dark:via-background dark:to-background transition-colors duration-400">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* ✅ NEW ROUTE: Password reset callback */}
            <Route path="/auth/update-password" element={<UpdatePassword />} />
            <Route
              path="payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/action"
              element={
                <ProtectedRoute>
                  <PaymentAction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload/plan"
              element={
                <ProtectedRoute>
                  <UploadPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/new"
              element={
                <ProtectedRoute>
                  <QuoteBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/all"
              element={
                <ProtectedRoute>
                  <ViewAllQuotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/variables"
              element={
                <ProtectedRoute>
                  <Variables />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
