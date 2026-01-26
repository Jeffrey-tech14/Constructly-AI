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
import { useEffect, useState } from "react";
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
import QuotePaymentPage from "./pages/QuotePaymentPage";
import QuoteDetailsPage from "./pages/QuoteDetailsPage";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorPage from "./pages/ErrorPage";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

const queryClient = new QueryClient();

// Inner component that can detect theme changes
const AppContent = () => {
  const [isDark, setIsDark] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // If no internet connection, show offline error page (after all hooks)
  if (!isOnline) {
    return (
      <ErrorPage
        statusCode={503}
        message="No Internet Connection"
        description="You appear to be offline. Please check your internet connection and try again."
      />
    );
  }

  return (
    <div className="min-h-screen scrollbar-hide bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100 dark:from-background dark:via-background dark:to-background transition-colors duration-400 relative">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
          linear-gradient(to right, ${
            isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)"
          } 1px, transparent 1px),
          linear-gradient(to bottom, ${
            isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.02)"
          } 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
        }}
      />
      <Navbar />
      <div className="relative z-10">
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
            path="/payments/quote"
            element={
              <ProtectedRoute>
                <QuotePaymentPage />
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
            path="/quotes/:quoteId"
            element={
              <ProtectedRoute>
                <QuoteDetailsPage />
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
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
