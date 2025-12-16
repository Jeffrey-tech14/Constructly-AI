// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, FileQuestion, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// --- THEME CONSTANTS ---
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#86bc25",
  HERO_ACCENT_BLUE: "#00356B",
  TEXT_LIGHT: "#F0F0F0",
};

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Preserved Logic
  if (!user) {
    navigate("/auth");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Main Card - Sharp Corners & Technical Style */}
        <div className="bg-white rounded-sm border-t-4 border-[#86bc25] shadow-2xl overflow-hidden relative">
          {/* Technical Header */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#86bc25]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                System Notification
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>

          <div className="p-8 text-center">
            {/* 404 Display */}
            <div className="mb-6 relative inline-block">
              <h1 className="text-8xl font-black text-[#00356B] tracking-tighter opacity-10 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileQuestion className="w-16 h-16 text-[#00356B]" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#00356B] mb-2 uppercase tracking-wide">
              Module Not Found
            </h2>

            <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
              The resource requested [ID: NULL] does not exist in the directory
              or has been relocated to a secure archive.
            </p>

            <div className="w-full h-px bg-gray-100 mb-8"></div>

            {/* Buttons - Sharp & Technical */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="bg-[#86bc25] hover:bg-[#75a620] text-white rounded-sm h-12 px-8 shadow-sm group"
              >
                <Home className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Return to Dashboard
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-sm h-12 px-8 border-gray-300 text-slate-600 hover:bg-gray-50 hover:text-[#00356B]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Go Back
                </span>
              </Button>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="bg-[#00356B] py-2 px-6 text-center sm:text-right">
            <span className="text-[9px] text-white/40 font-mono uppercase">
              Error Code: 0x404_ERR_MISSING
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
