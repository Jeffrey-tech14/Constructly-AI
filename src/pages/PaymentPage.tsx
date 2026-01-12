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
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();
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
  }, [user]);

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
      case "Professional":
        return <Shield className="w-5 h-5" />;
      case "Enterprise":
        return <Crown className="w-5 h-5" />;
      default:
        return <span className="text-sm font-medium">{tier}</span>;
    }
  };

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
            alt="Credit/Debit Card"
            className="w-6 h-6 object-contain dark:invert-0 invert"
          />
        </div>
      ),
      description: "Secure Visa / Mastercard processing.",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
            alt="M-Pesa"
            className="w-6 h-6 object-contain dark:invert-0 invert"
          />
        </div>
      ),
      description: "Mobile money (Kenya Region).",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Breezeicons-actions-22-view-bank.svg/640px-Breezeicons-actions-22-view-bank.svg.png"
            alt="Bank Transfer"
            className="w-6 h-6 object-contain dark:invert-0 invert"
          />
        </div>
      ),
      description: "Direct enterprise wire transfer.",
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in  relative overflow-hidden">
      {/* Background Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 border border-primary/20">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              System Configuration
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-light text-foreground uppercase tracking-tight mb-3">
            Select <span className="font-bold">License Tier</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Choose the computational capacity required for your construction
            projects. Upgrade or downgrade instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Plans */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Monitor className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Available Tiers
              </h3>
            </div>

            <div className="space-y-4">
              {tiersLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted/50 border border-border rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              )}

              {tiersError && (
                <div className="p-4 rounded-lg bg-destructive/10 border-l-4 border-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2">
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
                      relative rounded-lg border p-6 transition-all duration-300 group cursor-pointer
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
                      }
                      ${
                        isCurrent
                          ? "opacity-70 cursor-not-allowed border-primary/50"
                          : ""
                      }
                    `}
                  >
                    {/* Active Plan Marker */}
                    {isCurrent && (
                      <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-bl-lg rounded-tr-lg">
                        Current Active
                      </div>
                    )}

                    {/* Popular Tag */}
                    {plan.popular && !isCurrent && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg rounded-tr-lg">
                        Recommended
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                            plan.name === "Free"
                              ? "bg-muted text-muted-foreground border-muted-foreground/20"
                              : plan.name === "Professional"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-primary/20 text-primary border-primary/40"
                          }`}
                        >
                          {getTierBadge(plan.name)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">
                              {plan.name}
                            </h3>
                          </div>
                          <div className="flex items-baseline mt-1">
                            <span className="text-2xl font-mono font-light text-foreground">
                              {plan.price === 0
                                ? "Free"
                                : `KSh ${plan.price.toLocaleString()}`}
                            </span>
                            {plan.price > 0 && (
                              <span className="ml-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                                / Month
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && !isCurrent && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check
                            className="h-4 w-4 text-primary-foreground"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-full h-px bg-border mb-4"></div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-sm text-muted-foreground"
                        >
                          <Check className="mr-3 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {!isCurrent ? (
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full rounded-lg h-10 text-[10px] font-bold uppercase tracking-widest transition-all ${
                          isSelected ? "" : "border-border hover:border-primary"
                        }`}
                      >
                        {isSelected ? "Plan Selected" : "Select Tier"}
                      </Button>
                    ) : (
                      <div className="w-full rounded-lg bg-muted border border-border py-2.5 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
            <Card className="bg-card backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
              <CardHeader className="bg-accent/50 border-b border-border px-6 py-4">
                <CardTitle className="flex items-center text-xs font-bold uppercase tracking-widest text-foreground">
                  <CreditCard className="mr-2 h-4 w-4 text-primary" />
                  Payment Gateway
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`group relative flex items-center justify-between rounded-lg border p-4 transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-transparent hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-muted p-1">
                          {method.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground uppercase tracking-wide">
                            {method.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {method.description}
                          </span>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            {selectedPlanDetails && (
              <Card className="bg-card backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
                <CardHeader className="bg-accent/50 border-b border-border px-6 py-4">
                  <CardTitle className="flex items-center text-xs font-bold uppercase tracking-widest text-foreground">
                    <Shell className="mr-2 h-4 w-4 text-primary" />
                    Order Specification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">
                        {selectedPlanDetails.name} License
                      </span>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {selectedPlanDetails.price === 0
                        ? "0.00"
                        : `${selectedPlanDetails.price.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-foreground uppercase tracking-wide">
                        Total
                      </span>
                      <div className="text-right">
                        <div className="text-xl font-mono font-bold text-primary">
                          {selectedPlanDetails.price === 0
                            ? "FREE"
                            : `KSh ${selectedPlanDetails.price.toLocaleString()}`}
                        </div>
                        {selectedPlanDetails.price > 0 && (
                          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
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
                className={`w-full h-14 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-lg ${
                  processing || !selectedPlan || selectedPlan === profile?.tier
                    ? "opacity-50 cursor-not-allowed"
                    : ""
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
                <div className="flex items-center gap-1 opacity-70">
                  <Shield className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    SSL Encrypted
                  </span>
                </div>
                <div className="w-px h-3 bg-border"></div>
                <div className="flex items-center gap-1 opacity-70">
                  <Check className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Cancel Anytime
                  </span>
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
