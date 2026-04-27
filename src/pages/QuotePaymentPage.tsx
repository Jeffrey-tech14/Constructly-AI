// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePaystackPayment } from "react-paystack";
import { quotePaymentService } from "@/services/quotePaymentService";
import { supabase } from "@/integrations/supabase/client";
import { getEnv } from "@/utils/envConfig";
import {
  LoaderPinwheel,
  CheckCircle,
  XCircle,
  CreditCard,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

const QuotePaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    quoteId,
    quoteTitle,
    amount = 200,
    onPaymentComplete,
  } = location.state || {};

  const [email, setEmail] = useState(user?.email || "");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "polling" | "success" | "error"
  >("idle");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);

  const PAYSTACK_PUBLIC_KEY =
    getEnv("NEXT_PAYSTACK_PUBLIC_KEY") || getEnv("VITE_PAYSTACK_PUBLIC_KEY");

  // Poll the database for payment status updates
  const pollPaymentStatus = async () => {
    try {
      const payment = await quotePaymentService.getQuotePaymentStatus(quoteId);

      if (payment?.payment_status === "completed") {
        setPaymentStatus("success");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        toast({
          title: "Payment Successful",
          description: "Your quote has been unlocked!",
        });
        setTimeout(() => {
          if (onPaymentComplete) {
            onPaymentComplete();
          }
          navigate("/quotes/all");
        }, 2000);
      }
    } catch (error) {
      console.error("Error polling payment status:", error);
    }
  };

  // Start polling when payment status changes to polling
  useEffect(() => {
    if (paymentStatus !== "polling") return;

    pollingStartTimeRef.current = Date.now();
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_TIMEOUT = 60000; // 1 minute

    // Poll immediately
    pollPaymentStatus();

    // Set up interval for subsequent polls
    pollingIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (pollingStartTimeRef.current || Date.now());

      if (elapsed > MAX_TIMEOUT) {
        // Timeout reached
        clearInterval(pollingIntervalRef.current || undefined);
        pollingIntervalRef.current = null;
        setPaymentStatus("error");
        toast({
          variant: "destructive",
          title: "Payment Timeout",
          description:
            "Payment took too long to process. Please check your email for confirmation.",
        });
        return;
      }

      pollPaymentStatus();
    }, POLL_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [paymentStatus]);

  const handlePaystackSuccess = () => {
    // Payment was successful in Paystack modal
    // Switch to polling status to wait for webhook callback
    setPaymentStatus("polling");
  };

  const handlePaystackClose = () => {
    // User closed modal - if we're not already polling, return to idle
    if (paymentStatus !== "polling") {
      setPaymentStatus("idle");
    }
    setIsProcessing(false);
  };

  const paystackConfig = {
    reference: transactionRef || "",
    email: email,
    amount: amount * 100, // Paystack uses cents
    publicKey: PAYSTACK_PUBLIC_KEY || "",
    currency: "KES",
    metadata: {
      quote_id: quoteId,
      custom_fields: [
        {
          display_name: "Quote ID",
          variable_name: "quote_id",
          value: quoteId,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  if (!quoteId || !quoteTitle) {
    return (
      <div className="mt-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full mx-4 text-center space-y-4"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl ">Invalid Quote</h2>
          <p className="text-muted-foreground">
            Unable to process payment. Quote information is missing.
          </p>
          <Button
            onClick={() => navigate("/quotes/all")}
            className="w-full text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
        </motion.div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing Email",
        description: "Please enter your email to proceed",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create or get payment record
      let payment = await quotePaymentService.getQuotePaymentStatus(quoteId);
      if (!payment) {
        payment = await quotePaymentService.createQuotePayment(
          quoteId,
          user?.id || "",
          amount,
        );
      }

      // Generate reference (format: quote_<quoteId>_<timestamp>)
      const reference = `quote_${quoteId}_${Date.now()}`;
      setTransactionRef(reference);

      // Initiate Paystack payment
      // The webhook will handle the payment update when Paystack calls our callback
      initializePayment({
        onSuccess: handlePaystackSuccess,
        onClose: handlePaystackClose,
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to initiate payment",
      });
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="mt-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full mx-4 text-center space-y-4"
        >
          <div className="space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl ">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Quote <strong>{quoteTitle}</strong> has been unlocked.
            </p>
            <Button
              onClick={() => navigate("/quotes/all")}
              className="w-full text-white"
            >
              View Quotes
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="mt-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full mx-4 text-center space-y-4"
        >
          <div className="space-y-4 py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl ">Payment Failed</h2>
            <p className="text-muted-foreground">
              There was an issue processing your payment. Please try again.
            </p>
            <Button
              onClick={() => setPaymentStatus("idle")}
              className="w-full text-white"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === "polling") {
    return (
      <div className="mt-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full mx-4 text-center space-y-4"
        >
          <div className="space-y-4 py-8">
            <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="">
              Payment processing...
              <br />
              <span className="text-sm text-muted-foreground">
                Please wait while we confirm your payment
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full mx-4 text-center space-y-4"
      >
        <h1 className="sm:text-3xl items-center text-2xl flex items-center justify-center font-bold">
          <Lock className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
          Unlock Quote
        </h1>
        <p className="text-sm sm:text-lg mt-2">
          One-time payment to access this quote
        </p>

        {isProcessing || paymentStatus === "polling" ? (
          <div className="space-y-4 py-8">
            <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="">Processing your payment...</p>
          </div>
        ) : (
          <div className="space-y-4 mt-10 text-left">
            {/* Quote Title Display */}
            <div className="p-4 rounded-lg border bg-muted">
              <h4 className=" mb-2">Quote Details</h4>
              <div className="flex items-center justify-between mb-3">
                <span>Quote Title</span>
                <span className=" truncate ml-2 text-right">{quoteTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Amount</span>
                <span className=" text-lg">KES {amount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                One-time • Non-refundable
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm ">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Receipt will be sent to this email
              </p>
            </div>

            {/* Features */}
            <div className="p-4 rounded-lg border bg-muted">
              <h4 className=" mb-3">You will unlock:</h4>
              <ul className="space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Quote details & progress tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>BOQ generation (PDF, Excel, Word)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Edit quote information</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Export & download options</span>
                </li>
              </ul>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !email || paymentStatus === "polling"}
              className="w-full text-white bg-gradient-to-r from-[#D85C2C] to-[#C94820] hover:from-[#C94820] hover:to-[#B83B1A]"
            >
              {isProcessing || paymentStatus === "polling" ? (
                <>
                  <LoaderPinwheel className="w-4 h-4 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay KES {amount.toLocaleString()}
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate("/quotes/all")}
              variant="outline"
              className="w-full hover:text-white"
              disabled={isProcessing || paymentStatus === "polling"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quotes
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secure payment
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuotePaymentPage;
