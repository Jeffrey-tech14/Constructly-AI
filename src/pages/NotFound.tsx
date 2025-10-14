import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Pickaxe, Sparkles, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen animate-fade-in flex items-center justify-center p-4 smooth-transition bg-white dark:bg-gray-900">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="gradient-card rounded-2xl border-0 shadow-2xl max-w-md mx-auto fade-in border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-8 pb-8">
              {/* Enhanced Icon Section */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex items-center justify-center mb-6"
              >
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Pickaxe
                      className="w-12 h-12"
                      style={{ stroke: "url(#grad1)" }}
                    />
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 2 
                      }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-6 h-6 text-amber-500" />
                    </motion.div>
                  </div>
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="grad1" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6433eaff" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>

              {/* Enhanced 404 Text */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-8xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-primary dark:from-white dark:via-blue-200 dark:to-purple-900 bg-clip-text text-transparent mb-4 leading-none"
              >
                404
              </motion.h1>

              {/* Enhanced Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2"
              >
                <Navigation className="w-6 h-6 text-blue-600" />
                Page Not Found
              </motion.h2>

              {/* Enhanced Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed"
              >
                The page you're looking for doesn't exist or has been moved to a new location.
              </motion.p>

              {/* Enhanced Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 font-semibold text-base"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 px-8 py-3 font-semibold text-base"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Go Back
                  </Button>
                </motion.div>
              </motion.div>

              {/* Additional Help Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-sm text-gray-500 dark:text-gray-400 mt-6"
              >
                If you believe this is an error, please contact support.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
