// pages/PaymentAction.tsx
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, ArrowUpAz } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentAction() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { plan, paymentAmount } = location.state || {};
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [isSettingUpCard, setIsSettingUpCard] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const navigate = useNavigate();

  const getEnv = (key: string) => {
    if (typeof process !== "undefined" && process.env?.[key])
      return process.env[key];
    if (typeof import.meta !== "undefined" && import.meta.env?.[key])
      return import.meta.env[key];
    return undefined;
  };

  const PAYSTACK_PUBLIC_KEY = getEnv("VITE_PAYSTACK_PUBLIC_KEY");

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

  async function setupCardPayment() {
    if (paymentAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please retry.",
      });
      return;
    }

    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing email",
        description: "Please provide your email for payment.",
      });
      return;
    }

    setIsSettingUpCard(true);
    setTransactionRef(null);

    try {
      const reference = `feat_${user.id}_${Date.now()}`;
      setTransactionRef(reference);
      setIsLoading(true);

      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          plan: plan,
          amount: paymentAmount,
          purpose: "account_upgrade",
          method: "paystack",
          status: "initiated",
          currency: "KES",
          transaction_id: reference,
        })
        .select()
        .single();

      setIsLoading(false);

      if (error) {
        console.error("Error creating transaction:", error);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "Failed to initialize payment. Please try again.",
        });
        return;
      }

      if (data) {
        toast({
          title: "Payment Ready",
          description: "Click the Pay button to complete payment.",
        });
      }
    } catch (err) {
      console.error("Exception creating transaction:", err);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to connect to payment service.",
      });
    }
  }

  const paystackConfig = {
    reference: transactionRef || "",
    email: email,
    amount: paymentAmount * 100,
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: "KES",
    metadata: {
      custom_fields: [
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.id || "",
        },
        { display_name: "Plan", variable_name: "plan", value: plan },
        {
          display_name: "Purpose",
          variable_name: "purpose",
          value: "upgrade_account_fee",
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference: any) => {
    await supabase
      .from("payments")
      .update({
        status: "success",
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", reference);
    await supabase.from("profiles").update({ tier: plan }).eq("id", user.id);

    setPaymentStatus("success");
    toast({
      title: "Success!",
      description: "Your payment was successful and your account upgraded.",
    });
  };

  const handlePaystackClose = async (reference: any) => {
    await supabase
      .from("payments")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", reference);
    setPaymentStatus("error");
    toast({
      variant: "destructive",
      title: "Payment cancelled",
      description: "You cancelled the payment process.",
    });
  };

  const handlePaystackPayment = () => {
    setTimeout(() => {
      initializePayment({
        onSuccess: handlePaystackSuccess,
        onClose: handlePaystackClose,
      });
    }, 300);
  };

  return (
    <div className="mt-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full mx-4 text-center space-y-4"
      >
        <h1 className="sm:text-3xl items-center text-2xl flex items-center justify-center font-bold bg-gradient-to-r from-blue-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
          <ArrowUpAz className="sm:w-8 sm:h-8 mr-2 text-blue-900 dark:text-white" />
          Upgrade to {plan} Plan
        </h1>
        <p className="text-sm sm:text-lg bg-gradient-to-r from-blue-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text  mt-2">
          Unlock premium tools and exclusive plan upgrades.
        </p>

        {paymentStatus === "processing" || isLoading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
            <p className="font-semibold">Processing your payment...</p>
          </div>
        ) : paymentStatus === "success" ? (
          <div className="space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your account has been upgraded. Enjoy your new features!
            </p>
            <Button className="w-full text-white">
              <a href="#/dashboard" className="w-full h-full">
                Go to Dashboard
              </a>
            </Button>
          </div>
        ) : paymentStatus === "error" ? (
          <div className="space-y-4 py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-semibold">Payment Failed</h2>
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
                onClick={setupCardPayment}
                disabled={paymentAmount <= 0 || !email || isSettingUpCard}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90"
              >
                {isSettingUpCard ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Setting up payment...
                  </>
                ) : (
                  `Set up payment - KES ${paymentAmount}`
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePaystackPayment}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90"
              >
                Pay KES {paymentAmount}
              </Button>
            )}

            {paymentAmount > 0 && (
              <div className="p-4 rounded-lg border bg-muted mt-8">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="flex items-center justify-between">
                  <span>Upgrade Fee</span>
                  <span className="font-semibold">KES {paymentAmount}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
