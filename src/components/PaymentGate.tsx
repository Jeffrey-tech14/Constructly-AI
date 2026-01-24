// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PaymentGateProps {
  quoteId: string;
  quoteTitle: string;
  onPaymentComplete?: () => void;
}

export function PaymentGate({
  quoteId,
  quoteTitle,
  onPaymentComplete,
}: PaymentGateProps) {
  const navigate = useNavigate();
  const [isPayingLater, setIsPayingLater] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md border-2 border-[#D85C2C] shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-[#D85C2C]/10 p-4">
                <Lock className="h-8 w-8 text-[#D85C2C]" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-[#00356B]">
                Payment Required
              </CardTitle>
              <p className="mt-2 text-sm text-gray-600">
                Access this quote to view progress, generate BOQ, and make edits
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Quote Info */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-600">Quote Title</p>
              <p className="truncate text-lg font-semibold text-[#00356B]">
                {quoteTitle}
              </p>
            </div>

            {/* Price Display */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Payment Amount
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#00356B]">1,000</span>
                <span className="text-2xl font-semibold text-[#86bc25]">
                  KSH
                </span>
              </div>
              <p className="text-xs text-gray-500">
                One-time payment • Non-refundable
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 rounded-lg bg-[#86bc25]/5 p-4">
              <p className="text-sm font-semibold text-gray-700">
                After payment, you can:
              </p>
              <ul className="space-y-2">
                {[
                  "View quote progress and details",
                  "Generate BOQ (Bill of Quantities)",
                  "Edit quote information",
                  "Export to PDF, Excel & Word",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#86bc25]">
                      <span className="text-xs font-bold text-white">✓</span>
                    </span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full gap-2 rounded-lg bg-[#D85C2C] py-6 text-base font-bold hover:bg-[#C94820]"
                onClick={() => {
                  navigate("/payments/quote", {
                    state: {
                      quoteId,
                      quoteTitle,
                      amount: 1000,
                      onPaymentComplete,
                    },
                  });
                }}
              >
                <CreditCard className="h-5 w-5" />
                Pay Now via Paystack
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-lg border-2 border-gray-300 py-6 text-base font-semibold hover:bg-gray-50"
                onClick={() => setIsPayingLater(true)}
                disabled={isPayingLater}
              >
                {isPayingLater ? "Payment saved for later" : "Pay Later"}
              </Button>
            </div>

            {isPayingLater && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 rounded-lg border-l-4 border-[#86bc25] bg-[#86bc25]/5 p-3"
              >
                <p className="text-sm font-semibold text-[#00356B]">
                  ✓ Quote saved
                </p>
                <p className="text-xs text-gray-600">
                  You can pay anytime by visiting your quotes list. This quote
                  will remain in your account until you choose to pay.
                </p>
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            )}

            <p className="text-center text-xs text-gray-500">
              💳 Secure payment via Paystack
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
