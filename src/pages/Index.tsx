import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DraftingCompass,
  FileText,
  Calculator,
  Users,
  TrendingUp,
  Star,
  Building,
  Clock,
  CheckCircle,
  ArrowRight,
  Hammer,
  Ruler,
  HardHat,
  Menu,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Layers,
  Zap,
  LineChart,
  PhoneCall,
  Mail,
  ExternalLink,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

// app
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TestimonialsSection } from "@/components/Testimonials";

/**
 * Tier record from Supabase
 */
export interface Tier {
  id: number;
  name: string;
  price: number; // display price (e.g., 1499)
  period: string; // e.g., "mo", "yr"
  features: string[]; // list of bullet points
  popular: boolean; // flag
}

/**
 * Page: Full visual overhaul of the landing page
 * - Cross‑platform, dark-mode polished
 * - Pricing pulls from Supabase (tiers table)
 * - No logic removed; all key behaviors preserved & improved
 *
 * Sections:
 *  - Navbar (Theme toggle + mobile sheet)
 *  - Hero (parallax backdrop)
 *  - Trust/Highlights
 *  - Who It’s For
 *  - Features Grid
 *  - How It Works (3-step)
 *  - Pricing (from Supabase tiers)
 *  - FAQ (Accordion)
 *  - Testimonials
 *  - CTA Banner
 *  - Footer
 */
