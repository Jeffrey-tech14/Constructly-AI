import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

export default function PricingSection({
  tiersLoading,
  tiersError,
}: {
  tiersLoading?: boolean;
  tiersError?: string | null;
}) {
  const navigate = useNavigate();

  if (tiersLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-[#1a1a1a]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (tiersError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#1a1a1a]">
        <div className="flex items-center gap-2 text-red-500 bg-red-50/10 px-4 py-2 rounded-lg border border-red-500/20">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-red-400">
            Pricing currently unavailable
          </span>
        </div>
      </div>
    );
  }

  const features = [
    "AI Auto-Takeoff & Measurements",
    "Excel (BOQ) Export Integration",
    "Branded PDF Quotes Generation",
    "Unlimited File Revisions",
    "Local Material Prices Database",
    "Secure Cloud Storage Included",
    "PDF & DWG Format Support",
  ];

  return (
    <div
      id="pricing"
      className="bg-white py-16 flex items-center justify-center font-sans tracking-wide"
    >
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#27272a] rounded-sm shadow-2xl p-8 md:p-12 border-t-2 border-[#3f3f46] flex flex-col md:flex-row gap-12"
        >
          {/* Left Column */}
          <div className="flex-1 text-white">
            <h2 className="text-4xl md:text-[44px] font-light mb-4">
              Standard
            </h2>
            <p className="text-[15px] text-gray-300 mb-6">
              Comprehensive feature set for construction professionals
            </p>
            <p className="text-[15px] font-bold text-[#f0514e] mb-8">
              Pay as you go · No monthly commitment
            </p>

            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#f0514e]" />
                  <span className="text-[14px] text-gray-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[340px] flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#3f3f46] pt-8 md:pt-0 md:pl-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl text-gray-400 line-through decoration-gray-500">
                1,000 KES
              </span>
              <span className="bg-[#f0514e] text-white text-[11px] font-bold px-2 py-1 rounded-sm leading-none">
                80%
                <br />
                OFF
              </span>
            </div>

            <div className="text-[46px] text-white font-light mb-2 leading-none">
              200 <span className="text-3xl">KES</span>
            </div>

            <p className="text-[12px] text-gray-300 mb-8">
              per quote (billed per use)
            </p>

            <button
              onClick={() => navigate("/auth")}
              className="w-full max-w-[200px] bg-[#f0514e] hover:bg-[#d94441] text-white text-[15px] font-bold py-3.5 rounded-sm transition-colors mb-6 shadow-lg shadow-[#f0514e]/20"
            >
              Buy Now
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed max-w-[240px]">
              Additional taxes (VAT) may be applied to your purchase. The order
              is billed securely. *Quote=One complete project estimate.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Adjusted logo sizing and UI spacing
