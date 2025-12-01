// src/components/sections/CTABanner.tsx
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    // Outer Container: White background with padding to separate from other sections
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 flex justify-center">
      
      {/* Inner Container: Deep Blue Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        // max-w-7xl keeps the box itself from touching the edges of large screens
        className="w-full max-w-7xl bg-[#101D42] py-24 px-6 text-center shadow-sm"
      >
        
        {/* Content Container to center everything inside */}
        <div className="flex flex-col items-center justify-center">
          
          {/* Main Heading - Sleek and Bold */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
            Share Your Success with Our Software!
          </h2>
          
          {/* Subtext - "Shrunk" using max-w-2xl to force line breaks like the image */}
          <p className="text-gray-100 text-sm md:text-base mb-10 leading-relaxed max-w-2xl font-medium opacity-90">
            Showcase your projects created using our solutions and gain increased visibility on our website, social networks, and in industry journals, along with a discount on our software.
          </p>

          {/* Outline Button - Sleek, Uppercase, Wide Spacing */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-white text-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-white hover:text-[#101D42] transition-colors duration-300"
          >
            Share Your Project and Benefit
          </motion.button>

        </div>

      </motion.div>
    </section>
  );
}