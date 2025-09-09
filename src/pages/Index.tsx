import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  Phone,
  CheckSquare,
  HardDrive,
  Download,
  DollarSign,
  Smartphone,
  ChevronRight,
  CheckCircle,
  PieChart,
  FileStack,
  Plus,
  Minus,
  Shield,
  Hammer,
  Zap,
  Server,
  Database,
  Code,
  Cloud,
  Target,
  Lightbulb,
  Headphones,
  ChevronLeft,
  Quote,
  Check,
  Eye,
  Star,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Pickaxe,
  CheckCircle2,
  FileCheck,
  Building2,
  TargetIcon,
  Coins,
  BadgeCheck,
  FileBarChart,
  FileCode,
  FileSearch,
  FileDigit,
  FileOutput,
  FileSpreadsheet,
  FileSymlink,
  FileX,
  FileJson,
  FileKey,
  FileLock,
  FileTextIcon,
  FileType,
  FileUp,
  FileUser,
  FileVideo,
  FileVolume,
  FileWarning,
  FileHeart,
  FileDiff,
  FileCog,
  FileInput,
  FileDown,
  FileClock,
  FileCode2,
  FileCheck2,
  FileAxis3D,
  FileAudio,
  FileBadge,
  FileBox,
  FileChartColumn,
  FileChartLine,
  FileChartPie,
  FileImage,
  FileSignature,
  FileSliders,
  FileStackIcon,
  FileTerminal,
  FileTextIcon as FileTextIcon2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// New color palette based on KCA blue, RISA green, and purple
const KCA_BLUE = "#0054A4";           // KCA website blue
const RISA_GREEN = "#00A651";         // RISA green color
const PURPLE_ACCENT = "#6A0DAD";      // Rich purple accent
const DARK_NAVY = "#0A1931";          // Dark Navy Blue
const LIGHT_CREAM = "#F8F5F0";        // Light Cream
const CHARCOAL = "#333333";           // Charcoal Gray

// Tier interface from old version
export interface Tier {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
}

