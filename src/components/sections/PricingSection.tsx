// src/components/sections/PricingSection.tsx
import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Building2,
  Info,
  Box,
  Layers,
  Cpu,
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    .font-engineering { 
      letter-spacing: 0.01em;
    }
    .card-border { border: 1px solid #d1d5db; }
    .card-hover { transition: all 0.2s ease; }
    .card-hover:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.05); border-color: #9ca3af; }
    .price-bold { font-weight: 700 !important; color: #000 !important; }
    .icon-sharp { stroke-width: 1.5; }
  `}</style>
);

// --- THEME CONSTANTS ---
const BRAND = {
  blue: "#00356B",
  green: "#86bc25",
  gray: "#f3f5f7",
  textMain: "#333333",
  textLight: "#666666",
};

const getTheme = (index: number) => {
  return {
    id: `0${index + 1}`,
    icon:
      index === 0 ? (
        <Box size={24} className="icon-sharp" />
      ) : index === 1 ? (
        <Layers size={24} className="icon-sharp" />
      ) : (
        <Cpu size={24} className="icon-sharp" />
      ),
    label:
      index === 0 ? "STARTER" : index === 1 ? "PROFESSIONAL" : "ENTERPRISE",
  };
};

interface PricingSectionProps {
  tiers?: any[];
  tiersLoading?: boolean;
  tiersError?: string | null;
}

export default function PricingSection({
  tiers,
  tiersLoading,
  tiersError,
}: PricingSectionProps) {
  const navigate = useNavigate(); // ✅ Internal navigation hook

  if (tiersLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-[#f3f5f7] font-engineering">
        <Loader2
          className="w-8 h-8 animate-spin mb-3"
          style={{ color: BRAND.blue }}
        />
        <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
          Loading JTech Options...
        </span>
      </div>
    );
  }

  if (tiersError) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-white text-red-600 font-engineering">
        <AlertCircle className="w-8 h-8 mb-3" />
        <span className="font-bold text-base">
          Unable to load pricing plans.
        </span>
        <span className="text-xs text-slate-500 mt-1">
          Please verify your connection.
        </span>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div
        id="pricing"
        className="font-engineering antialiased text-[#333] bg-[#f9fafb]"
      >
        {/* HEADER SECTION */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row">
            <div className="p-8 md:p-10 md:w-2/3 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "radial-gradient(#00356B 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wide uppercase"
                    style={{ backgroundColor: BRAND.green }}
                  >
                    FY 2025
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Home</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span>Support</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span style={{ color: BRAND.blue }}>Pricing Plans</span>
                  </div>
                </div>

                <h1
                  className="text-2xl md:text-3xl lg:text-4xl font-light mb-4 leading-tight"
                  style={{ color: BRAND.blue }}
                >
                  JTech <strong className="font-bold">Estimation Plans</strong>
                </h1>

                <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6 max-w-2xl font-light">
                  Simple, transparent pricing for automated construction
                  estimating. Choose the right plan for your quoting volume.
                  Upgrade or cancel anytime.
                </p>

                <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">
                  {[
                    {
                      icon: (
                        <Check
                          className="w-3 h-3 icon-sharp"
                          style={{ color: BRAND.green }}
                        />
                      ),
                      text: "PDF / DWG / Image Support",
                    },
                    {
                      icon: (
                        <Check
                          className="w-3 h-3 icon-sharp"
                          style={{ color: BRAND.green }}
                        />
                      ),
                      text: "AI-Powered Takeoff",
                    },
                    {
                      icon: (
                        <Info className="w-3 h-3 text-blue-400 icon-sharp" />
                      ),
                      text: "Prices excl. VAT",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full"
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="md:w-1/3 text-white p-8 md:p-10 relative flex flex-col justify-center"
              style={{ backgroundColor: BRAND.blue }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#86bc25] icon-sharp" />
                  <span>Secure & Reliable</span>
                </h3>
                <div
                  className="w-10 h-0.5 mb-4"
                  style={{ backgroundColor: BRAND.green }}
                ></div>
                <p className="text-blue-100 text-xs md:text-sm leading-relaxed mb-5">
                  Your project files and estimates are securely processed and
                  stored. All exports are ready for client delivery with your
                  branding.
                </p>
                <button
                  onClick={() => navigate("/privacy")}
                  className="text-[10px] font-bold uppercase tracking-wider text-white border border-white/30 hover:bg-white/10 px-3 py-2 w-fit transition-colors rounded-sm"
                >
                  View Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section className="py-12 md:py-16">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tiers?.map((plan, index) => {
                const theme = getTheme(index);
                const isRecommended = index === 1;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex flex-col bg-white  shadow-none card-border card-hover ${
                      isRecommended ? "relative" : ""
                    }`}
                    style={{
                      borderTop: `3px solid ${
                        isRecommended ? BRAND.green : BRAND.blue
                      }`,
                    }}
                  >
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-[#86bc25] text-white text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-wider z-20">
                        Recommended
                      </div>
                    )}

                    <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                      <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-[#f8f9fa] text-[#00356B] border border-[#e5e7eb]">
                        {React.cloneElement(theme.icon, {
                          style: { color: BRAND.blue },
                        })}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                          {theme.label} / {theme.id}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="text-lg font-bold mb-1.5 text-slate-800 group-hover:text-[#00356B] transition-colors">
                        {plan.name}
                      </h3>

                      <div className="mb-4 flex items-baseline gap-1">
                        <span className="text-2xl price-bold">
                          KES {plan.price}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          / Year
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mb-5 leading-relaxed min-h-[40px]">
                        {plan.description ||
                          "Automated quantity takeoff and cost estimation from construction plans."}
                      </p>

                      <div className="mb-5 flex-grow">
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-2 block">
                          Included Features
                        </span>
                        <ul className="space-y-2">
                          {plan.features?.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <Check
                                className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 icon-sharp"
                                style={{ color: BRAND.green }}
                                strokeWidth={2}
                              />
                              <span className="text-xs text-slate-700 font-medium">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* ✅ Now uses internal navigate */}
                      <button
                        onClick={() => navigate(`/auth?plan=${plan.id}`)}
                        className="w-full py-2.5 px-4 text-[11px] font-bold text-white uppercase tracking-wider hover:brightness-105 transition-all border-none flex items-center justify-center gap-1.5 group-hover:gap-2 "
                        style={{
                          backgroundColor: isRecommended
                            ? BRAND.green
                            : BRAND.blue,
                        }}
                      >
                        Select Plan
                        <ChevronRight className="w-3 h-3 icon-sharp" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOOTER BADGES */}
        <section className="bg-white py-8 border-t border-gray-200">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center md:text-left">
              {[
                {
                  icon: (
                    <ShieldCheck
                      className="w-6 h-6 icon-sharp"
                      style={{ color: BRAND.blue }}
                    />
                  ),
                  title: "Secure Processing",
                  desc: "Files processed securely; deleted after export unless saved.",
                },
                {
                  icon: (
                    <Zap
                      className="w-6 h-6 icon-sharp"
                      style={{ color: BRAND.blue }}
                    />
                  ),
                  title: "Instant Estimates",
                  desc: "Get quotes in minutes, not hours.",
                },
                {
                  icon: (
                    <Building2
                      className="w-6 h-6 icon-sharp"
                      style={{ color: BRAND.blue }}
                    />
                  ),
                  title: "Branded Exports",
                  desc: "PDF quotes with your logo and company details.",
                },
                {
                  icon: (
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-sm text-white font-bold text-[10px] border border-white/20"
                      style={{ backgroundColor: BRAND.green }}
                    >
                      24/7
                    </div>
                  ),
                  title: "Support",
                  desc: "Email support for active subscribers.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center md:items-start gap-1.5"
                >
                  {item.icon}
                  <h4 className="text-xs font-bold text-slate-800">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
