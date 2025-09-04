import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  FileText,
  Calculator,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Building,
  Clock,
  Briefcase,
  Menu,
  MessageCircle,
  Shield,
  Hammer,
  DraftingCompass,
  DollarSign,
  UserCheck,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  ChevronDown,
  Play,
  Award,
  Globe,
  Zap,
  BarChart3,
  Cloud,
  Code,
  Database,
  Server,
  Smartphone,
  Headphones,
  Lightbulb,
  Target,
  BarChart,
  Settings,
  Calendar,
  Phone,
  MapPin,
  ArrowRightCircle,
  Check,
  ChevronRight,
  Eye,
  PieChart,
  FileStack,
  ClipboardCheck,
  Plus,
  Minus,
  HardDrive,
  Download,
  CheckSquare,
  ArrowRightIcon,
  Quote,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// RISA Color Theme with dark mode support
const colors = {
  primary: '#015B97',    // RISA's primary blue
  primaryLight: '#3288e6', // Lighter blue for accents
  secondary: '#565A5C',   // Text color
  white: '#FFFFFF',
  lightGray: '#F3F4F6',   // Backgrounds
  dark: '#111827',        // Dark text
  darkBackground: '#0f172a', // Dark mode background
  darkCard: '#1e293b',    // Dark mode card background
  darkText: '#e2e8f0',    // Dark mode text
  darkBorder: '#334155',  // Dark mode borders
  darkSecondary: '#94a3b8', // Dark mode secondary text
};

// Pricing Card Component with RISA styling and dark mode support
const PricingCard = ({ plan, isFeatured = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.2 }}
    whileHover={{ y: -10, transition: { duration: 0.3 } }}
    className={`
      rounded-xl p-8 shadow-md border transition-all duration-300
      hover:shadow-lg hover:scale-[1.02]
      ${isFeatured ? 'ring-2 ring-blue-500 shadow-lg relative' : ''}
      dark:border-gray-700 dark:shadow-gray-800/20
      dark:bg-gray-800 dark:text-gray-100
      bg-white border-gray-200 text-gray-900
      hover:border-blue-200 dark:hover:border-blue-800
    `}
  >
    {isFeatured && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
        Most Popular
      </span>
    )}
    <h3 className="text-2xl font-bold mb-3 text-center dark:text-gray-100">{plan.name}</h3>
    <p className="text-3xl font-bold mb-6 text-center text-blue-600">{plan.price}</p>
    <ul className="mb-8 space-y-4">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3 text-base group dark:text-gray-300 text-gray-700">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {feature.text}
          </span>
        </li>
      ))}
    </ul>
    <button className={`
      w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center
      group overflow-hidden relative
      ${isFeatured 
        ? 'bg-gradient-to-r from-blue-600 to-blue-800' 
        : 'bg-gradient-to-r from-blue-500 to-blue-700'}
    `}>
      <span className="relative z-10 flex items-center">
        {plan.buttonText}
      </span>
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    </button>
  </motion.div>
);

// Payment Method Component with RISA styling and dark mode support
const PaymentMethod = ({ method }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="border p-6 rounded-lg text-center shadow-sm 
                 transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]
                 dark:border-gray-700 dark:shadow-gray-800/20 dark:bg-gray-800 dark:text-gray-100
                 bg-white border-gray-200 text-gray-900
                 hover:border-blue-200 dark:hover:border-blue-800"
  >
    <div className="text-4xl mb-4 transition-colors duration-300 group-hover:text-blue-600 text-blue-500">
      {method.icon}
    </div>
    <h4 className="font-bold text-xl mb-2 dark:text-gray-100">{method.name}</h4>
    <p className="text-sm dark:text-gray-300 transition-colors duration-300 group-hover:text-blue-600 text-gray-600">
      {method.description}
    </p>
  </motion.div>
);

// Feature Card Component with RISA styling and dark mode support
const FeatureCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
               dark:border-gray-700 dark:shadow-gray-800/20 dark:bg-gray-800 dark:text-gray-100
               bg-white border-gray-200 text-gray-900
               hover:border-blue-200 dark:hover:border-blue-800"
  >
    <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:bg-blue-900/30">
      {feature.icon}
    </div>
    <h3 className="text-xl font-bold mb-3 dark:text-gray-100">{feature.title}</h3>
    <p className="dark:text-gray-300 text-gray-600 leading-relaxed text-sm">{feature.description}</p>
    <div className="mt-4 pt-4 border-t dark:border-gray-700">
      <div className="flex items-center text-blue-600 font-medium text-sm dark:text-blue-400">
        <span>Learn more</span>
        <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  </motion.div>
);

