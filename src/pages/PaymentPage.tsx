import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Smartphone,
  Check,
  ArrowLeft,
  Shield,
  Briefcase,
  Coins,
  Loader2,
  Shell,
  Crown,
  Copy,
  ArrowBigUp,
  Monitor,
  Cpu,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// --- THEME CONSTANTS ---
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#86bc25", // Action Green
  HERO_ACCENT_BLUE: "#00356B", // Deep Blue
  TEXT_LIGHT: "#F0F0F0",
  BORDER_COLOR: "rgba(255,255,255,0.15)",
  FONT_FAMILY: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    .font-engineering { font-family: ${THEME.FONT_FAMILY}; }
  `}</style>
);

export interface Tier {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const location = useLocation();
  const { profile, updateProfile, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchTiers = async () => {
      setTiersLoading(true);
      setTiersError(null);
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("id", { ascending: true });
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
  }, [user, location.key]);

  const selectedPlanDetails = tiers.find((plan) => plan?.name === selectedPlan);
  const [selectedAction, setSelectedAction] = useState<string>("");

  useEffect(() => {
    if (profile) {
      setSelectedPlan(profile.tier || "Free");
      if (selectedPlanDetails?.name.toLocaleLowerCase() !== "free") {
        setSelectedAction("upgrade");
      } else setSelectedAction("downgrade");
    }
  }, [profile]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Free":
        return <Shell className="w-5 h-5" />;
      case "Intermediate":
        return <Crown className="w-5 h-5" />;
      case "Professional":
        return <Shield className="w-5 h-5" />;
      default:
        return <span className="text-sm font-medium">{tier}</span>;
    }
  };

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
          alt="Credit/Debit Card"
          className="w-8 h-8 object-contain"
        />
      ),
      description: "Secure Visa / Mastercard processing.",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
          alt="M-Pesa"
          className="w-8 h-8 object-contain"
        />
      ),
      description: "Mobile money (Kenya Region).",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Breezeicons-actions-22-view-bank.svg/640px-Breezeicons-actions-22-view-bank.svg.png"
          alt="Bank Transfer"
          className="w-8 h-8 object-contain"
        />
      ),
      description: "Direct enterprise wire transfer.",
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in font-engineering text-slate-300 relative overflow-hidden"
         style={{ backgroundColor: THEME.NAVY_BG }}>
      
      <GlobalStyles />

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-sm bg-[#00356B]/30 border border-[#00356B]">
              <Cpu className="w-4 h-4 text-[#86bc25]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#86bc25]">System Configuration</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-light text-white uppercase tracking-tight mb-3">
             Select <span className="font-bold">License Tier</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
             Choose the computational capacity required for your construction projects. Upgrade or downgrade instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Plans */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Monitor className="w-4 h-4 text-[#86bc25]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Available Tiers</h3>
            </div>

            <div className="space-y-4">
              {tiersLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-white/5 border border-white/10 rounded-sm animate-pulse"
                    ></div>
                  ))}
                </div>
              )}

              {tiersError && (
                <div className="p-4 rounded-sm bg-red-900/20 border-l-4 border-red-500 text-red-200 text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Failed to load configuration. Retry connection.
                </div>
              )}

              {tiers.map((plan) => {
                const isSelected = selectedPlan === plan.name;
                const isCurrent = plan.name === profile?.tier;
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => !isCurrent && setSelectedPlan(plan.name)}
                    className={`
                      relative rounded-sm border-t-4 p-6 transition-all duration-300 group
                      ${isSelected 
                        ? `bg-white/5 border-t-[#86bc25] border-x border-b border-white/10 shadow-lg` 
                        : `bg-[#000B29]/50 border-t-transparent border border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer`
                      }
                      ${isCurrent ? "opacity-70 cursor-not-allowed border-t-slate-500" : ""}
                    `}
                  >
                    {/* Active Plan Marker */}
                    {isCurrent && (
                        <div className="absolute top-0 right-0 bg-slate-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-bl-sm">
                            Current Active
                        </div>
                    )}

                    {/* Popular Tag - Technical Style */}
                    {plan.popular && !isCurrent && (
                      <div className="absolute top-0 right-0 bg-[#00356B] text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest border-b border-l border-[#86bc25]">
                        Recommended
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-sm border border-white/10 ${
                            plan.name === "Free"
                              ? "bg-slate-800 text-slate-400"
                              : plan.name === "Intermediate"
                              ? "bg-[#00356B]/40 text-blue-400"
                              : "bg-[#86bc25]/20 text-[#86bc25]"
                          }`}
                        >
                          {getTierBadge(plan.name)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold uppercase tracking-wider text-white">
                              {plan.name}
                            </h3>
                          </div>
                          <div className="flex items-baseline mt-1">
                            <span className="text-2xl font-mono font-light text-white">
                              {plan.price === 0
                                ? "Free"
                                : `KSh ${plan.price.toLocaleString()}`}
                            </span>
                            {plan.price > 0 && (
                              <span className="ml-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                / Month
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && !isCurrent && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#86bc25]">
                          <Check className="h-4 w-4 text-[#000B29]" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-white/10 mb-4"></div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-400">
                          <Check className="mr-3 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#86bc25]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {!isCurrent ? (
                      <Button
                        className={`w-full rounded-sm h-10 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          isSelected
                            ? "bg-[#86bc25] border-[#86bc25] text-white hover:bg-[#75a620]"
                            : "bg-transparent border-slate-600 text-slate-400 hover:border-white hover:text-white"
                        }`}
                      >
                        {isSelected ? "Plan Selected" : "Select Tier"}
                      </Button>
                    ) : (
                      <div className="w-full rounded-sm bg-slate-800 border border-slate-700 py-2.5 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        Currently Active
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Payment & Summary */}
          <div className="space-y-8 sticky top-8">
            
            {/* Payment Method Card */}
            <Card className="bg-[#000B29]/80 backdrop-blur-sm border border-white/10 rounded-sm shadow-xl overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/10 px-6 py-4">
                <CardTitle className="flex items-center text-xs font-bold uppercase tracking-widest text-white">
                  <CreditCard className="mr-2 h-4 w-4 text-[#86bc25]" />
                  Payment Gateway
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`group relative flex items-center justify-between rounded-sm border p-4 transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? "bg-[#00356B]/20 border-[#86bc25]"
                          : "bg-transparent border-white/10 hover:border-white/30 hover:bg-white/5"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-14 items-center justify-center rounded-sm bg-white p-1">
                          {method.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white uppercase tracking-wide">
                            {method.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {method.description}
                          </span>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="h-2 w-2 rounded-full bg-[#86bc25] shadow-[0_0_8px_#86bc25]"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            {selectedPlanDetails && (
              <Card className="bg-[#000B29]/80 backdrop-blur-sm border border-white/10 rounded-sm shadow-xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/10 px-6 py-4">
                  <CardTitle className="flex items-center text-xs font-bold uppercase tracking-widest text-white">
                    <Shell className="mr-2 h-4 w-4 text-[#86bc25]" />
                    Order Specification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-300">
                        {selectedPlanDetails.name} License
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {selectedPlanDetails.price === 0
                        ? "0.00"
                        : `${selectedPlanDetails.price.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-white uppercase tracking-wide">Total</span>
                      <div className="text-right">
                        <div className="text-xl font-mono font-bold text-[#86bc25]">
                          {selectedPlanDetails.price === 0
                            ? "FREE"
                            : `KSh ${selectedPlanDetails.price.toLocaleString()}`}
                        </div>
                        {selectedPlanDetails.price > 0 && (
                          <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            Billing Monthly
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <Button
                className={`w-full h-14 rounded-sm font-bold uppercase tracking-widest text-xs transition-all shadow-lg ${
                     processing || !selectedPlan || selectedPlan === profile?.tier
                     ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600"
                     : "bg-[#86bc25] hover:bg-[#75a620] text-white border border-[#86bc25] hover:shadow-[#86bc25]/20"
                }`}
                onClick={() => {
                  navigate("/payments/action", {
                    state: {
                      plan: selectedPlanDetails?.name,
                      paymentAmount: selectedPlanDetails?.price,
                      action: selectedAction,
                    },
                  });
                }}
                disabled={
                  processing || !selectedPlan || selectedPlan === profile?.tier
                }
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing Transaction...
                  </>
                ) : selectedPlan === profile?.tier ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Already Active
                  </>
                ) : selectedPlanDetails?.price === 0 ? (
                  "Downgrade System"
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Process Payment
                  </>
                )}
              </Button>
              
              <div className="flex justify-center gap-4 pt-4">
                 <div className="flex items-center gap-1 opacity-50">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] uppercase font-bold text-slate-400">SSL Encrypted</span>
                 </div>
                 <div className="w-px h-3 bg-white/20"></div>
                 <div className="flex items-center gap-1 opacity-50">
                    <Check className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] uppercase font-bold text-slate-400">Cancel Anytime</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentPage;