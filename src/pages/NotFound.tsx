// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  const floatingVariants = {
    animate: {
      y: [0, 30, 0],
      rotate: [0, 5, -5, 0],
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#B8860B]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#00356B]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
          transition={{
            duration: 16,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/3 w-72 h-72 bg-[#86bc25]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* 404 Text with Floating Animation */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
              className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-[#B8860B] via-[#D4A574] to-[#B8860B] dark:from-[#D4A574] dark:via-[#B8860B] dark:to-[#D4A574] bg-clip-text text-transparent drop-shadow-lg"
            >
              404
            </motion.h1>
          </motion.div>

          {/* Error Message */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#00356B] dark:text-white mb-4">
              Page Lost on the Construction Site
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              It seems like you've wandered off the project blueprint! The page
              you're looking for has disappeared into the blueprint archive.
            </p>
          </motion.div>

          {/* Search Icon with Rotation */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-lg"
            >
              <Search className="w-8 h-8 text-[#B8860B] dark:text-[#D4A574]" />
            </motion.div>
          </motion.div>

          {/* Support Text */}
          <motion.p
            variants={itemVariants}
            className="text-slate-600 dark:text-slate-400 mb-10 font-medium text-base"
          >
            Don't worry! Use the links below to get back on track
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-[#B8860B] hover:bg-[#A67C00] text-white rounded-full h-12 px-8 font-semibold shadow-lg transition-all group"
              >
                <Home className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Back to Home
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/quotes/new")}
                variant="outline"
                className="w-full sm:w-auto text-[#00356B] dark:text-[#86bc25] border-2 border-slate-300 dark:border-slate-600 hover:border-[#B8860B] dark:hover:border-[#B8860B] hover:bg-[#B8860B]/10 rounded-full h-12 px-8 font-semibold transition-all group"
              >
                Explore Projects
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer Links Card */}
          <motion.div
            variants={itemVariants}
            className="glass-card rounded-2xl p-6 sm:p-8 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">
              Need help finding something?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/help")}
                className="text-[#B8860B] hover:text-[#00356B] dark:hover:text-[#D4A574] font-semibold transition-colors"
              >
                Browse Documentation →
              </motion.button>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:block">
                •
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/support")}
                className="text-[#B8860B] hover:text-[#00356B] dark:hover:text-[#D4A574] font-semibold transition-colors"
              >
                Contact Support →
              </motion.button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-slate-400 dark:text-slate-600 text-sm font-light"
            >
              ↓
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
