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
  HardHat,
  Ruler,
  Hammer,
  Menu,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from '@/components/ui/accordion';
import { TestimonialsSection } from '@/components/Testimonials';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { refreshApp, useAuth } from '@/contexts/AuthContext';

export interface Tier {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
}

const Index = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null);
  const menuItems = ['Features','Testimonials', 'FAQ' , 'Pricing', 'Contact']

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

  if(user){
    navigate("/dashboard")
  }
  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.backgroundPosition = `center ${scrollY * 0.5}px`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Background Orbs (Decorative) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/20 dark:bg-blue-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300/20 dark:bg-purple-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
       <nav className="backdrop-blur-sm shadow-sm border-b border-white/20 dark:border-slate-700/30 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="sm:text-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              Constructly
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {menuItems.map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                onClick={() =>
                  document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item}
              </Button>
            ))}
            <Button
              onClick={() => navigate("/auth?mode=signin")}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-primary/10"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <span className="text-lg font-semibold">Menu</span>
                </SheetHeader>
                <div className="flex flex-col mt-6 space-y-3">
                  {menuItems.map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" })
                        setOpen(false)
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate("/auth?mode=signin")
                      setOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                  variant='ghost'
                    onClick={() => {
                      navigate("/auth?mode=signup")
                      setOpen(false)
                    }}
                    className="justify-start"
                  >
                    Get Started
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>

      <div className='container mx-auto px-4 py-8'>
      {/* Hero Section with Animated SVG */}
      <section
        ref={heroRef}
        className="relative py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
        style={{ backgroundPosition: 'center' }}
      >
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full px-4 py-2 animate-fade-in-up">
            <Star className="w-4 h-4 mr-1 inline" /> Professional Construction Management
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Build Accurate Quotes
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300">
              in Minutes
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Streamline your construction business with professional quote generation, project management, and client communication tools — built for contractors in Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button
              onClick={() => navigate('/auth?mode=signup')}
              size="lg"
              className="bg-gradient-to-r animate-bounce-gentle from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 pulse-button"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
            {/* <Button
              onClick={() => navigate('/auth?mode=signin')}
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-lg border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
            >
              Watch Demo
            </Button> */}
          </div>
        </div>
      </section>

      {/* Who It's For - Enhanced */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <Card className="bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-slate-800/60 dark:to-slate-900/60 backdrop-blur-md border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent text-center">
              Who It’s For
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
              {[
                { emoji: '🏗️', role: 'Contractors', desc: 'Apply your own material/service rates' },
                { emoji: '📐', role: 'Quantity Surveyors', desc: 'Auto takeoff + BOQ in minutes' },
                { emoji: '🏘️', role: 'SMEs & Developers', desc: 'Clear pricing, margin control' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 shadow-lg backdrop-blur-sm border border-white/30 dark:border-slate-700/40 text-center hover:scale-105 transition-transform duration-300 card-hover"
                >
                  <div className="text-5xl mb-3">{item.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.role}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4">
            Everything You Need to Manage Construction Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From initial quotes to project completion, we've got you covered with professional tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <FileText className="w-8 h-8" />,
              title: 'Professional Quotes',
              description: 'Generate detailed, accurate quotes with material costs, labor estimates, and timelines.',
              gradient: 'from-blue-500 to-blue-600',
            },
            {
              icon: <Calculator className="w-8 h-8" />,
              title: 'Cost Calculator',
              description: 'Built-in calculator with current market rates for materials and labor in Kenya.',
              gradient: 'from-green-500 to-green-600',
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Client Management',
              description: 'Keep track of all your clients, projects, and communication in one place.',
              gradient: 'from-purple-500 to-purple-600',
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: 'Business Analytics',
              description: 'Track your revenue, project success rates, and business growth over time.',
              gradient: 'from-purple-500 to-purple-600',
            },
            {
              icon: <Building className="w-8 h-8" />,
              title: 'Project Types',
              description: 'Support for residential, commercial, and infrastructure construction projects.',
              gradient: 'from-red-500 to-red-600',
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: 'Time Tracking',
              description: 'Monitor project timelines and ensure deliveries are on schedule.',
              gradient: 'from-indigo-500 to-indigo-600',
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="rounded-2xl border-0 shadow-lg card-hover bg-white/60 dark:bg-slate-800/60 shadow-lg backdrop-blur-sm border border-white/30 dark:border-slate-700/40 transform transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
               style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <CardContent className="pt-8 px-6 pb-6">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg w-fit mb-5`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-slate-900 to-slate-400 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4 ">
            What Contractors Say
          </h2>
          <TestimonialsSection />
        </div>
      </section>

      {/* FAQ */}
      <section id='faq' className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="sm:text-3xl text-2xl font-bold mb-12 text-center bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent ">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Accordion type="multiple">
              {[
                { q: 'Where can I find documentation?', a: 'All docs are available on our official documentation portal (link to be provided).' },
                { q: 'Is Constructly free?', a: 'We offer a free tier with essential tools and paid plans with advanced features.' },
                { q: 'Do you collect analytics?', a: 'Yes, but only anonymized usage data to help us improve Constructly.' },
                {
                  q: 'Where can I read your privacy policy?',
                  a: (
                    <span>
                      You can view our{' '}
                      <a href="#privacy" className="underline">Privacy Policy</a>{' '}
                      and{' '}
                      <a href="#terms" className="underline">Terms of Service</a>{' '}
                      at the bottom of this page.
                    </span>
                  ),
                },
              ].map((item, i) => (
                <AccordionItem
                  key={item.q} // use stable unique key
                  value={`item-${i}`}
                  className="border-b border-slate-200 dark:border-slate-700"
                >
                  <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground mt-2">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground">Start free, upgrade when you need more features.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {tiers.map((plan, index) => (
            <Card
              key={index}
              className={`rounded-2xl border-0 shadow-xl relative transform transition-all duration-500 hover:-translate-y-2 gradient-card animate-fade-in-up ${
                plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
              style={{ animationDelay: `${0.3 + index * 0.15}s` }}
            >
              <div>
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium z-10 shadow-lg">
                  🌟 Most Popular
                </Badge>
              )}
              <div>
              <CardContent className="pt-10 pb-8 px-6 text-center">
                <h3 className="sm:text-2xl text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  className={`w-full rounded-full py-6 text-lg font-medium transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Get Started
                </Button>
              </CardContent>
              </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-4 sm:px-6 lg:px-8 backdrop-blur-lg border-t border-white/20 dark:border-slate-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="sm:text-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
                Constructly
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Empowering construction professionals across Kenya with modern project management tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left mb-10 text-sm">
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:underline hover:text-blue-600 transition-colors">
                    Quote Builder
                  </a>
                </li>
                <li>
                  <a href="#projects" className="hover:underline hover:text-blue-600 transition-colors">
                    Project Management
                  </a>
                </li>
                <li>
                  <a href="#analytics" className="hover:underline hover:text-blue-600 transition-colors">
                    Reporting
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@constructly.africa" className="hover:underline hover:text-blue-600 transition-colors">
                    support@constructly.africa
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:underline hover:text-blue-600 transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#docs" className="hover:underline hover:text-blue-600 transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#privacy" className="hover:underline hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:underline hover:text-blue-600 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-8">
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="rounded-full border-blue-500 bg-white text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl"
              >
                Get Started
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Or email us at{' '}
              <a href="mailto:hello@constructly.africa" className="underline hover:text-blue-500">
                hello@constructly.africa
              </a>
            </span>
          </div>

          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Constructly. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

// Animated SVG: Construction Scene
const ConstructionAnimation = () => (
  <svg width="800" height="400" viewBox="0 0 800 400" className="animate-pulse-slow">
    <rect x="0" y="300" width="800" height="100" fill="#1f2937" />
    <rect x="100" y="200" width="100" height="100" fill="#6b7280" />
    <rect x="120" y="150" width="60" height="50" fill="#3b82f6" />
    <circle cx="150" cy="130" r="10" fill="#fbbf24" />
    <rect x="300" y="220" width="150" height="80" fill="#9ca3af" />
    <rect x="330" y="180" width="90" height="40" fill="#10b981" />
    <rect x="500" y="240" width="120" height="60" fill="#ef4444" />
    <circle cx="530" cy="230" r="8" fill="#f59e0b" />
    <path d="M600 200 L630 170 L660 200" fill="none" stroke="#374151" strokeWidth="4" />
    <circle cx="630" cy="170" r="5" fill="#d97706" />
    {/* Moving Worker */}
    <g className="animate-bounce-slow">
      <rect x="200" y="280" width="10" height="20" fill="#374151" />
      <circle cx="205" cy="275" r="6" fill="#fbbf24" />
      <rect x="198" y="290" width="4" height="10" fill="#374151" />
      <rect x="208" y="290" width="4" height="10" fill="#374151" />
    </g>
  </svg>
);

export default Index;