// ===== PAYMENT METHOD COMPONENT (from old version) =====
const PaymentMethod = ({ method }) => {
  return (
    <div
      className="
        border p-7 rounded-2xl text-center shadow-sm transition-all duration-300 
        hover:shadow-md hover:border-blue-200 transition-transform hover:-translate-y-1 
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
      "
    >
      <div className="text-4xl mb-4 ">{method.icon}</div>
      <h4 className="font-bold text-xl mb-2">{method.name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {method.description}
      </p>
    </div>
  );
};

// ===== TESTIMONIALS SECTION =====
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = [
    {
      quote: "Constructly reduced our estimation time by 70% and improved accuracy by 40%. The AI-powered insights have transformed how we approach project budgeting.",
      name: "Michael Johnson",
      title: "Senior Estimator",
      company: "ConstructCo Ltd",
      rating: 5,
      results: [
        { value: "70%", label: "Time Reduction" },
        { value: "40%", label: "Accuracy Improvement" }
      ]
    },
    {
      quote: "The AI-powered insights have transformed how we approach project budgeting. We're now able to bid on more projects with confidence in our cost projections.",
      name: "Sarah Williams",
      title: "Project Director",
      company: "UrbanBuild Group",
      rating: 5,
      results: [
        { value: "35%", label: "More Projects" },
        { value: "25%", label: "Team Productivity" }
      ]
    },
    {
      quote: "An essential tool for any modern construction firm. The ROI was immediate, and our team has embraced the platform wholeheartedly for all our estimation needs.",
      name: "David Chen",
      title: "CTO",
      company: "Skyline Developments",
      rating: 4,
      results: [
        { value: "90%", label: "ROI in 3 months" },
        { value: "100%", label: "Team Adoption" }
      ]
    }
  ];
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, testimonials.length]);
  const currentTestimonial = testimonials[activeIndex];
  return (
    <section id="testimonials" className="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
            <Star className="w-3 h-3 mr-1" /> Client Testimonials
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base">
            Hear from industry professionals who have transformed their estimation process with our solution.
          </p>
        </motion.div>
        <div className="max-w-5xl mx-auto relative mb-16 md:mb-20">
          <div className="relative h-auto overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-2 p-4 md:p-6 lg:p-8">
                    <div className="text-blue-500 text-3xl md:text-4xl mb-4">
                      <Quote className="opacity-70" />
                    </div>
                    <p className="text-base md:text-lg text-gray-800 dark:text-white mb-6 leading-relaxed italic">
                      "{currentTestimonial.quote}"
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="bg-blue-600 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                          {currentTestimonial.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 md:ml-4">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">{currentTestimonial.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{currentTestimonial.title}, {currentTestimonial.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 md:w-5 md:h-5 ${i < currentTestimonial.rating ? "text-blue-500 fill-blue-200" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Achievements</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {currentTestimonial.results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
                        >
                          <div className="text-xl md:text-2xl font-extrabold text-blue-600 mb-1">{result.value}</div>
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{result.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-4 md:mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 transition-colors duration-300"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Moon className="h-4 w-4 md:h-5 md:w-5" /> : <Sun className="h-4 w-4 md:h-5 md:w-5" />}
      </motion.button>
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-800 dark:text-white bg-white/80 hover:bg-white rounded-full p-2"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </motion.button>
        </div>
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full h-auto rounded-lg"
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
      icon: <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />,
      items: [
        {
          question: "What file formats does Constructly support?",
          answer: (
            <div className="space-y-3">
              <p>Constructly supports all major CAD formats including:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>DWG and DXF (AutoCAD formats)</li>
                <li>PDF documents with vector data</li>
                <li>Image formats: JPG, PNG, TIFF</li>
                <li>Revit files (RVT)</li>
                <li>SketchUp files (SKP)</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
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
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>Over 95% accuracy on standard construction plans</li>
                <li>90-93% accuracy on complex or custom designs</li>
                <li>Consistent results across various project types</li>
              </ul>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-300">
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
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>Your company logo and branding</li>
                <li>Custom categories and item descriptions</li>
                <li>Company-specific terminology</li>
                <li>Flexible pricing structures</li>
                <li>Multiple currency and unit options</li>
              </ol>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-300">
                <p>Professional and Enterprise plans offer advanced customization options.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    "Account & Billing": {
      icon: <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />,
      items: [
        {
          question: "What payment methods are accepted?",
          answer: (
            <div className="space-y-3">
              <p>We accept various payment methods:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300">
                  <h4 className="font-medium mb-2">Online Payments</h4>
                  <ul className="space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• PayPal</li>
                    <li>• Bank Transfer</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
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
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>Log in to your account</li>
                <li>Navigate to 'Billing' section</li>
                <li>Select 'Change Plan'</li>
                <li>Choose your new plan</li>
                <li>Confirm the changes</li>
              </ol>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300">
                <p>Note: Plan changes take effect immediately. Prorated charges or credits will be applied to your next invoice.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    "Technical Support": {
      icon: <Settings className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />,
      items: [
        {
          question: "What should I do if I'm having trouble uploading plans?",
          answer: (
            <div className="space-y-3">
              <p>If you're experiencing upload issues:</p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>Check your internet connection</li>
                <li>Ensure your file format is supported</li>
                <li>Verify the file is not corrupted or password protected</li>
                <li>Try compressing large files before uploading</li>
                <li>Contact support if issues persist</li>
              </ol>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
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
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                  <h4 className="font-medium mb-2">File Preparation</h4>
                  <ul className="space-y-1">
                    <li>• Use vector formats when possible</li>
                    <li>• Ensure clear dimension labels</li>
                    <li>• Use standard architectural scales</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300">
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
    <section id="faq" className="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Frequently Asked Questions
        </motion.h2>
        {/* Category Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8"
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
              className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full transition-all text-sm ${
                activeCategory === key
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
              <span className="font-medium">{key}</span>
            </motion.button>
          ))}
        </motion.div>
        {/* Search Bar */}
        <motion.div 
          className="max-w-xl mx-auto mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder={`Search ${activeCategory} FAQs...`}
              className="w-full pl-10 pr-4 py-2 md:py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
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
          className="grid md:grid-cols-2 gap-4 md:gap-6"
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
                  className="w-full p-4 md:p-6 text-left flex justify-between items-center"
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-white pr-4">{faq.question}</h3>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    className="text-blue-500 flex-shrink-0"
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
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
                      className="px-4 md:px-6 pb-4 md:pb-6 text-gray-700 dark:text-gray-300 text-sm overflow-hidden"
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
          className="mt-10 md:mt-12 p-6 md:p-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4">Need More Help?</h3>
          <p className="mb-6 opacity-90 text-sm md:text-base">Our support team is available to assist you</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <motion.a 
              href="tel:9499515815" 
              className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PhoneCall className="w-4 h-4" />
              Call Support: 949 951 5815
            </motion.a>
            <motion.a 
              href="mailto:support@constructly.com"
              className="border border-white text-white hover:bg-white hover:text-blue-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-4 h-4" />
              Email Us
            </motion.a>
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
      icon: <UploadCloud className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Upload Plans",
      desc: "Upload your construction plans in various formats including DWG, PDF, and image files with our drag-and-drop interface.",
      color: "bg-blue-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "AI Analysis",
      desc: "Our advanced AI algorithms analyze materials, dimensions, and requirements with industry-leading accuracy.",
      color: "bg-green-600"
    },
    {
      icon: <Calculator className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Automated Calculations",
      desc: "Get precise quantity takeoffs and cost estimates with detailed breakdowns and customizable parameters.",
      color: "bg-purple-600"
    },
    {
      icon: <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Generate Professional Quote",
      desc: "Create professional, branded quotes ready to send to clients with automated formatting and company branding.",
      color: "bg-blue-700"
    }
  ];
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
            <ClipboardCheck className="w-3 h-3 mr-1" /> Process
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            How Constructly Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base">
            Transform your construction plans into accurate, professional quotes with our specialized analysis system
          </p>
        </motion.div>
        <div className="relative">
          {/* Timeline for desktop */}
          <div className="absolute hidden md:block top-16 left-0 right-0 h-0.5 bg-blue-300 transform -translate-y-1/2 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${step.color} flex items-center justify-center mb-4 shadow-lg relative`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.icon}
                    <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                      {i + 1}
                    </div>
                  </motion.div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Get Started Today <ArrowRight className="ml-2 h-4 w-4 inline" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

// ===== WHO IT'S FOR SECTION (Redesigned with modern layout) =====
const WhoItsForSection = () => {
  return (
    <section className="py-14 bg-white dark:bg-gray-900" aria-labelledby="who-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
            <TargetIcon className="w-3 h-3 mr-1" /> Tailored for your workflow
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4" id="who-title">
            Who It's For
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base">
            Designed specifically for construction professionals in Kenya
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {[
            { icon: "🏗️", role: "Contractors", desc: "Bring your own rates & margins." },
            { icon: "📐", role: "Quantity Surveyors", desc: "Takeoffs, BOQs & exports." },
            { icon: "🏘️", role: "SMEs & Developers", desc: "Clear pricing, better decisions." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-transform overflow-hidden group">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{item.role}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== ICON GRID SECTION (Replaces Marquee) =====
const IconGrid = () => {
  const icons = [
    { icon: <Building2 className="h-10 w-10 text-blue-600" />, label: "Contractors" },
    { icon: <Calculator className="h-10 w-10 text-green-600" />, label: "Quantity Surveyors" },
    { icon: <TrendingUp className="h-10 w-10 text-purple-600" />, label: "SMEs" },
    { icon: <HardHat className="h-10 w-10 text-blue-600" />, label: "Construction Managers" },
    { icon: <ClipboardCheck className="h-10 w-10 text-green-600" />, label: "Project Managers" },
    { icon: <BarChart3 className="h-10 w-10 text-purple-600" />, label: "Developers" },
    { icon: <FileText className="h-10 w-10 text-blue-600" />, label: "Architects" },
    { icon: <Ruler className="h-10 w-10 text-green-600" />, label: "Engineers" },
  ];

  return (
    <section className="py-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Trusted by Professionals Across the Industry
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base">
            Construction professionals from various specialties rely on Constructly for accurate estimates and efficient project management
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {icons.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </motion.div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== CTA BANNER (Redesigned with modern layout) =====
const CTABanner = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-10 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-2xl overflow-hidden">
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="uppercase tracking-wider text-white/80 text-xs mb-1">Ready to build better?</p>
                <h3 className="text-2xl md:text-3xl font-bold">Create your first quote in minutes</h3>
                <p className="text-white/80 mt-2">No credit card required. Cancel anytime.</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white text-gray-800 font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => navigate("/auth?mode=signin")}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-gray-900 text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Get Started
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

// ===== LOGO COMPONENT =====
const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div className="flex items-center group select-none">
    <div className="p-2 rounded-xl bg-transaparent shadow-md group-hover:scale-105 transition-transform">
      <Pickaxe className="w-5 h-5 text-blue-600 dark:text-white" />
    </div>
    {!compact && (
      <span className="ml-2 font-bold text-lg sm:text-2xl text-blue-600 dark:text-white">
        Constructly
      </span>
    )}
  </div>
);

// ===== MAIN COMPONENT =====
const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Pricing data from old version
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState<string | null>(null);

  // Payment methods from old version
  const paymentMethods = [
    {
      id: "credit",
      name: "Credit/Debit Card",
      icon: <CreditCard className="w-10 h-10" />,
      description: "Secure payments via Visa, Mastercard, and American Express.",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: <Smartphone className="w-10 h-10" />,
      description: "Convenient mobile payments for Kenyan users.",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: <DollarSign className="w-10 h-10" />,
      description: "Direct bank transfers for enterprise payments.",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <Coins className="w-10 h-10" />,
      description: "International payments processed securely.",
    },
  ];

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

  // Fetch tiers from database (from old version)
  useEffect(() => {
    let cancelled = false;
    const fetchTiers = async () => {
      setTiersLoading(true);
      setTiersError(null);
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("id", { ascending: true });
      if (cancelled) return;
      if (error) {
        setTiersError(error.message || "Failed to load pricing tiers.");
        setTiers([]);
      } else {
        setTiers(Array.isArray(data) ? data : []);
      }
      setTiersLoading(false);
    };
    fetchTiers();
    return () => {
      cancelled = true;
    };
  }, []);

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
      {/* Custom styles for new color palette */}
      <style>
        {`
          /* KCA Blue color palette */
          .bg-blue-100 { background-color: #E6F0FF; }
          .bg-blue-200 { background-color: #BFD9FF; }
          .bg-blue-300 { background-color: #99C2FF; }
          .bg-blue-400 { background-color: #4D94FF; }
          .bg-blue-500 { background-color: #0054A4; }
          .bg-blue-600 { background-color: #00468C; }
          .bg-blue-700 { background-color: #003874; }
          .bg-blue-800 { background-color: #002B5C; }
          .bg-blue-900 { background-color: #001D44; }
          
          .text-blue-100 { color: #E6F0FF; }
          .text-blue-200 { color: #BFD9FF; }
          .text-blue-300 { color: #99C2FF; }
          .text-blue-400 { color: #4D94FF; }
          .text-blue-500 { color: #0054A4; }
          .text-blue-600 { color: #00468C; }
          .text-blue-700 { color: #003874; }
          .text-blue-800 { color: #002B5C; }
          .text-blue-900 { color: #001D44; }
          
          .border-blue-100 { border-color: #E6F0FF; }
          .border-blue-200 { border-color: #BFD9FF; }
          .border-blue-300 { border-color: #99C2FF; }
          .border-blue-400 { border-color: #4D94FF; }
          .border-blue-500 { border-color: #0054A4; }
          .border-blue-600 { border-color: #00468C; }
          .border-blue-700 { border-color: #003874; }
          .border-blue-800 { border-color: #002B5C; }
          .border-blue-900 { border-color: #001D44; }
          
          .ring-blue-500 { --tw-ring-color: #0054A4; }
          .ring-blue-600 { --tw-ring-color: #00468C; }
          
          .hover\\:bg-blue-600:hover { background-color: #00468C; }
          .hover\\:text-blue-600:hover { color: #00468C; }
          .hover\\:border-blue-600:hover { border-color: #00468C; }
          
          .from-blue-600 { --tw-gradient-from: #00468C; --tw-gradient-to: rgba(0, 70, 140, 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
          .to-blue-800 { --tw-gradient-to: #002B5C; }
          
          /* RISA Green color palette */
          .bg-green-100 { background-color: #E6F7ED; }
          .bg-green-200 { background-color: #BFEBD1; }
          .bg-green-300 { background-color: #99DFB5; }
          .bg-green-400 { background-color: #4DC77E; }
          .bg-green-500 { background-color: #00A651; }
          .bg-green-600 { background-color: #008E44; }
          .bg-green-700 { background-color: #007637; }
          .bg-green-800 { background-color: #005E2A; }
          .bg-green-900 { background-color: #00461D; }
          
          .text-green-100 { color: #E6F7ED; }
          .text-green-200 { color: #BFEBD1; }
          .text-green-300 { color: #99DFB5; }
          .text-green-400 { color: #4DC77E; }
          .text-green-500 { color: #00A651; }
          .text-green-600 { color: #008E44; }
          .text-green-700 { color: #007637; }
          .text-green-800 { color: #005E2A; }
          .text-green-900 { color: #00461D; }
          
          .border-green-100 { border-color: #E6F7ED; }
          .border-green-200 { border-color: #BFEBD1; }
          .border-green-300 { border-color: #99DFB5; }
          .border-green-400 { border-color: #4DC77E; }
          .border-green-500 { border-color: #00A651; }
          .border-green-600 { border-color: #008E44; }
          .border-green-700 { border-color: #007637; }
          .border-green-800 { border-color: #005E2A; }
          .border-green-900 { border-color: #00461D; }
          
          /* Purple accent color palette */
          .bg-purple-100 { background-color: #F4E6FF; }
          .bg-purple-200 { background-color: #E3BFFF; }
          .bg-purple-300 { background-color: #D299FF; }
          .bg-purple-400 { background-color: #B14DFF; }
          .bg-purple-500 { background-color: #6A0DAD; }
          .bg-purple-600 { background-color: #5A0B94; }
          .bg-purple-700 { background-color: #4A097B; }
          .bg-purple-800 { background-color: #3A0762; }
          .bg-purple-900 { background-color: #2A0549; }
          
          .text-purple-100 { color: #F4E6FF; }
          .text-purple-200 { color: #E3BFFF; }
          .text-purple-300 { color: #D299FF; }
          .text-purple-400 { color: #B14DFF; }
          .text-purple-500 { color: #6A0DAD; }
          .text-purple-600 { color: #5A0B94; }
          .text-purple-700 { color: #4A097B; }
          .text-purple-800 { color: #3A0762; }
          .text-purple-900 { color: #2A0549; }
          
          .border-purple-100 { border-color: #F4E6FF; }
          .border-purple-200 { border-color: #E3BFFF; }
          .border-purple-300 { border-color: #D299FF; }
          .border-purple-400 { border-color: #B14DFF; }
          .border-purple-500 { border-color: #6A0DAD; }
          .border-purple-600 { border-color: #5A0B94; }
          .border-purple-700 { border-color: #4A097B; }
          .border-purple-800 { border-color: #3A0762; }
          .border-purple-900 { border-color: #2A0549; }
        `}
      </style>

      {/* ===== TOP BAR ===== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 py-1.5 text-sm text-gray-700 dark:text-gray-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end space-x-6 md:space-x-8">
          <div className="relative group">
            <motion.button 
              className="flex items-center lowercase text-gray-700 dark:text-gray-300 hover:text-blue-600 transition text-xs"
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
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
              >
                <Mail className="mr-2 h-4 w-4" /> support
              </a>
              <a
                href="mailto:sales@constructly.com"
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
              >
                <Mail className="mr-2 h-4 w-4" /> sales/general
              </a>
            </div>
          </div>
          <a href="tel:9499515815" className="flex items-center hover:text-blue-600 text-gray-700 dark:text-gray-300 text-xs">
            <PhoneCall className="mr-1 h-3.5 w-3.5" /> 949 951 5815
          </a>
        </div>
      </motion.div>

      {/* ===== ANIMATED NAVBAR ===== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ${
          scrolled ? "py-2" : "py-3 md:py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <DraftingCompass className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-blue-600">Constructly</span>
            </motion.div>
            <div className="hidden lg:flex items-center space-x-6 md:space-x-8">
              <motion.button 
                onClick={() => scrollTo('features')} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Features
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('pricing')} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Pricing
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('how-it-works')} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                How It Works
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('testimonials')} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Testimonials
              </motion.button>
              <motion.button 
                onClick={() => scrollTo('faq')} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                FAQs
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => navigate('/auth')}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-sm flex items-center"
                >
                  <User className="mr-1 h-4 w-4" /> Login
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 md:px-6 md:py-3 text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </button>
              </motion.div>
              <ThemeToggle />
            </div>
            <div className="flex items-center space-x-2 lg:hidden">
              <ThemeToggle />
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="h-9 w-9 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Menu className="h-5 w-5" />
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-6 bg-white dark:bg-gray-800">
                  <div className="flex flex-col space-y-4 mt-8">
                    <motion.button 
                      onClick={() => scrollTo('features')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-left text-sm py-2"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Features
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('pricing')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-left text-sm py-2"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Pricing
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('how-it-works')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-left text-sm py-2"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      How It Works
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('testimonials')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-left text-sm py-2"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Testimonials
                    </motion.button>
                    <motion.button 
                      onClick={() => scrollTo('faq')} 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-left text-sm py-2"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      FAQs
                    </motion.button>
                    <button
                      onClick={() => navigate('/auth')}
                      className="justify-start text-gray-700 dark:text-gray-300 hover:text-blue-600 pl-0 text-sm py-2 flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" /> Login
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/auth')}
                      className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm py-3 rounded-lg"
                    >
                      Get Started
                    </motion.button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          </div>
      </motion.nav>

      {/* ===== HERO SECTION ===== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative py-12 md:py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
                <Star className="w-3 h-3 mr-1" /> Professional Construction Management
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                <span className="text-blue-600">Generate Accurate Quotes in Minutes</span>
              </h1>
              <p className="text-lg md:text-xl mb-6 md:mb-8 leading-relaxed text-gray-700 dark:text-gray-300">
                Upload your construction plans and get precise material estimates and professional quotes in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 md:px-8 md:py-4 font-medium text-sm md:text-base rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Get Started
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    className="bg-white dark:bg-gray-800 border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 md:px-8 md:py-4 font-medium text-sm md:text-base rounded-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => setDemoOpen(true)}
                  >
                    View Demo
                  </button>
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

      {/* ===== ICON GRID SECTION (Replaces Marquee) ===== */}
      <IconGrid />

      {/* ===== WHO IT'S FOR SECTION ===== */}
      <WhoItsForSection />

      {/* ===== HOW IT WORKS SECTION ===== */}
      <HowItWorks />

      {/* ===== FEATURES CARDS ===== */}
      <motion.section
        id="features"
        className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
              <FileText className="w-3 h-3 mr-1" /> All-in-one toolkit
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Everything you need to manage construction projects
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base">
              Comprehensive features designed specifically for construction professionals
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <FileText className="w-7 h-7 text-blue-600" />,
                title: "Professional Quotes",
                description: "Detailed, accurate proposals with your rates, margins, and timelines.",
              },
              {
                icon: <Calculator className="w-7 h-7 text-green-600" />,
                title: "Cost Calculator",
                description: "Live calculations with regional multipliers and service rates.",
              },
              {
                icon: <Users className="w-7 h-7 text-purple-600" />,
                title: "Client Management",
                description: "Track clients, projects, and approvals in one place.",
              },
              {
                icon: <TrendingUp className="w-7 h-7 text-blue-600" />,
                title: "Business Analytics",
                description: "See revenue, conversion, and project KPIs at a glance.",
              },
              {
                icon: <Building className="w-7 h-7 text-green-600" />,
                title: "Project Types",
                description: "Residential, commercial, and infrastructure supported.",
              },
              {
                icon: <Clock className="w-7 h-7 text-purple-600" />,
                title: "Time Tracking",
                description: "Keep timelines on track with milestones and reminders.",
              },
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-100 to-blue-200">
                    <div className="flex justify-center mb-4">{f.icon}</div>
                    <CardTitle className="text-center text-gray-800 dark:text-white text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                    <p className="text-gray-600 dark:text-gray-300 text-sm text-center">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== PRICING SECTION (from old version) ===== */}
      <motion.section
        id="pricing"
        className="py-20"
        aria-labelledby="pricing-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
              <Star className="w-3 h-3 mr-1" /> Start free
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4" id="pricing-title">
              Choose your plan
            </h2>
          </div>

          {/* Loading / Error states */}
          {tiersLoading && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10"
              aria-live="polite"
              aria-busy
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="rounded-2xl border-0 shadow-xl bg-white/60 dark:bg-slate-900/60"
                >
                  <CardContent className="p-8 animate-pulse">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <div
                          key={j}
                          className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"
                        />
                      ))}
                    </div>
                    <div className="h-11 w-full bg-slate-200 dark:bg-slate-800 rounded mt-8" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tiersError && (
            <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
              Failed to load pricing tiers: {tiersError}
            </div>
          )}

          {!tiersLoading && !tiersError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {tiers.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <Card
                    className={`relative rounded-2xl border-0 shadow-xl transition-transform ${
                      plan.popular ? "ring-2 ring-blue-500 scale-[1.02]" : ""
                    } bg-white/70 dark:bg-slate-900/60`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-1 rounded-full shadow-md">
                        🌟 Most Popular
                      </Badge>
                    )}
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <Sparkles className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="mt-4">
                        <span className="text-4xl font-extrabold text-blue-600">
                          KES {plan.price}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          /{plan.period}
                        </span>
                      </div>
                      <ul className="mt-6 space-y-3">
                        {plan.features?.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                            <span className="text-sm leading-relaxed text-muted-foreground">
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => navigate("/auth?mode=signup")}
                        className={`mt-8 w-full rounded-full py-5 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:shadow-xl"
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ===== PAYMENT OPTIONS SECTION (from old version) ===== */}
      <motion.section
        id="payment-options"
        className="py-16"
        aria-labelledby="payment-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4 text-xs">
              <CreditCard className="w-3 h-3 mr-1" /> Payment options
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4" id="payment-title">
              Variety of payment options
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 w-full mt-10">
            {paymentMethods.map((method, i) => (
              <PaymentMethod key={i} method={method} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <TestimonialsSection />

      {/* ===== FAQ SECTION ===== */}
      <FaqSection />

      {/* ===== CTA BANNER ===== */}
      <CTABanner />

      {/* ===== FOOTER (from old version) ===== */}
      <motion.footer
        id="contact"
        className="border-t border-white/30 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Empowering construction professionals across Kenya with modern
              quote, takeoff, and project tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm mb-8">
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    className="hover:underline hover:text-blue-600"
                    href="#features"
                  >
                    Quote Builder
                  </a>
                </li>
                <li>
                  <a
                    className="hover:underline hover:text-blue-600"
                    href="#features"
                  >
                    Project Management
                  </a>
                </li>
                <li>
                  <a
                    className="hover:underline hover:text-blue-600"
                    href="#features"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-center ">
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2  justify-center items-center">
                <li className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a
                    className="hover:underline"
                    href="mailto:support@elaris.africa"
                  >
                    support@elaris.africa
                  </a>
                </li>
                <li>
                  <a
                    className="hover:underline hover:text-blue-600"
                    href="#faq"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a className="hover:underline hover:text-blue-600" href="#">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-right">
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a className="hover:underline hover:text-blue-600" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:underline hover:text-blue-600" href="#">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-3.5 h-3.5" />{" "}
              <span>+254 700 000 000</span>
              <span className="hidden sm:inline">•</span>
              <a
                className="inline-flex items-center gap-1 hover:underline"
                href="#"
                rel="noreferrer"
              >
                Learn more <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div>© {new Date().getFullYear()} Elaris. All rights reserved.</div>
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