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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PaymentDialog from "@/components/PaymentDialog";
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
        return <Shell className="w-6 h-6" />;
      case "Intermediate":
        return <Crown className="w-6 h-6" />;
      case "Professional":
        return <Shield className="w-6 h-6" />;
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
          className="w-10 h-10 object-contain"
        />
      ),
      description: "Pay securely with Visa, Mastercard, or American Express.",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
          alt="M-Pesa"
          className="w-10 h-10 object-contain"
        />
      ),
      description: "Mobile payments for Kenyan users.",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Breezeicons-actions-22-view-bank.svg/640px-Breezeicons-actions-22-view-bank.svg.png"
          alt="Bank Transfer"
          className="w-10 h-10 object-contain"
        />
      ),
      description: "Direct bank transfers for enterprise payments.",
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="sm:text-3xl items-center text-2xl flex items-center justify-center font-bold bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
            <Monitor className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
            Upgrade Your Plan
          </h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text  mt-2">
            Choose the plan that fits your construction business needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiersLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-32 dark:bg-gray-900 bg-gray-300 rounded-md animate-pulse"
                      ></div>
                    ))}
                  </div>
                )}

                {tiersError && (
                  <div className="p-4 rounded-md bg-destructive text-white">
                    Failed to load pricing tiers. Please try again
                  </div>
                )}

                {tiers.map((plan) => {
                  const isSelected = selectedPlan === plan.name;
                  const isCurrent = plan.name === profile?.tier;
                  return (
                    <div
                      key={plan.id}
                      className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300
        ${
          isSelected
            ? "border-primary shadow-lg shadow-primary/20 dark:shadow-white/30 dark:border-white bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900"
            : "border-border hover:border-primary/30 dark:hover:border-white/20 hover:shadow-md bg-white dark:bg-slate-900"
        }
        ${
          isCurrent
            ? "opacity-80 dark:border-white/80 cursor-not-allowed grayscale-[20%]"
            : "cursor-pointer"
        }`}
                      onClick={() => !isCurrent && setSelectedPlan(plan.name)}
                    >
                      {plan.popular && (
                        <div className="absolute -right-10 top-4 rotate-45 z-20">
                          <div className="w-36 bg-gradient-to-r from-primary to-purple-600 py-1 text-center text-xs font-bold text-white shadow-lg">
                            POPULAR
                          </div>
                        </div>
                      )}

                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full ${
                              plan.name === "Free"
                                ? "bg-green-100 text-green-700"
                                : plan.name === "Intermediate"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {getTierBadge(plan.name)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold tracking-tight">
                                {plan.name}
                              </h3>
                              {isCurrent && (
                                <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">
                                  <Check className="mr-1 h-3 w-3" /> Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {plan.price === 0
                                  ? "Free"
                                  : `KSh ${plan.price.toLocaleString()}`}
                              </span>
                              {plan.price > 0 && (
                                <span className="ml-1 text-sm font-medium text-muted-foreground">
                                  /month
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isSelected && !isCurrent && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary dark:bg-white">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <ul className="mb-6 space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {!isCurrent ? (
                        <Button
                          className={`w-full rounded-full py-2   ${
                            isSelected
                              ? "bg-primary text-white hover:bg-primary/90"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select Plan"}
                        </Button>
                      ) : (
                        <div className="w-full rounded-full bg-green-100 py-2 text-center text-sm font-semibold text-green-800">
                          Active Plan
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/40 border-b px-6 py-4">
                <CardTitle className="flex items-center text-base font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5 text-primary dark:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`group relative flex border-border border-primary/10 dark:border-white/10 border-primary/10 items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === method.id
                          ? "border-primary dark:border-white/80 bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 dark:hover:border-white/30 hover:bg-accent/50 cursor-pointer"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center text-white justify-center rounded-lg ${
                            paymentMethod === method.id
                              ? "bg-primary/10"
                              : "bg-background/40"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {method.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {method.description}
                          </span>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary dark:bg-white shadow-sm">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedPlanDetails && (
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/40 border-b dark:border-white/30 px-6 py-4">
                  <CardTitle className="flex items-center text-base font-semibold">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-primary dark:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {selectedPlanDetails.name} Plan
                      </span>
                    </div>
                    <span className="font-semibold">
                      {selectedPlanDetails.price === 0
                        ? "Free"
                        : `KSh ${selectedPlanDetails.price.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t dark:border-white/30 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold sm:text-xl">Total</span>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {selectedPlanDetails.price === 0
                            ? "Free"
                            : `KSh ${selectedPlanDetails.price.toLocaleString()}`}
                        </div>
                        {selectedPlanDetails.price > 0 && (
                          <div className="text-sm text-muted-foreground">
                            per month
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
                className="w-full h-12 text-base text-white font-semibold rounded-xl"
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
                  processing ||
                  !selectedPlan ||
                  selectedPlanDetails?.price === 0 ||
                  selectedPlan === profile?.tier
                }
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : selectedPlan === profile?.tier ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Current Plan
                  </>
                ) : selectedPlanDetails?.price === 0 ? (
                  "Downgrade to Free"
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Complete Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentPage;
