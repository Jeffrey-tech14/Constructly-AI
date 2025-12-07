<<<<<<< HEAD
// src/pages/NotFound.tsx
=======
>>>>>>> origin/main
// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
<<<<<<< HEAD
import { Home, ArrowLeft, Target, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center p-6 font-sans antialiased">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-[#E1EBF2] shadow-lg rounded-[4px] overflow-hidden">
          <CardContent className="pt-12 pb-10 px-8 text-center">
            
            {/* Icon Container */}
            <div className="w-24 h-24 bg-[#F0F7FA] rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-[#015B97]" />
            </div>

            {/* Typography */}
            <h1 className="text-[64px] font-bold text-[#015B97] leading-none mb-2 tracking-tight">
              404
            </h1>

            <h2 className="text-[22px] font-bold text-[#333333] mb-4">
              Page Not Found
            </h2>

            <p className="text-[15px] text-[#666666] leading-relaxed mb-10">
              The page you are looking for has been moved, deleted, or possibly never existed.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-[#015B97] hover:bg-[#004a80] text-white font-extrabold uppercase tracking-[1.2px] text-[12px] h-12 rounded-[3px] transition-all"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
=======
import { Home, ArrowLeft, DraftingCompass, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    navigate("/auth");
  }
  return (
    <div className="min-h-screen animate-fade-in flex items-center justify-center p-4 smooth-transition">
      <div className="text-center">
        <Card className=" rounded-2xl border-0 shadow-2xl max-w-md mx-auto fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl  ">
                <Target
                  className="sm:w-8 sm:h-8"
                  style={{ stroke: "url(#grad1)" }}
                />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="grad1" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6433eaff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-primary dark:from-white dark:via-blue-200 dark:to-purple-900 bg-clip-text text-transparent mb-4">
              404
            </h1>

            <h2 className="sm:text-2xl text-lg font-bold text-foreground mb-4">
              Page Not Found
            </h2>

            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
>>>>>>> origin/main
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
<<<<<<< HEAD
                className="w-full bg-white border border-[#E1EBF2] text-[#333333] hover:bg-gray-50 font-bold uppercase tracking-[1.2px] text-[12px] h-12 rounded-[3px] transition-all"
=======
                className="rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
>>>>>>> origin/main
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
<<<<<<< HEAD

          </CardContent>
          
          {/* Decorative Bottom Bar */}
          <div className="h-1.5 w-full bg-[#015B97]" />
        </Card>

        <p className="text-center text-[11px] text-[#999] mt-8 uppercase tracking-widest">
            © 2025 Jeff. All rights reserved.
        </p>
      </motion.div>
=======
          </CardContent>
        </Card>
      </div>
>>>>>>> origin/main
    </div>
  );
};

<<<<<<< HEAD
export default NotFound;
=======
export default NotFound;
>>>>>>> origin/main
