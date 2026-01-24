import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Check,
  ArrowLeft,
  Shield,
  Lock,
  FileText,
  BarChart3,
  Download,
  Zap,
  CheckCircle,
} from "lucide-react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold text-foreground mb-3">
            Pricing Model
          </h1>
          <p className="text-lg text-muted-foreground">
            Simple, transparent per-quote pricing. No subscriptions.
          </p>
        </div>

        {/* Main Pricing Card */}
        <Card className="mb-8 border-2 border-[#D85C2C] shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-[#00356B] to-[#00356B]/80 text-white p-8">
            <CardTitle className="flex items-center justify-center text-2xl">
              <Zap className="w-6 h-6 mr-2" />
              Per-Quote Payment Model
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Price Display */}
            <div className="text-center space-y-4">
              <div className="inline-block">
                <div className="text-6xl font-bold text-[#00356B] mb-2">
                  1,000
                </div>
                <div className="text-2xl font-semibold text-[#86bc25]">KSH</div>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Per Quote (One-time)
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                No subscriptions. No monthly fees. Pay only for the quotes you
                want to unlock.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 py-8 border-t border-b border-gray-200 dark:border-gray-700">
              {[
                {
                  icon: BarChart3,
                  title: "Progress Tracking",
                  desc: "Track quote progress percentage",
                },
                {
                  icon: FileText,
                  title: "BOQ Generation",
                  desc: "Generate in PDF, Excel, Word formats",
                },
                {
                  icon: Download,
                  title: "Full Downloads",
                  desc: "Export all materials and schedules",
                },
                {
                  icon: Lock,
                  title: "Full Access",
                  desc: "Edit and manage quote details",
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#86bc25]/10">
                        <Icon className="h-6 w-6 text-[#86bc25]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How It Works */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">
                How It Works:
              </h3>
              <ol className="space-y-3 text-sm">
                {[
                  "Create a quote (saved as draft instantly, no payment needed)",
                  "View the quote summary",
                  "Click 'Pay 1000 KSH' to unlock full access",
                  "Complete payment via Paystack (card, M-Pesa, bank transfer)",
                  "Unlock progress tracking, BOQ generation, and editing",
                  "Download and share your quote",
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#86bc25] text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "No Subscriptions",
              desc: "Pay only for the quotes you unlock. Cancel anytime.",
              icon: Check,
            },
            {
              title: "Save First",
              desc: "Save unlimited quotes as drafts before paying.",
              icon: FileText,
            },
            {
              title: "Secure Payment",
              desc: "Powered by Paystack with multiple payment options.",
              icon: Shield,
            },
          ].map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card key={idx} className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-[#86bc25]/10 rounded-lg">
                      <Icon className="h-6 w-6 text-[#86bc25]" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/quotes/new")}
            size="lg"
            className="bg-[#D85C2C] hover:bg-[#C94820] text-white px-8 py-6 text-base font-bold"
          >
            <Zap className="w-5 h-5 mr-2" />
            Create Your First Quote
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Start free • Pay only when you unlock
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
