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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// RISA Color Palette
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";
const KCA_GOLD = "#D4AF37";
const KCA_GOLD_DARK = "#B8860B";

// Define card colors using RISA's palette (for icons)
const ICON_COLORS = [
  RISA_BLUE,
  RISA_LIGHT_BLUE,
  RISA_BLUE,
  RISA_LIGHT_BLUE,
  RISA_BLUE,
  RISA_LIGHT_BLUE,
];

export interface Tier {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
}

const PaymentMethod = ({ method }) => {
  return (
    <div className="flex items-center justify-center p-2">
      <img
        src={method.image}
        alt={method.name}
        className="h-14 w-auto object-contain" // consistent height, scales down
        loading="lazy"
      />
    </div>
  );
};

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = [
    {
      quote:
        "JTech AI reduced our estimation time by 70% and improved accuracy by 40%. The AI-powered insights have transformed how we approach project budgeting.",
      name: "Michael Johnson",
      title: "Senior Estimator",
      company: "JTech AI Ltd",
      rating: 5,
      results: [
        { value: "70%", label: "Time Reduction" },
        { value: "40%", label: "Accuracy Improvement" },
      ],
    },
    {
      quote:
        "The AI-powered insights have transformed how we approach project budgeting. We're now able to bid on more projects with confidence in our cost projections.",
      name: "Sarah Williams",
      title: "Project Director",
      company: "UrbanBuild Group",
      rating: 5,
      results: [
        { value: "35%", label: "More Projects" },
        { value: "25%", label: "Team Productivity" },
      ],
    },
    {
      quote:
        "An essential tool for any modern construction firm. The ROI was immediate, and our team has embraced the platform wholeheartedly for all our estimation needs.",
      name: "David Chen",
      title: "CTO",
      company: "Skyline Developments",
      rating: 4,
      results: [
        { value: "90%", label: "ROI in 3 months" },
        { value: "100%", label: "Team Adoption" },
      ],
    },
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
    <section
      id="testimonials"
      className="py-16 md:py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <Badge className="mb-4 text-xs bg-blue-600 text-white dark:bg-blue-700">
            <Star className="w-3 h-3 mr-1" /> Client Testimonials
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Trusted by Industry Leaders
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base dark:text-gray-300">
            Hear from professionals who transformed their workflow with Jtech AI.
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
                    <div className="text-blue-500 text-3xl md:text-4xl mb-4 dark:text-blue-400">
                      <Quote className="opacity-70" />
                    </div>
                    <p className="text-lg mb-6 leading-relaxed italic text-gray-900 dark:text-gray-100">
                      "{currentTestimonial.quote}"
                    </p>
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: KCA_GOLD }}
                      >
                        {currentTestimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              i < currentTestimonial.rating
                                ? "text-blue-500 fill-blue-200 dark:text-blue-400 dark:fill-blue-800"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 md:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Key Achievements
                    </h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {currentTestimonial.results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="bg-white p-3 md:p-4 rounded-lg border shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center dark:bg-gray-800 dark:border-gray-600"
                          style={{ borderColor: RISA_BLUE }}
                        >
                          <div className="text-xl md:text-2xl font-extrabold text-blue-600 mb-1 dark:text-blue-400">
                            {result.value}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                            {result.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="flex justify-center mt-4 md:mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex
                      ? "bg-blue-500 dark:bg-blue-400"
                      : "bg-gray-300 dark:bg-gray-600"
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

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="flex items-center ml-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-gray-100 text-gray-600 transition-colors duration-300 dark:bg-gray-800 dark:text-gray-300"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Moon className="h-4 w-4 md:h-5 md:w-5" />
        ) : (
          <Sun className="h-4 w-4 md:h-5 md:w-5" />
        )}
      </motion.button>
    </div>
  );
};

