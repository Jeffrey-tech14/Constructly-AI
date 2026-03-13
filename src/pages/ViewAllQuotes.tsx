// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useQuotes } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProjectProgress from "@/components/ProjectProgress";
import {
  Search,
  Eye,
  FileText,
  TrendingUp,
  Building2,
  MapPin,
  Calendar,
  Trash2,
  Pen,
  Target,
  Loader2,
  CreditCard,
  Lock,
} from "lucide-react";
import { QuoteExportDialog } from "@/components/QuoteExportDialog";
import { quotePaymentService } from "@/services/quotePaymentService";
import { set } from "date-fns";
const ViewAllQuotes = () => {
  const { fetchQuotes, quotes, loading, deleteQuote } = useQuotes();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMountedRef = useRef(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedQuoteForExport, setSelectedQuoteForExport] =
    useState<any>(null);
  const [deletingQuote, setDeletingQuote] = useState<string | null>(null);
  const [quotesRefreshKey, setQuotesRefreshKey] = useState(0);
  const [paymentStatuses, setPaymentStatuses] = useState<
    Record<string, boolean>
  >({});
  const [paymentChecking, setPaymentChecking] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
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
  useEffect(() => {
    if (user && profile !== null && isMountedRef.current) {
      fetchQuotes();
      // Load payment statuses for all quotes
      loadPaymentStatuses();
    }
  }, [fetchQuotes, user, profile, quotesRefreshKey, location]);

  const loadPaymentStatuses = async () => {
    if (!quotes.length) return;
    setPaymentChecking(true);
    const statuses: Record<string, boolean> = {};
    for (const quote of quotes) {
      try {
        const isPaid = await quotePaymentService.isQuotePaid(quote.id);
        statuses[quote.id] = isPaid;
      } catch (error) {
        console.error(
          `Error checking payment status for quote ${quote.id}:`,
          error,
        );
        statuses[quote.id] = false;
      }
    }
    setPaymentStatuses(statuses);
    setPaymentChecking(false);
  };

  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    const result = quotes
      .filter((quote) => {
        const belongsToUser = quote?.user_id === profile?.id;
        const matchesSearch =
          (quote?.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (quote?.client_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || quote?.status === statusFilter;
        return belongsToUser && matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b?.updated_at || 0).getTime() -
          new Date(a?.updated_at || 0).getTime(),
      );
    if (isMountedRef.current) {
      setFilteredQuotes(result);
    }
  }, [quotes, profile?.id, searchTerm, statusFilter]);
  const handleDeleteQuote = async (quoteId: string, quoteTitle: string) => {
    setDeletingQuote(quoteId);
    try {
      const success = await deleteQuote(quoteId);
      if (success) {
        toast({
          title: "Quote Deleted",
          description: `"${quoteTitle}" has been deleted successfully.`,
        });
      } else {
        throw new Error("Failed to delete quote");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete quote",
        variant: "destructive",
      });
    } finally {
      setDeletingQuote(null);
    }
  };
  const contractorName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Unknown Contractor";
  const companyName = profile?.company || "";
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };
  if (!user) {
    navigate("/auth");
  }
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8"></Loader2>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="sm:text-2xl text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
              <Building2 className="sm:w-7 sm:h-7 text-primary dark:text-white" />
              <h2 className="text-xl sm:text-2xl">All Construction Quotes</h2>
            </h1>
            <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text mt-2">
              Manage and track all your construction quotes with ease
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Badge variant="secondary" className="px-3 py-1 text-gray-700">
              Total: {filteredQuotes.length}
            </Badge>
          </div>
        </div>

        <Card className=" mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search quotes by title or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 h-11">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  No quotes found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filter settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote) => {
              const formattedDate =
                new Date(quote.updated_at).toLocaleDateString("en-KE", {
                  timeZone: "Africa/Nairobi",
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }) +
                " at " +
                new Date(quote.updated_at).toLocaleTimeString("en-KE", {
                  timeZone: "Africa/Nairobi",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
              return (
                <Card key={quote.id} className=" hover:shadow-lg shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 sm:flex flex-1 items-center gap-2">
                          <div className="flex gap-2">
                            <Building2 className="w-5 h-5 text-primary dark:text-white" />
                            {quote.title}
                          </div>
                          <p className="font-normal text-sm">
                            Last Update: {formattedDate}
                          </p>
                        </CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Client:</span>{" "}
                            {quote.client_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {quote.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(quote.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status.charAt(0).toUpperCase() +
                            quote.status.slice(1).replace("_", " ")}
                        </Badge>
                        {paymentStatuses[quote.id] ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            ✓ Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Lock className="w-3 h-3 mr-1" />
                            Unpaid
                          </Badge>
                        )}
                        <div className="text-right">
                          <div className="sm:text-2xl text-lg font-bold text-primary dark:text-white">
                            KSh{" "}
                            {formatCurrency(
                              quote.total_amount,
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="dark:bg-gray-900">
                        <CardContent className="text-center p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Materials
                          </div>
                          <div className="text-lg  text-green-600">
                            KSh{" "}
                            {formatCurrency(
                              quote.materials_cost,
                            ).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="dark:bg-gray-900">
                        <CardContent className="text-center p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Labor
                          </div>
                          <div className="text-lg  text-blue-600">
                            KSh{" "}
                            {formatCurrency(quote.labor_cost).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="dark:bg-gray-900">
                        <CardContent className="text-center p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Add-ons
                          </div>
                          <div className="text-lg  text-purple-600">
                            KSh{" "}
                            {formatCurrency(
                              quote.additional_services_cost,
                            ).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {quote.custom_specs && (
                      <Card className="dark:bg-gray-900 mb-6">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">
                            Custom Specifications
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {quote.custom_specs}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {paymentStatuses[quote.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none"
                          onClick={() => navigate(`/quotes/${quote.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}

                      {paymentStatuses[quote.id] && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className=" flex-1 sm:flex-none"
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Progress
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogTitle></DialogTitle>
                            <ProjectProgress
                              quoteId={quote.id}
                              quoteName={quote.title}
                              onQuoteUpdated={() =>
                                setQuotesRefreshKey((k) => k + 1)
                              }
                            />
                          </DialogContent>
                        </Dialog>
                      )}

                      {!paymentStatuses[quote.id] && (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate("/payments/quote", {
                              state: {
                                quoteId: quote.id,
                                quoteTitle: quote.title,
                                amount: 1000,
                              },
                            })
                          }
                          className="text-white flex-1 sm:flex-none bg-gradient-to-r from-[#D85C2C] to-[#C94820] hover:from-[#C94820] hover:to-[#B83B1A]"
                          disabled={paymentChecking}
                        >
                          {paymentChecking ? (
                            <>
                              <Loader2 className="animate-spin w-4 h-4 mr-2 text-white" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2 text-white" />
                              Pay 1000 KSH
                            </>
                          )}
                        </Button>
                      )}

                      {paymentStatuses[quote.id] && (
                        <Dialog
                          onOpenChange={(open) => {
                            if (!open) setSelectedQuoteForExport(null);
                          }}
                        >
                          <DialogTitle></DialogTitle>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedQuoteForExport(quote)}
                              className="text-white flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-700 hover:from-primary/40 hover:to-primary/90"
                            >
                              <FileText className="w-4 h-4 mr-2 text-white" />
                              Generate BOQ
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            onPointerDownOutside={(e) => e.preventDefault()}
                            onEscapeKeyDown={(e) => e.preventDefault()}
                          >
                            {selectedQuoteForExport && (
                              <QuoteExportDialog
                                open={!!selectedQuoteForExport}
                                onOpenChange={(open) => {
                                  if (!open) setSelectedQuoteForExport(null);
                                }}
                                quote={selectedQuoteForExport}
                                contractorName={contractorName}
                                companyName={companyName}
                                logoUrl={profile.avatar_url}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      )}

                      {paymentStatuses[quote.id] && (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate("/quotes/new", { state: { quote } })
                          }
                          className="text-white flex-1 sm:flex-none bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700"
                        >
                          <Pen className="w-4 h-4 mr-2 text-white" />
                          Edit Quote
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingQuote === quote.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingQuote === quote.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{quote.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteQuote(quote.id, quote.title)
                              }
                              className="bg-red-600 hover:bg-red-200 hover:text-red-800 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default ViewAllQuotes;
