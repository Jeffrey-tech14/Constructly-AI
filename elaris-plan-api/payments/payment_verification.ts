// src/lib/paymentProcessor.ts

import { supabase } from "@/integrations/supabase/client";

// Types
export interface PaymentDetails {
  amount: number;
  currency: string;
  method: "mpesa" | "paypal" | "card" | "bank";
  transactionId: string;
  userId: string;
  plan: string;
  userEmail: string;
  userName: string;
  // Method-specific details
  mpesaPhone?: string;
  paypalEmail?: string;
  bankAccount?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
  cardName?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  approvalUrl?: string;
  bankDetails?: any;
}

// M-Pesa STK Push implementation
export async function processMpesaPayment(
  details: PaymentDetails
): Promise<PaymentResult> {
  try {
    // Validate phone number
    if (
      !details.mpesaPhone ||
      !/^(\+?254|0)(7[0-9]|1[0-9])\d{7}$/.test(details.mpesaPhone)
    ) {
      return {
        success: false,
        message:
          "Invalid M-Pesa phone number. Please use a valid Kenyan number (07XXXXXXXX or +2547XXXXXXXX)",
      };
    }

    // Format phone number to 254 format
    let formattedPhone = details.mpesaPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken();
    if (!accessToken) {
      return { success: false, message: "Failed to authenticate with M-Pesa" };
    }

    // Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    // Make STK push request
    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: details.amount,
          PartyA: formattedPhone,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: formattedPhone,
          CallBackURL: `${process.env.BACKEND_URL}/api/webhook/mpesa`,
          AccountReference: "ConstructionApp",
          TransactionDesc: `Payment for ${details.plan} plan`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("M-Pesa API error:", errorData);
      return {
        success: false,
        message: "M-Pesa service unavailable. Please try again later.",
      };
    }

    const data = await response.json();

    if (data.ResponseCode === "0") {
      // Store the checkout request ID for verification later
      await supabase
        .from("payments")
        .update({
          checkout_request_id: data.CheckoutRequestID,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", details.transactionId);

      return {
        success: true,
        message:
          "STK push sent to your phone. Please complete the payment on your device.",
        transactionId: details.transactionId,
      };
    } else {
      return {
        success: false,
        message:
          data.errorMessage ||
          "Failed to initiate M-Pesa payment. Please try again.",
      };
    }
  } catch (error) {
    console.error("M-Pesa payment error:", error);
    return {
      success: false,
      message: "Error processing M-Pesa payment. Please try again later.",
    };
  }
}

// PayPal payment implementation
export async function processPaypalPayment(
  details: PaymentDetails
): Promise<PaymentResult> {
  try {
    // Validate email
    if (
      !details.paypalEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.paypalEmail)
    ) {
      return { success: false, message: "Invalid PayPal email address." };
    }

    // Get PayPal access token
    const accessToken = await getPaypalAccessToken();
    if (!accessToken) {
      return { success: false, message: "Failed to authenticate with PayPal" };
    }

    // Convert amount to USD (assuming KES to USD conversion)
    const amountUSD = (details.amount / 100).toFixed(2); // Simple conversion for demo

    // Create PayPal order
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amountUSD,
              },
              description: `Payment for ${details.plan} plan`,
              custom_id: details.transactionId,
              invoice_id: `INV-${details.transactionId}`,
              payer: {
                email_address: details.paypalEmail,
                name: {
                  given_name: details.userName.split(" ")[0],
                  surname:
                    details.userName.split(" ").slice(1).join(" ") || "User",
                },
              },
            },
          ],
          application_context: {
            brand_name: "Construction App",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.FRONTEND_URL}/payment/success?transactionId=${details.transactionId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PayPal API error:", errorData);
      return {
        success: false,
        message: "PayPal service unavailable. Please try again later.",
      };
    }

    const data = await response.json();

    if (data.status === "CREATED") {
      // Store PayPal order ID for verification later
      await supabase
        .from("payments")
        .update({
          paypal_order_id: data.id,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", details.transactionId);

      // Find approval URL
      const approveLink = data.links.find(
        (link: any) => link.rel === "approve"
      );

      return {
        success: true,
        message: "Redirecting to PayPal for payment approval.",
        transactionId: details.transactionId,
        approvalUrl: approveLink?.href,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create PayPal order.",
      };
    }
  } catch (error) {
    console.error("PayPal payment error:", error);
    return {
      success: false,
      message: "Error processing PayPal payment. Please try again later.",
    };
  }
}

