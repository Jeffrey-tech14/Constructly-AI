// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { supabase } from "@/integrations/supabase/client";

export interface QuotePayment {
  id: string;
  quote_id: string;
  user_id: string;
  amount_ksh: number;
  payment_status: "pending" | "processing" | "completed" | "failed";
  payment_reference: string | null;
  transaction_id: string | null;
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

class QuotePaymentService {
  /**
   * Create a payment record for a quote
   */
  async createQuotePayment(
    quoteId: string,
    userId: string,
    amountKsh: number = 1000,
  ): Promise<QuotePayment> {
    const { data, error } = await supabase
      .from("quote_payments")
      .insert({
        quote_id: quoteId,
        user_id: userId,
        amount_ksh: amountKsh,
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get payment status for a quote
   */
  async getQuotePaymentStatus(quoteId: string): Promise<QuotePayment | null> {
    try {
      const { data, error } = await supabase
        .from("quote_payments")
        .select("*")
        .eq("quote_id", quoteId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Payment status query error:", error);
        return null; // Return null instead of throwing
      }
      return data || null;
    } catch (err) {
      console.warn("Failed to get payment status:", err);
      return null;
    }
  }

  /**
   * Check if a quote is paid
   */
  async isQuotePaid(quoteId: string): Promise<boolean> {
    const payment = await this.getQuotePaymentStatus(quoteId);
    return payment?.payment_status === "completed";
  }

  /**
   * Get all unpaid quotes for a user
   */
  async getUnpaidQuotes(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("quote_payments")
      .select("*, quotes:quote_id(*)")
      .eq("user_id", userId)
      .eq("payment_status", "pending");

    if (error) throw error;
    return data || [];
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    quoteId: string,
    status: "pending" | "processing" | "completed" | "failed",
    transactionId?: string,
    paymentReference?: string,
  ): Promise<QuotePayment> {
    const updateData: any = {
      payment_status: status,
      updated_at: new Date().toISOString(),
    };

    if (transactionId) updateData.transaction_id = transactionId;
    if (paymentReference) updateData.payment_reference = paymentReference;
    if (status === "completed")
      updateData.completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("quote_payments")
      .update(updateData)
      .eq("quote_id", quoteId)
      .select()
      .single();

    if (error) throw error;

    // Also update quotes table payment_status
    await supabase
      .from("quotes")
      .update({ payment_status: status === "completed" ? "paid" : "unpaid" })
      .eq("id", quoteId);

    return data;
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(
    transactionId: string,
  ): Promise<QuotePayment | null> {
    const { data, error } = await supabase
      .from("quote_payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  /**
   * Get user's payment history
   */
  async getUserPaymentHistory(userId: string): Promise<QuotePayment[]> {
    const { data, error } = await supabase
      .from("quote_payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const quotePaymentService = new QuotePaymentService();
