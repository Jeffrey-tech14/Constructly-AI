// src/components/sections/PricingSection.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  FileBadge,
  ArrowRight,
  CreditCard,
  Sparkles
} from "lucide-react";

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    .font-display {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .pricing-bg {
      background-color: #eef5ff; /* Light blue background */
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(200, 220, 230, 0.6);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); /* thicker white blurry shadow */
    }
    .glow-text {
      text-shadow: 0 0 16px rgba(134, 188, 37, 0.4);
    }
    @media (max-width: 768px) {
      .text-center-sm {
        text-align: center !important;
      }
      .flex-col-sm {
        flex-direction: column !important;
      }
      .gap-8-sm {
        gap: 2rem !important;
      }
    }
  `}</style>
);

export default function PricingSection({
  tiers,
  tiersLoading,
  tiersError,
}: {
  tiers?: any[];
  tiersLoading?: boolean;
  tiersError?: string | null;
}) {
  const navigate = useNavigate();

  // Loading State
  if (tiersLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-[#eef5ff]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00356B]" />
      </div>
    );
  }

  // Error State
  if (tiersError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#eef5ff]">
        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Pricing currently unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="font-display pricing-bg min-h-screen relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-[#00356B] tracking-tight mb-6"
            >
              Simple, transparent pricing.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 leading-relaxed"
            >
              No monthly subscriptions. No hidden fees.<br className="hidden sm:block" />
              Just professional estimating whenever you need it.
            </motion.p>
          </div>

          {/* Main Pricing Block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="glass-panel rounded-2xl overflow-hidden border border-[#d0e3ec] grid md:grid-cols-5">
              
              {/* LEFT PANEL: The Offer (RIB Blue Theme) */}
              <div className="md:col-span-2 bg-[#00356B] p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#86bc25] rounded-full mix-blend-overlay filter blur-[60px] opacity-15"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6 text-[#86bc25]">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                  
                  <h3 className="text-xl font-medium text-blue-100 mb-2">Pay As You Go</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl md:text-5xl font-bold tracking-tighter">1,000</span>
                    <span className="text-xl font-bold text-[#86bc25]">KES</span>
                  </div>
                  <p className="text-sm text-blue-200/90 leading-relaxed">
                    Perfect for contractors and architects who want premium results without the monthly overhead.
                  </p>
                </div>

                <div className="relative z-10 mt-8">
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full py-3.5 bg-[#86bc25] hover:bg-[#7aa821] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Start Estimating</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-xs text-blue-200/70 mt-3">
                    First quote is free • No credit card needed
                  </p>
                </div>
              </div>

              {/* RIGHT PANEL: Features (Clean White) */}
              <div className="md:col-span-3 bg-white p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-1">Everything included</h4>
                  <p className="text-sm text-slate-600">We don't gate features. One price gets you the full suite.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-y-5 gap-x-6">
                  {[
                    "AI Auto-Takeoff",
                    "Excel (BOQ) Export",
                    "Branded PDF Quotes",
                    "Unlimited Revisions",
                    "Local Material Prices",
                    "Secure Cloud Storage",
                    "PDF & DWG Support",
                    "Priority Email Support"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#86bc25] mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                    <span>Compatible with:</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">PDF</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded font-medium">XLS</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">DWG</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Footer */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8 border-t border-[#cfdbe3]">
            {[
              { icon: Shield, label: "Secure Processing" },
              { icon: Zap, label: "Instant Results" },
              { icon: FileBadge, label: "Professional Format" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2.5">
                <item.icon className="w-4.5 h-4.5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}