// Card payment implementation (using Stripe as example)
export async function processCardPayment(
  details: PaymentDetails
): Promise<PaymentResult> {
  try {
    // Validate card details
    const validationResult = validateCardDetails(details);
    if (!validationResult.isValid) {
      return { success: false, message: validationResult.message };
    }

    // In a real implementation, you would use Stripe, Square, or another payment processor
    // This is a simplified example using a mock API
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        amount: Math.round(details.amount * 100).toString(), // Convert to cents
        currency: details.currency.toLowerCase(),
        payment_method_types: "card",
        description: `Payment for ${details.plan} plan - ${details.userEmail}`,
        metadata: `transaction_id=${details.transactionId},user_id=${details.userId}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Card payment API error:", errorData);
      return {
        success: false,
        message: "Card payment service unavailable. Please try again later.",
      };
    }

    const data = await response.json();

    if (data.status === "requires_payment_method") {
      // You would typically create a payment method and confirm the payment intent
      // For this example, we'll simulate success

      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", details.transactionId);

      return {
        success: true,
        message: "Card payment processed successfully.",
        transactionId: details.transactionId,
      };
    } else {
      return {
        success: false,
        message: data.error?.message || "Card payment failed.",
      };
    }
  } catch (error) {
    console.error("Card payment error:", error);
    return {
      success: false,
      message: "Error processing card payment. Please try again later.",
    };
  }
}

// Bank transfer implementation
export async function processBankTransfer(
  details: PaymentDetails
): Promise<PaymentResult> {
  try {
    // Validate bank account
    if (!details.bankAccount || details.bankAccount.length < 5) {
      return { success: false, message: "Invalid bank account number." };
    }

    // Generate payment instructions for bank transfer
    const bankDetails = {
      bank_name: process.env.BANK_NAME || "Example Bank",
      account_number: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
      account_name: process.env.BANK_ACCOUNT_NAME || "Construction App Ltd",
      branch: process.env.BANK_BRANCH || "Main Branch",
      swift_code: process.env.BANK_SWIFT_CODE || "ABCDKENA",
      reference: details.transactionId,
      amount: details.amount,
      currency: details.currency,
      beneficiary: details.userName,
      instructions: `Please include reference ${details.transactionId} in the transfer details.`,
    };

    // Store bank transfer details
    await supabase
      .from("payments")
      .update({
        bank_account: details.bankAccount,
        bank_transfer_details: bankDetails,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", details.transactionId);

    return {
      success: true,
      message:
        "Bank transfer instructions generated. Please complete the transfer within 24 hours.",
      transactionId: details.transactionId,
      bankDetails,
    };
  } catch (error) {
    console.error("Bank transfer error:", error);
    return {
      success: false,
      message: "Error processing bank transfer. Please try again later.",
    };
  }
}

// Helper function to get M-Pesa access token
async function getMpesaAccessToken(): Promise<string | null> {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`M-Pesa auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting M-Pesa access token:", error);
    return null;
  }
}

// Helper function to get PayPal access token
async function getPaypalAccessToken(): Promise<string | null> {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    return null;
  }
}

// Validate card details
function validateCardDetails(details: PaymentDetails): {
  isValid: boolean;
  message: string;
} {
  if (
    !details.cardNumber ||
    !/^\d{16}$/.test(details.cardNumber.replace(/\s/g, ""))
  ) {
    return {
      isValid: false,
      message:
        "Invalid card number. Please enter a valid 16-digit card number.",
    };
  }

  if (!details.cardExpiry || !/^\d{2}\/\d{2}$/.test(details.cardExpiry)) {
    return {
      isValid: false,
      message: "Invalid expiry date. Please use format MM/YY.",
    };
  }

  // Check if card is not expired
  const [month, year] = details.cardExpiry.split("/").map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return {
      isValid: false,
      message: "Card has expired. Please use a valid card.",
    };
  }

  if (!details.cardCVC || !/^\d{3,4}$/.test(details.cardCVC)) {
    return {
      isValid: false,
      message: "Invalid CVC. Please enter a valid 3 or 4-digit CVC.",
    };
  }

  if (!details.cardName || details.cardName.trim().length < 2) {
    return {
      isValid: false,
      message:
        "Invalid cardholder name. Please enter the name as it appears on your card.",
    };
  }

  return { isValid: true, message: "Card details are valid." };
}

// Verify payment with provider
export async function verifyWithProvider(
  transactionId: string,
  provider: "mpesa" | "paypal" | "card" | "bank"
): Promise<{ success: boolean; message: string }> {
  try {
    // Get payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error || !payment) {
      return { success: false, message: "Transaction not found." };
    }

    if (payment.status === "completed") {
      return { success: false, message: "Transaction already completed." };
    }

    let verified = false;
    let providerStatus = "pending";

    if (provider === "mpesa" && payment.checkout_request_id) {
      // Verify M-Pesa transaction
      const accessToken = await getMpesaAccessToken();
      if (!accessToken) {
        return {
          success: false,
          message: "Failed to authenticate with M-Pesa.",
        };
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);
      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString("base64");

      const response = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: payment.checkout_request_id,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        providerStatus = result.ResultCode === "0" ? "completed" : "failed";
        verified = result.ResultCode === "0";
      }
    } else if (provider === "paypal" && payment.paypal_order_id) {
      // Verify PayPal transaction
      const accessToken = await getPaypalAccessToken();
      if (!accessToken) {
        return {
          success: false,
          message: "Failed to authenticate with PayPal.",
        };
      }

      const response = await fetch(
        `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${payment.paypal_order_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        providerStatus = result.status;
        verified = result.status === "COMPLETED";
      }
    } else if (provider === "card") {
      // For card payments, we assume immediate verification
      verified = true;
      providerStatus = "completed";
    } else if (provider === "bank") {
      // For bank transfers, manual verification is needed
      return {
        success: false,
        message: "Bank transfers require manual verification.",
      };
    }

    if (verified) {
      await supabase
        .from("payments")
        .update({
          status: "completed",
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId);

      // Update user tier
      await supabase
        .from("profiles")
        .update({ tier: payment.plan })
        .eq("id", payment.user_id);

      return {
        success: true,
        message: "Payment verified and marked as completed.",
      };
    } else {
      await supabase
        .from("payments")
        .update({
          status: providerStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId);

      return { success: false, message: `Payment status: ${providerStatus}.` };
    }
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: "Error verifying payment. Please try again later.",
    };
  }
}
