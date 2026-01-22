// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, FileQuestion, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Preserved Logic
  if (!user) {
    navigate("/auth");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="glass-card backdrop-blur-sm rounded-lg border-t-4 border-[#86bc25] shadow-2xl overflow-hidden relative">
          {/* Animated Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#86bc25]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                System Alert
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-red-400" />
            </div>
          </div>

          <div className="p-8 sm:p-12 text-center">
            {/* 404 Display */}
            <div className="mb-8 relative h-32 flex items-center justify-center">
              <h1 className="text-9xl font-black text-[#00356B]/5 tracking-tighter select-none absolute">
                404
              </h1>
              <FileQuestion className="w-24 h-24 text-[#86bc25] drop-shadow-lg relative z-10" />
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl font-bold text-[#00356B] dark:text-[#86bc25] mb-2 uppercase tracking-wide">
              Module Not Found
            </h2>

            {/* Subtitle */}
            <div className="h-1 w-20 bg-gradient-to-r from-[#86bc25] to-[#00356B] mx-auto mb-6 rounded-full" />

            {/* Description Text */}
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              The resource requested{" "}
              <span className="text-[#00356B] dark:text-[#86bc25] font-bold">
                [ID: NULL]
              </span>{" "}
              does not exist in the directory or has been relocated to a secure
              archive.
            </p>

            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {["Error", "Status", "Code"].map((label) => (
                <div
                  key={label}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600"
                >
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    {label}
                  </div>
                  <div className="text-lg font-bold text-[#86bc25]">
                    {label === "Error"
                      ? "404"
                      : label === "Status"
                      ? "∅"
                      : "ERR"}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent mb-8" />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-gradient-to-r from-[#86bc25] to-[#75a620] hover:from-[#75a620] hover:to-[#6a9218] text-white rounded-lg h-12 px-8 shadow-lg font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Return to Dashboard
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto rounded-lg h-12 px-8 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#00356B] dark:hover:text-[#86bc25] hover:border-[#86bc25] dark:hover:border-[#86bc25] font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Go Back
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
