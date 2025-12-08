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
  ImageIcon,
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

// RISA Color Palette (aligned with public pages)
const PRIMARY_TEXT = "#001021";
const ACCENT_BLUE = "#005F9E";
const BORDER_COLOR = "#E5E7EB";
const LIGHT_BG = "#F5F7FA";

export interface ParsedPlan {
  rooms: Room[];
  floors: number;
  file_url?: string;
  uploaded_at?: string;
  file_name?: string;
  note?: string;
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

const PreviewModal = ({ fileUrl, fileType }: { fileUrl: string; fileType: string }) => {
  const isPDF = fileType === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf");
  const isImage = fileType.startsWith("image/") || fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/);
  return (
    <div className="p-4 max-h-[80vh] w-full overflow-auto">
      {isPDF ? (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] rounded-lg border border-gray-200"
          title="PDF Preview"
        />
      ) : isImage ? (
        <img
          src={fileUrl}
          alt="Plan preview"
          className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-sm object-contain"
        />
      ) : (
        <div className="text-center py-8">
          <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Preview not available for this file type</p>
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
  const [currentStep, setCurrentStep] = useState<"idle" | "uploading" | "analyzing" | "complete" | "error">("idle");
  const [confidence, setConfidence] = useState<number>(0);
  const [extractedDataPreview, setExtractedDataPreview] = useState<ParsedPlan | null>(null);
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
    // ... (logic unchanged)
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
    // ... (logic unchanged)
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
    // ... (logic unchanged)
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

  const analyzePlan = async (file: File, setError: Function, setCurrentStep: Function): Promise<ParsedPlan> => {
    // ... (logic unchanged)
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("https://constructly-backend.onrender.com/api/plan/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Analysis failed: ${res.status} - ${errorText}`);
    }
    const result = await res.json();
    if (result.note) {
      const noteText = result.note.toString().toLowerCase();
      const errorKeywords = ["error", "failed", "invalid", "missing", "unable", "issue", "exception"];
      const containsError = errorKeywords.some((word) => noteText.includes(word));
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
    // ... (logic unchanged)
    const fileUrl = await uploadPlan(file);
    await supabase
      .from("quotes")
      .update({ plan_file_url: fileUrl })
      .eq("id", quoteData.id);
    return fileUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (logic unchanged)
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "pdf", "webp"];
    const validTypes = ["image/jpeg", "image/png", "application/pdf", "image/webp"];
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExt || "");
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
                position: data.connectivity.roomPositions[`room_${index}`] || { x: 0, y: 0 },
                connectedRooms: data.connectivity.sharedWalls
                  .filter((wall) => wall.room1Id === `room_${index}` || wall.room2Id === `room_${index}`)
                  .map((wall) => (wall.room1Id === `room_${index}` ? wall.room2Id : wall.room1Id)),
                sharedArea: data.connectivity.sharedWalls
                  .filter((wall) => wall.room1Id === `room_${index}` || wall.room2Id === `room_${index}`)
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
      if (err.message.includes("Failed to fetch") || err.message.includes("Network")) {
        errorType = "network";
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message.includes("Invalid response format")) {
        errorMessage = "The analysis service returned an unexpected format. Please try again.";
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
    // ... (logic unchanged)
    if (!selectedFile || !quoteData?.id || !editablePlan) return;
    try {
      setCurrentStep("uploading");
      toast({ title: "Uploading plan", description: "Please wait" });
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
      case "network": return <AlertCircle className="w-6 h-6" />;
      case "analysis": return <AlertTriangle className="w-6 h-6" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getErrorColor = () => {
    switch (error?.type) {
      case "network": return "text-orange-600";
      case "analysis": return "text-red-600";
      case "save": return "text-red-600";
      default: return "text-red-600";
    }
  };

  const getSharedWallsForRoom = (roomId: string) => {
    if (!editablePlan?.connectivity?.sharedWalls) return [];
    return editablePlan.connectivity.sharedWalls.filter(
      (wall) => wall.room1Id === roomId || wall.room2Id === roomId
    );
  };

  const getRoomConnections = (roomId: string) => {
    const room = editablePlan?.rooms.find((r) => r.wallConnectivity?.roomId === roomId);
    return room?.wallConnectivity?.connectedRooms || [];
  };

  const renderConnectivityPanel = () => {
    if (!editablePlan?.connectivity) return null;
    const efficiency = editablePlan.connectivity.efficiency;
    return (
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-[#001021] flex items-center gap-2">
            <Network className="w-4 h-4 text-[#005F9E]" />
            Wall Connectivity Analysis
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            AI-detected room connections and shared walls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Space", value: efficiency.spaceUtilization, color: "text-blue-600" },
              { label: "Walls", value: efficiency.wallEfficiency, color: "text-green-600" },
              { label: "Connect", value: efficiency.connectivityScore, color: "text-purple-600" },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <div className={`text-lg font-extrabold ${m.color}`}>{Math.round(m.value * 100)}%</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{m.label}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Link className="w-3 h-3" /> Shared Walls
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editablePlan.connectivity.sharedWalls.map((wall) => {
                const room1 = editablePlan.rooms.find((r) => r.wallConnectivity?.roomId === wall.room1Id);
                const room2 = editablePlan.rooms.find((r) => r.wallConnectivity?.roomId === wall.room2Id);
                return (
                  <div key={wall.id} className="flex justify-between text-[11px] p-2 bg-gray-50 rounded">
                    <span>{room1?.room_name || wall.room1Id} ↔ {room2?.room_name || wall.room2Id}</span>
                    <span className="text-gray-600">{wall.sharedLength.toFixed(1)}m</span>
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
          return <Badge className="bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Free</Badge>;
        case "Intermediate":
          return <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Intermediate</Badge>;
        case "Professional":
          return <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Professional</Badge>;
        default:
          return <Badge>{tier}</Badge>;
      }
    };

    return (
      <div className="min-h-screen bg-white font-inter flex items-center justify-center p-4">
        <GlobalStyles />
        <Card className="max-w-md w-full border border-gray-200 shadow-sm rounded-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <Shield className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl font-extrabold text-[#001021]">Upgrade Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Upgrade to access AI-powered plan parsing and advanced features.
            </p>
            <div>{getTierBadge(profile.tier)}</div>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full text-[11px] font-bold uppercase tracking-widest bg-[#005F9E] hover:bg-[#004a7a] text-white rounded-md py-2.5"
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
      <div className="min-h-screen bg-white font-inter text-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#001021] flex items-center justify-center gap-3">
              <UploadCloud className="w-6 h-6 text-[#005F9E]" />
              Upload & Analyze Plan
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
              AI-powered extraction of rooms, dimensions, doors, and windows — instantly generate accurate construction estimates.
            </p>
          </motion.div>

          {/* Progress Steps */}
          {currentStep !== "idle" && currentStep !== "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-10"
            >
              <Card className="rounded-lg border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    {[
                      { label: "Uploading", icon: UploadCloud },
                      { label: "Analyzing", icon: BarChart3 },
                      { label: "Complete", icon: CheckCircle },
                    ].map((step, idx) => {
                      const isDone = (currentStep === "analyzing" && idx < 1) || (currentStep === "complete" && idx < 2) || (idx === 2 && currentStep === "complete");
                      const isActive = (currentStep === "uploading" && idx === 0) || (currentStep === "analyzing" && idx === 1) || (currentStep === "complete" && idx === 2);
                      const IconComponent = step.icon;
                      return (
                        <div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isDone ? "bg-green-500 text-white" : isActive ? "bg-[#005F9E] text-white" : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {isDone ? <CheckCircle className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
                          </div>
                          <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive || isDone ? "text-[#005F9E]" : "text-gray-500"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-[#005F9E]"
                      initial={{ width: "0%" }}
                      animate={{
                        width: currentStep === "uploading" ? "33%" : currentStep === "analyzing" ? "66%" : "100%",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <motion.p
                    className="text-center text-sm text-gray-600 mt-4"
                    key={currentStep}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {currentStep === "uploading" && (
                      <span className="flex items-center justify-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Uploading your construction plan...
                      </span>
                    )}
                    {currentStep === "analyzing" && (
                      <span className="flex flex-col items-center gap-2">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-[#005F9E] rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4" /> AI is analyzing your plan...
                        </span>
                      </span>
                    )}
                    {currentStep === "complete" && (
                      <span className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" /> Plan successfully parsed! Review and edit below.
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
              className="mb-10"
            >
              <Card className="rounded-lg border border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-2 rounded-full bg-red-100 text-red-600">{getErrorIcon()}</div>
                    <div>
                      <h3 className="font-bold text-red-800">
                        {error.type === "network" ? "Connection Error" : error.type === "analysis" ? "Analysis Failed" : "Save Error"}
                      </h3>
                      <p className="text-red-700 text-sm">{error.message}</p>
                      {retryCount > 0 && (
                        <p className="text-xs text-red-600 mt-1">Attempt {retryCount} of {MAX_RETRIES}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleRemoveFile}
                      className="flex-1 text-[11px] font-bold uppercase tracking-widest border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove File
                    </Button>
                    {error.retryable && (
                      <Button
                        onClick={handleRetry}
                        disabled={retryCount >= MAX_RETRIES}
                        className="flex-1 text-[11px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        {retryCount >= MAX_RETRIES ? "Max Retries" : "Try Again"}
                      </Button>
                    )}
                  </div>
                  {retryCount >= MAX_RETRIES && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                      💡 <strong>Tip:</strong> Try uploading a clearer image or different file format.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="rounded-lg border border-gray-200 shadow-sm">
                <CardHeader className="bg-[#005F9E] text-white rounded-t-lg">
                  <CardTitle className="text-lg font-bold">Upload Your Floor Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {(editablePlan && currentStep === "complete") ||
                  (fileUrl && (currentStep === "analyzing" || currentStep === "uploading")) ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#005F9E]" />
                          <span className="font-bold text-[#001021]">
                            {selectedFile?.name || fileUrl.split("/").pop() || "Uploaded Plan"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {previewUrl && (
                        <Card className="border border-gray-200 rounded-lg overflow-hidden">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-[#001021] flex items-center gap-2">
                              <Eye className="w-4 h-4 text-[#005F9E]" />
                              Plan Preview
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div
                              className="w-full h-[600px] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                              onClick={() => setShowPreviewModal(true)}
                            >
                              <PreviewModal fileUrl={previewUrl} fileType={selectedFile?.type || "image/jpeg"} />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {(currentStep === "analyzing" || currentStep === "uploading") && (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#005F9E] mb-4" />
                          <p className="text-gray-600">
                            {currentStep === "uploading" ? "Uploading..." : "Analyzing plan..."}
                          </p>
                        </div>
                      )}

                      {currentStep === "complete" && editablePlan && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#001021]">Edit Extracted Plan</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Floors</Label>
                              <Input
                                type="number"
                                min="1"
                                value={editablePlan.floors}
                                onChange={(e) =>
                                  setEditablePlan((prev) =>
                                    prev ? { ...prev, floors: parseInt(e.target.value) || 1 } : prev
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">File Name</Label>
                              <Input
                                value={editablePlan.file_name || ""}
                                onChange={(e) => setEditablePlan((prev) => (prev ? { ...prev, file_name: e.target.value } : prev))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          {editablePlan.rooms.map((room, i) => (
                            <Card key={i} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-[#001021]">Room {i + 1}: {room.room_name || "Unnamed"}</h4>
                                {room.wallConnectivity && (
                                  <Badge className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {room.wallConnectivity.connectedRooms?.length || 0} connections
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <Input
                                  placeholder="Room Name"
                                  value={room.room_name}
                                  onChange={(e) =>
                                    setEditablePlan((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            rooms: prev.rooms.map((r, idx) => (idx === i ? { ...r, room_name: e.target.value } : r)),
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
                                            rooms: prev.rooms.map((r, idx) => (idx === i ? { ...r, length: e.target.value } : r)),
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
                                            rooms: prev.rooms.map((r, idx) => (idx === i ? { ...r, width: e.target.value } : r)),
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
                                            rooms: prev.rooms.map((r, idx) => (idx === i ? { ...r, height: e.target.value } : r)),
                                          }
                                        : prev
                                    )
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input placeholder="Block Type" value={room.blockType} onChange={(e) => {}} />
                                <Input type="number" step="0.01" placeholder="Wall Thickness (m)" value={room.thickness} onChange={(e) => {}} />
                                <Input placeholder="Plaster" value={room.plaster} onChange={(e) => {}} />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div>
                                  <Label className="flex items-center text-[11px] font-bold text-gray-700 uppercase tracking-widest gap-1">
                                    <DoorOpen className="w-3 h-3 text-green-600" />
                                    Doors Count
                                  </Label>
                                  <Input type="number" min="0" value={room.doors?.length || 0} onChange={(e) => {}} />
                                </div>
                                <div>
                                  <Label className="flex items-center text-[11px] font-bold text-gray-700 uppercase tracking-widest gap-1">
                                    <LucideAppWindow className="w-3 h-3 text-blue-600" />
                                    Windows Count
                                  </Label>
                                  <Input type="number" min="0" value={room.windows?.length || 0} onChange={(e) => {}} />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : fileUrl ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <span className="font-bold text-[#001021]">{fileUrl.split("/").pop() || "Uploaded Plan"}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => downloadFile(fileUrl, fileUrl.split("/").pop() || "plan")} className="text-gray-500">
                            <HardDriveDownload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => navigate("/quotes/new", { state: { quoteData } })}
                          className="flex-1 text-[11px] font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRetry}
                          variant="secondary"
                          className="flex-1 text-[11px] font-bold uppercase tracking-widest text-[#001021] border-[#005F9E]"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Retry Analysis
                        </Button>
                      </div>
                    </div>
                  ) : !selectedFile ? (
                    <div className="border-2 border-dashed border-[#005F9E] rounded-xl p-12 text-center transition-colors hover:border-[#004a7a]">
                      <UploadCloud className="w-16 h-16 mx-auto mb-4 text-[#005F9E]" />
                      <p className="text-gray-600 mb-2">Drag & drop your plan or click to upload</p>
                      <p className="text-xs text-gray-500 mb-4">Supported formats: JPEG, PNG, PDF, WEBP (Max 20MB)</p>
                      <Input type="file" accept=".jpg,.jpeg,.png,.pdf,.webp" onChange={handleFileChange} className="hidden" id="fileUpload" />
                      <Label
                        htmlFor="fileUpload"
                        className="cursor-pointer inline-flex items-center px-5 py-2.5 bg-[#005F9E] hover:bg-[#004a7a] text-white text-[11px] font-bold uppercase tracking-widest rounded-md shadow-sm"
                      >
                        📁 Select File
                      </Label>
                    </div>
                  ) : null}

                  <div className="flex gap-3 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/quotes/new")}
                      className="flex-1 text-[11px] font-bold uppercase tracking-widest border-gray-300 text-[#001021] hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    {(editablePlan && currentStep === "complete") || (selectedFile && !fileUrl && currentStep !== "error") ? (
                      <Button
                        onClick={handleDone}
                        disabled={currentStep === "uploading" || currentStep === "analyzing"}
                        className="flex-1 text-[11px] font-bold uppercase tracking-widest bg-[#005F9E] hover:bg-[#004a7a] text-white rounded-md py-2.5"
                      >
                        {currentStep === "uploading" || currentStep === "analyzing" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" /> Done
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {showConnectivityPanel && editablePlan?.connectivity && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {renderConnectivityPanel()}
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showPreviewModal && previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-bold text-[#001021]">Plan Preview</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowPreviewModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <PreviewModal fileUrl={previewUrl} fileType={selectedFile?.type || "image/jpeg"} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default UploadPlan;