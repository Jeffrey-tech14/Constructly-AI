import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DraftingCompass,
  Menu,
  ChevronDown,
  PhoneCall,
  Mail,
  User,
  UploadCloud,
  BarChart3,
  FileText,
  Calculator,
  Building,
  ClipboardCheck,
  ArrowRight,
  X,
  Sun,
  Moon,
  HelpCircle,
  CreditCard,
  Settings,
  Search,
  Calendar,
  Clock,
  ArrowRightCircle,
  Play,
  Home,
  Users,
  Briefcase,
  Award,
  Scale,
  TrendingUp,
  Factory,
  MapPin,
  Layers,
  HardHat,
  Ruler,
  Wrench,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ===== THEME TOGGLE =====
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return (
    <div className="flex items-center ml-4">
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 transition-colors duration-300"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
    </div>
  );
};

// ===== VIDEO DEMO MODAL =====
const VideoModal = ({ isOpen, onClose }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Set video to start from the middle
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.currentTime = videoRef.current.duration / 2;
      };
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-800 dark:text-white bg-white/80 hover:bg-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full h-auto"
          style={{ maxHeight: "80vh" }}
          onContextMenu={(e) => e.preventDefault()} // Prevent right-click context menu
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>
    </motion.div>
  );
};

// ===== FAQ COMPONENT =====
const FaqSection = () => {
  const [activeCategory, setActiveCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const faqsData = {
    "General": {
      icon: <HelpCircle className="w-5 w-5 text-risa-primary" />,
      items: [
        {
          question: "What file formats does Constructly support?",
          answer: (
            <div className="space-y-3">
              <p>Constructly supports all major CAD formats including:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>DWG and DXF (AutoCAD formats)</li>
                <li>PDF documents with vector data</li>
                <li>Image formats: JPG, PNG, TIFF</li>
                <li>Revit files (RVT)</li>
                <li>SketchUp files (SKP)</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                <p>Tip: For best results, use vector-based files rather than raster images when possible.</p>
              </div>
            </div>
          ),
        },
        {
          question: "How accurate are the material estimates?",
          answer: (
            <div className="space-y-3">
              <p>Our AI-powered analysis achieves:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Over 95% accuracy on standard construction plans</li>
                <li>90-93% accuracy on complex or custom designs</li>
                <li>Consistent results across various project types</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-300">
                <p>Note: Accuracy may vary based on plan quality and complexity. We recommend reviewing estimates before finalizing quotes.</p>
              </div>
            </div>
          ),
        },
        {
          question: "Can I customize the quote templates?",
          answer: (
            <div className="space-y-3">
              <p>Yes, all plans include customizable templates with:</p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Your company logo and branding</li>
                <li>Custom categories and item descriptions</li>
                <li>Company-specific terminology</li>
                <li>Flexible pricing structures</li>
                <li>Multiple currency and unit options</li>
              </ol>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
                <p>Professional and Enterprise plans offer advanced customization options.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    "Account & Billing": {
      icon: <CreditCard className="w-5 w-5 text-risa-primary" />,
      items: [
        {
          question: "What payment methods are accepted?",
          answer: (
            <div className="space-y-3">
              <p>We accept various payment methods:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
                  <h4 className="font-medium mb-2">Online Payments</h4>
                  <ul className="space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• PayPal</li>
                    <li>• Bank Transfer</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                  <h4 className="font-medium mb-2">Other Options</h4>
                  <ul className="space-y-1">
                    <li>• Annual billing discounts</li>
                    <li>• Purchase orders</li>
                    <li>• Wire transfers</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
        {
          question: "How do I upgrade or downgrade my plan?",
          answer: (
            <div className="space-y-3">
              <p>To change your plan:</p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Log in to your account</li>
                <li>Navigate to 'Billing' section</li>
                <li>Select 'Change Plan'</li>
                <li>Choose your new plan</li>
                <li>Confirm the changes</li>
              </ol>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
                <p>Note: Plan changes take effect immediately. Prorated charges or credits will be applied to your next invoice.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    "Technical Support": {
      icon: <Settings className="w-5 w-5 text-risa-primary" />,
      items: [
        {
          question: "What should I do if I'm having trouble uploading plans?",
          answer: (
            <div className="space-y-3">
              <p>If you're experiencing upload issues:</p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Check your internet connection</li>
                <li>Ensure your file format is supported</li>
                <li>Verify the file is not corrupted or password protected</li>
                <li>Try compressing large files before uploading</li>
                <li>Contact support if issues persist</li>
              </ol>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                <p>Emergency: Contact support immediately for critical issues affecting your business operations.</p>
              </div>
            </div>
          ),
        },
        {
          question: "How do I optimize my plans for best results?",
          answer: (
            <div className="space-y-3">
              <p>For optimal analysis results:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                  <h4 className="font-medium mb-2">File Preparation</h4>
                  <ul className="space-y-1">
                    <li>• Use vector formats when possible</li>
                    <li>• Ensure clear dimension labels</li>
                    <li>• Use standard architectural scales</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <ul className="space-y-1">
                    <li>• Organize layers properly</li>
                    <li>• Clean up unnecessary elements</li>
                    <li>• Use standard symbols and notations</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
  };
  const filteredFaqs = faqsData[activeCategory].items.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 
          className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Frequently Asked Questions
        </motion.h2>
        {/* Category Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {Object.entries(faqsData).map(([key, { icon }]) => (
            <motion.button
              key={key}
              onClick={() => {
                setActiveCategory(key);
                setOpenIndex(null);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeCategory === key
                  ? "bg-risa-primary text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
              <span className="text-sm font-medium">{key}</span>
            </motion.button>
          ))}
        </motion.div>
        {/* Search Bar */}
        <motion.div 
          className="max-w-xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeCategory} FAQs...`}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-risa-primary focus:border-transparent transition-all duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
        {/* FAQ List */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          key={activeCategory}
        >
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg dark:hover:shadow-gray-800/30 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <motion.button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center"
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-base font-medium text-gray-800 dark:text-white pr-4">{faq.question}</h3>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    className="text-risa-primary flex-shrink-0"
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: 1, 
                        height: "auto",
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.4, delay: 0.1 }
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.2 }
                        }
                      }}
                      className="px-6 pb-6 text-gray-700 dark:text-gray-300 text-sm overflow-hidden"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {/* Support CTA */}
        <motion.div 
          className="mt-12 p-8 bg-risa-primary rounded-xl text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
          <p className="mb-6 opacity-90">Our support team is available to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:9499515815" 
              className="bg-white hover:bg-gray-100 text-risa-primary px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Call Support: 949 951 5815
            </a>
            <a 
              href="mailto:support@constructly.com"
              className="border border-white text-white hover:bg-white hover:text-risa-primary px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ===== HOW IT WORKS SECTION =====
const HowItWorks = () => {
  const steps = [
    {
      icon: <UploadCloud className="h-10 w-10 text-white" />,
      title: "Upload Plans",
      desc: "Upload your construction plans in various formats",
      color: "bg-risa-primary"
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-white" />,
      title: "AI Analysis",
      desc: "Our system analyzes materials, dimensions, and requirements",
      color: "bg-blue-600"
    },
    {
      icon: <Calculator className="h-10 w-10 text-white" />,
      title: "Automated Calculations",
      desc: "Get precise quantity takeoffs and cost estimates",
      color: "bg-green-600"
    },
    {
      icon: <FileText className="h-10 w-10 text-white" />,
      title: "Generate Quote",
      desc: "Create professional quotes ready to send to clients",
      color: "bg-purple-600"
    }
  ];
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            How Constructly Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform your construction plans into accurate quotes with our specialized analysis system
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto rounded-full ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                {step.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== MAIN COMPONENT =====
const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll for navbar animation
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Fixed scrollTo function for navbar
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Close mobile menu after clicking
      setMenuOpen(false);
    }
  };

  // Redirect if logged in
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
      style={{ fontFamily: "Poppins, Helvetica Neue, Arial, sans-serif" }}
    >
      {/* ===== TOP BAR (Updated with RISA-style Contact Button) ===== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 py-1.5 text-sm text-gray-700 dark:text-gray-300"
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-end space-x-8">
          <div className="relative group">
            <motion.button 
              className="flex items-center lowercase text-gray-700 dark:text-gray-300 hover:text-risa-primary transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="mr-1 h-3.5 w-3.5" />
              contact us 
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </motion.button>
            <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 min-w-40 hidden group-hover:block z-50">
              <a
                href="mailto:support@constructly.com"
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Mail className="mr-2 h-4 w-4" /> support
              </a>
              <a
                href="mailto:sales@constructly.com"
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Mail className="mr-2 h-4 w-4" /> sales/general
              </a>
            </div>
          </div>
          <a href="tel:9499515815" className="flex items-center hover:text-risa-primary text-gray-700 dark:text-gray-300">
            <PhoneCall className="mr-1 h-3.5 w-3.5" /> 949 951 5815
          </a>
        </div>
      </motion.div>
      
      {/* ===== ANIMATED NAVBAR (Updated with Capitalized, Animated Links) ===== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <DraftingCompass className="h-6 w-6 text-risa-primary" />
              <span className="text-xl font-bold text-risa-primary">Constructly</span>
            </motion.div>
            <div className="hidden lg:flex items-center space-x-8">
              <motion.button 
                onClick={() => scrollTo('features')} 
                className="text-gray-700 dark:text-gray-300 hover:text-risa-primary font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Features
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('pricing')} 
                className="text-gray-700 dark:text-gray-300 hover:text-risa-primary font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Pricing
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('testimonials')} 
                className="text-gray-700 dark:text-gray-300 hover:text-risa-primary font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Testimonials
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('faq')} 
                className="text-gray-700 dark:text-gray-300 hover:text-risa-primary font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                FAQ
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/auth')}
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-300 hover:text-risa-primary"
                >
                  <User className="mr-1 h-4 w-4" /> Login
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-risa-primary hover:bg-risa-primaryLight text-white px-6 py-3 text-sm"
                >
                  Get Started
                </Button>
              </motion.div>
              <ThemeToggle />
            </div>
            <div className="flex items-center space-x-2 lg:hidden">
              <ThemeToggle />
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-6 bg-white dark:bg-gray-800">
                  <div className="flex flex-col space-y-4 mt-8">
                    <motion.button 
                      onClick={() => scrollTo('features')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Features
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('pricing')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Pricing
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('testimonials')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Testimonials
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('faq')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      FAQ
                    </motion.button>
                    <Button
                      onClick={() => navigate('/auth')}
                      variant="ghost"
                      className="justify-start text-gray-700 dark:text-gray-300 hover:text-risa-primary pl-0"
                    >
                      <User className="mr-2 h-4 w-4" /> Login
                    </Button>
                    <Button
                      onClick={() => navigate('/auth')}
                      className="bg-risa-primary text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>
      
      {/* ===== HERO SECTION ===== */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative py-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="text-risa-primary">Generate Accurate Quotes in Minutes</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed text-gray-700 dark:text-gray-300">
                Upload your construction plans and get precise material estimates and professional quotes in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-risa-primary hover:bg-risa-primaryLight text-white px-8 py-4 font-medium"
                  >
                    Get Started
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="bg-risa-primary hover:bg-risa-primaryLight text-white px-8 py-4 font-medium"
                    onClick={() => setDemoOpen(true)}
                  >
                    View Demo
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex justify-center"
            >
              <motion.img
                src="/page3.jpg"
                alt="Construction Plans Analysis"
                className="max-w-full h-auto rounded-lg shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* ===== HOW IT WORKS SECTION ===== */}
      <HowItWorks />
      
      {/* ===== FEATURES CARDS ===== */}
      <motion.section
        id="features"
        className="py-16 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Building className="h-12 w-12 text-risa-primary" />,
                title: "Residential Construction",
                desc: "Generate accurate quotes for residential projects from architectural plans",
                features: ["Single-family homes", "Multi-unit housing", "Renovations"],
              },
              {
                icon: <ClipboardCheck className="h-12 w-12 text-risa-primary" />,
                title: "Commercial Projects",
                desc: "Precise estimation for office buildings, retail spaces, and more",
                features: ["Office complexes", "Retail spaces", "Mixed-use developments"],
              },
              {
                icon: <DraftingCompass className="h-12 w-12 text-risa-primary" />,
                title: "Infrastructure",
                desc: "Specialized tools for civil engineering and infrastructure projects",
                features: ["Bridges", "Roads", "Public works"],
              },
            ].map((product, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3 bg-risa-primary/10">
                    <div className="flex justify-center mb-4">{product.icon}</div>
                    <CardTitle className="text-center text-gray-800 dark:text-white">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{product.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {product.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-risa-primary mr-2">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* ===== PRICING SECTION ===== */}
      <motion.section
        id="pricing"
        className="py-20 bg-white dark:bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h2 
            className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Choose the plan that fits your construction business needs.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Starter", price: "$0", popular: false, features: ["Up to 5 plans/month", "Basic quote generation", "Email Support", "Standard templates"] },
              { name: "Professional", price: "$299", popular: true, features: ["Unlimited plans", "Advanced AI analysis", "Priority Support", "Custom templates", "Team collaboration"] },
              { name: "Enterprise", price: "Custom", popular: false, features: ["Unlimited everything", "Dedicated account manager", "White-label reports", "API access", "On-premise deployment"] },
            ].map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-500 h-full flex flex-col bg-white dark:bg-gray-800 ${
                    tier.popular ? "border-risa-primary shadow-xl ring-2 ring-risa-primary/20" : ""
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-risa-primary text-white text-xs font-bold px-4 py-1">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-800 dark:text-white">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">{tier.price}</span>
                      {tier.price !== "Custom" && tier.price !== "$0" && <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3 mb-6 text-left">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-risa-primary mr-2">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => navigate('/auth')}
                      className={`w-full ${
                        tier.popular
                          ? "bg-risa-primary hover:bg-risa-primaryLight"
                          : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
                      } text-white lowercase mt-auto py-4`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* ===== TESTIMONIALS SECTION ===== */}
      <motion.section
        id="testimonials"
        className="py-20 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            What Our Customers Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: "Sarah K.", 
                role: "Project Manager", 
                company: "BuildRight Construction", 
                text: "Constructly has cut our quoting time by 70%. The accuracy of material estimates has improved our profitability significantly.",
                avatar: "/avatar1.jpg"
              },
              { 
                name: "James L.", 
                role: "Estimator", 
                company: "Precision Builders", 
                text: "The AI analysis is incredibly accurate. We've reduced estimation errors by 90% since implementing Constructly.",
                avatar: "/avatar2.jpg"
              },
              { 
                name: "Marta R.", 
                role: "Business Owner", 
                company: "R&R Construction", 
                text: "As a small business, Constructly gives us the estimating power of large corporations. Our quotes are now more competitive than ever.",
                avatar: "/avatar3.jpg"
              },
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-white dark:bg-gray-800 p-8 text-left transition-all duration-300 h-full flex flex-col transform hover:scale-105">
                  <div className="flex text-risa-primary mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic text-lg">"{t.text}"</p>
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 rounded-full bg-risa-primary/20 flex items-center justify-center mr-4">
                      <span className="text-risa-primary font-bold text-lg">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">{t.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t.role}, {t.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* ===== FAQ SECTION ===== */}
      <FaqSection />
      
      {/* ===== FOOTER ===== */}
      <motion.footer
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <DraftingCompass className="h-6 w-6 text-risa-primary" />
                <span className="text-xl font-bold">Constructly</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Advanced construction plan analysis and quote generation for the modern construction industry.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Navigation</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollTo('features')} className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left">Pricing</button></li>
                <li><button onClick={() => scrollTo('testimonials')} className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left">Testimonials</button></li>
                <li><button onClick={() => scrollTo('faq')} className="text-gray-700 dark:text-gray-300 hover:text-risa-primary text-left">FAQ</button></li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-200 dark:border-gray-700 my-8" />
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            © 2023 Constructly. All rights reserved.
          </div>
        </div>
      </motion.footer>
      
      {/* Modals */}
      <VideoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
};

export default Index;