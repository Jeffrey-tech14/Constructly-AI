import { useState } from "react";

export type PaymentMethod = "mpesa" | "paypal" | "banktransfer" | "other";

export interface PaymentDetails {
  amount: number;
  currency: string;
  method: PaymentMethod;
  mpesaKey?: string; // Placeholder
  paypalClientId?: string; // Placeholder
  bankAccount?: string; // Placeholder
  otherDetails?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  approvalUrl?: string; // For methods like PayPal
  bankDetails?: {
    bank_name: string;
    account_number: string;
    routing_number: string;
    instructions: string;
  }; // For bank transfer instructions
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  async function initiatePayment(
    details: PaymentDetails
  ): Promise<PaymentResult> {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let response: PaymentResult;
      switch (details.method) {
        case "mpesa":
          // Placeholder logic for Mpesa
          response = {
            success: true,
            message: "Mpesa payment initiated (placeholder)",
            transactionId: "mpesa_txn_placeholder",
          };
          break;
        case "paypal":
          // Placeholder logic for PayPal
          response = {
            success: true,
            message: "PayPal payment initiated (placeholder)",
            transactionId: "paypal_txn_placeholder",
          };
          break;
        case "banktransfer":
          // Placeholder logic for Bank Transfer
          response = {
            success: true,
            message: "Bank transfer initiated (placeholder)",
            transactionId: "bank_txn_placeholder",
          };
          break;
        case "other":
          // Placeholder logic for other payment methods
          response = {
            success: true,
            message: "Other payment method initiated (placeholder)",
            transactionId: "other_txn_placeholder",
          };
          break;
        default:
          response = {
            success: false,
            message: "Unsupported payment method",
          };
      }
      setResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || "Payment failed");
      return {
        success: false,
        message: err.message || "Payment failed",
      };
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    result,
    initiatePayment,
  };
}
