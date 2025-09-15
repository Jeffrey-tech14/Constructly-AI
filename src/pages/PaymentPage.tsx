// src/pages/PaymentPage.tsx
import { useState, useEffect } from "react";
import { usePayment, PaymentDetails, PaymentMethod } from "@/hooks/usePayment";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Tier {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
}

const PaymentPage = () => {
  const {
    loading: paymentLoading,
    error: paymentError,
    result: paymentResult,
    initiatePayment,
  } = usePayment();

  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [showPaypalDialog, setShowPaypalDialog] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardName, setCardName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tiers, setTiers] = useState<Tier[]>([]);
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

  useEffect(() => {
    if (profile) {
      setSelectedPlan(profile.tier || "Free");
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
      icon: <CreditCard className="w-10 h-10" />,
      description: "Pay securely with Visa, Mastercard, or American Express.",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: <Smartphone className="w-10 h-10" />,
      description: "Mobile payments for Kenyan users.",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: <Briefcase className="w-10 h-10" />,
      description: "Direct bank transfers for enterprise payments.",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <Coins className="w-10 h-10" />,
      description: "International payments processed securely.",
    },
  ];

  const handlePayment = async () => {
    if (!selectedPlan || !paymentMethod) {
      toast({
        title: "Selection Required",
        description: "Please select a plan and payment method.",
        variant: "destructive",
      });
      return;
    }

    // Show dialogs for info collection
    if (paymentMethod === "mpesa") {
      setShowMpesaDialog(true);
      return;
    }
    if (paymentMethod === "paypal") {
      setShowPaypalDialog(true);
      return;
    }
    if (paymentMethod === "bank") {
      setShowBankDialog(true);
      return;
    }
    if (paymentMethod === "card") {
      setShowCardDialog(true);
      return;
    }

    await processPayment({});
  };

  const processPayment = async (extra: any) => {
    setProcessing(true);

    try {
      const selectedPlanDetails = tiers.find(
        (plan) => plan.name === selectedPlan
      );

      if (!selectedPlanDetails) {
        toast({
          title: "Error",
          description: "Selected plan not found.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Validate payment method specific details
      if (paymentMethod === "card") {
        if (!cardName || cardName.trim().length < 2) {
          toast({
            title: "Invalid Card Name",
            description: "Please enter the cardholder name.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
          toast({
            title: "Invalid Card Number",
            description: "Please enter a valid 16-digit card number.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          toast({
            title: "Invalid Expiry Date",
            description: "Please use format MM/YY.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        if (!/^\d{3,4}$/.test(cardCVC)) {
          toast({
            title: "Invalid CVC",
            description: "Please enter a valid 3 or 4-digit CVC.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }
      }

      if (
        paymentMethod === "mpesa" &&
        (!mpesaPhone || !/^(\+?254|0)(7[0-9]|1[0-9])\d{7}$/.test(mpesaPhone))
      ) {
        toast({
          title: "Invalid M-Pesa Number",
          description: "Please enter a valid Kenyan phone number.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      if (
        paymentMethod === "paypal" &&
        (!paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail))
      ) {
        toast({
          title: "Invalid PayPal Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      if (paymentMethod === "bank" && !bankAccount) {
        toast({
          title: "Bank Account Required",
          description: "Please enter your bank account number.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      const details: PaymentDetails = {
        amount: selectedPlanDetails.price,
        currency: "KES",
        method: paymentMethod as PaymentMethod,
        userId: user.id,
        plan: selectedPlan,
        userEmail: user.email!,
        userName: profile?.name || "User",
        mpesaPhone,
        paypalEmail,
        bankAccount,
        cardNumber,
        cardExpiry,
        cardCVC,
        cardName,
        ...extra,
      };

      toast({
        title: "Processing Payment",
        description: "Please wait while we process your payment...",
      });

      const result = await initiatePayment(details);

      if (result.success) {
        if (result.approvalUrl && paymentMethod === "paypal") {
          // Redirect to PayPal for approval
          window.location.href = result.approvalUrl;
          return;
        }

        if (result.bankDetails && paymentMethod === "bank") {
          // Show bank transfer instructions
          toast({
            title: "Bank Transfer Instructions",
            description: `Please transfer KSh ${selectedPlanDetails.price.toLocaleString()} to ${
              result.bankDetails.bank_name
            } Account ${result.bankDetails.account_number}`,
            duration: 10000,
          });

          // Poll for payment status
          checkPaymentStatus(result.transactionId!);
          return;
        }

        // For immediate payment methods, update profile
        if (paymentMethod === "card" || paymentMethod === "mpesa") {
          await updateProfile({
            tier: selectedPlan as "Free" | "Intermediate" | "Professional",
          });

          toast({
            title: "Payment Successful!",
            description: `Welcome to ${selectedPlan} plan!`,
          });

          navigate("/dashboard");
        }
      } else {
        toast({
          title: "Payment Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      // Poll for payment status
      const checkStatus = async (attempt = 0): Promise<void> => {
        if (attempt > 12) {
          // 1 minute timeout (5s * 12)
          toast({
            title: "Payment Timeout",
            description:
              "Payment verification timed out. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(`/api/payments/status/${transactionId}`);
        const result = await response.json();

        if (result.success && result.payment.status === "completed") {
          await updateProfile({
            tier: selectedPlan as "Free" | "Intermediate" | "Professional",
          });

          toast({
            title: "Payment Verified!",
            description: `Welcome to ${selectedPlan} plan!`,
          });

          navigate("/dashboard");
        } else if (result.success && result.payment.status === "failed") {
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
        } else {
          // Continue polling
          setTimeout(() => checkStatus(attempt + 1), 5000);
        }
      };

      await checkStatus();
    } catch (error) {
      console.error("Status check error:", error);
      toast({
        title: "Verification Error",
        description: "Could not verify payment status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const selectedPlanDetails = tiers.find((plan) => plan.name === selectedPlan);

  // Dialog components
  const MpesaDialog = (
    <Dialog open={showMpesaDialog} onOpenChange={setShowMpesaDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter M-Pesa Phone Number</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
          <Input
            id="mpesa-phone"
            type="tel"
            placeholder="e.g. 07XXXXXXXX or +2547XXXXXXXX"
            value={mpesaPhone}
            onChange={(e) => setMpesaPhone(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            You will receive an STK push prompt on this number to complete
            payment.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowMpesaDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setShowMpesaDialog(false);
              await processPayment({ mpesaPhone });
            }}
            disabled={!mpesaPhone || processing}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Pay with M-Pesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const PaypalDialog = (
    <Dialog open={showPaypalDialog} onOpenChange={setShowPaypalDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter PayPal Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="paypal-email">PayPal Email Address</Label>
          <Input
            id="paypal-email"
            type="email"
            placeholder="your@email.com"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPaypalDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setShowPaypalDialog(false);
              await processPayment({ paypalEmail });
            }}
            disabled={!paypalEmail || processing}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Continue to PayPal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const BankDialog = (
    <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Bank Account Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="bank-account">Bank Account Number</Label>
          <Input
            id="bank-account"
            type="text"
            placeholder="Your bank account number"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            You will receive bank transfer instructions after confirming your
            payment.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowBankDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setShowBankDialog(false);
              await processPayment({ bankAccount });
            }}
            disabled={!bankAccount || processing}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Generate Transfer Instructions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const CardDialog = (
    <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Card Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="card-name">Cardholder Name</Label>
            <Input
              id="card-name"
              type="text"
              placeholder="Name as it appears on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                // Format with spaces every 4 digits
                const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                setCardNumber(formatted.substring(0, 19));
              }}
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-expiry">Expiry Date</Label>
              <Input
                id="card-expiry"
                type="text"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 2) {
                    setCardExpiry(value);
                  } else {
                    setCardExpiry(
                      `${value.substring(0, 2)}/${value.substring(2, 4)}`
                    );
                  }
                }}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                type="text"
                placeholder="123"
                value={cardCVC}
                onChange={(e) =>
                  setCardCVC(e.target.value.replace(/\D/g, "").substring(0, 4))
                }
                maxLength={4}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCardDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setShowCardDialog(false);
              await processPayment({
                cardNumber,
                cardExpiry,
                cardCVC,
                cardName,
              });
            }}
            disabled={processing}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Pay with Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen animate-fade-in">
      {MpesaDialog}
      {PaypalDialog}
      {BankDialog}
      {CardDialog}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="sm:text-3xl items-center text-2xl flex items-center justify-center font-bold bg-gradient-to-r from-blue-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
            <Monitor className="sm:w-8 sm:h-8 mr-2 text-blue-900 dark:text-white" />
            Upgrade Your Plan
          </h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-blue-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text  mt-2">
            Choose the plan that fits your construction business needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
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
                      {/* Popular banner (top right corner ribbon) */}
                      {plan.popular && (
                        <div className="absolute -right-10 top-4 rotate-45 z-20">
                          <div className="w-36 bg-gradient-to-r from-primary to-purple-600 py-1 text-center text-xs font-bold text-white shadow-lg">
                            POPULAR
                          </div>
                        </div>
                      )}

                      {/* Header: icon + title + price */}
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Plan icon */}
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

                          {/* Plan info */}
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

                        {/* Selection indicator */}
                        {isSelected && !isCurrent && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary dark:bg-white">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Features list */}
                      <ul className="mb-6 space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
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

          {/* Payment Methods & Summary */}
          <div className="space-y-8">
            {/* Payment Methods */}
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
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            paymentMethod === method.id
                              ? "bg-primary/10"
                              : "bg-muted"
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

            {/* Order Summary */}
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
                  {/* Plan row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          selectedPlanDetails.name === "Free"
                            ? "bg-green-100 text-green-700"
                            : selectedPlanDetails.name === "Intermediate"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {getTierBadge(selectedPlanDetails.name)}
                      </div> */}
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

                  {/* Divider + Total */}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-base text-white font-semibold rounded-xl"
                onClick={handlePayment}
                disabled={
                  processing ||
                  !selectedPlan ||
                  (selectedPlanDetails?.price === 0 && !paymentMethod) ||
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