// Testimonials Component with RISA styling and dark mode support
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    quote: '',
    name: '',
    title: '',
    company: '',
    rating: 5,
    results: [
      { value: '', label: 'Improvement' },
      { value: '', label: 'Benefit' }
    ]
  });
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const savedTestimonials = localStorage.getItem('testimonials');
      return savedTestimonials ? JSON.parse(savedTestimonials) : [
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
        },
        {
          quote: "We've cut our estimation errors to near zero and significantly improved our profit margins. The automated reporting features alone have saved us hundreds of hours.",
          name: "Amanda Rodriguez",
          title: "Operations Manager",
          company: "Tower Construction Group",
          rating: 5,
          results: [
            { value: "99%", label: "Accuracy Rate" },
            { value: "18%", label: "Profit Increase" }
          ]
        }
      ];
    } catch (error) {
      console.error("Failed to load testimonials from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('testimonials', JSON.stringify(testimonials));
    } catch (error) {
      console.error("Failed to save testimonials to localStorage:", error);
    }
  }, [testimonials]);

  const companies = [
    "ConstructCo Ltd",
    "UrbanBuild Group",
    "Skyline Developments",
    "Tower Construction",
    "Prime Builders",
    "Metro Engineering",
    "InfraTech Solutions",
    "Global Constructors"
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(() => {
        nextTestimonial();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, activeIndex, testimonials.length]);

  const currentTestimonial = testimonials[activeIndex];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleResultChange = (index, field, value) => {
    const updatedResults = [...formData.results];
    updatedResults[index][field] = value;
    setFormData({ ...formData, results: updatedResults });
  };

  const addResultField = () => {
    setFormData({
      ...formData,
      results: [...formData.results, { value: '', label: '' }]
    });
  };

  const removeResultField = (index) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTestimonial = {
      ...formData,
      results: formData.results.filter(result => result.value || result.label)
    };
    setTestimonials((prevTestimonials) => [...prevTestimonials, newTestimonial]);
    setFormData({
      quote: '',
      name: '',
      title: '',
      company: '',
      rating: 5,
      results: [
        { value: '', label: 'Improvement' },
        { value: '', label: 'Benefit' }
      ]
    });
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setActiveIndex(testimonials.length);
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowForm(false);
      }
    };
    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForm]);

  return (
    <section id="testimonials" className="relative py-20 overflow-hidden dark:bg-gray-900">
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              ref={formRef}
              className="rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto 
                         dark:bg-gray-800 dark:text-gray-100 bg-white"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold dark:text-gray-100">Share Your Experience</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    aria-label="Close form"
                  >
                    <X className="text-xl" />
                  </button>
                </div>
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="text-green-500 text-6xl mb-4 animate-bounce">✓</div>
                    <h4 className="text-xl font-bold dark:text-gray-100 mb-2">Thank You!</h4>
                    <p className="dark:text-gray-300 text-gray-600">Your testimonial has been submitted successfully.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="quote" className="block dark:text-gray-100 text-gray-700 font-medium mb-2">Your Quote*</label>
                      <textarea
                        id="quote"
                        name="quote"
                        value={formData.quote}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                   border-gray-300"
                        rows="4"
                        placeholder="Share your experience with our product..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block dark:text-gray-100 text-gray-700 font-medium mb-2">Your Name*</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all
                                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                     border-gray-300"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="title" className="block dark:text-gray-100 text-gray-700 font-medium mb-2">Your Title*</label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all
                                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                     border-gray-300"
                          placeholder="Senior Estimator"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="company" className="block dark:text-gray-100 text-gray-700 font-medium mb-2">Company*</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                   border-gray-300"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label className="block dark:text-gray-100 text-gray-700 font-medium mb-2">Rating*</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="focus:outline-none transition-transform transform hover:scale-110"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={`text-2xl ${star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block dark:text-gray-100 text-gray-700 font-medium mb-3">Key Results (Optional)</label>
                      <div className="space-y-4">
                        {formData.results.map((result, index) => (
                          <div key={index} className="flex flex-col md:flex-row gap-2">
                            <input
                              type="text"
                              value={result.value}
                              onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                              className="w-full md:w-1/3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all
                                         dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                         border-gray-300"
                              placeholder="e.g. 40%"
                            />
                            <input
                              type="text"
                              value={result.label}
                              onChange={(e) => handleResultChange(index, 'label', e.target.value)}
                              className="w-full md:w-2/3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all
                                         dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                         border-gray-300"
                              placeholder="Result description"
                            />
                            {formData.results.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeResultField(index)}
                                className="flex-shrink-0 p-3 text-red-500 hover:text-red-700 transition-colors rounded-lg 
                                           dark:border-gray-600 dark:hover:border-red-800
                                           border border-gray-300 md:border-none"
                                aria-label="Remove result field"
                              >
                                <X />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addResultField}
                          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors 
                                     dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                     inline-flex items-center text-sm"
                        >
                          <Plus className="mr-2" /> Add Another Result
                        </button>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-all duration-300"
                      >
                        Submit Testimonial
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
            className="inline-flex items-center bg-blue-600 px-4 py-2 rounded-full mb-6"
          >
            <span className="text-white font-medium text-sm">
              <span className="mr-2">★</span> Client Testimonials
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            <span className="text-blue-600 dark:text-blue-400">
              Trusted by Industry Leaders
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
            className="dark:text-gray-300 text-gray-600 max-w-3xl mx-auto"
          >
            Hear from industry professionals who have transformed their estimation process with our solution.
          </motion.p>
        </div>
        <div className="max-w-5xl mx-auto relative mb-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevTestimonial}
            className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full 
                       shadow flex items-center justify-center transition-all border
                       dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:text-blue-400
                       bg-white border-gray-200 text-gray-600 hover:text-blue-600"
            aria-label="Previous testimonial"
            disabled={testimonials.length <= 1}
          >
            <ChevronLeft />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTestimonial}
            className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full 
                       shadow flex items-center justify-center transition-all border
                       dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:text-blue-400
                       bg-white border-gray-200 text-gray-600 hover:text-blue-600"
            aria-label="Next testimonial"
            disabled={testimonials.length <= 1}
          >
            <ChevronRightIcon />
          </motion.button>
          <div className="relative h-auto overflow-hidden">
            {testimonials.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl shadow-md overflow-hidden border
                             dark:border-gray-700 dark:shadow-gray-800/20 dark:bg-gray-800
                             bg-white border-gray-100"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2 p-6 md:p-8">
                      <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">
                        <Quote className="opacity-70" />
                      </div>
                      <p className="mb-6 leading-relaxed italic dark:text-gray-100 text-gray-800">
                        "{currentTestimonial.quote}"
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {currentTestimonial.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold dark:text-gray-100">{currentTestimonial.name}</h4>
                            <p className="dark:text-gray-300 text-gray-600 text-sm">{currentTestimonial.title}, {currentTestimonial.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`text-lg ${i < currentTestimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-6 md:p-8 border-l-0 lg:border-l border-t-0 lg:border-t-0 border-gray-200 dark:bg-blue-900/20 dark:border-gray-700">
                      <h3 className="text-lg font-semibold dark:text-gray-100 mb-4">Key Achievements</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {currentTestimonial.results.map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="p-3 rounded-lg border shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center
                                       dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                       bg-white border-gray-200"
                          >
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-1">{result.value}</div>
                            <div className="text-xs dark:text-gray-300 text-gray-600">{result.label}</div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="text-xs dark:text-gray-300 text-gray-600 mb-2">Project Type:</div>
                        <div className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium dark:bg-blue-900/50 dark:text-blue-300">
                          Commercial Tower
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 dark:text-gray-400 text-gray-500">
                No testimonials to display yet. Be the first to share your experience!
              </div>
            )}
          </div>
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  className={`w-2 h-2 rounded-full transition-colors
                             ${index === activeIndex ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-12 pt-12 border-t dark:border-gray-800">
          <motion.h3
            className="text-center text-lg font-semibold dark:text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Trusted by industry leaders worldwide
          </motion.h3>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {companies.map((company, index) => (
              <motion.div
                key={index}
                className="rounded-lg p-4 flex items-center justify-center h-20 border shadow-sm hover:shadow-md transition-all duration-300
                           dark:border-gray-700 dark:shadow-gray-800/20 dark:bg-gray-800 dark:text-gray-100
                           bg-white border-gray-200 text-gray-700"
                whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-600 w-10 h-10 rounded-md flex items-center justify-center text-white font-bold mr-2 flex-shrink-0">
                    <Building className="text-sm" />
                  </div>
                  <span className="font-medium text-sm text-center">{company}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);
  const menuItems = ['Features', 'Solutions', 'Benefits', 'Pricing', 'Testimonials', 'FAQ', 'Contact'];
  const pricingPlans = [
    {
      name: "Free",
      price: "KES 0",
      features: [
        { text: "Up to 3 projects", icon: <Users className="w-5 h-5" /> },
        { text: "Basic AI Sketch Recognition", icon: <CheckSquare className="w-5 h-5" /> },
        { text: "Manual Quantity Takeoff", icon: <CheckSquare className="w-5 h-5" /> },
        { text: "100MB Cloud Storage", icon: <HardDrive className="w-5 h-5" /> },
        { text: "Basic Report Generation", icon: <Download className="w-5 h-5" /> },
        { text: "Community Support", icon: <Wrench className="w-5 h-5" /> },
      ],
      buttonText: "Get Started",
    },
    {
      name: "Basic",
      price: "KES 5,000",
      features: [
        { text: "Up to 10 projects", icon: <Users className="w-5 h-5" /> },
        { text: "AI Sketch Recognition", icon: <CheckSquare className="w-5 h-5" /> },
        { text: "Automated Quantity Takeoff", icon: <CheckSquare className="w-5 h-5" /> },
        { text: "1GB Cloud Storage", icon: <HardDrive className="w-5 h-5" /> },
        { text: "Standard Report Generation", icon: <Download className="w-5 h-5" /> },
        { text: "Email Support", icon: <Wrench className="w-5 h-5" /> },
      ],
      buttonText: "Get Started",
    },
    {
      name: "Professional",
      price: "KES 7,500",
      features: [
        { text: "Unlimited Projects", icon: <Users className="w-5 h-5" /> },
        { text: "Advanced AI Sketch Recognition", icon: <CheckSquare className="w-5 h-5" /> },
        { text: "Automated Quantity Takeoff", icon: <CheckSquare className="w-5 h-5" /> },
        { text: "5GB Cloud Storage", icon: <HardDrive className="w-5 h-5" /> },
        { text: "Advanced Report Generation", icon: <Download className="w-5 h-5" /> },
        { text: "Priority Email & Chat Support", icon: <Wrench className="w-5 h-5" /> },
      ],
      buttonText: "Get Started",
    }
  ];
  const paymentMethods = [
    {
      name: "Credit/Debit Card",
      icon: <DollarSign className="w-8 h-8" />,
      description: "Secure payments via Visa, Mastercard, and American Express.",
    },
    {
      name: "M-Pesa",
      icon: <Smartphone className="w-8 h-8" />,
      description: "Convenient mobile payments for Kenyan users.",
    },
    {
      name: "Bank Transfer",
      icon: <Briefcase className="w-8 h-8" />,
      description: "Direct bank transfers for enterprise payments.",
    },
    {
      name: "PayPal",
      icon: <DollarSign className="w-8 h-8" />,
      description: "International payments processed securely.",
    },
  ];
  const stepDetails = [
    {
      title: "Upload Plans",
      description: "Easily upload your construction plans in various formats including PDF, CAD files, and images.",
      features: [
        "Support for multiple file formats",
        "Automatic dimension extraction",
        "Material recognition technology",
        "Cloud-based storage for easy access"
      ]
    },
    {
      title: "Generate Estimate",
      description: "Our advanced AI algorithms analyze your plans and generate precise cost estimates.",
      features: [
        "Real-time material pricing",
        "Labor cost calculations",
        "Equipment rental estimates",
        "Customizable markup options"
      ]
    },
    {
      title: "Review & Customize",
      description: "Fine-tune your estimates with our intuitive editing tools.",
      features: [
        "Interactive editing interface",
        "Multiple pricing tiers",
        "Client-specific customization",
        "Professional template options"
      ]
    },
    {
      title: "Share with Clients",
      description: "Easily share your professional quotes with clients through multiple channels.",
      features: [
        "Direct email integration",
        "Downloadable PDF reports",
        "Client portal access",
        "Real-time notification system"
      ]
    }
  ];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const setStartTime = () => {
        if (video.duration) {
          video.currentTime = video.duration / 2;
        }
      };
      if (video.readyState > 0) {
        setStartTime();
      } else {
        video.addEventListener('loadedmetadata', setStartTime);
      }
      return () => {
        video.removeEventListener('loadedmetadata', setStartTime);
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sections = {
    hero: useInView({ triggerOnce: true, threshold: 0.2 }),
    features: useInView({ triggerOnce: true, threshold: 0.1 }),
    solutions: useInView({ triggerOnce: true, threshold: 0.1 }),
    benefits: useInView({ triggerOnce: true, threshold: 0.1 }),
    pricing: useInView({ triggerOnce: true, threshold: 0.2 }),
    faq: useInView({ triggerOnce: true, threshold: 0.1 }),
    cta: useInView({ triggerOnce: true, threshold: 0.3 }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  const slideIn = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const heroImages = ['/page.jpg', '/page1.jpg', '/page2.jpg', '/page3.jpg'];
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const howItWorksImages = ['/first.jpg', '/second.jpg', '/third.jpg', '/fouth.jpg'];

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(heroInterval);
  }, []);

  useEffect(() => {
    const fetchTiers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tiers').select('*').order('id');
      if (error) {
        console.error('Error fetching tiers:', error);
      } else {
        setTiers(data || []);
      }
      setLoading(false);
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      if (open) setOpen(false);
    }
  };

  const handleStartTrial = () => {
    navigate('/auth?mode=signup');
  };

  const handleScheduleDemo = () => {
    window.location.href = '/video.mp4';
  };

  const toggleFaq = (index: number) => {
    if (openFaqItems.includes(index)) {
      setOpenFaqItems(openFaqItems.filter(item => item !== index));
    } else {
      setOpenFaqItems([...openFaqItems, index]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans antialiased overflow-hidden dark:bg-gray-900 dark:text-gray-100">
      {/* Navigation - RISA Style */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed w-full z-50 transition-all duration-300
                   ${isScrolled ? 'bg-white shadow-md py-2 dark:bg-gray-900 dark:shadow-gray-800/20' : 'bg-transparent py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="flex-shrink-0 flex items-center">
                <div className="p-2 rounded-md bg-blue-600">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold dark:text-white">Constructly</span>
              </div>
            </motion.div>
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.toLowerCase().replace(/\s/g, ''))}
                  className={`text-sm font-medium transition-colors
                             ${isScrolled 
                               ? 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400' 
                               : 'text-white hover:text-blue-200'}`}
                >
                  {item}
                </motion.button>
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate("/auth?mode=signin")}
                  variant="ghost"
                  size="sm"
                  className={isScrolled ? "text-gray-600 dark:text-gray-300" : "text-white"}
                >
                  Sign In
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all shadow-md"
                >
                  Get Started
                </Button>
              </motion.div>
              <ThemeToggle />
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={isScrolled ? "text-gray-600 dark:text-gray-300" : "text-white"}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 dark:bg-gray-800 dark:text-gray-100">
                  <SheetHeader>
                    <span className="text-xl font-semibold dark:text-white">Constructly</span>
                  </SheetHeader>
                  <div className="flex flex-col mt-6 space-y-3">
                    {menuItems.map((item) => (
                      <Button
                        key={item}
                        variant="ghost"
                        className="justify-start dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => scrollToSection(item.toLowerCase().replace(/\s/g, ''))}
                      >
                        {item}
                      </Button>
                    ))}
                    <Separator className="my-2 dark:bg-gray-700" />
                    <Button
                      variant="ghost"
                      className="justify-start dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => navigate("/auth?mode=signin")}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="justify-start bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => navigate("/auth?mode=signup")}
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
      <main>
        {/* Hero Section - RISA Style */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative pt-28 pb-16 text-center min-h-[80vh] flex items-center"
        >
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full relative">
              <img 
                src={heroImages[currentHeroImage]} 
                alt="Construction background" 
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 w-full">
            <motion.div variants={itemVariants}>
              <Badge className="backdrop-blur-sm px-4 py-2 mb-6 dark:bg-gray-800/80 dark:text-gray-100 dark:border-gray-700">
                <Zap className="w-4 h-4 mr-1 inline" /> The Future of Construction Management
              </Badge>
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
            >
              Effortless Estimates,
              <br />
              <span className="text-blue-300">
                Perfectly Professional.
              </span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-10"
            >
              Streamline your construction business with professional quote generation, project management, and client communication tools — built for contractors in Kenya.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                  className="bg-white text-blue-600 px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                >
                  Start Free Trial
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleScheduleDemo}
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all"
                >
                  Schedule a Demo
                </Button>
              </motion.div>
            </motion.div>
            <motion.p 
              variants={itemVariants}
              className="mt-6 text-blue-200 text-sm"
            >
              14-day free trial • No credit card required
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Button variant="ghost" className="text-white" onClick={() => scrollToSection('features')}>
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        {/* Logo Bar - RISA Style */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-12 bg-gray-50 dark:bg-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4">
            <motion.p variants={itemVariants} className="text-center dark:text-gray-300 text-gray-500 text-sm mb-8">
              Trusted by leading construction companies worldwide
            </motion.p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shadow-sm dark:from-gray-700 dark:to-gray-800"
                ></motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        {/* Features Section - RISA Style */}
        <section id="features" className="py-20 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                Powerful Features for Construction Professionals
              </motion.h2>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-2xl mx-auto">
                Everything you need to streamline your construction business in one platform
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {[
                {
                  icon: <FileText className="w-8 h-8" />,
                  title: 'Professional Quoting',
                  description: 'Create detailed, accurate quotes with material costs, labor estimates, and timelines in minutes.'
                },
                {
                  icon: <Calculator className="w-8 h-8" />,
                  title: 'Smart Cost Estimation',
                  description: 'Access a built-in calculator with current market rates for materials and labor in Kenya.'
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: 'Client Management',
                  description: 'Centralize all client information, project history, and communication in one place.'
                },
                {
                  icon: <TrendingUp className="w-8 h-8" />,
                  title: 'Performance Analytics',
                  description: 'Track key metrics like revenue, project success rates, and business growth over time.'
                },
                {
                  icon: <Building className="w-8 h-8" />,
                  title: 'Project Portfolio',
                  description: 'Manage projects for residential, commercial, and infrastructure construction.'
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: 'Time Tracking',
                  description: 'Monitor project timelines, assign tasks, and ensure every delivery is on schedule.'
                }
              ].map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>
        {/* Solutions Section - RISA Style */}
        <section id="solutions" className="py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                Tailored Solutions for Your Business
              </motion.h2>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-2xl mx-auto">
                Designed specifically for the Kenyan construction industry
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideIn}
                className="space-y-8"
              >
                {[
                  {
                    icon: <ClipboardCheck className="w-6 h-6 text-blue-600" />,
                    title: 'Estimate & Bid Management',
                    description: 'Create accurate estimates quickly with our pre-built templates and cost databases specific to Kenyan market rates.'
                  },
                  {
                    icon: <BarChart className="w-6 h-6 text-blue-600" />,
                    title: 'Project Cost Control',
                    description: 'Track expenses in real-time and compare against budgets to maintain profitability on all your projects.'
                  },
                  {
                    icon: <Calendar className="w-6 h-6 text-blue-600" />,
                    title: 'Schedule Management',
                    description: 'Plan and visualize project timelines with interactive Gantt charts and milestone tracking.'
                  },
                  {
                    icon: <Settings className="w-6 h-6 text-blue-600" />,
                    title: 'Resource Allocation',
                    description: 'Optimize manpower and equipment usage across multiple projects with our resource planning tools.'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4 dark:bg-blue-900/30">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">{item.title}</h3>
                      <p className="dark:text-gray-300 text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative"
              >
                <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-700">
                  <img src="/page3.jpg" alt="Construction project management dashboard" className="w-full h-auto" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs font-medium dark:text-gray-300">Project Status: On Track</span>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-lg shadow">
                  <div className="text-center">
                    <div className="text-lg font-bold">98%</div>
                    <div className="text-xs">Client Satisfaction</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Benefits Section - RISA Style */}
        <section id="benefits" className="py-20 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                Why Construction Professionals Choose Us
              </motion.h2>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-2xl mx-auto">
                Experience the difference with our construction-focused platform
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="space-y-6"
              >
                {[
                  {
                    icon: <TrendingUp className="w-5 h-5" />,
                    title: 'Increase Profit Margins',
                    description: 'Reduce estimation errors and identify cost-saving opportunities to maximize profitability on every project.'
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    title: 'Save Time',
                    description: 'Cut estimation time by up to 70% with our automated tools and pre-built templates designed for efficiency.'
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: 'Reduce Risk',
                    description: 'Make data-driven decisions with accurate cost databases and historical project analytics to minimize errors.'
                  },
                  {
                    icon: <UserCheck className="w-5 h-5" />,
                    title: 'Win More Bids',
                    description: 'Create professional, detailed proposals that impress clients and set you apart from competitors.'
                  },
                  {
                    icon: <Globe className="w-5 h-5" />,
                    title: 'Anywhere Access',
                    description: 'Manage your projects from office or site with our cloud-based platform and mobile apps for on-the-go access.'
                  },
                  {
                    icon: <Headphones className="w-5 h-5" />,
                    title: 'Dedicated Support',
                    description: 'Get construction-specific support from our team of industry experts when you need it most.'
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all duration-300 w-full dark:bg-gray-800 dark:hover:bg-blue-900/20"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center mr-4 text-white">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 dark:text-white">{benefit.title}</h3>
                      <p className="dark:text-gray-300 text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative"
              >
                <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-700">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-auto"
                  >
                    <source src="/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs font-medium dark:text-gray-300">70% Time Saved</span>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-lg shadow">
                  <div className="text-center">
                    <div className="text-lg font-bold">95%</div>
                    <div className="text-xs">Accuracy Rate</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* How It Works Section - RISA Style */}
        <section id="howitworks" className="py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                How Constructly Works
              </motion.h2>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-2xl mx-auto">
                Simple steps to streamline your construction business processes
              </motion.p>
            </motion.div>
            <div className="space-y-24 w-full">
              {[
                { 
                  step: '1', 
                  title: 'Upload Plans', 
                  description: 'Upload your construction plans or input project details', 
                  icon: <Cloud className="w-6 h-6" />, 
                  direction: 'left'
                },
                { 
                  step: '2', 
                  title: 'Generate Estimate', 
                  description: 'Our system creates accurate cost estimates', 
                  icon: <Calculator className="w-6 h-6" />, 
                  direction: 'right'
                },
                { 
                  step: '3', 
                  title: 'Review & Customize', 
                  description: 'Fine-tune your estimates and proposals', 
                  icon: <FileText className="w-6 h-6" />, 
                  direction: 'left'
                },
                { 
                  step: '4', 
                  title: 'Share with Clients', 
                  description: 'Send professional quotes to your clients', 
                  icon: <UserCheck className="w-6 h-6" />, 
                  direction: 'right'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                  className={`flex flex-col ${item.direction === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center w-full`}
                >
                  <motion.div 
                    variants={itemVariants}
                    className="flex-1"
                  >
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-100 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-50 dark:bg-blue-900/20"></div>
                      <img 
                        src={howItWorksImages[index]} 
                        alt={item.title} 
                        className="relative rounded-xl shadow-lg border-4 border-white w-full h-auto transform transition-all duration-500 group-hover:scale-[1.02] dark:border-gray-700"
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="flex-1"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold mr-4 shadow">
                        {item.step}
                      </div>
                      <h3 className="text-xl font-bold dark:text-white">{item.title}</h3>
                    </div>
                    <p className="dark:text-gray-300 text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 font-medium rounded-lg dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          Learn more
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl dark:bg-gray-800 dark:text-gray-100">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold dark:text-white mb-4">{stepDetails[index].title}</DialogTitle>
                          <DialogDescription className="dark:text-gray-300">
                            {stepDetails[index].description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                            Key Features
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {stepDetails[index].features.map((feature, i) => (
                              <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-blue-900/20">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="dark:text-gray-100 text-gray-700 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
              className="mt-16 flex justify-center"
            >
              <Button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow text-base font-semibold">
                <Play className="w-5 h-5" /> Watch Demo Video
              </Button>
            </motion.div>
          </div>
        </section>
        {/* Pricing Section - RISA Style */}
        <section id="pricing" className="py-20 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                Choose Your Perfect Plan
              </motion.h2>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-2xl mx-auto">
                Unlock powerful features designed to elevate your business. Select the plan that aligns with your scale and needs.
              </motion.p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8 mb-20 items-start w-full">
              {pricingPlans.map((plan, i) => (
                <PricingCard key={i} plan={plan} isFeatured={plan.name === "Professional"} />
              ))}
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-12"
            >
              <motion.h3 variants={itemVariants} className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
                Flexible Payment Options
              </motion.h3>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-xl mx-auto">
                We provide a variety of secure and convenient ways to pay, ensuring a smooth transaction experience.
              </motion.p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-6 w-full">
              {paymentMethods.map((method, i) => (
                <PaymentMethod key={i} method={method} />
              ))}
            </div>
          </div>
        </section>
        {/* Testimonials Section - RISA Style */}
        <TestimonialsSection />
        {/* FAQ Section - RISA Style */}
        <section id="faq" className="py-16 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-12"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                Frequently Asked Questions
              </motion.h2>
              <motion.p variants={itemVariants} className="dark:text-gray-300 text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about Constructly
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {[
                { 
                  q: 'What is Constructly and who is it for?', 
                  a: 'Constructly is a comprehensive construction management platform designed for contractors, quantity surveyors, and construction businesses of all sizes. It helps streamline quoting, project management, and client communication processes.' 
                },
                { 
                  q: 'How does Constructly help with cost estimation?', 
                  a: 'Our platform includes a built-in cost database with current market rates for materials and labor, automated calculation tools, and customizable templates to create accurate estimates quickly.' 
                },
                { 
                  q: 'Can I use Constructly on mobile devices?', 
                  a: 'Yes, Constructly is fully responsive and works on all devices. We also have dedicated mobile apps for iOS and Android for on-site access.' 
                },
                { 
                  q: 'How secure is my data with Constructly?', 
                  a: 'We take security seriously. All data is encrypted, regularly backed up, and stored on secure servers. We also offer role-based access control to protect sensitive information.' 
                },
                { 
                  q: 'What kind of training and support do you offer?', 
                  a: 'We provide comprehensive onboarding, video tutorials, documentation, and email support. Our premium plans include dedicated account management and priority support.' 
                },
                { 
                  q: 'Can I integrate Constructly with other software?', 
                  a: 'Yes, we offer API access and integrations with popular accounting software, project management tools, and CRM systems.' 
                },
                { 
                  q: 'How often do you update the software?', 
                  a: 'We release new features and improvements every month based on customer feedback and industry trends.' 
                },
                { 
                  q: 'What happens to my data if I cancel my subscription?', 
                  a: 'You can export all your data at any time. After cancellation, your data will be stored for 30 days before being permanently deleted.' 
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={itemVariants}
                  className="rounded-lg shadow border overflow-hidden w-full
                             dark:border-gray-700 dark:shadow-gray-800/20 dark:bg-gray-800
                             bg-white border-gray-200"
                >
                  <motion.button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full text-left p-5 focus:outline-none"
                    whileHover={{ backgroundColor: "rgba(1, 91, 151, 0.05)" }}
                  >
                    <span className="font-semibold dark:text-white">{item.q}</span>
                    <motion.div
                      animate={{ rotate: openFaqItems.includes(index) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-blue-600 flex-shrink-0 dark:text-blue-400"
                    >
                      <ChevronDown />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {openFaqItems.includes(index) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <div className="w-10 h-0.5 bg-blue-400 rounded-full mb-3"></div>
                          <p className="dark:text-gray-300 text-gray-600 leading-relaxed text-sm">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-10 text-center"
            >
              <p className="dark:text-gray-300 text-gray-600 mb-4">Still have questions? Our team is here to help.</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow dark:bg-blue-700 dark:hover:bg-blue-800">
                <MessageCircle className="w-4 h-4 mr-2" /> Contact Support
              </Button>
            </motion.div>
          </div>
        </section>
        {/* CTA Section - RISA Style */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 w-full">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-2xl md:text-3xl font-bold mb-4 text-white"
            >
              Ready to Transform Your Construction Business?
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Start your free trial today and experience the difference.
            </motion.p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="flex flex-col sm:flex-row justify-center gap-3"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleStartTrial}
                  size="lg"
                  className="bg-white text-blue-600 px-6 py-3 font-semibold hover:bg-gray-100 transition-all shadow rounded-lg"
                >
                  Start Free Trial
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleScheduleDemo}
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all rounded-lg"
                >
                  Schedule a Demo
                </Button>
              </motion.div>
            </motion.div>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-4 text-blue-200 text-sm"
            >
              No credit card required • 14-day free trial • Cancel anytime
            </motion.p>
          </div>
        </section>
        {/* Footer - RISA Style */}
        <footer id="contact" className="py-12 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-md bg-blue-600">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold ml-2 dark:text-white">Constructly</span>
                </div>
                <p className="dark:text-gray-400 mb-4 text-sm">
                  Empowering construction professionals with modern, efficient tools.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="dark:text-gray-400 hover:text-white transition"><Linkedin className="w-4 h-4" /></a>
                  <a href="#" className="dark:text-gray-400 hover:text-white transition"><Twitter className="w-4 h-4" /></a>
                  <a href="#" className="dark:text-gray-400 hover:text-white transition"><Facebook className="w-4 h-4" /></a>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-3 dark:text-white">Product</h3>
                <ul className="space-y-2 dark:text-gray-400 text-sm">
                  <li><a href="#features" className="hover:text-white transition block dark:hover:text-blue-400">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition block dark:hover:text-blue-400">Pricing</a></li>
                  <li><a href="#testimonials" className="hover:text-white transition block dark:hover:text-blue-400">Testimonials</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3 dark:text-white">Company</h3>
                <ul className="space-y-2 dark:text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition block dark:hover:text-blue-400">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition block dark:hover:text-blue-400">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition block dark:hover:text-blue-400">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3 dark:text-white">Contact</h3>
                <ul className="space-y-2 dark:text-gray-400 text-sm">
                  <li className="flex items-start">
                    <MessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <a href="mailto:support@constructly.africa" className="hover:text-white transition block dark:hover:text-blue-400">support@constructly.africa</a>
                  </li>
                  <li className="flex items-start">
                    <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="hover:text-white transition block dark:hover:text-blue-400">+254 700 123 456</span>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="hover:text-white transition block dark:hover:text-blue-400">Nairobi, Kenya</span>
                  </li>
                </ul>
              </div>
            </div>
            <Separator className="my-6 dark:bg-gray-700" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs dark:text-gray-500">
                © {new Date().getFullYear()} Constructly. All rights reserved.
              </span>
              <div className="flex gap-3">
                <a href="#" className="dark:text-gray-500 hover:text-white text-xs">Privacy Policy</a>
                <a href="#" className="dark:text-gray-500 hover:text-white text-xs">Terms of Service</a>
                <a href="#" className="dark:text-gray-500 hover:text-white text-xs">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;