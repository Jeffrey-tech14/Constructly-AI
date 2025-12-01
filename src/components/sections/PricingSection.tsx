import { motion } from "framer-motion";
import { 
  Loader2, 
  AlertCircle, 
  Check,
  ChevronRight,
  Home,
  Zap,
  Briefcase,
  Building2
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

const HERO_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop";

export default function PricingSection({ tiers, tiersLoading, tiersError, navigate }) {
  
  // --- THEME CONFIGURATION (Applying colors to buttons and accents) ---
  const getTheme = (index) => {
    const themes = [
      { 
        // 1. STARTER (Blue)
        subtitle: "STARTER",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        accentColor: "text-blue-600", // For subtitle and checks
        // Solid colored button
        btnStyles: "bg-blue-600 hover:bg-blue-700 text-white"
      },
      { 
        // 2. PROFESSIONAL (Teal/Cyan)
        subtitle: "PROFESSIONAL",
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        accentColor: "text-cyan-600",
        btnStyles: "bg-cyan-600 hover:bg-cyan-700 text-white"
      },
      { 
        // 3. ENTERPRISE (Purple)
        subtitle: "ENTERPRISE",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        accentColor: "text-purple-600",
        btnStyles: "bg-purple-600 hover:bg-purple-700 text-white"
      }
    ];
    return themes[index % themes.length];
  };

  if (tiersLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-gray-50 font-inter">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" /> 
        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Loading pricing options...</span>
      </div>
    );
  }

  if (tiersError) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-gray-50 text-red-600 font-inter">
        <AlertCircle className="w-8 h-8 mb-4" /> 
        <span className="font-bold">Unable to load pricing plans. Please refresh.</span>
      </div>
    );
  }

  return (
    <>
    <GlobalStyles />
    <div 
      id="pricing"
      className="font-inter text-[#1a1a1a] bg-gray-100 antialiased min-h-screen"
    >
      
      {/* =========================================
          1. HERO SECTION
      ========================================= */}
      <section className="relative h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={HERO_IMAGE} 
            alt="Support and Service" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001021]/95 to-[#003865]/90"></div>
        </div>

        <div className="relative z-10 max-w-[1250px] mx-auto px-6 h-full flex flex-col justify-center">
          <div className="absolute top-8 left-6 lg:left-8 flex items-center space-x-2 text-[10px] md:text-xs uppercase tracking-widest text-gray-400 font-medium">
            <Home className="w-3 h-3" />
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Pricing Plans</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mt-6"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-300 font-light max-w-xl">
              Essential tools to streamline your workflow and boost productivity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================================
          2. CARDS SECTION (Clean White Design with Color Accents)
      ========================================= */}
      <section className="relative z-20 -mt-20 pb-24 px-6">
        <div className="max-w-[1250px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {tiers?.map((plan, index) => {
              const theme = getTheme(index);
              const IconComponent = index === 0 ? Zap : index === 1 ? Briefcase : Building2;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  // Clean white card with shadow, matching reference image
                  className="bg-white rounded-2xl shadow-xl p-8 flex flex-col h-full hover:shadow-2xl transition-all duration-300"
                >
                  
                  {/* --- HEADER: Icon + Title + Subtitle --- */}
                  <div className="flex items-center gap-4 mb-8">
                    {/* Icon Circle with colored tint */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        {plan.image ? (
                           <img src={plan.image} alt={plan.name} className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                           // Icon with theme color
                           <IconComponent className={`w-6 h-6 ${theme.iconColor}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-[#001021] text-2xl font-bold leading-none mb-1">
                            {plan.name}
                        </h3>
                        {/* Subtitle with theme color accent */}
                        <div className={`text-xs font-bold uppercase tracking-widest ${theme.accentColor}`}>
                            {theme.subtitle}
                        </div>
                    </div>
                  </div>

                  {/* --- PRICE --- */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-gray-500">KES</span>
                      {/* Price stays dark as per image */}
                      <span className="text-5xl font-extrabold text-[#001021] tracking-tight">{plan.price}</span>
                      <span className="text-sm text-gray-500 font-medium">/year</span>
                    </div>
                  </div>

                  {/* --- DESCRIPTION --- */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 pb-8 border-b border-gray-100">
                      {plan.description || "Essential tools to streamline your workflow and boost productivity."}
                  </p>

                  {/* --- FEATURES LIST --- */}
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features?.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                        {/* Checkmark matches theme color */}
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme.accentColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* --- BUTTON (Solid Theme Color) --- */}
                  <button
                    onClick={() => navigate(`/auth?mode=signup&plan=${plan.id}`)}
                    className={`
                      w-full py-4 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl 
                      transition-all duration-300 shadow-sm hover:shadow-md
                      ${theme.btnStyles}
                    `}
                  >
                    Select Plan
                  </button>

                </motion.div>
              );
            })}

          </div>
        </div>
      </section>

    </div>
    </>
  );
}