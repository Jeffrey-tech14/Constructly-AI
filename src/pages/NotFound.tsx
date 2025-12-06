// src/pages/NotFound.tsx
// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full bg-white border border-[#E1EBF2] text-[#333333] hover:bg-gray-50 font-bold uppercase tracking-[1.2px] text-[12px] h-12 rounded-[3px] transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

          </CardContent>
          
          {/* Decorative Bottom Bar */}
          <div className="h-1.5 w-full bg-[#015B97]" />
        </Card>

        <p className="text-center text-[11px] text-[#999] mt-8 uppercase tracking-widest">
            © 2025 Jeff. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;