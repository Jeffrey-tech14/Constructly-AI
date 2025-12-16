// src/components/sections/PaymentOptionsSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

// --- THEME CONSTANTS ---
const BRAND = {
  blue: "#00356B", // Deep JTech Blue
  green: "#86bc25", // Action Green
  gray: "#f3f5f7",
  textMain: "#333333",
};

const paymentMethods = [
  {
    id: "mastercard",
    name: "Mastercard",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  },
  {
    id: "visa",
    name: "Visa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png",
  },
];

const PaymentMethod = ({ method, index }) => (
  <motion.div
    className="group bg-white rounded-sm border border-gray-200 shadow-sm p-5 flex flex-col items-center justify-center h-36 w-full cursor-pointer hover:border-[#00356B] hover:shadow-md transition-all duration-300 relative overflow-hidden"
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
  >
    {/* Active Checkmark */}
    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <CheckCircle2 className="w-4 h-4" style={{ color: BRAND.green }} />
    </div>

    {/* Logo */}
    <img
      src={method.image}
      alt={method.name}
      className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
    />

    {/* Label */}
    <span className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-[#00356B] transition-colors">
      {method.name}
    </span>
  </motion.div>
);

export default function PaymentOptionsSection() {
  return (
    <>
      <motion.section
        id="payment-options"
        className="py-20 px-6 bg-[#f9fafb] font-engineering text-[#333] border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 text-[#00356B] text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm rounded-sm">
              <CreditCard className="w-3 h-3" />
              <span>Secure Transactions</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-light text-[#00356B] mb-4">
              Supported <strong className="font-bold">Payment Methods</strong>
            </h2>

            <p className="max-w-xl mx-auto text-slate-600 text-sm leading-relaxed">
              We offer flexible, secure payment integration tailored for
              enterprise requirements. Instant license activation upon
              successful transaction.
            </p>
          </div>

          {/* Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12 max-w-3xl mx-auto">
            {paymentMethods.map((method, index) => (
              <PaymentMethod key={method.id} method={method} index={index} />
            ))}
          </div>

          {/* Security Assurance Footer */}
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-sm border border-gray-200 shadow-sm">
              <ShieldCheck className="w-5 h-5" style={{ color: BRAND.green }} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Encryption
                </span>
                <span className="text-xs font-bold text-slate-700">
                  256-bit SSL Secured
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-sm border border-gray-200 shadow-sm">
              <Lock className="w-5 h-5" style={{ color: BRAND.blue }} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Compliance
                </span>
                <span className="text-xs font-bold text-slate-700">
                  PCI DSS Certified
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
