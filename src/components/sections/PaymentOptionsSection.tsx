// src/components/sections/PaymentOptionsSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Lock } from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

const paymentMethods = [
  { id: "paypal", name: "PayPal", image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
  { id: "mastercard", name: "Mastercard", image: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
  { id: "visa", name: "Visa", image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
  // Using a cleaner, official-looking M-Pesa logo asset
  { id: "mpesa", name: "M-Pesa", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" },
];

const PaymentMethod = ({ method, index }) => (
  <motion.div
    // Card container styles - keeps the hover lift effect on the card itself
    className="relative group bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center h-28 cursor-pointer hover:border-[#005F9E] hover:shadow-xl transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -4 }}
  >
    {/* UPDATED IMAGE: 
       Removed 'filter grayscale opacity-70' so icons retain original colors.
    */}
    <img
      src={method.image}
      alt={method.name}
      className="max-h-12 md:max-h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
    />
  </motion.div>
);

export default function PaymentOptionsSection() {
  return (
    <>
      <GlobalStyles />
      <motion.section
        id="payment-options"
        className="py-24 px-6 bg-[#F5F7FA] font-inter text-[#1a1a1a]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-[1250px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001021] text-white text-[10px] font-bold uppercase tracking-[0.15em] mb-6 shadow-md">
              <CreditCard className="w-3 h-3" />
              <span>Secure Checkout</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-[#001021] mb-6 tracking-tight">
              Multiple Secure Payment Methods
            </h2>
            
            <p className="max-w-2xl mx-auto text-gray-600 text-base md:text-lg leading-relaxed">
              We offer flexible payment options tailored to your region. Choose the method that works best for you and upgrade your workflow instantly.
            </p>
          </div>

          {/* Payment Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
            {paymentMethods.map((method, index) => (
              <PaymentMethod key={method.id} method={method} index={index} />
            ))}
          </div>

          {/* Security Assurance Footer */}
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-6 opacity-80"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-[#003865] font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>SSL Encrypted Transaction</span>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-[#003865] font-medium">
              <Lock className="w-4 h-4 text-[#005F9E]" />
              <span>PCI DSS Compliant</span>
            </div>
          </motion.div>

        </div>
      </motion.section>
    </>
  );
}