const VideoModal = ({ isOpen, onClose }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((error) => {
        console.log("Autoplay was prevented:", error);
      });
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
            className="text-gray-800 bg-white/80 hover:bg-white rounded-full p-2 dark:text-white dark:bg-gray-800/80"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </motion.button>
        </div>
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          loop
          muted
          className="w-full h-auto rounded-lg"
          style={{ maxHeight: "80vh" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>
    </motion.div>
  );
};

const FaqSection = () => {
  const [activeCategory, setActiveCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const faqsData = {
    General: {
      icon: (
        <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
      ),
      items: [
        {
          question: "What file formats does JTech AI support?",
          answer: (
            <div className="space-y-3">
              <p>JTech AI supports all major CAD formats including:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm dark:text-gray-300">
                <li>DWG and DXF (AutoCAD formats)</li>
                <li>PDF documents with vector data</li>
                <li>Image formats: JPG, PNG, TIFF</li>
                <li>Revit files (RVT)</li>
                <li>SketchUp files (SKP)</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded border text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
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
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm dark:text-gray-300">
                <li>Over 95% accuracy on standard construction plans</li>
                <li>90-93% accuracy on complex or custom designs</li>
                <li>Consistent results across various project types</li>
              </ul>
              <div className="bg-green-50 p-3 rounded border text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
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
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm dark:text-gray-300">
                <li>Your company logo and branding</li>
                <li>Custom categories and item descriptions</li>
                <li>Company-specific terminology</li>
                <li>Flexible pricing structures</li>
                <li>Multiple currency and unit options</li>
              </ol>
              <div className="bg-green-50 p-3 rounded border text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                <p>Professional and Enterprise plans offer advanced customization options.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    "Account & Billing": {
      icon: (
        <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
      ),
      items: [
        {
          question: "What payment methods are accepted?",
          answer: (
            <div className="space-y-3">
              <p>We accept various payment methods:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded border text-xs text-green-700 dark:bg-gray-800 dark:text-green-300 dark:border-gray-700">
                  <h4 className="font-medium mb-2">Online Payments</h4>
                  <ul className="space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• PayPal</li>
                    <li>• Bank Transfer</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-3 rounded border text-xs text-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:border-gray-700">
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
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm dark:text-gray-300">
                <li>Log in to your account</li>
                <li>Navigate to 'Billing' section</li>
                <li>Select 'Change Plan'</li>
                <li>Choose your new plan</li>
                <li>Confirm the changes</li>
              </ol>
              <div className="bg-purple-50 p-3 rounded border text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                <p>Note: Plan changes take effect immediately. Prorated charges or credits will be applied to your next invoice.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    "Technical Support": {
      icon: (
        <Settings className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
      ),
      items: [
        {
          question: "What should I do if I'm having trouble uploading plans?",
          answer: (
            <div className="space-y-3">
              <p>If you're experiencing upload issues:</p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm dark:text-gray-300">
                <li>Check your internet connection</li>
                <li>Ensure your file format is supported</li>
                <li>Verify the file is not corrupted or password protected</li>
                <li>Try compressing large files before uploading</li>
                <li>Contact support if issues persist</li>
              </ol>
              <div className="bg-red-50 p-3 rounded border text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
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
                <div className="bg-blue-50 p-3 rounded border text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                  <h4 className="font-medium mb-2">File Preparation</h4>
                  <ul className="space-y-1">
                    <li>• Use vector formats when possible</li>
                    <li>• Ensure clear dimension labels</li>
                    <li>• Use standard architectural scales</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded border text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
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
          className="text-2xl md:text-3xl font-semibold text-center mb-10 md:mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Frequently Asked Questions
        </motion.h2>

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
                  ? "text-white bg-blue-600 shadow-lg dark:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
              <span className="font-medium">{key}</span>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          className="max-w-xl mx-auto mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 dark:text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${activeCategory} FAQs...`}
              className="w-full pl-10 pr-4 py-2 md:py-3 rounded-lg border bg-white placeholder-gray-500 text-gray-900 focus:ring-2 focus:border-transparent transition-all duration-300 text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
              style={{
                borderColor: RISA_BLUE,
                outline: "none",
                boxShadow: `0 0 0 2px ${RISA_BLUE}`,
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </motion.div>

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
                className="bg-white rounded-xl border overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                style={{ borderColor: RISA_BLUE }}
                whileHover={{ y: -5 }}
              >
                <motion.button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-4 md:p-6 text-left flex justify-between items-center text-gray-900 dark:text-white"
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-sm md:text-base font-medium pr-4">
                    {faq.question}
                  </h3>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    className="text-blue-600 dark:text-blue-400"
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
                          opacity: { duration: 0.4, delay: 0.1 },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.2 },
                        },
                      }}
                      className="px-4 md:px-6 pb-4 md:pb-6 text-gray-700 text-sm overflow-hidden dark:text-gray-300"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-10 md:mt-12 p-6 md:p-8 text-center text-white"
          style={{ backgroundColor: RISA_BLUE }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <h3 className="text-xl md:text-2xl font-semibold mb-4">
            Need More Help?
          </h3>
          <p className="mb-6 opacity-90 text-sm md:text-base">
            Our support team is available to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <motion.a
              href="tel:9499515815"
              className="bg-white text-blue-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm dark:bg-gray-800 dark:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PhoneCall className="w-4 h-4" />
              Call Support: 949 951 5815
            </motion.a>
            <motion.a
              href="mailto:support@jtechai.com"
              className="border border-white text-white hover:bg-white hover:text-blue-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm dark:hover:bg-gray-800 dark:hover:text-blue-400"
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

const HowItWorks = () => {
  const steps = [
    {
      icon: <UploadCloud className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Upload Plans",
      desc: "Upload your construction plans in various formats including DWG, PDF, and image files with our drag-and-drop interface.",
      color: RISA_BLUE,
    },
    {
      icon: <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "AI Analysis",
      desc: "Our advanced AI algorithms analyze materials, dimensions, and requirements with industry-leading accuracy.",
      color: RISA_LIGHT_BLUE,
    },
    {
      icon: <Calculator className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Automated Calculations",
      desc: "Get precise quantity takeoffs and cost estimates with detailed breakdowns and customizable parameters.",
      color: RISA_BLUE,
    },
    {
      icon: <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Generate Professional Quote",
      desc: "Create professional, branded quotes ready to send to clients with automated formatting and company branding.",
      color: RISA_LIGHT_BLUE,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 md:py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge className="mb-4 text-xs bg-blue-600 text-white dark:bg-blue-700">
            <ClipboardCheck className="w-3 h-3 mr-1" /> Process
          </Badge>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
            How JTech AI Works
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-base dark:text-gray-300">
            Transform your construction plans into accurate, professional quotes with our specialized analysis system
          </p>
        </motion.div>
        <div className="relative">
          <div
            className="absolute hidden md:block top-16 left-0 right-0 h-0.5"
            style={{
              backgroundColor: RISA_BLUE,
              transform: "translateY(-50%)",
            }}
          ></div>
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
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 shadow-lg relative`}
                    style={{ backgroundColor: step.color }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.icon}
                    <div className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md dark:bg-gray-800 dark:text-blue-400">
                      {i + 1}
                    </div>
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm dark:text-gray-300">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const WhoItsForSection = () => {
  const professionals = [
    {
      icon: <Building2 className="h-10 w-10 text-white" />,
      title: "General Contractors",
      description:
        "Quickly generate accurate quotes for clients and manage multiple projects efficiently.",
      features: ["Project estimation", "Client management", "Cost tracking"],
      color: ICON_COLORS[0],
    },
    {
      icon: <Calculator className="h-10 w-10 text-white" />,
      title: "Quantity Surveyors",
      description:
        "Streamline your takeoff process with AI-powered measurement tools.",
      features: [
        "Automated takeoffs",
        "Precision measurements",
        "Custom reports",
      ],
      color: ICON_COLORS[1],
    },
    {
      icon: <ClipboardCheck className="h-10 w-10 text-white" />,
      title: "Construction Managers",
      description:
        "Keep projects on budget with real-time cost monitoring and forecasting.",
      features: [
        "Budget management",
        "Resource allocation",
        "Progress tracking",
      ],
      color: ICON_COLORS[2],
    },
    {
      icon: <HardHat className="h-10 w-10 text-white" />,
      title: "Subcontractors",
      description:
        "Submit competitive bids faster with accurate material and labor estimates.",
      features: [
        "Specialized estimating",
        "Quick proposals",
        "Trade-specific templates",
      ],
      color: ICON_COLORS[3],
    },
    {
      icon: <Ruler className="h-10 w-10 text-white" />,
      title: "Construction Estimators",
      description:
        "Enhance your estimating workflow with AI-assisted quantity takeoffs.",
      features: [
        "AI measurements",
        "Database integration",
        "Historical data analysis",
      ],
      color: ICON_COLORS[4],
    },
    {
      icon: <Home className="h-10 w-10 text-white" />,
      title: "Home Builders",
      description:
        "Create detailed estimates for residential projects of any scale.",
      features: [
        "Residential templates",
        "Material optimization",
        "Client presentations",
      ],
      color: ICON_COLORS[5],
    },
  ];

  const navigate = useNavigate();

  return (
    <section id="who-its-for" className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge className="mb-4 text-xs bg-blue-600 text-white dark:bg-blue-700">
            <Users className="w-3 h-3 mr-1" /> Designed For Professionals
          </Badge>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
            Who Uses JTech AI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base dark:text-gray-300">
            Built for construction professionals across all specialties and
            project types
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {professionals.map((pro, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="h-full"
            >
              {/* Redesigned Card: Sharp, Professional, No Colored Top */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center mb-5">
                    <div
                      className="p-3 rounded-full mr-4 flex-shrink-0"
                      style={{ backgroundColor: pro.color }}
                    >
                      {pro.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {pro.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm flex-grow dark:text-gray-300">
                    {pro.description}
                  </p>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">
                      Key Features:
                    </h4>
                    <ul className="text-xs space-y-2">
                      {pro.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0 dark:text-green-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto text-base dark:text-gray-300">
            No matter your role in construction, JTech AI provides the tools you
            need to save time, reduce errors, and win more bids with
            professional, accurate estimates.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/auth?mode=signup")}
            className="font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-white"
            style={{
              backgroundColor: RISA_BLUE,
              padding: "0.5rem 2rem",
              borderRadius: "50px",
              border: "none",
            }}
          >
            Find Your Plan <ArrowRight className="ml-2 h-4 w-4 inline" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

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
          <div className="rounded-2xl text-gray-900 dark:text-white shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <p className="uppercase tracking-wider text-blue-200 text-xs mb-1">Ready to build better?</p>
                <h3 className="text-2xl md:text-3xl font-bold">Create your first quote in minutes</h3>
                <p className="text-blue-100 mt-2">No credit card required. Cancel anytime.</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-shadow text-blue-600 bg-white border border-blue-600 dark:text-blue-400 dark:bg-gray-800 dark:border-blue-400"
                  onClick={() => navigate("/auth?mode=signin")}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-shadow text-white"
                  onClick={() => navigate("/auth?mode=signup")}
                  style={{
                    backgroundColor: RISA_BLUE,
                    padding: "0.5rem 2rem",
                    borderRadius: "50px",
                    border: "none",
                  }}
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

const PaymentOptionsSection = () => {
  const paymentMethods = [
    {
      id: "visa",
      name: "Visa",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png",
    },
    {
      id: "paypal",
      name: "PayPal",
      image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    },
  ];
  return (
    <motion.section
      id="payment-options"
      className="py-16 bg-gray-50 dark:bg-gray-800"
      aria-labelledby="payment-title"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <Badge
            className="mb-4 text-xs text-white px-3 py-1"
            style={{
              background: `linear-gradient(90deg, ${RISA_BLUE}, ${KCA_GOLD})`,
            }}
          >
            <CreditCard className="w-3 h-3 mr-1" /> Payment options
          </Badge>
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white"
            id="payment-title"
          >
            Multiple Payment Methods
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base dark:text-gray-300">
            Secure and convenient payment options for your business
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {paymentMethods.map((method, i) => (
            <PaymentMethod key={i} method={method} />
          ))}
        </div>
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">
              Secure & Encrypted Payments
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div className="flex items-center group select-none">
    <div className="p-2 rounded-xl bg-transparent shadow-md group-hover:scale-105 transition-transform">
      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    {!compact && (
      <span className="ml-2 font-semibold text-lg sm:text-2xl text-blue-600 dark:text-blue-400">
        JTech AI
      </span>
    )}
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false); // State for dark mode

  const paymentMethods = [
    {
      id: "credit",
      name: "Credit/Debit Card",
      icon: (
        <CreditCard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      ),
      description:
        "Secure payments via Visa, Mastercard, and American Express.",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: (
        <Smartphone className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      ),
      description: "Convenient mobile payments for Kenyan users.",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: (
        <DollarSign className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      ),
      description: "Direct bank transfers for enterprise payments.",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <Coins className="w-10 h-10 text-blue-600 dark:text-blue-400" />,
      description: "International payments processed securely.",
    },
  ];

  // Dark Mode Effect
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

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

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

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen text-gray-900 transition-colors duration-300 dark:text-gray-100"
      style={{
        fontSize: "14px",
      }}
    >
      {/* Global Styles (Mimicking RISA) */}
      <style>
        {`
          html { font-size: 14px; }
          .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 1rem;
            border: 1px solid #e5e7eb;
          }
          .video-container video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            background-color: #000;
          }
        `}
      </style>

      {/* Top Sub-Nav (Like RISA) */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white py-1.5 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end space-x-6 md:space-x-8">
          <div className="relative group">
            <motion.button
              className="flex items-center lowercase text-gray-700 hover:text-blue-600 transition text-xs dark:text-gray-300 dark:hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: RISA_BLUE }}
            >
              <Mail className="mr-1 h-3.5 w-3.5" />
              contact us
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </motion.button>
            <div
              className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-2 min-w-40 hidden group-hover:block z-50 dark:bg-gray-800"
              style={{ border: `1px solid ${RISA_BLUE}` }}
            >
              <a
                href="mailto:support@jtechai.com"
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700 text-xs dark:hover:bg-gray-700 dark:text-gray-300"
                style={{ color: RISA_DARK_TEXT }}
              >
                <Mail className="mr-2 h-4 w-4" /> support
              </a>
              <a
                href="mailto:sales@jtechai.com"
                className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700 text-xs dark:hover:bg-gray-700 dark:text-gray-300"
                style={{ color: RISA_DARK_TEXT }}
              >
                <Mail className="mr-2 h-4 w-4" /> sales/general
              </a>
            </div>
          </div>
          <a
            href="tel:9499515815"
            className="flex items-center hover:text-blue-600 text-gray-700 text-xs dark:text-gray-300 dark:hover:text-blue-400"
            style={{ color: RISA_BLUE }}
          >
            <PhoneCall className="mr-1 h-3.5 w-3.5" /> 949 951 5815
          </a>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`sticky top-0 z-50 bg-white shadow-sm transition-all duration-300 dark:bg-gray-800 ${
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
              <Target className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400">
                JTech AI
              </span>
            </motion.div>
            <div className="hidden lg:flex items-center space-x-6 md:space-x-8">
              <motion.button
                onClick={() => scrollTo("features")}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: RISA_BLUE }}
              >
                Features
              </motion.button>
              <motion.button
                onClick={() => scrollTo("pricing")}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: RISA_BLUE }}
              >
                Pricing
              </motion.button>
              <motion.button
                onClick={() => scrollTo("how-it-works")}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: RISA_BLUE }}
              >
                How It Works
              </motion.button>
              <motion.button
                onClick={() => scrollTo("testimonials")}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: RISA_BLUE }}
              >
                Testimonials
              </motion.button>
              <motion.button
                onClick={() => scrollTo("faq")}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: RISA_BLUE }}
              >
                FAQs
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => navigate("/auth")}
                  className="text-gray-700 hover:text-blue-600 text-sm flex items-center dark:text-gray-300 dark:hover:text-blue-400"
                  style={{
                    backgroundColor: RISA_WHITE,
                    color: RISA_BLUE,
                    padding: "0.5rem 2rem",
                    borderRadius: "50px",
                    border: `1px solid ${RISA_BLUE}`,
                  }}
                >
                  <User className="mr-1 h-4 w-4" /> Login
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => navigate("/auth")}
                  className="text-white px-4 py-2 md:px-6 md:py-3 text-sm rounded-full shadow-md hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: RISA_BLUE,
                    padding: "0.5rem 2rem",
                    borderRadius: "50px",
                    border: "none",
                  }}
                >
                  Get Started
                </button>
              </motion.div>

              <ThemeToggle
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </div>
            <div className="flex items-center space-x-2 lg:hidden">
              <ThemeToggle
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="h-9 w-9 p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    style={{ color: RISA_BLUE }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-80 p-6 bg-white dark:bg-gray-800"
                >
                  <div className="flex flex-col space-y-4 mt-8">
                    <motion.button
                      onClick={() => scrollTo("features")}
                      className="text-gray-700 hover:text-blue-600 text-left text-sm py-2 dark:text-gray-300 dark:hover:text-blue-400"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ color: RISA_BLUE }}
                    >
                      Features
                    </motion.button>
                    <motion.button
                      onClick={() => scrollTo("pricing")}
                      className="text-gray-700 hover:text-blue-600 text-left text-sm py-2 dark:text-gray-300 dark:hover:text-blue-400"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ color: RISA_BLUE }}
                    >
                      Pricing
                    </motion.button>
                    <motion.button
                      onClick={() => scrollTo("how-it-works")}
                      className="text-gray-700 hover:text-blue-600 text-left text-sm py-2 dark:text-gray-300 dark:hover:text-blue-400"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ color: RISA_BLUE }}
                    >
                      How It Works
                    </motion.button>
                    <motion.button
                      onClick={() => scrollTo("testimonials")}
                      className="text-gray-700 hover:text-blue-600 text-left text-sm py-2 dark:text-gray-300 dark:hover:text-blue-400"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ color: RISA_BLUE }}
                    >
                      Testimonials
                    </motion.button>
                    <motion.button
                      onClick={() => scrollTo("faq")}
                      className="text-gray-700 hover:text-blue-600 text-left text-sm py-2 dark:text-gray-300 dark:hover:text-blue-400"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ color: RISA_BLUE }}
                    >
                      FAQs
                    </motion.button>
                    <button
                      onClick={() => navigate("/auth")}
                      className="justify-start text-gray-700 hover:text-blue-600 pl-0 text-sm py-2 flex items-center dark:text-gray-300 dark:hover:text-blue-400"
                      style={{
                        backgroundColor: RISA_WHITE,
                        color: RISA_BLUE,
                        padding: "0.5rem 2rem",
                        borderRadius: "50px",
                        border: `1px solid ${RISA_BLUE}`,
                      }}
                    >
                      <User className="mr-2 h-4 w-4" /> Login
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/auth")}
                      className="text-white text-sm py-3 rounded-full"
                      style={{
                        backgroundColor: RISA_BLUE,
                        padding: "0.5rem 2rem",
                        borderRadius: "50px",
                        border: "none",
                      }}
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

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative py-12 md:py-16 lg:py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Badge className="mb-4 text-xs bg-blue-600 text-white dark:bg-blue-700">
                <Star className="w-3 h-3 mr-1" /> Professional Construction
                Management
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight" style={{ color: RISA_BLUE }}>
                Generate Accurate Quotes in Minutes
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
                    onClick={() => navigate("/auth")}
                    className="text-white px-6 py-3 md:px-8 md:py-4 font-medium text-sm md:text-base rounded-full shadow-md hover:shadow-lg transition-all"
                    style={{
                      backgroundColor: RISA_BLUE,
                      padding: "0.5rem 2rem",
                      borderRadius: "50px",
                      border: "none",
                    }}
                  >
                    Get Started
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    className="text-blue-600 hover:bg-blue-50 px-6 py-3 md:py-4 font-medium text-sm md:text-base rounded-full shadow-md hover:shadow-lg transition-all dark:text-blue-400 dark:hover:bg-gray-800"
                    onClick={() => setDemoOpen(true)}
                    style={{
                      backgroundColor: RISA_WHITE,
                      color: RISA_BLUE,
                      padding: "0.5rem 2rem",
                      borderRadius: "50px",
                      border: `1px solid ${RISA_BLUE}`,
                    }}
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
                className="max-w-full h-auto rounded-xl shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* REMOVED: Stats Section - No longer included */}

      <WhoItsForSection />
      <HowItWorks />

      {/* New Features Section: "Why Choose JTech AI AI?" */}
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
            <Badge className="mb-4 text-xs bg-blue-600 text-white dark:bg-blue-700">
              <Zap className="w-3 h-3 mr-1" /> AI-Powered
            </Badge>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
              Why Choose JTech AI AI?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-base dark:text-gray-300">
              Experience the future of construction estimation with our cutting-edge AI technology.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="space-y-8">
                {[
                  {
                    icon: <Target className="w-6 h-6 text-white" />,
                    title: "Unmatched Accuracy",
                    description:
                      "Our AI analyzes plans with over 95% precision, drastically reducing costly estimation errors.",
                  },
                  {
                    icon: <Clock className="w-6 h-6 text-white" />,
                    title: "Lightning Speed",
                    description:
                      "Generate comprehensive quotes in minutes, not hours or days, accelerating your bidding process.",
                  },
                  {
                    icon: <Database className="w-6 h-6 text-white" />,
                    title: "Intelligent Learning",
                    description:
                      "The software learns from your past projects and regional data to provide smarter, more relevant estimates.",
                  },
                  {
                    icon: <FileText className="w-6 h-6 text-white" />,
                    title: "Professional Outputs",
                    description:
                      "Create stunning, branded quotes and reports that impress clients and win more bids.",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="p-3 rounded-full bg-blue-600 mr-4 flex-shrink-0 dark:bg-blue-700">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="video-container">
                <video
                  controls
                  autoPlay
                  playsInline
                  loop
                  muted
                  poster="/video-poster.jpg"
                  className="rounded-xl"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 0;
                    e.currentTarget.play().catch((error) => {
                      console.log("Autoplay was prevented:", error);
                    });
                  }}
                >
                  <source src="/video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        className="py-20 bg-gray-50 dark:bg-gray-800"
        aria-labelledby="pricing-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 text-xs bg-blue-600 text-white dark:bg-blue-700">
              <Star className="w-3 h-3 mr-1" /> Start free
            </Badge>
            <h2
              className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white"
              id="pricing-title"
            >
              Choose your plan
            </h2>
          </div>

          {tiersLoading && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10"
              aria-live="polite"
              aria-busy
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="rounded-xl border-2 border-blue-300 shadow-xl bg-white/60 dark:bg-gray-700/60"
                >
                  <CardContent className="p-8 animate-pulse">
                    <div className="h-6 w-32 bg-slate-200 rounded mb-6 dark:bg-gray-600" />
                    <div className="h-10 w-24 bg-slate-200 rounded mb-6 dark:bg-gray-600" />
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <div
                          key={j}
                          className="h-4 w-full bg-slate-200 rounded dark:bg-gray-600"
                        />
                      ))}
                    </div>
                    <div className="h-11 w-full bg-slate-200 rounded mt-8 dark:bg-gray-600" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tiersError && (
            <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
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
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    borderColor: KCA_GOLD,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card
                    className={`relative rounded-2xl border-2 border-[${RISA_BLUE}] shadow-xl transition-all duration-300 hover:shadow-2xl ${
                      plan.popular
                        ? "ring-2 ring-blue-500 scale-[1.02]"
                        : "hover:scale-105"
                    } bg-white/90 dark:bg-gray-800/90 dark:border-gray-700`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-1 rounded-full shadow-md">
                        ✨ Most Popular
                      </Badge>
                    )}
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </h3>
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="mt-4">
                        <span className="text-4xl font-extrabold" style={{ color: KCA_GOLD }}>
                          KES {plan.price}
                        </span>
                        <span className="text-gray-500 ml-1 dark:text-gray-400">
                          /{plan.period}
                        </span>
                      </div>
                      <ul className="mt-6 space-y-3">
                        {plan.features?.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0 dark:text-green-400" />
                            <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => navigate("/auth?mode=signup")}
                        className="mt-8 w-full rounded-full py-5 font-semibold transition-all duration-300 text-white"
                        style={{
                          backgroundColor: RISA_BLUE,
                          padding: "0.5rem 2rem",
                          borderRadius: "50px",
                          border: "none",
                        }}
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

      <PaymentOptionsSection />

      {/* Use redesigned testimonials */}
      <TestimonialsSection />

      <FaqSection />
      <CTABanner />

      {/* Footer */}
      <motion.footer
        id="contact"
        className="border-t bg-white dark:bg-gray-800 dark:border-gray-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center group select-none">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 font-semibold text-lg sm:text-2xl text-blue-600 dark:text-blue-400">
                JTech AI
              </span>
            </div>
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => scrollTo("features")}
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => scrollTo("pricing")}
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => scrollTo("how-it-works")}
                  >
                    How It Works
                  </button>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => scrollTo("testimonials")}
                  >
                    Testimonials
                  </button>
                </li>
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => scrollTo("faq")}
                  >
                    FAQs
                  </button>
                </li>
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => scrollTo("who-its-for")}
                  >
                    Who It's For
                  </button>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Support</h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-center sm:justify-end gap-2">
                  <Mail className="w-4 h-4" />
                  <a
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    href="mailto:support@jtechai.com"
                  >
                    support@jtechai.com
                  </a>
                </li>
                <li className="flex items-center justify-center sm:justify-end gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <a
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    href="tel:9499515815"
                  >
                    949 951 5815
                  </a>
                </li>
                <li>
                  <button
                    className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    Back to Top
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-700 dark:text-gray-400">
                © {new Date().getFullYear()} JTech AI. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </motion.footer>

      <VideoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
};

export default Index;
