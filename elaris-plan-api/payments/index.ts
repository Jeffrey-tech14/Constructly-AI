// src/server/index.ts
import express from "express";
import cors from "cors";
import {
  processMpesaPayment,
  processPaypalPayment,
  processCardPayment,
  processBankTransfer,
  verifyWithProvider,
} from "./payment_verification";
import { supabase } from "@/integrations/supabase/client";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Payment initiation endpoint
app.post("/api/payments/initiate", async (req, res) => {
  try {
    const {
      method,
      amount,
      currency,
      userId,
      plan,
      userEmail,
      userName,
      ...details
    } = req.body;

    // Validate required fields
    if (
      !method ||
      !amount ||
      !currency ||
      !userId ||
      !plan ||
      !userEmail ||
      !userName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: method, amount, currency, userId, plan, userEmail, or userName",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create payment record in database
    const { error: insertError } = await supabase.from("payments").insert({
      user_id: userId,
      method: method,
      amount: amount,
      currency: currency,
      transaction_id: transactionId,
      status: "initiated",
      plan: plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Database error:", insertError);
      return res.status(500).json({
        success: false,
        message: "Failed to create payment record",
      });
    }

    // Prepare payment details
    const paymentDetails = {
      amount,
      currency,
      method,
      transactionId,
      userId,
      plan,
      userEmail,
      userName,
      ...details,
    };

    let result;

    // Process payment based on method
    switch (method) {
      case "mpesa":
        result = await processMpesaPayment(paymentDetails);
        break;
      case "paypal":
        result = await processPaypalPayment(paymentDetails);
        break;
      case "card":
        result = await processCardPayment(paymentDetails);
        break;
      case "bank":
        result = await processBankTransfer(paymentDetails);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid payment method",
        });
    }

    res.json(result);
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// M-Pesa callback webhook
app.post("/api/webhook/mpesa", async (req, res) => {
  try {
    const callbackData = req.body;

    // Log the callback for debugging
    console.log("M-Pesa callback received:", JSON.stringify(callbackData));

    // Check if this is a valid STK callback
    if (callbackData.Body && callbackData.Body.stkCallback) {
      const resultCode = callbackData.Body.stkCallback.ResultCode;
      const checkoutRequestId = callbackData.Body.stkCallback.CheckoutRequestID;

      if (resultCode === "0") {
        // Payment was successful
        const metadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
        const amount = metadata.find(
          (item: any) => item.Name === "Amount"
        ).Value;
        const mpesaReceipt = metadata.find(
          (item: any) => item.Name === "MpesaReceiptNumber"
        ).Value;
        const phone = metadata.find(
          (item: any) => item.Name === "PhoneNumber"
        ).Value;
        const transactionDate = metadata.find(
          (item: any) => item.Name === "TransactionDate"
        ).Value;

        // Update payment status in database
        const { data: payment, error } = await supabase
          .from("payments")
          .select("*")
          .eq("checkout_request_id", checkoutRequestId)
          .single();

        if (!error && payment) {
          await supabase
            .from("payments")
            .update({
              status: "completed",
              mpesa_receipt: mpesaReceipt,
              verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("checkout_request_id", checkoutRequestId);

          // Update user tier if payment is for subscription
          await supabase
            .from("profiles")
            .update({ tier: payment.plan })
            .eq("id", payment.user_id);

          console.log(
            `M-Pesa payment completed for transaction: ${payment.transaction_id}`
          );
        }
      } else {
        // Payment failed
        const { error } = await supabase
          .from("payments")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("checkout_request_id", checkoutRequestId);

        if (error) {
          console.error("Failed to update payment status:", error);
        }
      }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa webhook error:", error);
    res
      .status(500)
      .json({ ResultCode: 1, ResultDesc: "Error processing callback" });
  }
});

// PayPal webhook handler
app.post("/api/webhook/paypal", async (req, res) => {
  try {
    // Verify webhook signature (implementation would depend on PayPal SDK)
    const event = req.body;

    console.log("PayPal webhook received:", event.event_type);

    // Handle different event types
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const transactionId = event.resource.custom_id;
      const paypalOrderId = event.resource.id;

      if (transactionId) {
        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "completed",
            verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("transaction_id", transactionId);

        // Get payment record to update user tier
        const { data: payment } = await supabase
          .from("payments")
          .select("user_id, plan")
          .eq("transaction_id", transactionId)
          .single();

        if (payment) {
          await supabase
            .from("profiles")
            .update({ tier: payment.plan })
            .eq("id", payment.user_id);
        }

        console.log(
          `PayPal payment completed for transaction: ${transactionId}`
        );
      }
    } else if (
      event.event_type === "PAYMENT.CAPTURE.DENIED" ||
      event.event_type === "PAYMENT.CAPTURE.FAILED"
    ) {
      const transactionId = event.resource.custom_id;

      if (transactionId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("transaction_id", transactionId);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).send("Error");
  }
});

// Payment verification endpoint
app.post("/api/payments/verify", async (req, res) => {
  try {
    const { transactionId, provider } = req.body;

    if (!transactionId || !provider) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID and provider are required",
      });
    }

    const result = await verifyWithProvider(transactionId, provider);
    res.json(result);
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Payment status check endpoint
app.get("/api/payments/status/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error || !payment) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
});

export default app;
