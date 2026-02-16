// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { quotePaymentService } from "@/services/quotePaymentService";
import {
  Loader2,
  ArrowLeft,
  Lock,
  CheckCircle,
  Pen,
  CreditCard,
  FileText,
  TrendingUp,
  Building2,
  MapPin,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectProgress from "@/components/ProjectProgress";
import { QuoteExportDialog } from "@/components/QuoteExportDialog";
import { motion } from "framer-motion";

const QuoteDetailsPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetails();
      checkPaymentStatus();
    }
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quoteId)
        .single();

      if (error) throw error;

      // Check if user has access to this quote
      if (data.user_id !== profile?.id && !profile?.is_admin) {
        navigate("/quotes/all");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have access to this quote.",
        });
        return;
      }

      setQuote(data);
    } catch (error) {
      console.error("Error fetching quote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quote details",
      });
      navigate("/quotes/all");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!quoteId) return;
    try {
      const paid = await quotePaymentService.isQuotePaid(quoteId);
      setIsPaid(paid);
      if (!paid && profile?.is_admin) {
        setIsPaid(true);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const handleDeleteQuote = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId);

      if (error) throw error;

      toast({
        title: "Quote Deleted",
        description: `"${quote.title}" has been deleted successfully.`,
      });
      navigate("/quotes/all");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete quote",
      });
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "planning":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "started":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "in_progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "on_hold":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin rounded-full h-8 w-8" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/quotes/all")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-lg">Quote not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = new Date(quote.updated_at).toLocaleDateString("en-KE", {
    timeZone: "Africa/Nairobi",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/quotes/all")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl  flex items-center gap-3 bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
                  <Building2 className="w-7 h-7 text-primary dark:text-white" />
                  {quote.title}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  Last updated: {formattedDate}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(quote.status)}>
                  {quote.status.charAt(0).toUpperCase() +
                    quote.status.slice(1).replace("_", " ")}
                </Badge>
                {isPaid ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <Lock className="w-3 h-3 mr-1" />
                    Unpaid
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6">
          {/* Quote Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quote Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{quote.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Client Email
                    </p>
                    <p className="font-medium">
                      {quote.client_email || "Not provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{quote.location}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="font-medium">{quote.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Project Type
                    </p>
                    <p className="capitalize  font-medium">
                      {quote.project_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cost Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-1">
                      Materials
                    </p>
                    <p className="text-lg ">
                      KSh{" "}
                      {formatCurrency(quote.materials_cost).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-1">Labor</p>
                    <p className="text-lg ">
                      KSh {formatCurrency(quote.labor_cost).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-1">
                      Add-ons
                    </p>
                    <p className="text-lg ">
                      KSh{" "}
                      {formatCurrency(
                        quote.additional_services_cost,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  {quote.equipment_costs > 0 && (
                    <div className="flex justify-between">
                      <span>Equipment Costs</span>
                      <span className="">
                        KSh{" "}
                        {formatCurrency(quote.equipment_costs).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.transport_costs > 0 && (
                    <div className="flex justify-between">
                      <span>Transport Costs</span>
                      <span className="">
                        KSh{" "}
                        {formatCurrency(quote.transport_costs).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.permit_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Permit Costs</span>
                      <span className="">
                        KSh {formatCurrency(quote.permit_cost).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.overhead_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Overhead Amount</span>
                      <span className="">
                        KSh{" "}
                        {formatCurrency(quote.overhead_amount).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.contingency_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Contingency</span>
                      <span className="">
                        KSh{" "}
                        {formatCurrency(
                          quote.contingency_amount,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.addons_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Subcontractor Costs</span>
                      <span className="">
                        KSh {formatCurrency(quote.addons_cost).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.profit_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Profit</span>
                      <span className="">
                        KSh{" "}
                        {formatCurrency(quote.profit_amount).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg border-t pt-2 mt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">
                      KSh {formatCurrency(quote.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Custom Specs */}
          {quote.custom_specs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Custom Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {quote.custom_specs}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Materials List */}
          {quote.masonry_materials && quote.masonry_materials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quote.masonry_materials.map(
                      (material: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 rounded-lg bg-muted"
                        >
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {material.quantity} {material.unit}
                            </p>
                          </div>
                          <p className="">
                            KSh{" "}
                            {formatCurrency(
                              material.total_price || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {isPaid && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Progress
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogTitle></DialogTitle>
                    <ProjectProgress
                      quoteId={quote.id}
                      quoteName={quote.title}
                      onQuoteUpdated={() => fetchQuoteDetails()}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="text-white bg-gradient-to-r from-primary to-blue-700 hover:from-primary/40 hover:to-primary/90">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate BOQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                  >
                    <QuoteExportDialog
                      open={true}
                      onOpenChange={() => {}}
                      quote={quote}
                      contractorName={profile?.name || ""}
                      companyName={profile?.company || ""}
                      logoUrl={profile?.avatar_url || ""}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => navigate("/quotes/new", { state: { quote } })}
                  className="text-white bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700"
                >
                  <Pen className="w-4 h-4 mr-2" />
                  Edit Quote
                </Button>
              </>
            )}

            {!isPaid && (
              <Button
                onClick={() =>
                  navigate("/payments/quote", {
                    state: {
                      quoteId: quote.id,
                      quoteTitle: quote.title,
                      amount: 1000,
                    },
                  })
                }
                className="text-white bg-gradient-to-r from-[#D85C2C] to-[#C94820] hover:from-[#C94820] hover:to-[#B83B1A]"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay 1000 KSH
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{quote.title}"? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteQuote}
                    className="bg-red-600 hover:bg-red-200 hover:text-red-800 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailsPage;
