import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Trash2,
  Loader2,
  Shield,
  Crown,
  Shell,
  LayoutDashboard,
  DoorOpen,
  RefreshCw,
  Image as ImageIcon,
  LucideAppWindow,
  HardDriveDownload,
  FileIcon,
  LucideFileText,
  AlertTriangle,
  AlertCircle,
  Eye,
  X,
  BarChart3,
  Zap,
  Building,
  Ruler,
  Pickaxe,
  LucideThumbsUp,
} from "lucide-react";
import { ExtractedPlan, usePlan } from "@/contexts/PlanContext";
import { usePlanUpload } from "@/hooks/usePlanUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Dimensions, WallProperties } from "@/hooks/useMasonryCalculatorNew";
import { WallSection } from "@/hooks/useMasonryCalculatorNew";
import { planParserService } from "@/services/planParserService";

// --- GLOBAL STYLES (Matches Frontend) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
    
    /* Sleek Scrollbar hide */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    .glass-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(229, 231, 235, 0.5);
    }
    .dark .glass-panel {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(30, 41, 59, 0.5);
    }
  `}</style>
);

// --- THEME CONSTANTS ---
const THEME = {
  NAVY: "#00356B",
  ORANGE: "#D85C2C",
  GREEN: "#86bc25",
  LIGHT_BG: "#f8f9fa",
  DARK_BG: "#0b1120"
};

const PreviewModal = ({
  fileUrl,
  fileType,
}: {
  fileUrl: string;
  fileType: string;
}) => {
  const isPDF =
    fileType === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf");
  const isImage =
    fileType.startsWith("image/") ||
    fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/);
  return (
    <div className="p-4 max-h-[80vh] w-full overflow-auto bg-gray-50 dark:bg-gray-900 rounded-xl">
      {isPDF ? (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          title="PDF Preview"
        />
      ) : isImage ? (
        <img
          src={fileUrl}
          alt="Plan preview"
          className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-md object-contain"
        />
      ) : (
        <div className="text-center py-12">
          <FileIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            Preview not available for this file type
          </p>
        </div>
      )}
    </div>
  );
};

const UploadPlan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "uploading" | "analyzing" | "complete" | "error"
  >("idle");
  const [confidence, setConfidence] = useState<number>(0);
  const [extractedDataPreview, setExtractedDataPreview] =
    useState<ExtractedPlan | null>(null);
  const [editablePlan, setEditablePlan] = useState<ExtractedPlan | null>(null);
  const [response, setResponse] = useState([]);
  const [error, setError] = useState<{
    message: string;
    type: "upload" | "analysis" | "save" | "network";
    retryable: boolean;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [analysisTimeLeft, setAnalysisTimeLeft] = useState<number | null>(null);

  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const { quoteData } = location.state || {};
  const { uploadPlan, deletePlan, fileUrlExists } = usePlanUpload();
  const { toast } = useToast();
  const MAX_RETRIES = 3;

  const { extractedPlan, setExtractedPlan } = usePlan();

  useEffect(() => {
    if (quoteData?.plan_file_url) {
      setFileUrl(quoteData.plan_file_url);
      setPreviewUrl(quoteData.plan_file_url);
      toast({
        title: "Plan File Loaded",
        description:
          "Existing plan file found. You can re-scan or upload a new one.",
      });
    }
  }, [quoteData]);

  async function downloadFile(publicUrl: string, file_name: string) {
    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split("/");
      const bucketName = pathParts[5];
      const filePath = pathParts.slice(6).join("/");

      const { data: fileInfo, error: infoError } = await supabase.storage
        .from(bucketName)
        .list("", {
          limit: 1,
          search: filePath.split("/").pop(),
        });

      const response = await fetch(publicUrl);
      if (response.ok) {
        const blob = await response.blob();
        const fileName = filePath.split("/").pop() || "downloaded-file";
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        return;
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);

      if (error) {
        throw error;
      }

      const signedResponse = await fetch(data.signedUrl);
      if (!signedResponse.ok) {
        throw new Error(`HTTP error! status: ${signedResponse.status}`);
      }

      const blob = await signedResponse.blob();
      const fileName = filePath.split("/").pop() || "downloaded-file";
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  const handleRemoveFile = async () => {
    if (fileUrl && quoteData?.id) {
      await deletePlan(fileUrl);
      await supabase
        .from("quotes")
        .update({ plan_file_url: null })
        .eq("id", quoteData.id);
      setFileUrl(null);
      setPreviewUrl(null);
      toast({
        title: "Plan removed",
        description: "The plan has been deleted from storage.",
      });
    }
    setSelectedFile(null);
    setCurrentStep("idle");
    setExtractedDataPreview(null);
    setEditablePlan(null);
    setError(null);
    setRetryCount(0);
  };

  const handleRetry = async () => {
    if (selectedFile) {
      setError(null);
      setRetryCount((prev) => prev + 1);
      handleFileChange({ target: { files: [selectedFile] } } as any);
    } else if (fileUrl) {
      setError(null);
      setRetryCount((prev) => prev + 1);
      setCurrentStep("analyzing");
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch file");
        const blob = await response.blob();
        const fileName = fileUrl.split("/").pop() || "existing-plan";
        const file = new File([blob], fileName, { type: blob.type });
        setPreviewUrl(URL.createObjectURL(file));
        setSelectedFile(file);
        const data = await analyzePlan(file, setError, setCurrentStep);
        setEditablePlan({
          ...data,
          file_url: fileUrl,
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
        });
        setConfidence(Math.min(80 + Math.random() * 20, 100));
        setCurrentStep("complete");
        setRetryCount(0);
      } catch (err) {
        console.error("Retry analysis error:", err);
        setError({
          message: "Failed to re-analyze existing file",
          type: "analysis",
          retryable: retryCount < MAX_RETRIES,
        });
        setCurrentStep("error");
      }
    }
  };

  const analyzePlan = async (
    file: File,
    setError: Function,
    setCurrentStep: Function
  ): Promise<ExtractedPlan> => {
    try {
      const parsedData = await planParserService.parsePlanFile(file);

      // Transform the parsed data to match ParsedPlan interface
      const result: ExtractedPlan = {
        ...parsedData,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Analysis failed";
      console.error("Plan analysis error:", error);

      setError({
        message: errorMessage,
        type: "analysis",
        retryable: true,
      });

      throw new Error(errorMessage);
    }
  };

  const uploadAndSave = async (file: File): Promise<string> => {
    // Check if quote already has a valid file URL - if so, reuse it
    if (quoteData?.plan_file_url) {
      const urlExists = await fileUrlExists(quoteData.plan_file_url);
      if (urlExists) {
        toast({
          title: "Plan File Reused",
          description: "Using existing plan file from storage",
        });
        return quoteData.plan_file_url;
      }
    }

    // File doesn't exist or is invalid, upload new one
    const fileUrl = await uploadPlan(file);
    if (fileUrl) {
      await supabase
        .from("quotes")
        .update({ plan_file_url: fileUrl })
        .eq("id", quoteData.id);
    }
    return fileUrl;
  };

  /**
   * Download existing plan file from URL and use it as selected file
   */
  const handleUseExistingFile = async () => {
    if (!fileUrl) return;

    try {
      setCurrentStep("uploading");
      toast({
        title: "Loading Plan",
        description: "Retrieving existing plan file...",
      });

      // Fetch the file from URL
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      // Get filename from URL or use default
      const filename = fileUrl.split("/").pop() || `plan-${Date.now()}.pdf`;
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], filename, {
        type: blob.type || "application/octet-stream",
      });

      setSelectedFile(file);
      setPreviewUrl(fileUrl);
      setError(null);

      // Proceed with analysis
      try {
        setCurrentStep("analyzing");
        const data = await analyzePlan(file, setError, setCurrentStep);

        const processedPlan: ExtractedPlan = {
          ...data,
          file_url: fileUrl,
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
          wallDimensions: data.wallDimensions,
        };

        setEditablePlan(processedPlan);

        setConfidence(Math.min(80 + Math.random() * 20, 100));
        setCurrentStep("complete");
        setRetryCount(0);

        toast({
          title: "Plan Loaded",
          description: "Existing plan file loaded successfully",
        });
      } catch (err) {
        console.error("Analysis error:", err);
        setError({
          message: "Failed to analyze plan",
          type: "analysis",
          retryable: true,
        });
        setCurrentStep("error");
      }
    } catch (error) {
      console.error("Error loading file:", error);
      toast({
        title: "Error",
        description: "Failed to load existing plan file",
        variant: "destructive",
      });
      setCurrentStep("error");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "pdf", "webp"];
    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/webp",
    ];

    const isValidType =
      validTypes.includes(file.type) || validExtensions.includes(fileExt || "");

    if (!isValidType) {
      setError({
        message: "Please upload a supported file format (JPEG, PNG, PDF, WEBP)",
        type: "upload",
        retryable: true,
      });
      setCurrentStep("error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError({
        message: "File size must be less than 20MB",
        type: "upload",
        retryable: true,
      });
      setCurrentStep("error");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setConfidence(0);
    setError(null);

    try {
      setCurrentStep("uploading");
      setCurrentStep("analyzing");
      const data = await analyzePlan(file, setError, setCurrentStep);

      const processedPlan: ExtractedPlan = {
        ...data,
        file_url: fileUrl,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
        wallDimensions: data.wallDimensions,
      };

      setEditablePlan(processedPlan);
      setConfidence(Math.min(80 + Math.random() * 20, 100));
      setCurrentStep("complete");
      setRetryCount(0);
    } catch (err) {
      console.error("Analysis error:", err);
      let errorType: "analysis" | "network" = "analysis";
      let errorMessage = "Failed to analyze plan. Please try again.";

      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("Network")
      ) {
        errorType = "network";
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (err.message.includes("Invalid response format")) {
        errorMessage =
          "The analysis service returned an unexpected format. Please try again.";
      } else if (err.message.includes("Server reported issue")) {
        errorMessage = "Automatic detection failed. Please try again";
      }

      setError({
        message: errorMessage,
        type: errorType,
        retryable: retryCount < MAX_RETRIES,
      });
      setCurrentStep("error");
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDone = async () => {
    if (!selectedFile || !quoteData?.id || !editablePlan) return;

    try {
      setCurrentStep("uploading");
      toast({
        title: "Uploading plan",
        description: "Please wait",
      });

      const fileUrl = await uploadAndSave(selectedFile);
      setFileUrl(fileUrl);

      const finalPlan: ExtractedPlan = {
        ...editablePlan,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
        file_name: selectedFile.name,
      };

      setExtractedPlan(finalPlan);
      setCurrentStep("complete");

      toast({
        title: "Plan Saved",
      });

      navigate("/quotes/new", { state: { quote: quoteData } });
    } catch (error) {
      console.error("Error saving plan:", error);
      setError({
        message: "Failed to save plan. Please try again.",
        type: "save",
        retryable: true,
      });
      setCurrentStep("error");
      toast({
        title: "Error",
        description: "Could not save plan.",
        variant: "destructive",
      });
    }
  };

  const getErrorIcon = () => {
    switch (error?.type) {
      case "network":
        return <AlertCircle className="w-6 h-6" />;
      case "analysis":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getErrorColor = () => {
    switch (error?.type) {
      case "network":
        return "text-orange-600 dark:text-orange-200";
      case "analysis":
        return "text-red-600 dark:text-red-200";
      case "save":
        return "text-red-600 dark:text-red-200";
      default:
        return "text-red-600 dark:text-red-200";
    }
  };

  if (!user) navigate("/auth");

  if (profile?.tier === "Free") {
    const getTierBadge = (tier: string) => {
      switch (tier) {
        case "Free":
          return (
            <Badge className="bg-gray-100 text-gray-800 border-0">
              <Shell className="w-3 h-3 mr-1" />
              Free
            </Badge>
          );
        case "Professional":
          return (
            <Badge className="bg-[#86bc25]/10 text-[#5da40b] border-0">
              <Shield className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          );
        case "Enterprise":
          return (
            <Badge className="bg-[#00356B]/10 text-[#00356B] border-0">
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
          );
        default:
          return <Badge>{tier}</Badge>;
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa] dark:bg-[#0b1120] font-technical">
        <GlobalStyles />
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-2xl border-none">
          <CardHeader className="text-center pt-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#00356B] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#00356B] dark:text-white">
              Upgrade Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center pb-8">
            <p className="text-gray-600 dark:text-gray-300">
              Upgrade to access AI-powered plan parsing and advanced features.
            </p>
            <div className="flex justify-center">
               {getTierBadge(profile.tier)}
            </div>
            <Button
              className="w-full text-white font-bold rounded-xl shadow-lg h-12"
              style={{ backgroundColor: THEME.ORANGE }}
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in scrollbar-hide bg-[#f8f9fa] dark:bg-[#0b1120] font-technical pb-20">
      <GlobalStyles />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center mb-10 text-center"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#00356B] rounded-xl shadow-lg shadow-blue-900/20">
               <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#00356B] dark:text-white tracking-tight">
              Upload & Analyze Plan
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl font-medium">
            AI-powered extraction of wall data, dimensions, doors, and windows
            — instantly generate accurate construction estimates.
          </p>
        </motion.div>

        {/* --- Progress Steps --- */}
        {currentStep !== "idle" && currentStep !== "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-none shadow-sm bg-white dark:bg-[#151c2f]">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8 px-4">
                  {[
                    { label: "Uploading", icon: UploadCloud },
                    { label: "Analyzing", icon: BarChart3 },
                    { label: "Complete", icon: CheckCircle },
                  ].map((step, idx) => {
                    const isDone =
                      (currentStep === "analyzing" && idx < 1) ||
                      (currentStep === "complete" && idx < 2) ||
                      (idx === 2 && currentStep === "complete");
                    const isActive =
                      (currentStep === "uploading" && idx === 0) ||
                      (currentStep === "analyzing" && idx === 1) ||
                      (currentStep === "complete" && idx === 2);
                    const IconComponent = step.icon;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center space-y-3 flex-1 relative z-10"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-4 ${
                            isDone
                              ? "bg-[#86bc25] border-[#86bc25] text-white shadow-lg shadow-green-200"
                              : isActive
                              ? "bg-[#00356B] border-[#00356B] text-white shadow-lg shadow-blue-200 scale-110"
                              : "bg-white border-gray-100 text-gray-300 dark:bg-gray-800 dark:border-gray-700"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-6 h-6" />
                          )}
                        </motion.div>
                        <span
                          className={`text-sm font-bold tracking-wide ${
                            isActive || isDone
                              ? "text-[#00356B] dark:text-white"
                              : "text-gray-400 dark:text-gray-600"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress Bar Container */}
                <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#00356B] to-[#004e9c]"
                    initial={{ width: "0%" }}
                    animate={{
                      width:
                        currentStep === "uploading"
                          ? "33%"
                          : currentStep === "analyzing"
                          ? "66%"
                          : "100%",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <motion.div
                  className="text-center mt-6 min-h-[24px]"
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === "uploading" && (
                    <span className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00356B]" />
                      Uploading your construction plan...
                    </span>
                  )}
                  {currentStep === "analyzing" && (
                    <span className="flex flex-col items-center justify-center gap-2">
                       <span className="flex items-center gap-2 text-[#00356B] dark:text-blue-300 font-bold">
                        <Zap className="w-4 h-4 fill-[#00356B] dark:fill-blue-300" />
                        AI is analyzing geometry...
                      </span>
                      {analysisTimeLeft !== null && (
                        <span className="text-xs text-gray-400 font-medium">
                          Estimated time: {analysisTimeLeft}s
                        </span>
                      )}
                    </span>
                  )}
                  {currentStep === "complete" && (
                    <span className="flex items-center justify-center gap-2 text-[#86bc25] font-bold">
                      <CheckCircle className="w-5 h-5" />
                      Plan successfully parsed! Review results below.
                    </span>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* --- Error State --- */}
        {currentStep === "error" && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`p-3 rounded-full bg-white dark:bg-red-900/50 shadow-sm ${getErrorColor()}`}
                  >
                    {getErrorIcon()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-200">
                      {error.type === "network"
                        ? "Connection Error"
                        : error.type === "analysis"
                        ? "Analysis Failed"
                        : "Save Error"}
                    </h3>
                    <p className="text-red-600/80 dark:text-red-300 text-sm mt-1">
                      {error.message}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-xs font-bold uppercase tracking-wider text-red-400 mt-2">
                        Attempt {retryCount} of {MAX_RETRIES}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      variant="outline"
                      onClick={handleRemoveFile}
                      className="w-full border-red-200 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 h-11"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove & Start Over
                    </Button>
                  </motion.div>
                  {error.retryable && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        onClick={handleRetry}
                        className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
                        disabled={retryCount >= MAX_RETRIES}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {retryCount >= MAX_RETRIES ? "Max Retries Reached" : "Try Again"}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* --- Main Content Area --- */}
        <div className="grid grid-cols-1 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            <Card className="text-center border-none shadow-sm bg-white dark:bg-[#151c2f] overflow-hidden">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 py-6">
                <CardTitle className="text-lg font-bold text-[#00356B] dark:text-white">
                  Upload Your Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {(editablePlan && currentStep === "complete") ||
                (fileUrl && (currentStep === "analyzing" || currentStep === "uploading")) ? (
                  <div className="space-y-6">
                    {/* File Info Bar */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-[#00356B] dark:text-blue-300">
                         <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {selectedFile?.name || fileUrl.split("/").pop() || "Uploaded Plan"}
                          </p>
                          <p className="text-xs text-gray-500">Ready for processing</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {previewUrl && (
                      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm relative group cursor-pointer" onClick={() => setShowPreviewModal(true)}>
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white/90 dark:bg-black/80 backdrop-blur px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                               Click to Preview
                            </div>
                         </div>
                         <div className="bg-gray-100 dark:bg-gray-900 h-[400px] flex items-center justify-center p-4">
                            <PreviewModal
                                fileUrl={previewUrl}
                                fileType={selectedFile?.type || "image/jpeg"}
                            />
                         </div>
                      </div>
                    )}

                    {(currentStep === "analyzing" || currentStep === "uploading") && (
                      <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#00356B] mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                          {currentStep === "uploading" ? "Uploading..." : "Analyzing plan structure..."}
                        </p>
                      </div>
                    )}

                    {currentStep === "complete" && editablePlan && (
                      <div>
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                          <h3 className="text-lg font-bold text-[#00356B] dark:text-white flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-[#D85C2C]" />
                            Extraction Results
                          </h3>
                          <Badge className="bg-green-100 text-green-700 border-0">High Confidence</Badge>
                        </div>

                        {/* Extracted Wall Structure Results */}
                        {editablePlan.wallDimensions && (
                          <div className="mb-8 bg-[#86bc25]/5 rounded-2xl border border-[#86bc25]/20 overflow-hidden">
                            <div className="bg-[#86bc25]/10 px-6 py-4 flex items-center gap-2">
                               <Ruler className="w-5 h-5 text-[#5da40b]" />
                               <h4 className="font-bold text-[#5da40b]">Wall Dimensions</h4>
                            </div>
                            
                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">External Perimeter (m)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="bg-white border-gray-200 focus:border-[#86bc25] focus:ring-[#86bc25] h-11 font-medium"
                                  value={editablePlan.wallDimensions?.externalWallPerimiter || 0}
                                  onChange={(e) =>
                                    setEditablePlan((prev) =>
                                      prev && prev.wallDimensions
                                        ? { ...prev, wallDimensions: { ...prev.wallDimensions, externalWallPerimiter: parseFloat(e.target.value) || 0 } }
                                        : prev
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">External Height (m)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="bg-white border-gray-200 focus:border-[#86bc25] focus:ring-[#86bc25] h-11 font-medium"
                                  value={editablePlan.wallDimensions?.externalWallHeight || 0}
                                  onChange={(e) =>
                                    setEditablePlan((prev) =>
                                      prev && prev.wallDimensions
                                        ? { ...prev, wallDimensions: { ...prev.wallDimensions, externalWallHeight: parseFloat(e.target.value) || 0 } }
                                        : prev
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Internal Perimeter (m)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="bg-white border-gray-200 focus:border-[#00356B] focus:ring-[#00356B] h-11 font-medium"
                                  value={editablePlan.wallDimensions?.internalWallPerimiter || 0}
                                  onChange={(e) =>
                                    setEditablePlan((prev) =>
                                      prev && prev.wallDimensions
                                        ? { ...prev, wallDimensions: { ...prev.wallDimensions, internalWallPerimiter: parseFloat(e.target.value) || 0 } }
                                        : prev
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Internal Height (m)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="bg-white border-gray-200 focus:border-[#00356B] focus:ring-[#00356B] h-11 font-medium"
                                  value={editablePlan.wallDimensions?.internalWallHeight || 0}
                                  onChange={(e) =>
                                    setEditablePlan((prev) =>
                                      prev && prev.wallDimensions
                                        ? { ...prev, wallDimensions: { ...prev.wallDimensions, internalWallHeight: parseFloat(e.target.value) || 0 } }
                                        : prev
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div>
                            <Label className="font-bold text-gray-700 dark:text-gray-300">Total Floors</Label>
                            <Input
                              type="number"
                              min="1"
                              className="mt-2 h-11 border-gray-200"
                              value={editablePlan.floors}
                              onChange={(e) =>
                                setEditablePlan((prev) =>
                                  prev ? { ...prev, floors: parseInt(e.target.value) || 1 } : prev
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="font-bold text-gray-700 dark:text-gray-300">Plan Name</Label>
                            <Input
                              className="mt-2 h-11 border-gray-200"
                              value={editablePlan.file_name || ""}
                              onChange={(e) =>
                                setEditablePlan((prev) =>
                                  prev ? { ...prev, file_name: e.target.value } : prev
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Action Buttons for Completion */}
                        <div className="flex space-x-4 pt-8">
                            <Button
                              variant="outline"
                              onClick={() => navigate("/quotes/new")}
                              className="flex-1 h-12 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                            >
                              Cancel
                            </Button>
                            <Button
                                onClick={handleDone}
                                className="flex-1 h-12 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                                style={{ backgroundColor: THEME.NAVY }}
                            >
                                <LucideThumbsUp className="w-5 h-5 mr-2" />
                                Save & Continue
                            </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // EMPTY STATE / DRAG & DROP
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-16 text-center transition-all hover:border-[#00356B] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 group">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                       <UploadCloud className="w-10 h-10 text-[#00356B] dark:text-blue-300" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Drag & drop plan file here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                      Supports JPEG, PNG, PDF, WEBP (Max 20MB). We'll automatically analyze geometry.
                    </p>

                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf,.rvt,.ifc,.pln,.zip,.csv,.xlsx,.txt,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                    />

                    <Label
                      htmlFor="fileUpload"
                      className="cursor-pointer inline-flex items-center px-8 py-4 rounded-full text-white font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all"
                      style={{ backgroundColor: THEME.ORANGE }}
                    >
                      Browse Files
                    </Label>

                    {fileUrl && previewUrl && (
                      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          onClick={handleUseExistingFile}
                          variant="outline"
                          className="w-full sm:w-auto h-12 border-[#00356B] text-[#00356B] hover:bg-[#00356B] hover:text-white font-bold"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Use Previously Uploaded Plan
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal Overlay */}
      <AnimatePresence>
        {showPreviewModal && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Plan Preview</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900">
                <PreviewModal
                  fileUrl={previewUrl}
                  fileType={selectedFile?.type || "image/jpeg"}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPlan;