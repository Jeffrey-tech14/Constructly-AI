import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowUpAz,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentAction() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { plan, paymentAmount, action = "upgrade" } = location.state || {};
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const { toast } = useToast();
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [isSettingUpCard, setIsSettingUpCard] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const navigate = useNavigate();

  const getEnv = (key: string) => {
    if (typeof process !== "undefined" && process.env?.[key])
      return process.env[key];
    if (typeof import.meta !== "undefined" && import.meta.env?.[key])
      return import.meta.env[key];
    return undefined;
  };
  // Plan mapping - update these with your actual Paystack plan codes
  const planCodes = {
    Intermediate:
      getEnv("VITE_PAYSTACK_PLAN_INTERMEDIATE") || "PLAN_intermediate_monthly",
    Professional:
      getEnv("VITE_PAYSTACK_PLAN_PROFESSIONAL") || "PLAN_professional_monthly",
  };

  const PAYSTACK_PUBLIC_KEY = getEnv("VITE_PAYSTACK_PUBLIC_KEY");
  const PAYSTACK_SECRET_KEY = getEnv("VITE_PAYSTACK_SECRET_KEY");

  // Fetch current subscription on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCurrentSubscription();
    }
  }, [user?.id]);

  async function fetchCurrentSubscription() {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .in("status", ["active", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }

  // Add CSS for Paystack popup z-index
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      .paystack-popup, .paystack-modal {
        z-index: 99999 !important;
      }
      .paystack-overlay {
        z-index: 99998 !important;
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Setup subscription for upgrade
  async function setupSubscription() {
    if (!plan || plan === "free") {
      toast({
        variant: "destructive",
        title: "Invalid Plan",
        description: "Please select a paid plan to continue.",
      });
      return;
    }

    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing email",
        description: "Please provide your email for subscription.",
      });
      return;
    }

    setIsSettingUpCard(true);
    setTransactionRef(null);

    try {
      const reference = `sub_${user.id}_${Date.now()}`;
      setTransactionRef(reference);

      // If user has an existing active subscription, mark it for cancellation at period end
      if (currentSubscription) {
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
            cancel_at_period_end: true,
          })
          .eq("id", currentSubscription.id);
      }

      // Create new subscription record
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: plan,
          amount: paymentAmount,
          status: "initiated",
          currency: "KES",
          transaction_id: reference,
          plan_code: planCodes[plan],
          subscription_type: "monthly",
          next_billing_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating subscription:", error);
        toast({
          variant: "destructive",
          title: "Subscription Error",
          description: "Failed to initialize subscription. Please try again.",
        });
        return;
      }

      toast({
        title: "Subscription Ready",
        description:
          "Click the Subscribe button to start your monthly subscription.",
      });
    } catch (err) {
      console.error("Exception creating subscription:", err);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to connect to subscription service.",
      });
    } finally {
      setIsSettingUpCard(false);
    }
  }

  async function handleDowngradeToFree() {
    setIsLoading(true);

    try {
      let paystackCancellationSuccess = false;

      if (currentSubscription?.subscription_code) {
        try {
          await cancelPaystackSubscriptionWithRetry(
            currentSubscription.subscription_code,
            currentSubscription.email_token
          );
          paystackCancellationSuccess = true;
        } catch (paystackError) {}
      } else {
      }

      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: paystackCancellationSuccess
            ? "user_downgrade"
            : "user_downgrade_paystack_failed",
        })
        .eq("user_id", user.id)
        .in("status", ["active", "past_due"]);

      if (subError) {
        console.error("Error updating subscriptions:", subError);
        throw new Error(
          `Failed to update subscription status: ${subError.message}`
        );
      }

      // Update user profile to free
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          tier: "Free",
          subscription_status: "cancelled",
          current_subscription_id: null,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw new Error(
          `Failed to update user profile: ${profileError.message}`
        );
      }

      setPaymentStatus("success");

      if (paystackCancellationSuccess) {
        toast({
          title: "Successfully Downgraded!",
          description:
            "Your subscription has been cancelled and you've been moved to the free plan.",
        });
      } else {
        toast({
          title: "Downgrade Initiated!",
          description:
            "You've been moved to the free plan. Subscription cancellation is being processed.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error in downgrade process:", error);
      setPaymentStatus("error");

      toast({
        variant: "destructive",
        title: "Downgrade Failed",
        description:
          error.message ||
          "There was an error downgrading your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelPaystackSubscriptionWithRetry(
    subscriptionCode: string,
    email: string,
    maxRetries = 2
  ) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke(
          "cancel-subscription",
          {
            body: { subscriptionCode, emailToken: email },
          }
        );

        if (error) {
          lastError = error;

          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }

        if (data && data.success) {
          return data;
        }

        if (data && !data.success) {
          lastError = new Error(data.error);
        }
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    throw lastError || new Error("All cancellation attempts failed");
  }

  const validatePlanCode = (plan: string) => {
    const code = planCodes[plan as keyof typeof planCodes];
    if (!code) {
      throw new Error(`Invalid plan code for plan: ${plan}`);
    }
    return code;
  };
  let planCode: string | null = null;
  if (plan && plan.toLowerCase() !== "free") {
    planCode = validatePlanCode(plan);
  }

  const paystackConfig = planCode
    ? {
        reference: transactionRef || "",
        email: email,
        amount: paymentAmount * 100, // Convert to kobo
        publicKey: PAYSTACK_PUBLIC_KEY || "",
        currency: "KES",
        plan: planCode,
        metadata: {
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user?.id || "",
            },
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan,
            },
            {
              display_name: "Subscription Type",
              variable_name: "subscription_type",
              value: "monthly",
            },
          ],
        },
      }
    : null;

  const initializePayment = paystackConfig
    ? usePaystackPayment(paystackConfig)
    : () => {
        handleDowngradeToFree();
      };

  // Handle successful Paystack payment
  const handlePaystackSuccess = async (reference: any) => {
    setIsLoading(true);
    try {
      // Update subscription status to active
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("transaction_id", reference.reference);

      if (updateError) throw updateError;

      // Update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          tier: plan,
          subscription_status: "active",
        })
        .eq("id", user.id);

      if (profileError) throw profileError;
      const { data, error } = await supabase.functions.invoke(
        "create-subscription",
        {
          body: { reference: reference.reference, plan_code: planCodes[plan] },
        }
      );

      if (error || !data.success)
        throw new Error("Paystack subscription creation failed");

      // Save subscription_code, authorization_code, etc.
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          subscription_code: data.data.subscription_code,
          authorization_code: data.data.authorization.authorization_code,
          email_token: data.data.email_token,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", reference.reference);

      setPaymentStatus("success");
      toast({
        title: "Subscription Active!",
        description: `Your ${plan} monthly subscription has been activated successfully.`,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        variant: "destructive",
        title: "Update Error",
        description:
          "Subscription payment successful but there was an error updating your account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle when user closes Paystack modal
  const handlePaystackClose = async () => {
    if (transactionRef) {
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionRef);
    }

    setPaymentStatus("error");
    toast({
      variant: "destructive",
      title: "Subscription Cancelled",
      description: "You cancelled the subscription process.",
    });
  };

  // Initialize Paystack payment
  const handlePaystackPayment = () => {
    setTimeout(() => {
      initializePayment({
        onSuccess: (reference) => handlePaystackSuccess(reference),
        onClose: handlePaystackClose,
      });
    }, 300);
  };

  if (action === "downgrade" || plan === "Free") {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full mx-4 text-center space-y-4"
        >
          <h1 className="sm:text-3xl items-center text-2xl flex items-center justify-center font-bold bg-gradient-to-r from-blue-700 via-primary to-primary/90 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
            <ArrowDown className="sm:w-7 sm:h-7 mr-2 text-blue-700 dark:text-white dark:text-white" />
            Downgrade to Free Plan
          </h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-blue-700 via-primary to-primary/90 dark:from-white dark:via-white dark:to-white   text-transparent bg-clip-text mt-2">
            Move to our free plan and cancel your current subscription.
          </p>

          {paymentStatus === "processing" || isLoading ? (
            <div className="space-y-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto" />
              <p className="font-semibold">Processing your downgrade...</p>
            </div>
          ) : paymentStatus === "success" ? (
            <div className="space-y-4 py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold">
                Successfully Downgraded!
              </h2>
              <p className="text-muted-foreground">
                You've been moved to the free plan. Your subscription has been
                cancelled.
              </p>
              <Button className="w-full text-white">
                <a
                  href="#/dashboard"
                  className="w-full h-full flex items-center justify-center"
                >
                  Go to Dashboard
                </a>
              </Button>
            </div>
          ) : paymentStatus === "error" ? (
            <div className="space-y-4 py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-semibold">Downgrade Failed</h2>
              <p className="text-muted-foreground">
                Something went wrong. Please try again.
              </p>
              <Button
                onClick={() => setPaymentStatus("idle")}
                className="w-full text-white"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-10">
              <div className="p-4 rounded-lg border bg-muted">
                <h4 className="font-semibold mb-2">Downgrade Summary</h4>
                <div className="flex items-center justify-between mb-2">
                  <span>Current Plan</span>
                  <span className="font-semibold capitalize">
                    {currentSubscription?.plan || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>New Plan</span>
                  <span className="font-semibold">Free</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your subscription will be cancelled immediately. You'll have
                  access to paid features until the end of your billing period.
                </p>
              </div>

              <Button
                onClick={handleDowngradeToFree}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing Downgrade...
                  </>
                ) : (
                  "Confirm Downgrade to Free"
                )}
              </Button>

              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="w-full"
              >
                Keep Current Plan
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Show invalid plan if no plan selected or trying to upgrade to free
  if (!plan || plan === "free") {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full mx-4 text-center space-y-4"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-semibold">Invalid Plan Selection</h2>
          <p className="text-muted-foreground">
            Please select a paid plan to proceed with subscription.
          </p>
          <Button onClick={() => navigate("/pricing")} className="w-full">
            View Plans
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main upgrade flow for paid plans
  return (
    <div className="mt-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full mx-4 text-center space-y-4"
      >
        <h1 className="sm:text-3xl items-center text-2xl flex items-center justify-center font-bold bg-gradient-to-r from-blue-700 via-primary to-primary/90 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
          <ArrowUpAz className="sm:w-7 sm:h-7 mr-2 text-blue-700 dark:text-white dark:text-white" />
          Subscribe to {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </h1>
        <p className="text-sm sm:text-lg bg-gradient-to-r from-blue-700 via-primary to-primary/90 dark:from-white dark:via-white dark:to-white   text-transparent bg-clip-text mt-2">
          Start your monthly subscription and unlock premium features.
        </p>

        {paymentStatus === "processing" || isLoading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto" />
            <p className="font-semibold">Processing your subscription...</p>
          </div>
        ) : paymentStatus === "success" ? (
          <div className="space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">Subscription Active!</h2>
            <p className="text-muted-foreground">
              Your {plan} plan has been activated. Enjoy your premium features!
            </p>
            <Button className="w-full">
              <a
                href="#/dashboard"
                className="w-full h-full flex items-center justify-center"
              >
                Go to Dashboard
              </a>
            </Button>
          </div>
        ) : paymentStatus === "error" ? (
          <div className="space-y-4 py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-semibold">Subscription Failed</h2>
            <p className="text-muted-foreground">
              Something went wrong. Please try again.
            </p>
            <Button
              onClick={() => setPaymentStatus("idle")}
              className="w-full text-white"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-10 text-left">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!transactionRef ? (
              <Button
                onClick={setupSubscription}
                disabled={!email || isSettingUpCard}
                className="w-full  hover:opacity-90"
              >
                {isSettingUpCard ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Setting up subscription...
                  </>
                ) : (
                  `Start Subscription - KES ${paymentAmount}/month`
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePaystackPayment}
                disabled={isLoading}
                className="w-full hover:opacity-90"
              >
                Subscribe Now - KES {paymentAmount}/month
              </Button>
            )}

            <div className="p-4 rounded-lg border bg-muted mt-8">
              <h4 className="font-semibold mb-2">Subscription Summary</h4>
              <div className="flex items-center justify-between mb-2">
                <span>Plan</span>
                <span className="font-semibold capitalize">{plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Monthly Fee</span>
                <span className="font-semibold">KES {paymentAmount}/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Billed monthly. Cancel anytime. First payment processed
                immediately.
              </p>
            </div>

            {currentSubscription && (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                  Current Subscription
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You currently have an active {currentSubscription.plan} plan.
                  Subscribing to a new plan will cancel your current
                  subscription.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