const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // UI State
  const [menuOpen, setMenuOpen] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState<string | null>(null);

  // Parallax hero ref
  const heroRef = useRef<HTMLDivElement>(null);

  // -------- Effects
  // Redirect authenticated users
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Fetch pricing tiers from Supabase
  useEffect(() => {
    let cancelled = false;
    const fetchTiers = async () => {
      setTiersLoading(true);
      setTiersError(null);
      const { data, error } = await supabase.from("tiers").select("*").order("id", { ascending: true });
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

  // Parallax background shift
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      heroRef.current.style.backgroundPosition = `center ${window.scrollY * 0.35}px`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuItems = useMemo(() => [
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact" },
  ], []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen text-foreground selection:bg-blue-200 dark:selection:bg-blue-800">
      {/* Decorative background orbs */}
      <BackdropOrbs />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm border-b border-white/20 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Logo />

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((m) => (
                <Button
                  key={m.id}
                  variant="ghost"
                  size="sm"
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => scrollTo(m.id)}
                >
                  {m.label}
                </Button>
              ))}
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth?mode=signin")}>Sign In</Button>
              <Button
                onClick={() => navigate("/auth?mode=signup")}
                className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 shadow-lg"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <div className="flex items-center gap-2">
                      <Logo compact />
                    </div>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col gap-2">
                    {menuItems.map((m) => (
                      <Button key={m.id} variant="ghost" className="justify-start" onClick={() => { scrollTo(m.id); setMenuOpen(false); }}>
                        {m.label}
                      </Button>
                    ))}
                    <div className="pt-3 flex gap-2">
                      <Button className="flex-1" variant="ghost" onClick={() => { navigate("/auth?mode=signin"); setMenuOpen(false); }}>Sign In</Button>
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white" onClick={() => { navigate("/auth?mode=signup"); setMenuOpen(false); }}>Get Started</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header
        ref={heroRef}
        className="relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
          <div className="mx-auto text-center">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1">
              <Star className="w-4 h-4 mr-1 inline" /> Professional Construction Management
            </Badge>
            <h1 className="mt-6 text-5xl md:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Build Accurate Quotes
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                in Minutes
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your business with takeoffs, BOQs, and client-ready proposals — built for contractors in Kenya.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/auth?mode=signup")}
                size="lg"
                className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => scrollTo("features")}
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <svg className="absolute bottom-0 left-0 w-full h-10 text-blue-600 dark:text-slate-600" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,64L60,64C120,64,240,64,360,53.3C480,43,600,21,720,21.3C840,21,960,43,1080,58.7C1200,75,1320,85,1380,90.7L1440,96L1440,160L1380,160C1320,160,1200,160,1080,160C960,160,840,160,720,160C600,160,480,160,360,160C240,160,120,160,60,160L0,160Z" />
        </svg>
      </header>

      {/* Trust badges / highlights */}
      <section className="pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, label: "Reliable" },
              { icon: <Zap className="w-5 h-5" />, label: "Fast Quotes" },
              { icon: <Layers className="w-5 h-5" />, label: "BOQ Ready" },
              { icon: <LineChart className="w-5 h-5" />, label: "Analytics" },
              { icon: <Hammer className="w-5 h-5" />, label: "Contractor‑First" },
              { icon: <Ruler className="w-5 h-5" />, label: "Accurate" },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-full bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                {b.icon} <span className="text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it’s for */}
      <section className="py-14" aria-labelledby="who-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading id="who-title" eyebrow="Tailored for your workflow" title="Who It’s For" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[
              { emoji: "🏗️", role: "Contractors", desc: "Bring your own rates & margins." },
              { emoji: "📐", role: "Quantity Surveyors", desc: "Takeoffs, BOQs & exports." },
              { emoji: "🏘️", role: "SMEs & Developers", desc: "Clear pricing, better decisions." },
            ].map((item, i) => (
              <Card key={i} className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-3">{item.emoji}</div>
                  <h3 className="text-xl font-semibold mb-1">{item.role}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading id="features-title" eyebrow="All-in-one toolkit" title="Everything you need to manage construction projects" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {[
              { icon: <FileText className="w-7 h-7" />, title: "Professional Quotes", description: "Detailed, accurate proposals with your rates, margins, and timelines." },
              { icon: <Calculator className="w-7 h-7" />, title: "Cost Calculator", description: "Live calculations with regional multipliers and service rates." },
              { icon: <Users className="w-7 h-7" />, title: "Client Management", description: "Track clients, projects, and approvals in one place." },
              { icon: <TrendingUp className="w-7 h-7" />, title: "Business Analytics", description: "See revenue, conversion, and project KPIs at a glance." },
              { icon: <Building className="w-7 h-7" />, title: "Project Types", description: "Residential, commercial, and infrastructure supported." },
              { icon: <Clock className="w-7 h-7" />, title: "Time Tracking", description: "Keep timelines on track with milestones and reminders." },
            ].map((f, i) => (
              <Card
                key={i}
                className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <CardContent className="p-8">
                  <div className="mb-4 w-fit p-3 rounded-xl dark:text-white shadow-md">{f.icon}</div>
                  <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16" aria-labelledby="how-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading id="how-title" eyebrow="Simple steps" title="How it works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: <HardHat className="w-7 h-7" />, title: "1. Set your rates", desc: "Enter material and service rates. Add regional multipliers and profit margins." },
              { icon: <Ruler className="w-7 h-7" />, title: "2. Analyze plans", desc: "Upload drawings, run takeoffs, and generate quantities instantly." },
              { icon: <Hammer className="w-7 h-7" />, title: "3. Send proposals", desc: "Export branded quotes and BOQs. Win more jobs with clarity." },
            ].map((s, i) => (
              <Card key={i} className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-4 w-fit p-3 rounded-xl dark:text-white  shadow-md">{s.icon}</div>
                  <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20" aria-labelledby="pricing-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading id="pricing-title" eyebrow="Start free" title="Choose your plan" />

          {/* Loading / Error states */}
          {tiersLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10" aria-live="polite" aria-busy>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-2xl border-0 shadow-xl bg-white/60 dark:bg-slate-900/60">
                  <CardContent className="p-8 animate-pulse">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <div key={j} className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
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
                <Card
                  key={plan.id}
                  className={`relative rounded-2xl border-0 shadow-xl transition-transform hover:-translate-y-1 ${
                    plan.popular ? "ring-4 ring-blue-500/80 scale-[1.02]" : ""
                  } bg-white/70 dark:bg-slate-900/60`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-1 rounded-full shadow-md">
                      🌟 Most Popular
                    </Badge>
                  )}
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground ml-1">/{plan.period}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                          <span className="text-sm leading-relaxed text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => navigate("/auth?mode=signup")}
                      className={`mt-8 w-full rounded-full py-5 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16" aria-labelledby="faq-title">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading id="faq-title" eyebrow="Good to know" title="Frequently asked questions" />
          <div className="mt-6">
            <Accordion type="multiple" className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 shadow-lg overflow-hidden">
              {[
                {
                  q: "Is there a free plan?",
                  a: "Yes. You can start free with essential tools and upgrade anytime to unlock advanced features.",
                },
                {
                  q: "Do you support Kenyan market rates?",
                  a: "Yes. You can bring your own rates, and we support regional multipliers and contractor-specific pricing.",
                },
                {
                  q: "Can I export BOQs and proposals?",
                  a: "Absolutely. Generate client-ready PDFs and spreadsheets from your takeoffs.",
                },
                {
                  q: "How do I get support?",
                  a: "Reach us via email or the in-app help. We respond quickly to keep your projects moving.",
                },
              ].map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-b border-slate-200 dark:border-slate-800">
                  <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold">
                    <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> {item.q}</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20" aria-labelledby="testimonials-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading id="testimonials-title" eyebrow="Loved by contractors" title="What contractors say" />
          <div className="mt-6">
            <TestimonialsSection />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="uppercase tracking-wider text-white/80 text-xs mb-1">Ready to build better?</p>
                <h3 className="text-2xl md:text-3xl font-bold">Create your first quote in minutes</h3>
                <p className="text-white/80 mt-2">No credit card required. Cancel anytime.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="rounded-full text-slate-900"
                  onClick={() => navigate("/auth?mode=signin")}
                >
                  Sign In
                </Button>
                <Button
                  className="rounded-full bg-white text-slate-900 hover:bg-white/90"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/30 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Empowering construction professionals across Kenya with modern quote, takeoff, and project tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm mb-8">
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2">
                <li><a className="hover:underline hover:text-blue-600" href="#features">Quote Builder</a></li>
                <li><a className="hover:underline hover:text-blue-600" href="#features">Project Management</a></li>
                <li><a className="hover:underline hover:text-blue-600" href="#features">Analytics</a></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-center sm:justify-start gap-2"><Mail className="w-4 h-4" /><a className="hover:underline" href="mailto:support@constructly.africa">support@constructly.africa</a></li>
                <li><a className="hover:underline hover:text-blue-600" href="#faq">FAQs</a></li>
                <li><a className="hover:underline hover:text-blue-600" href="#">Documentation</a></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a className="hover:underline hover:text-blue-600" href="#">Privacy Policy</a></li>
                <li><a className="hover:underline hover:text-blue-600" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-3.5 h-3.5" /> <span>+254 700 000 000</span>
              <span className="hidden sm:inline">•</span>
              <a className="inline-flex items-center gap-1 hover:underline" href="#" rel="noreferrer">
                Learn more <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div>© {new Date().getFullYear()} Constructly. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/** Logo */
const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div className="flex items-center group select-none">
    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-md group-hover:scale-105 transition-transform">
      <DraftingCompass className="w-5 h-5 text-white" />
    </div>
    {!compact && (
      <span className="ml-2 font-bold text-lg sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Constructly
      </span>
    )}
  </div>
);

/** Section heading helper */
const SectionHeading = ({ id, eyebrow, title }: { id?: string; eyebrow?: string; title: string }) => (
  <div id={id} className="text-center">
    {eyebrow && (
      <p className="uppercase tracking-widest text-xs text-blue-700/80 dark:text-blue-300/80">{eyebrow}</p>
    )}
    <h2 className="mt-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
      {title}
    </h2>
  </div>
);

/** Decorative floating orbs */
const BackdropOrbs = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-700/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-700/20 rounded-full blur-3xl animate-pulse delay-1000" />
  </div>
);

/** Optional: Animated construction scene (kept lightweight) */
export const ConstructionAnimation = () => (
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
    <g className="animate-bounce-slow">
      <rect x="200" y="280" width="10" height="20" fill="#374151" />
      <circle cx="205" cy="275" r="6" fill="#fbbf24" />
      <rect x="198" y="290" width="4" height="10" fill="#374151" />
      <rect x="208" y="290" width="4" height="10" fill="#374151" />
    </g>
  </svg>
);

export default Index;
