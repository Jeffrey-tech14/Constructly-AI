// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { AlertCircle, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ErrorPageProps {
  statusCode?: number;
  message?: string;
  description?: string;
}

const ErrorPage = ({
  statusCode = 500,
  message = "Something went wrong",
  description = "An unexpected error occurred while processing your request.",
}: ErrorPageProps) => {
  const navigate = useNavigate();
  const [isReloading, setIsReloading] = useState(false);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReload = () => {
    setIsReloading(true);
    window.location.reload();
  };

  const getErrorIcon = () => {
    if (statusCode === 404) {
      return <Search className="h-12 w-12 text-orange-500" />;
    }
    return <AlertCircle className="h-12 w-12 text-red-500" />;
  };

  const getErrorColor = () => {
    if (statusCode === 404) {
      return "orange";
    }
    return "red";
  };

  const errorColor = getErrorColor();
  const bgColorLight = errorColor === "red" ? "bg-red-50" : "bg-orange-50";
  const bgColorDark =
    errorColor === "orange" ? "dark:bg-orange-950" : "dark:bg-red-950";
  const borderColor =
    errorColor === "orange"
      ? "border-orange-200 dark:border-orange-800"
      : "border-red-200 dark:border-red-800";
  const textColor =
    errorColor === "orange"
      ? "text-orange-900 dark:text-orange-100"
      : "text-red-900 dark:text-red-100";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${bgColorLight} ${bgColorDark}`}>
              {getErrorIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {statusCode}
                </span>
              </div>
              <CardTitle className="text-2xl">{message}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Info */}
          <div
            className={`p-4 rounded-lg ${bgColorLight} ${bgColorDark} border ${borderColor}`}
          >
            <p className={`text-sm ${textColor}`}>
              {statusCode === 404
                ? "The page you're looking for doesn't exist or has been moved."
                : "There has been an error processing your request. Please try again later."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleGoHome} variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="gap-2">
              Go Back
            </Button>
            <Button
              onClick={handleReload}
              variant="outline"
              className="gap-2"
              disabled={isReloading}
            >
              {isReloading ? "Reloading..." : "Reload Page"}
            </Button>
          </div>

          {/* Additional Help */}
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              What you can do:
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try a different browser or incognito mode</li>
              <li>Contact our support team if the problem persists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
