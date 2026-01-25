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
  CheckCircle2,
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
import { useBBSUpload } from "@/hooks/useBBSUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Dimensions, WallProperties } from "@/hooks/useMasonryCalculatorNew";
import { WallSection } from "@/hooks/useMasonryCalculatorNew";
import { planParserService } from "@/services/planParserService";

// RISA Color Palette
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

export interface ParsedPlan {
  wallDimensions?: Dimensions;
  wallSections?: WallSection[];
  wallProperties?: WallProperties;

  floors: number;
  file_url?: string;
  uploaded_at?: string;
  file_name?: string;
  note?: string;
}

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
    <div className="p-4 max-h-[80vh] w-full overflow-auto">
      {isPDF ? (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-600"
          title="PDF Preview"
        />
      ) : isImage ? (
        <img
          src={fileUrl}
          alt="Plan preview"
          className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg object-contain"
        />
      ) : (
        <div className="text-center py-8">
          <FileIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-300">
            Preview not available for this file type
          </p>
        </div>
      )}
    </div>
  );
};

const UploadPlan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bbsFile, setBbsFile] = useState<File | null>(null);
  const [bbsFileUrl, setBBSFileUrl] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "uploading" | "analyzing" | "complete" | "error"
  >("idle");
  const [confidence, setConfidence] = useState<number>(0);
  const [extractedDataPreview, setExtractedDataPreview] =
    useState<ParsedPlan | null>(null);
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
  const {
    uploadBBS,
    deleteBBS,
    fileUrlExists: bbsFileUrlExists,
  } = useBBSUpload();
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
    if (quoteData?.bbs_file_url) {
      setBBSFileUrl(quoteData.bbs_file_url);
      toast({
        title: "BBS File Loaded",
        description:
          "Existing BBS file found. You can replace it or use the existing one.",
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

  const handleRemoveBBSFile = async () => {
    if (bbsFileUrl && quoteData?.id) {
      await deleteBBS(bbsFileUrl);
      await supabase
        .from("quotes")
        .update({ bbs_file_url: null })
        .eq("id", quoteData.id);
      setBBSFileUrl(null);
      setBbsFile(null);
      toast({
        title: "BBS removed",
        description: "The BBS file has been deleted from storage.",
      });
    }
  };

  const uploadAndSaveBBS = async (file: File): Promise<string> => {
    // Check if quote already has a valid BBS file URL - if so, reuse it
    if (quoteData?.bbs_file_url) {
      const urlExists = await bbsFileUrlExists(quoteData.bbs_file_url);
      if (urlExists) {
        toast({
          title: "BBS File Reused",
          description: "Using existing BBS file from storage",
        });
        return quoteData.bbs_file_url;
      }
    }

    // File doesn't exist or is invalid, upload new one
    const fileUrl = await uploadBBS(file);
    if (!fileUrl) {
      throw new Error("Failed to upload BBS file");
    }

    // Update database with the file URL
    const { error } = await supabase
      .from("quotes")
      .update({ bbs_file_url: fileUrl })
      .eq("id", quoteData.id);

    setEditablePlan((prev) => ({
      ...prev,
      bbs_file_url: fileUrl,
    }));

    if (error) {
      console.error("Database update error for BBS:", error);
      throw new Error(
        `Failed to save BBS file URL to database: ${error.message}`,
      );
    }

    return fileUrl;
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

        // Use BBS file from state, or fetch from URL if available
        let bbsFileToUse = bbsFile;
        if (!bbsFileToUse && bbsFileUrl) {
          bbsFileToUse = await getBBSFileFromUrl();
        }

        const data = await analyzePlan(
          file,
          setError,
          setCurrentStep,
          bbsFileToUse,
        );
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
    setCurrentStep: Function,
    bbs?: File,
  ): Promise<ExtractedPlan> => {
    try {
      const parsedData = await planParserService.parsePlanFile(file, bbs);

      // Calculate build area from length and width with 300% multiplier
      let calculatedBuildArea = parsedData.projectInfo?.totalArea || 0;
      if (
        parsedData.wallDimensions?.length &&
        parsedData.wallDimensions?.width
      ) {
        const baseArea =
          parsedData.wallDimensions.length * parsedData.wallDimensions.width;
        calculatedBuildArea = baseArea * 3; // 300% multiplier
      }

      // Transform the parsed data to match ParsedPlan interface
      const result: ExtractedPlan = {
        ...parsedData,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
        projectInfo: {
          ...parsedData.projectInfo,
          totalArea: calculatedBuildArea,
        },
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
    if (!fileUrl) {
      throw new Error("Failed to upload plan file");
    }

    // Update database with the file URL
    const { error } = await supabase
      .from("quotes")
      .update({ plan_file_url: fileUrl })
      .eq("id", quoteData.id);

    if (error) {
      console.error("Database update error:", error);
      throw new Error(`Failed to save file URL to database: ${error.message}`);
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

        // Use BBS file from state, or fetch from URL if available
        let bbsFileToUse = bbsFile;
        if (!bbsFileToUse && bbsFileUrl) {
          bbsFileToUse = await getBBSFileFromUrl();
        }

        const data = await analyzePlan(
          file,
          setError,
          setCurrentStep,
          bbsFileToUse,
        );

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
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError({
        message: "File size must be less than 20MB",
        type: "upload",
        retryable: true,
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setConfidence(0);
    setError(null);
    setCurrentStep("idle");

    toast({
      title: "Plan File Selected",
      description: file.name,
    });
  };

  const handleBBSFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "webp",
      "xlsx",
      "csv",
    ];
    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    const isValidType =
      validTypes.includes(file.type) || validExtensions.includes(fileExt || "");

    if (!isValidType) {
      toast({
        title: "Invalid BBS Format",
        description: "BBS must be PDF, image, or spreadsheet format",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "BBS file must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    setBbsFile(file);
    toast({
      title: "BBS Added",
      description: `Bar Bending Schedule added: ${file.name}`,
    });
  };

  // Helper function to fetch and convert BBS file URL to File object
  const getBBSFileFromUrl = async (): Promise<File | null> => {
    if (!bbsFileUrl) return null;

    try {
      const response = await fetch(bbsFileUrl);
      if (!response.ok) throw new Error("Failed to fetch BBS file");

      const filename = bbsFileUrl.split("/").pop() || `bbs-${Date.now()}.pdf`;
      const blob = await response.blob();

      const file = new File([blob], filename, {
        type: blob.type || "application/octet-stream",
      });

      return file;
    } catch (error) {
      console.error("Error fetching BBS file from URL:", error);
      return null;
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) {
      toast({
        title: "No Plan File",
        description: "Please select a plan file first",
        variant: "destructive",
      });
      return;
    }

    try {
      setCurrentStep("analyzing");

      // Use BBS file from state, or fetch from URL if available
      let bbsFileToUse = bbsFile;
      if (!bbsFileToUse && bbsFileUrl) {
        bbsFileToUse = await getBBSFileFromUrl();
      }

      const data = await analyzePlan(
        selectedFile,
        setError,
        setCurrentStep,
        bbsFileToUse,
      );

      const processedPlan: ExtractedPlan = {
        ...data,
        file_url: fileUrl,
        file_name: selectedFile.name,
        uploaded_at: new Date().toISOString(),
        wallDimensions: data.wallDimensions,
      };

      setEditablePlan(processedPlan);
      setConfidence(Math.min(80 + Math.random() * 20, 100));
      setCurrentStep("complete");
      setRetryCount(0);

      toast({
        title: "Analysis Complete",
        description: "Plan extracted successfully",
      });
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

  const handleConfirmationFieldsUpdate = (updates: {
    houseType?: "bungalow" | "mansionate";
    foundationType?: string;
    buildArea?: string;
    groundFloorElevation?: string;
  }) => {
    if (!editablePlan) return;

    const getDefaultFoundationType = (houseType: string): string => {
      return houseType === "bungalow" ? "strip-footing" : "raft-foundation";
    };

    const houseType = (updates.houseType ||
      editablePlan.projectInfo?.houseType ||
      "bungalow") as "bungalow" | "mansionate";

    // Update the extracted plan with confirmation data
    const updatedPlan: ExtractedPlan = {
      ...editablePlan,
      projectInfo: {
        projectType: editablePlan.projectInfo?.projectType || "residential",
        floors: editablePlan.projectInfo?.floors || 1,
        totalArea: updates.buildArea
          ? parseFloat(updates.buildArea)
          : editablePlan.projectInfo?.totalArea || 0,
        description: editablePlan.projectInfo?.description || "",
        houseType,
      },
      wallProperties: {
        ...editablePlan.wallProperties,
      },
      foundationDetails: [
        {
          ...(editablePlan.foundationDetails?.[0] || {}),
          foundationType:
            updates.foundationType?.toString() ||
            getDefaultFoundationType(houseType),
          groundFloorElevation: updates.groundFloorElevation
            ? parseFloat(updates.groundFloorElevation)
            : editablePlan.foundationDetails?.[0]?.groundFloorElevation || 0,
        },
      ],
    };

    setEditablePlan(updatedPlan);
    setExtractedPlan(updatedPlan);
  };

  const handleDone = async () => {
    if (!selectedFile || !quoteData?.id || !editablePlan) return;

    try {
      setCurrentStep("uploading");
      toast({
        title: "Uploading plan and BBS",
        description: "Please wait",
      });

      const fileUrl = await uploadAndSave(selectedFile);
      setFileUrl(fileUrl);

      // Upload BBS file if it exists
      let uploadedBBSUrl = bbsFileUrl; // Use existing if available
      if (bbsFile) {
        uploadedBBSUrl = await uploadAndSaveBBS(bbsFile);
        setBBSFileUrl(uploadedBBSUrl);
      }

      const finalPlan: ExtractedPlan = {
        ...editablePlan,
        file_url: fileUrl,
        bbs_file_url: uploadedBBSUrl || undefined,
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
    console.log(error);
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
        return "text-orange-500 dark:text-orange-200";
      case "analysis":
        return "text-red-500 dark:text-red-200";
      case "save":
        return "text-red-500 dark:text-red-200";
      default:
        return "text-red-500 dark:text-red-200";
    }
  };

  if (!user) navigate("/auth");

  return (
    <div className="min-h-screen animate-fade-in scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="text-center">
            <div className="flex items-center sm:text-2xl text-xl font-bold bg-gradient-to-r from-blue-700 via-primary to-primary/90 dark:from-white dark:via-white dark:to-white dark:from-white dark:via-white dark:to-white  bg-clip-text text-transparent">
              <UploadCloud className="sm:w-7 sm:h-7 mr-2 text-blue-700 dark:text-white dark:text-white" />
              Upload & Analyze Plan
            </div>
            <p className="text-sm sm:text-lg bg-gradient-to-r from-blue-700 via-primary to-primary/90 dark:from-white dark:via-white dark:to-white    text-transparent bg-clip-text mt-2">
              AI-powered extraction of rooms, dimensions, doors, and windows —
              instantly generate accurate construction estimates.
            </p>
          </div>
          <div className="w-10"></div>
        </motion.div>

        {/* Progress Steps */}
        {currentStep !== "idle" && currentStep !== "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
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
                        className="flex flex-col items-center space-y-3 flex-1"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                            isDone
                              ? "bg-green-500 text-white shadow-lg"
                              : isActive
                                ? "bg-primary text-white shadow-lg animate-pulse"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </motion.div>
                        <span
                          className={`text-sm font-medium ${
                            isActive || isDone
                              ? "text-primary dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
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
                    style={{ backgroundColor: RISA_BLUE }}
                  />
                </div>
                <motion.p
                  className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4"
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === "uploading" && (
                    <span className="flex items-center justify-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      Uploading your construction plan...
                    </span>
                  )}
                  {currentStep === "analyzing" && (
                    <span className="flex flex-col items-center justify-center gap-2">
                      <div className="flex space-x-1 mb-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.2,
                              repeatType: "loop",
                            }}
                          />
                        ))}
                      </div>
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI is analyzing your plan...
                      </span>
                      {analysisTimeLeft !== null && (
                        <span className="text-xs text-primary dark:text-blue-400 font-medium">
                          Est. time: {analysisTimeLeft}s
                        </span>
                      )}
                    </span>
                  )}
                  {currentStep === "complete" && (
                    <span className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Plan successfully parsed! Review and edit below.
                    </span>
                  )}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {currentStep === "error" && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`p-3 rounded-full bg-red-100 dark:bg-red-900 ${getErrorColor()}`}
                  >
                    {getErrorIcon()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                      {error.type === "network"
                        ? "Connection Error"
                        : error.type === "analysis"
                          ? "Analysis Failed"
                          : "Save Error"}
                    </h3>
                    <p className="text-red-600 dark:text-red-300">
                      {error.message}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                        Attempt {retryCount} of {MAX_RETRIES}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      onClick={handleRemoveFile}
                      className="w-full border-red-200 text-red-600 hover:text-white hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove File
                    </Button>
                  </motion.div>
                  {error.retryable && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={handleRetry}
                        variant="destructive"
                        className="w-full"
                        disabled={retryCount >= MAX_RETRIES}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {retryCount >= MAX_RETRIES
                          ? "Max Retries Reached"
                          : "Try Again"}
                      </Button>
                    </motion.div>
                  )}
                </div>
                {retryCount >= MAX_RETRIES && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      💡 <strong>Tip:</strong> Try uploading a clearer image or
                      a different file format. Make sure your plan has clear
                      room labels and dimensions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            <Card className="text-center">
              <CardHeader className="glass rounded-t-3xl">
                <CardTitle className="sm:text-xl font-bold">
                  Upload Your Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {(editablePlan && currentStep === "complete") ||
                (fileUrl &&
                  (currentStep === "analyzing" ||
                    currentStep === "uploading")) ? (
                  <div className="space-y-6 scrollbar-hide">
                    <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                      <FileText className="sm:w-7 sm:h-7 text-green-500" />
                      <p className="sm:text-lg font-semibold">
                        {selectedFile?.name ||
                          fileUrl.split("/").pop() ||
                          "Uploaded Plan"}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="sm:w-6 sm:h-6" />
                      </Button>
                    </div>

                    {(currentStep === "analyzing" ||
                      currentStep === "uploading") && (
                      <div className="text-center py-16">
                        {currentStep === "uploading" ? (
                          <div>
                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-500 mb-4" />
                            <p className="text-slate-600 dark:text-slate-300">
                              Uploading...
                            </p>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                          >
                            {/* Floating Icon Container */}
                            <motion.div
                              animate={{
                                y: [0, 30, 0],
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="flex justify-center"
                            >
                              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-green-400 dark:from-blue-500 dark:to-green-500 flex items-center justify-center shadow-lg">
                                <BarChart3 className="w-10 h-10 text-white animate-pulse" />
                                {/* Decorative rings */}
                                <motion.div
                                  className="absolute inset-0 rounded-full border-2 border-blue-400 dark:border-blue-500"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                  style={{ opacity: 0.5 }}
                                />
                                <motion.div
                                  className="absolute inset-0 rounded-full border-2 border-green-400 dark:border-green-500"
                                  animate={{ scale: [1.2, 1, 1.2] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.5,
                                  }}
                                  style={{ opacity: 0.3 }}
                                />
                              </div>
                            </motion.div>

                            {/* Text with typewriter effect */}
                            <div className="space-y-3">
                              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                Analyzing your plan...
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Our AI is dimensions and structural details
                              </p>
                            </div>

                            {/* Animated dots */}
                            <div className="flex justify-center gap-2 pt-2">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    repeatType: "loop",
                                  }}
                                />
                              ))}
                            </div>

                            {analysisTimeLeft !== null && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                              >
                                Est. time: {analysisTimeLeft}s remaining
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {previewUrl && (
                      <Card className="border p-1 border-slate-200 dark:border-slate-600 overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-green-500" />
                            Plan Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div
                            className="w-full h-[700px] rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600"
                            onClick={() => setShowPreviewModal(true)}
                          >
                            <div className="h-full flex flex-col items-center justify-center">
                              <PreviewModal
                                fileUrl={previewUrl}
                                fileType={selectedFile?.type || "image/jpeg"}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentStep === "complete" && editablePlan && (
                      <div className="scrollbar-hide">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                            <span className="bg-blue-100 dark:bg-primary p-2 rounded-full mr-3">
                              <FileText className="sm:w-5 sm:h-5 text-primary dark:text-blue-300" />
                            </span>
                            Edit Extracted Plan
                          </h3>
                        </div>

                        {/* Extracted Wall Structure Results */}
                        {editablePlan.wallDimensions && (
                          <Card className="mb-8 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                            <CardHeader className="bg-green-100 dark:bg-green-900/30 rounded-t-lg">
                              <CardTitle className="text-lg flex items-center text-green-900 dark:text-green-100">
                                <BarChart3 className="w-5 h-5 mr-2" />
                                Wall Structure Extraction Results
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                              {/* Wall Dimensions */}
                              <div>
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                                  <Ruler className="w-4 h-4 mr-2" />
                                  Wall Dimensions
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-green-200 dark:border-green-700">
                                    <Label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">
                                      External Wall Perimeter (m)
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={
                                        editablePlan.wallDimensions
                                          ?.externalWallPerimiter || 0
                                      }
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev && prev.wallDimensions
                                            ? {
                                                ...prev,
                                                wallDimensions: {
                                                  ...prev.wallDimensions,
                                                  externalWallPerimiter:
                                                    parseFloat(
                                                      e.target.value,
                                                    ) || 0,
                                                },
                                              }
                                            : prev,
                                        )
                                      }
                                      className="bg-green-50 dark:bg-slate-700"
                                    />
                                  </div>
                                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-green-200 dark:border-green-700">
                                    <Label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">
                                      External Wall Height (m)
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={
                                        editablePlan.wallDimensions
                                          ?.externalWallHeight || 0
                                      }
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev && prev.wallDimensions
                                            ? {
                                                ...prev,
                                                wallDimensions: {
                                                  ...prev.wallDimensions,
                                                  externalWallHeight:
                                                    parseFloat(
                                                      e.target.value,
                                                    ) || 0,
                                                },
                                              }
                                            : prev,
                                        )
                                      }
                                      className="bg-green-50 dark:bg-slate-700"
                                    />
                                  </div>
                                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-blue-200 dark:border-blue-700">
                                    <Label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">
                                      Internal Wall Perimeter (m)
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={
                                        editablePlan.wallDimensions
                                          ?.internalWallPerimiter || 0
                                      }
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev && prev.wallDimensions
                                            ? {
                                                ...prev,
                                                wallDimensions: {
                                                  ...prev.wallDimensions,
                                                  internalWallPerimiter:
                                                    parseFloat(
                                                      e.target.value,
                                                    ) || 0,
                                                },
                                              }
                                            : prev,
                                        )
                                      }
                                      className="bg-blue-50 dark:bg-slate-700"
                                    />
                                  </div>
                                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-blue-200 dark:border-blue-700">
                                    <Label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">
                                      Internal Wall Height (m)
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={
                                        editablePlan.wallDimensions
                                          ?.internalWallHeight || 0
                                      }
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev && prev.wallDimensions
                                            ? {
                                                ...prev,
                                                wallDimensions: {
                                                  ...prev.wallDimensions,
                                                  internalWallHeight:
                                                    parseFloat(
                                                      e.target.value,
                                                    ) || 0,
                                                },
                                              }
                                            : prev,
                                        )
                                      }
                                      className="bg-blue-50 dark:bg-slate-700"
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Inline Confirmation Fields */}
                        {editablePlan && currentStep === "complete" && (
                          <Card className="mb-8">
                            <CardHeader className="rounded-t-lg">
                              <CardTitle className="text-lg flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Confirm Extracted Project Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm mb-2 block">
                                    House Type
                                  </Label>
                                  <Select
                                    value={
                                      editablePlan.projectInfo?.houseType ||
                                      "bungalow"
                                    }
                                    onValueChange={(value) => {
                                      const houseType = value as
                                        | "bungalow"
                                        | "mansionate";
                                      handleConfirmationFieldsUpdate({
                                        houseType,
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select house type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bungalow">
                                        Bungalow
                                      </SelectItem>
                                      <SelectItem value="mansionate">
                                        Mansionate
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm mb-2 block">
                                    Foundation Type
                                  </Label>
                                  <Select
                                    value={
                                      editablePlan.foundationDetails?.[0]
                                        ?.foundationType || ""
                                    }
                                    onValueChange={(value) => {
                                      handleConfirmationFieldsUpdate({
                                        foundationType: value,
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select foundation type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="strip-footing">
                                        Strip Foundation
                                      </SelectItem>
                                      <SelectItem value="raft-foundation">
                                        Raft Foundation
                                      </SelectItem>
                                      <SelectItem value="pad-foundation">
                                        Pad Foundation
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm mb-2 block">
                                    External Wall Thickness (mm)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={
                                      (editablePlan.wallSections?.find(
                                        (s) => s.type === "external",
                                      )?.thickness ?? 0) * 1000
                                    }
                                    onChange={(e) => {
                                      const newThickness =
                                        parseFloat(e.target.value) / 1000;
                                      setEditablePlan((prev) => {
                                        if (!prev) return prev;
                                        const existingIndex =
                                          prev.wallSections?.findIndex(
                                            (s) => s.type === "external",
                                          ) ?? -1;
                                        let updatedSections = prev.wallSections
                                          ? [...prev.wallSections]
                                          : [];

                                        if (existingIndex >= 0) {
                                          updatedSections[existingIndex] = {
                                            ...updatedSections[existingIndex],
                                            thickness: newThickness,
                                          };
                                        } else {
                                          updatedSections.push({
                                            id: `wall-external-${Date.now()}`,
                                            type: "external",
                                            thickness: newThickness,
                                          } as any);
                                        }
                                        return {
                                          ...prev,
                                          wallSections: updatedSections,
                                        };
                                      });
                                    }}
                                    placeholder="e.g., 200"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm mb-2 block">
                                    Internal Wall Thickness (mm)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={
                                      (editablePlan.wallSections?.find(
                                        (s) => s.type === "internal",
                                      )?.thickness ?? 0) * 1000
                                    }
                                    onChange={(e) => {
                                      const newThickness =
                                        parseFloat(e.target.value) / 1000;
                                      setEditablePlan((prev) => {
                                        if (!prev) return prev;
                                        const existingIndex =
                                          prev.wallSections?.findIndex(
                                            (s) => s.type === "internal",
                                          ) ?? -1;
                                        let updatedSections = prev.wallSections
                                          ? [...prev.wallSections]
                                          : [];

                                        if (existingIndex >= 0) {
                                          updatedSections[existingIndex] = {
                                            ...updatedSections[existingIndex],
                                            thickness: newThickness,
                                          };
                                        } else {
                                          updatedSections.push({
                                            id: `wall-internal-${Date.now()}`,
                                            type: "internal",
                                            thickness: newThickness,
                                          } as any);
                                        }
                                        return {
                                          ...prev,
                                          wallSections: updatedSections,
                                        };
                                      });
                                    }}
                                    placeholder="e.g., 200"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm mb-2 block">
                                    Build Area (m²)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={
                                      editablePlan.projectInfo?.totalArea || ""
                                    }
                                    onChange={(e) => {
                                      handleConfirmationFieldsUpdate({
                                        buildArea: e.target.value,
                                      });
                                    }}
                                    placeholder="e.g., 100"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm mb-2 block">
                                    Ground Floor Elevation (m)
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.001"
                                    value={
                                      editablePlan.foundationDetails?.[0]
                                        ?.groundFloorElevation || ""
                                    }
                                    onChange={(e) => {
                                      handleConfirmationFieldsUpdate({
                                        groundFloorElevation: e.target.value,
                                      });
                                    }}
                                    placeholder="e.g., 150"
                                  />
                                </div>
                              </div>
                              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  <span className="font-semibold">Note:</span>{" "}
                                  These values have been extracted from your
                                  plan. Please verify and correct them if needed
                                  before proceeding.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Bar Bending Schedule Results */}
                        {editablePlan.bar_schedule &&
                          editablePlan.bar_schedule.length > 0 && (
                            <Card className="mb-8 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                              <CardHeader className="bg-blue-100 dark:bg-blue-900/30 rounded-t-lg">
                                <CardTitle className="text-lg flex items-center text-blue-900 dark:text-blue-100">
                                  <BarChart3 className="w-5 h-5 mr-2" />
                                  Bar Bending Schedule (BBS)
                                </CardTitle>
                                <CardDescription className="text-blue-700 dark:text-blue-300 mt-2">
                                  Rebar Calculation Method:{" "}
                                  <span className="font-semibold">
                                    {editablePlan.rebar_calculation_method ||
                                      "intensity-based"}
                                  </span>
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-blue-300 dark:border-blue-700">
                                        <th className="text-left p-2 font-semibold text-blue-900 dark:text-blue-100">
                                          Bar Type
                                        </th>
                                        <th className="text-left p-2 font-semibold text-blue-900 dark:text-blue-100">
                                          Length (m)
                                        </th>
                                        <th className="text-left p-2 font-semibold text-blue-900 dark:text-blue-100">
                                          Quantity
                                        </th>
                                        <th className="text-left p-2 font-semibold text-blue-900 dark:text-blue-100">
                                          Weight/m (kg)
                                        </th>
                                        <th className="text-left p-2 font-semibold text-blue-900 dark:text-blue-100">
                                          Total Weight (kg)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {editablePlan.bar_schedule.map(
                                        (bar, idx) => (
                                          <tr
                                            key={idx}
                                            className="border-b border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                          >
                                            <td className="p-2 text-blue-700 dark:text-blue-300 font-semibold">
                                              {bar.bar_type}
                                            </td>
                                            <td className="p-2 text-slate-700 dark:text-slate-300">
                                              {bar.bar_length.toFixed(2)}
                                            </td>
                                            <td className="p-2 text-slate-700 dark:text-slate-300">
                                              {bar.quantity}
                                            </td>
                                            <td className="p-2 text-slate-700 dark:text-slate-300">
                                              {bar.weight_per_meter?.toFixed(
                                                2,
                                              ) || "-"}
                                            </td>
                                            <td className="p-2 text-slate-700 dark:text-slate-300 font-semibold">
                                              {bar.total_weight?.toFixed(2) ||
                                                "-"}
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                        <div className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label className="">Floors</Label>
                              <Input
                                type="number"
                                min="1"
                                value={editablePlan.floors}
                                onChange={(e) =>
                                  setEditablePlan((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          floors: parseInt(e.target.value) || 1,
                                        }
                                      : prev,
                                  )
                                }
                                className="mt-1 "
                              />
                            </div>
                            <div>
                              <Label className="">File Name</Label>
                              <Input
                                value={editablePlan.file_name || ""}
                                onChange={(e) =>
                                  setEditablePlan((prev) =>
                                    prev
                                      ? { ...prev, file_name: e.target.value }
                                      : prev,
                                  )
                                }
                                className="mt-1  "
                              />
                            </div>
                          </div>
                          {fileUrl ? (
                            <div className="space-y-6">
                              <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                                <LucideFileText className="w-10 h-10 text-green-500" />
                                <p className="text-xl font-semibold truncate flex-1">
                                  {fileUrl.split("/").pop() || "Uploaded Plan"}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleRemoveFile}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    downloadFile(
                                      fileUrl,
                                      fileUrl.split("/").pop() ||
                                        "Uploaded Plan",
                                    )
                                  }
                                  className=""
                                >
                                  <HardDriveDownload className="w-6 h-6" />
                                </Button>
                              </div>
                              <div className="flex space-x-4">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    navigate("/quotes/new", {
                                      state: { quoteData },
                                    })
                                  }
                                  className="flex-1 text-slate-700 dark:text-slate-200  h-14"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleRetry}
                                  variant="secondary"
                                  className="text-slate-700 dark:text-slate-200  h-14"
                                >
                                  <RefreshCw className="w-6 h-6 mr-2" />
                                  Retry Analysis
                                </Button>
                              </div>
                            </div>
                          ) : !selectedFile ? (
                            <div className="space-y-6">
                              {/* Plan File Upload Section */}
                              <div>
                                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                                  1️⃣ Upload Construction Plan
                                </h3>
                                <div className="border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-2xl p-12 text-center transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl bg-blue-50/30 dark:bg-primary/20">
                                  <UploadCloud className="w-16 h-16 mx-auto mb-4 text-blue-400 dark:text-blue-300" />
                                  <p className="mb-4 text-slate-600 dark:text-slate-300 font-medium">
                                    Drag & drop your plan or click to upload
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Supported formats: JPEG, PNG, PDF, WEBP (Max
                                    20MB)
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
                                    className="cursor-pointer glass-button inline-flex items-center px-8 py-3 rounded-lg transition-all text-base font-semibold"
                                  >
                                    📁 Select Plan File
                                  </Label>
                                </div>
                              </div>

                              {/* Plan File Status */}
                              {selectedFile && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    <div>
                                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        {selectedFile.name}
                                      </p>
                                      <p className="text-xs text-green-600 dark:text-green-400">
                                        Plan file ready for analysis
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-5 h-5" />
                                  </Button>
                                </div>
                              )}

                              {/* BBS File Upload Section (Optional) */}
                              <div>
                                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                                  2️⃣ Upload Bar Bending Schedule (Optional)
                                </h3>

                                {/* Existing BBS File Display */}
                                {bbsFileUrl && (
                                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                        <div>
                                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                            {bbsFileUrl.split("/").pop() ||
                                              "BBS File"}
                                          </p>
                                          <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Existing BBS file ready for use
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            downloadFile(
                                              bbsFileUrl,
                                              bbsFileUrl.split("/").pop() ||
                                                "BBS File",
                                            )
                                          }
                                          className="text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                        >
                                          <HardDriveDownload className="w-5 h-5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={handleRemoveBBSFile}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* New BBS File Upload */}
                                {!bbsFileUrl ? (
                                  <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-2xl p-12 text-center transition-all hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl bg-amber-50/30 dark:bg-amber-950/20">
                                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-amber-400 dark:text-amber-300" />
                                    <p className="mb-4 text-slate-600 dark:text-slate-300 font-medium">
                                      Upload BBS for precise rebar calculations
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                      Supported formats: PDF, Images,
                                      Spreadsheet (Max 20MB)
                                    </p>

                                    <Input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.csv"
                                      onChange={handleBBSFileChange}
                                      className="hidden"
                                      id="bbsFileUpload"
                                    />

                                    <Label
                                      htmlFor="bbsFileUpload"
                                      className="cursor-pointer glass-button inline-flex items-center px-8 py-3 rounded-lg transition-all text-base font-semibold"
                                    >
                                      📊 Select BBS File
                                    </Label>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-2xl p-8 text-center transition-all hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl bg-amber-50/30 dark:bg-amber-950/20">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-4">
                                      Or upload a new BBS file to replace the
                                      existing one
                                    </p>
                                    <Input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.csv"
                                      onChange={handleBBSFileChange}
                                      className="hidden"
                                      id="bbsFileUpload"
                                    />

                                    <Label
                                      htmlFor="bbsFileUpload"
                                      className="cursor-pointer glass-button inline-flex items-center px-6 py-2 rounded-lg transition-all text-sm font-semibold"
                                    >
                                      📊 Replace BBS File
                                    </Label>
                                  </div>
                                )}

                                {/* New BBS File Status */}
                                {bbsFile && (
                                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                      <div>
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                          {bbsFile.name}
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                          New BBS file ready to upload
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setBbsFile(null)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-5 h-5" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Start Analysis Button */}
                              {selectedFile && (
                                <Button
                                  onClick={startAnalysis}
                                  disabled={
                                    (currentStep as string) === "analyzing"
                                  }
                                  className="w-full font-bold py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                  {(currentStep as string) === "analyzing" ? (
                                    <>
                                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                      Analyzing Plan...
                                    </>
                                  ) : (
                                    <>🚀 Start Analysis</>
                                  )}
                                </Button>
                              )}

                              {/* Show button to use existing file if available */}
                              {fileUrl && previewUrl && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Or use your existing plan file
                                  </p>
                                  <Button
                                    onClick={handleUseExistingFile}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold h-12"
                                  >
                                    <Eye className="w-5 h-5 mr-2" />
                                    Use Existing Plan File
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : null}

                          <div className="flex space-x-4 pt-8">
                            <Button
                              variant="outline"
                              onClick={() => navigate("/quotes/new")}
                              className="flex-1 dark:hover:bg-primary hover:bg-blue-700 hover:text-white h-14"
                            >
                              Cancel
                            </Button>

                            {editablePlan &&
                            selectedFile &&
                            currentStep === "complete" ? (
                              <Button
                                onClick={handleDone}
                                disabled={false}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-primary hover:to-indigo-700 font-bold  h-14 shadow-lg transition-all"
                              >
                                {currentStep !== "complete" ? (
                                  <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <LucideThumbsUp className="w-6 h-6 mr-3" />
                                    Done
                                  </>
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Plan File Upload Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        1️⃣ Upload Construction Plan
                      </h3>
                      <div className="border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-2xl p-12 text-center transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl bg-blue-50/30 dark:bg-primary/20">
                        <UploadCloud className="w-16 h-16 mx-auto mb-4 text-blue-400 dark:text-blue-300" />
                        <p className="mb-4 text-slate-600 dark:text-slate-300 font-medium">
                          Drag & drop your plan or click to upload
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          Supported formats: JPEG, PNG, PDF, WEBP (Max 20MB)
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
                          className="cursor-pointer glass inline-flex items-center px-8 py-3 rounded-lg transition-all text-base font-semibold"
                        >
                          📁 Select Plan File
                        </Label>
                      </div>
                    </div>

                    {/* Plan File Status */}
                    {selectedFile && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Plan file ready for analysis
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    )}

                    {/* BBS File Upload Section (Optional) */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        2️⃣ Upload Bar Bending Schedule (Optional)
                      </h3>
                      <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-2xl p-12 text-center transition-all hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl bg-amber-50/30 dark:bg-amber-950/20">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-amber-400 dark:text-amber-300" />
                        <p className="mb-4 text-slate-600 dark:text-slate-300 font-medium">
                          Upload BBS for precise rebar calculations
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          Supported formats: PDF, Images, Spreadsheet (Max 20MB)
                        </p>

                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.csv"
                          onChange={handleBBSFileChange}
                          className="hidden"
                          id="bbsFileUpload2"
                        />

                        <Label
                          htmlFor="bbsFileUpload2"
                          className="cursor-pointer glass inline-flex items-center px-8 py-3 rounded-lg transition-all text-base font-semibold"
                        >
                          📊 Select BBS File
                        </Label>
                      </div>

                      {/* BBS File Status */}
                      {bbsFile && (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            <div>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                {bbsFile.name}
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                BBS file ready for analysis
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setBbsFile(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Start Analysis Button */}
                    {selectedFile && (
                      <Button
                        onClick={startAnalysis}
                        disabled={(currentStep as string) === "analyzing"}
                        className="w-full font-bold py-6 h-auto text-lg  shadow-lg hover:shadow-xl transition-all"
                      >
                        {(currentStep as string) === "analyzing" ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing Plan...
                          </>
                        ) : (
                          <>🚀 Start Analysis</>
                        )}
                      </Button>
                    )}

                    {/* Show button to use existing file if available */}
                    {fileUrl && previewUrl && (
                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Or use your existing plan file
                        </p>
                        <Button
                          onClick={handleUseExistingFile}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold h-12"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Use Existing Plan File
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

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Plan Preview</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <PreviewModal
                fileUrl={previewUrl}
                fileType={selectedFile?.type || "image/jpeg"}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPlan;
