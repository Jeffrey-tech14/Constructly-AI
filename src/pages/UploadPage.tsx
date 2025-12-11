// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

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
  Target,
  Link,
  Share2,
  Network,
  ArrowRightLeft,
} from "lucide-react";
import { ExtractedPlan, usePlan } from "@/contexts/PlanContext";
import { usePlanUpload } from "@/hooks/usePlanUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Room } from "@/hooks/useMasonryCalculator";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
  `}</style>
);

// --- THEME CONSTANTS ---
const THEME = {
  NAVY: "#002d5c",
  ACCENT: "#5BB539",
  TEXT_MAIN: "#1a1a1a",
  TEXT_LIGHT: "#666666",
  BG_LIGHT: "#fcfcfc",
  BORDER: "#d1d5db",
};

export interface ParsedPlan {
  rooms: Room[];
  floors: number;
  file_url?: string;
  uploaded_at?: string;
  file_name?: string;
  note?: string;
  // NEW: Added connectivity data
  connectivity?: {
    sharedWalls: Array<{
      id: string;
      room1Id: string;
      room2Id: string;
      wall1Id: string;
      wall2Id: string;
      sharedLength: number;
      sharedArea: number;
      openings: string[];
    }>;
    roomPositions: { [roomId: string]: { x: number; y: number } };
    totalSharedArea: number;
    efficiency: {
      spaceUtilization: number;
      wallEfficiency: number;
      connectivityScore: number;
    };
  };
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
          className="w-full h-[70vh] rounded-lg border border-[#d1d5db] dark:border-gray-600"
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
          <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
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
  const [showConnectivityPanel, setShowConnectivityPanel] = useState(true);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const { quoteData } = location.state || {};
  const { uploadPlan, deletePlan } = usePlanUpload();
  const { toast } = useToast();
  const MAX_RETRIES = 3;
  const { extractedPlan, setExtractedPlan } = usePlan();

  useEffect(() => {
    if (quoteData?.plan_file_url) {
      setFileUrl(quoteData.plan_file_url);
      setPreviewUrl(quoteData.plan_file_url);
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
    setShowConnectivityPanel(false);
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
  ): Promise<ParsedPlan> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      "https://constructly-backend.onrender.com/api/plan/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Analysis failed: ${res.status} - ${errorText}`);
    }
    const result = await res.json();
    if (result.note) {
      const noteText = result.note.toString().toLowerCase();
      const errorKeywords = [
        "error",
        "failed",
        "invalid",
        "missing",
        "unable",
        "issue",
        "exception",
      ];
      const containsError = errorKeywords.some((word) =>
        noteText.includes(word)
      );
      if (containsError) {
        setError({
          message: result.note,
          type: "analysis",
          retryable: false,
        });
        setCurrentStep("error");
        throw new Error(`Server reported issue: ${result.note}`);
      }
    }
    if (!result.rooms || !Array.isArray(result.rooms)) {
      throw new Error("Invalid response format: missing rooms array");
    }
    return result;
  };

  const uploadAndSave = async (file: File): Promise<string> => {
    const fileUrl = await uploadPlan(file);
    await supabase
      .from("quotes")
      .update({ plan_file_url: fileUrl })
      .eq("id", quoteData.id);
    return fileUrl;
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
        rooms: data.rooms.map((room, index) => ({
          ...room,
          wallConnectivity: data.connectivity
            ? {
                roomId: `room_${index}`,
                position: data.connectivity.roomPositions[`room_${index}`] || {
                  x: 0,
                  y: 0,
                },
                connectedRooms: data.connectivity.sharedWalls
                  .filter(
                    (wall) =>
                      wall.room1Id === `room_${index}` ||
                      wall.room2Id === `room_${index}`
                  )
                  .map((wall) =>
                    wall.room1Id === `room_${index}`
                      ? wall.room2Id
                      : wall.room1Id
                  ),
                sharedArea: data.connectivity.sharedWalls
                  .filter(
                    (wall) =>
                      wall.room1Id === `room_${index}` ||
                      wall.room2Id === `room_${index}`
                  )
                  .reduce((sum, wall) => sum + wall.sharedArea, 0),
                externalWallArea: 0,
              }
            : undefined,
        })),
        connectivity: data.connectivity,
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
        description: `${finalPlan.rooms.length} rooms across ${finalPlan.floors} floor(s) with wall connectivity analysis.`,
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
        return "text-orange-500 dark:text-orange-200";
      case "analysis":
        return "text-red-500 dark:text-red-200";
      case "save":
        return "text-red-500 dark:text-red-200";
      default:
        return "text-red-500 dark:text-red-200";
    }
  };

  const getSharedWallsForRoom = (roomId: string) => {
    if (!editablePlan?.connectivity?.sharedWalls) return [];
    return editablePlan.connectivity.sharedWalls.filter(
      (wall) => wall.room1Id === roomId || wall.room2Id === roomId
    );
  };

  const getRoomConnections = (roomId: string) => {
    const room = editablePlan?.rooms.find(
      (r) => r.wallConnectivity?.roomId === roomId
    );
    return room?.wallConnectivity?.connectedRooms || [];
  };

  const renderConnectivityPanel = () => {
    if (!editablePlan?.connectivity) return null;
    const efficiency = editablePlan.connectivity.efficiency;
    return (
      <Card className="border-l-4 border-l-[#002d5c] rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold text-[#002d5c] dark:text-white">
            <Network className="w-5 h-5 mr-2" />
            Wall Connectivity Analysis
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            AI-detected room connections and shared walls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002d5c] dark:text-blue-400">
                {Math.round(efficiency.spaceUtilization * 100)}%
              </div>
              <div className="text-xs text-gray-500">Space Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#5BB539] dark:text-green-400">
                {Math.round(efficiency.wallEfficiency * 100)}%
              </div>
              <div className="text-xs text-gray-500">Wall Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(efficiency.connectivityScore * 100)}%
              </div>
              <div className="text-xs text-gray-500">Connectivity</div>
            </div>
          </div>
          <div className="pb-3">
            <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-white">
              <Link className="w-4 h-4 mr-2" />
              Shared Walls ({editablePlan.connectivity.sharedWalls.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editablePlan.connectivity.sharedWalls.map((wall, index) => {
                const room1 = editablePlan.rooms.find(
                  (r) => r.wallConnectivity?.roomId === wall.room1Id
                );
                const room2 = editablePlan.rooms.find(
                  (r) => r.wallConnectivity?.roomId === wall.room2Id
                );
                return (
                  <div
                    key={wall.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                  >
                    <div className="flex items-center">
                      <ArrowRightLeft className="w-3 h-3 mr-2 text-[#002d5c] dark:text-blue-400" />
                      {room1?.room_name || wall.room1Id} ↔{" "}
                      {room2?.room_name || wall.room2Id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {wall.sharedLength.toFixed(1)}m (
                      {wall.sharedArea.toFixed(1)}m²)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-5">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Room Connections</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editablePlan.rooms.map((room, index) => {
                const connections = getRoomConnections(`room_${index}`);
                if (connections.length === 0) return null;
                return (
                  <div
                    key={index}
                    className="flex items-start p-2 bg-[#002d5c]/5 dark:bg-[#5BB539]/10 rounded text-sm"
                  >
                    <div className="font-medium w-32 flex-shrink-0 truncate">
                      {room.room_name || `Room ${index + 1}`}:
                    </div>
                    <div className="flex-1 text-gray-700 dark:text-gray-300">
                      {connections
                        .map((connId) => {
                          const connectedRoom = editablePlan.rooms.find(
                            (r) => r.wallConnectivity?.roomId === connId
                          );
                          return connectedRoom?.room_name || connId;
                        })
                        .join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) navigate("/auth");
  if (profile?.tier === "Free") {
    const getTierBadge = (tier: string) => {
      switch (tier) {
        case "Free":
          return (
            <Badge className="bg-gray-100 text-gray-800">
              <Shell className="w-3 h-3 mr-1" />
              Free
            </Badge>
          );
        case "Intermediate":
          return (
            <Badge className="bg-blue-100 text-blue-800">
              <Crown className="w-3 h-3 mr-1" />
              Intermediate
            </Badge>
          );
        case "Professional":
          return (
            <Badge className="bg-[#5BB539]/20 text-[#5BB539] border border-[#5BB539]/30">
              <Shield className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          );
        default:
          return <Badge>{tier}</Badge>;
      }
    };
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-[#0f172a]">
        <Card className="max-w-md w-full bg-white dark:bg-[#1e293b] shadow-lg border border-[#d1d5db] dark:border-gray-700 rounded-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#002d5c] to-[#001a35] rounded-full flex items-center justify-center text-white shadow">
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#002d5c] dark:text-white">
              Upgrade Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Upgrade to access AI-powered plan parsing and advanced features.
            </p>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {getTierBadge(profile.tier)}
            </div>
            <Button
              className="w-full bg-[#002d5c] hover:bg-[#001a35] text-white font-semibold rounded-lg shadow"
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
    <>
      <GlobalStyles />
      <div className="min-h-screen font-technical bg-white text-[#1a1a1a] dark:bg-[#0f172a] dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center text-2xl font-extrabold tracking-tight">
              <UploadCloud className="w-7 h-7 mr-2 text-[#002d5c] dark:text-white" />
              <span className="bg-gradient-to-r from-[#002d5c] to-[#001a35] bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                Upload & Analyze Plan
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-base font-medium">
              AI-powered extraction of rooms, dimensions, doors, and windows —
              instantly generate accurate construction estimates.
            </p>
          </motion.div>

          {/* Progress Steps */}
          {currentStep !== "idle" && currentStep !== "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="border border-[#d1d5db] dark:border-gray-700 rounded-lg">
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
                                ? "bg-[#5BB539] text-white shadow"
                                : isActive
                                ? "bg-[#002d5c] text-white shadow animate-pulse"
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
                                ? "text-[#002d5c] dark:text-[#5BB539]"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-[#002d5c]"
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
                  <motion.p
                    className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4"
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
                              className="w-2 h-2 bg-[#002d5c] rounded-full"
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
                          <span className="text-xs text-[#002d5c] dark:text-[#5BB539] font-medium">
                            Est. time: {analysisTimeLeft}s
                          </span>
                        )}
                      </span>
                    )}
                    {currentStep === "complete" && (
                      <span className="flex items-center justify-center gap-2 text-[#5BB539] dark:text-[#5BB539]">
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
              <Card className="border border-red-200 dark:border-red-700 rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div
                      className={`p-3 rounded-full bg-red-100 dark:bg-red-900/30 ${getErrorColor()}`}
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
                        className="w-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white dark:hover:bg-red-700"
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
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="border border-[#d1d5db] dark:border-gray-700 rounded-lg">
                <CardHeader className="bg-[#002d5c] text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold">Upload Your Floor Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {(editablePlan && currentStep === "complete") ||
                  (fileUrl &&
                    (currentStep === "analyzing" || currentStep === "uploading")) ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-[#f8f9fa] dark:bg-[#1e293b] rounded-lg border border-[#e5e7eb] dark:border-gray-600">
                        <FileText className="w-6 h-6 text-[#002d5c] dark:text-[#5BB539]" />
                        <p className="text-lg font-medium truncate flex-1">
                          {selectedFile?.name || fileUrl.split("/").pop() || "Uploaded Plan"}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      {previewUrl && (
                        <Card className="border border-[#d1d5db] dark:border-gray-600 rounded-lg">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center text-[#002d5c] dark:text-white">
                              <Eye className="w-5 h-5 mr-2" />
                              Plan Preview
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3">
                            <div
                              className="h-[500px] rounded-lg overflow-hidden cursor-pointer border border-[#e5e7eb] dark:border-gray-600"
                              onClick={() => setShowPreviewModal(true)}
                            >
                              <PreviewModal
                                fileUrl={previewUrl}
                                fileType={selectedFile?.type || "image/jpeg"}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {(currentStep === "analyzing" || currentStep === "uploading") && (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#002d5c] dark:text-white mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            {currentStep === "uploading" ? "Uploading..." : "Analyzing plan..."}
                          </p>
                        </div>
                      )}

                      {currentStep === "complete" && editablePlan && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Edit Extracted Plan
                            </h3>
                          </div>
                          <div className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Floors</Label>
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
                                        : prev
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>File Name</Label>
                                <Input
                                  value={editablePlan.file_name || ""}
                                  onChange={(e) =>
                                    setEditablePlan((prev) =>
                                      prev
                                        ? { ...prev, file_name: e.target.value }
                                        : prev
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            {editablePlan.rooms.map((room, i) => (
                              <Card
                                key={i}
                                className="p-5 border border-[#e5e7eb] dark:border-gray-600 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-[#002d5c] dark:text-[#5BB539]">
                                    Room {i + 1}: {room.room_name || "Unnamed"}
                                  </h4>
                                  {room.wallConnectivity && (
                                    <Badge variant="outline" className="flex items-center text-xs">
                                      <Link className="w-3 h-3 mr-1" />
                                      {room.wallConnectivity.connectedRooms?.length || 0} connections
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <Input
                                    placeholder="Room Name"
                                    value={room.room_name}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, room_name: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Length (m)"
                                    value={room.length}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, length: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Width (m)"
                                    value={room.width}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, width: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Height (m)"
                                    value={room.height}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, height: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Input
                                    placeholder="Block Type"
                                    value={room.blockType}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, blockType: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Wall Thickness (m)"
                                    value={room.thickness}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, thickness: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Plaster"
                                    value={room.plaster}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? { ...r, plaster: e.target.value }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <Label className="flex items-center mb-1">
                                      <DoorOpen className="w-4 h-4 mr-2 text-green-500" />
                                      Doors Count
                                    </Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={room.doors?.length || 0}
                                      onChange={(e) => {
                                        const count = Math.max(0, parseInt(e.target.value) || 0);
                                        setEditablePlan((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                rooms: prev.rooms.map((r, idx) =>
                                                  idx === i
                                                    ? {
                                                        ...r,
                                                        doors: Array.from({ length: count }, (_, di) =>
                                                          r.doors[di] || {
                                                            sizeType: "standard",
                                                            standardSize: "0.9 × 2.1 m",
                                                            custom: { height: "", width: "", price: "" },
                                                            type: "Panel",
                                                            frame: {
                                                              type: "Wood",
                                                              height: "2.7",
                                                              width: "1.2",
                                                              sizeType: "standard",
                                                              standardSize: "1.2 x 1.2 m",
                                                              custom: { height: "1.2", width: "1.2", price: "" },
                                                            },
                                                            count: 1,
                                                          }
                                                        ),
                                                      }
                                                    : r
                                                ),
                                              }
                                            : prev
                                        );
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label className="flex items-center mb-1">
                                      <LucideAppWindow className="w-4 h-4 mr-2 text-blue-500" />
                                      Windows Count
                                    </Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={room.windows?.length || 0}
                                      onChange={(e) => {
                                        const count = Math.max(0, parseInt(e.target.value) || 0);
                                        setEditablePlan((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                rooms: prev.rooms.map((r, idx) =>
                                                  idx === i
                                                    ? {
                                                        ...r,
                                                        windows: Array.from({ length: count }, (_, wi) =>
                                                          r.windows[wi] || {
                                                            sizeType: "standard",
                                                            standardSize: "1.2 × 1.2 m",
                                                            custom: { height: "", width: "", price: "" },
                                                            type: "Clear",
                                                            frame: {
                                                              type: "Wood",
                                                              height: "2.7",
                                                              width: "1.2",
                                                              sizeType: "standard",
                                                              standardSize: "1.2 x 1.2 m",
                                                              custom: { height: "1.2", width: "1.2", price: "" },
                                                            },
                                                            count: 1,
                                                          }
                                                        ),
                                                      }
                                                    : r
                                                ),
                                              }
                                            : prev
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : fileUrl ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-[#f8f9fa] dark:bg-[#1e293b] rounded-lg border border-[#e5e7eb] dark:border-gray-600">
                        <LucideFileText className="w-8 h-8 text-[#002d5c] dark:text-[#5BB539]" />
                        <p className="text-lg font-medium truncate flex-1">
                          {fileUrl.split("/").pop() || "Uploaded Plan"}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadFile(fileUrl, fileUrl.split("/").pop() || "plan")}
                          className="text-[#002d5c] dark:text-[#5BB539]"
                        >
                          <HardDriveDownload className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => navigate("/quotes/new", { state: { quoteData } })}
                          className="flex-1 h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRetry}
                          variant="secondary"
                          className="flex-1 h-12"
                        >
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Retry Analysis
                        </Button>
                      </div>
                    </div>
                  ) : !selectedFile ? (
                    <div className="border-2 border-dashed border-[#002d5c]/30 dark:border-[#5BB539]/30 rounded-xl p-12 text-center transition-all hover:border-[#002d5c] dark:hover:border-[#5BB539] hover:shadow bg-[#f8f9fa]/50 dark:bg-[#002d5c]/5">
                      <UploadCloud className="w-16 h-16 mx-auto mb-4 text-[#002d5c] dark:text-[#5BB539]" />
                      <p className="mb-3 text-gray-700 dark:text-gray-300 font-medium">
                        Drag & drop your plan or click to upload
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Supported formats: JPEG, PNG, PDF, WEBP (Max 20MB)
                      </p>
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileUpload"
                      />
                      <Label
                        htmlFor="fileUpload"
                        className="cursor-pointer inline-flex items-center px-5 py-2.5 bg-[#002d5c] hover:bg-[#001a35] text-white font-bold rounded-lg shadow transition-colors"
                      >
                        📁 Select File
                      </Label>
                    </div>
                  ) : null}

                  <div className="flex space-x-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/quotes/new")}
                      className="flex-1 h-12"
                    >
                      Cancel
                    </Button>
                    {(editablePlan && currentStep === "complete") ||
                    (selectedFile && !fileUrl && currentStep !== "error") ? (
                      <Button
                        onClick={handleDone}
                        disabled={currentStep === "uploading" || currentStep === "analyzing"}
                        className="flex-1 bg-[#002d5c] hover:bg-[#001a35] text-white font-bold h-12 rounded-lg"
                      >
                        {currentStep === "uploading" || currentStep === "analyzing" ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Done
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Connectivity Panel */}
            {showConnectivityPanel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
              >
                {renderConnectivityPanel()}
              </motion.div>
            )}
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
                className="bg-white dark:bg-[#1e293b] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-[#d1d5db] dark:border-gray-700">
                  <h3 className="text-lg font-semibold">Plan Preview</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreviewModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
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
    </>
  );
};

export default UploadPlan;