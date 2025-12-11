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
  Database,
  Globe,
  ChevronRight,
  ShieldCheck,
  Users,
  GraduationCap,
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
    
    /* Dark mode variables */
    .dark {
      --navy: #002d5c;
      --accent: #5BB539;
      --bg-primary: #0a0a0a;
      --bg-secondary: #111111;
      --border: #333333;
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --card-bg: #1a1a1a;
    }
    
    /* Light mode variables */
    :root {
      --navy: #002d5c;
      --accent: #5BB539;
      --bg-primary: #ffffff;
      --bg-secondary: #fcfcfc;
      --border: #d1d5db;
      --text-primary: #1a1a1a;
      --text-secondary: #6b7280;
      --card-bg: #ffffff;
    }
  `}</style>
);

// --- ENGINEERING GRAPHICS ---
const PlanGlobeGraphic = () => (
  <div className="relative w-24 h-24">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#002d5c] to-[#001a35] shadow-xl"></div>
    <svg
      className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="0.5" />
      <path d="M50 1 L50 99 M1 50 L99 50" stroke="white" strokeWidth="0.5" fill="none" />
      <ellipse
        cx="50"
        cy="50"
        rx="49"
        ry="20"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        className="rotate-45 origin-center"
      />
    </svg>
    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-[#5BB539] rounded-full animate-pulse"></div>
    <div className="absolute top-1/2 -left-2 bg-white text-[6px] font-bold text-[#002d5c] px-1.5 py-0.5 border border-gray-200 uppercase tracking-wider shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700">
      AI-SCAN
    </div>
  </div>
);

const PlanMonitorGraphic = () => (
  <div className="relative w-32">
    <div className="bg-[#1a1a1a] p-1 border border-black shadow-lg dark:border-gray-700">
      <div className="bg-[#002d5c] relative overflow-hidden aspect-[16/10]">
        <div className="h-2 bg-[#001a35] w-full flex items-center px-1 space-x-1">
          <div className="w-0.5 h-0.5 rounded-full bg-red-400"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-yellow-400"></div>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1 opacity-50">
          <div className="h-6 bg-white/20 border border-white/10"></div>
          <div className="h-6 bg-white/10 border border-white/10"></div>
          <div className="col-span-2 h-3 bg-white/10"></div>
        </div>
      </div>
    </div>
    <div className="w-8 h-3 bg-[#1a1a1a] mx-auto dark:bg-gray-800"></div>
    <div className="w-12 h-0.5 bg-black/20 mx-auto dark:bg-gray-700"></div>
  </div>
);

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
          className="w-full h-[70vh] rounded-lg border border-[var(--border)]"
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
          <FileIcon className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
          <p className="text-[var(--text-secondary)]">
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
      <div className="bg-[var(--card-bg)] border border-[var(--border)] border-t-4 border-t-[var(--navy)]">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-5 h-5 text-[var(--navy)] dark:text-white" />
            <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)]">
              Wall Connectivity Analysis
            </h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            AI-detected room connections and shared walls
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Efficiency Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--navy)] dark:text-blue-400">
                {Math.round(efficiency.spaceUtilization * 100)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Space Utilization
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--accent)]">
                {Math.round(efficiency.wallEfficiency * 100)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Wall Efficiency
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(efficiency.connectivityScore * 100)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Connectivity
              </div>
            </div>
          </div>

          {/* Shared Walls List */}
          <div className="pb-3">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center text-[var(--text-primary)]">
              <Link className="w-4 h-4 mr-2 text-[var(--navy)] dark:text-white" />
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
                    className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs"
                  >
                    <div className="flex items-center">
                      <ArrowRightLeft className="w-3 h-3 mr-2 text-[var(--navy)] dark:text-blue-400" />
                      {room1?.room_name || wall.room1Id} ↔{" "}
                      {room2?.room_name || wall.room2Id}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text-secondary)]">
                      {wall.sharedLength.toFixed(1)}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Connections */}
          <div className="mt-5">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3 text-[var(--text-primary)]">
              Room Connections
            </h4>
            <div className="space-y-2">
              {editablePlan.rooms.map((room, index) => {
                const connections = getRoomConnections(`room_${index}`);
                if (connections.length === 0) return null;

                return (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-[var(--navy)]/10 dark:bg-[#002d5c]/30 border border-[var(--navy)]/20 rounded text-xs"
                  >
                    <div className="font-bold text-[var(--text-primary)] w-32 truncate">
                      {room.room_name || `Room ${index + 1}`}:
                    </div>
                    <div className="flex-1 text-[var(--text-secondary)]">
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
        </div>
      </div>
    );
  };

  if (!user) navigate("/auth");

  if (profile?.tier === "Free") {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)] font-technical">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] border-t-4 border-t-[var(--accent)] max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--accent)]/20 rounded-sm flex items-center justify-center">
                <Shield className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Upgrade Required
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                Upgrade to access AI-powered plan parsing and advanced features.
              </p>
            </div>
            <div className="flex items-center justify-center mb-6">
              <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                <Shell className="w-3 h-3 mr-1" />
                Free Tier
              </Badge>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-[var(--navy)] hover:bg-[#001a35] text-white text-[11px] font-black uppercase tracking-[2px] py-3"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-[var(--bg-primary)] font-technical text-[var(--text-primary)]">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* HEADER SECTION */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[var(--navy)] text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest border border-[var(--border)]">
                  AI-PARSER // v4.2
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Advanced Plan Analysis
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl leading-tight mb-3">
                <span className="font-light block">AI-Powered</span>
                <span className="font-extrabold text-[var(--navy)] dark:text-white block mt-1">
                  Plan Analysis Engine
                </span>
              </h1>
              
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-2xl font-medium mb-6">
                Upload construction plans for automatic extraction of rooms, dimensions, 
                doors, windows, and wall connectivity. Generate accurate estimates instantly.
              </p>

              <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ISO 27001 Secure</span>
                </div>
                <div className="w-0.5 h-0.5 bg-[var(--border)] rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="w-0.5 h-0.5 bg-[var(--border)] rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  <span>Wall Connectivity Detection</span>
                </div>
              </div>
            </motion.div>

            {/* PROGRESS STEPS - ENGINEERING STYLE */}
            {currentStep !== "idle" && currentStep !== "error" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="bg-[var(--card-bg)] border border-[var(--border)] p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "UPLOAD", icon: UploadCloud, step: "uploading" },
                      { label: "ANALYSIS", icon: BarChart3, step: "analyzing" },
                      { label: "COMPLETE", icon: CheckCircle, step: "complete" },
                    ].map((item, idx) => {
                      const isDone = 
                        (currentStep === "analyzing" && idx < 1) ||
                        (currentStep === "complete" && idx < 2);
                      const isActive = currentStep === item.step;

                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="relative mb-3">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-sm border-2 ${
                              isDone 
                                ? "border-[var(--accent)] bg-[var(--accent)]/10" 
                                : isActive 
                                ? "border-[var(--navy)] bg-[var(--navy)]/10 animate-pulse" 
                                : "border-[var(--border)] bg-[var(--bg-secondary)]"
                            }`}>
                              {isDone ? (
                                <CheckCircle className="w-5 h-5 text-[var(--accent)]" />
                              ) : (
                                <item.icon className={`w-4 h-4 ${
                                  isActive ? "text-[var(--navy)] dark:text-white" : "text-[var(--text-secondary)]"
                                }`} />
                              )}
                            </div>
                            {idx < 2 && (
                              <div className={`absolute top-1/2 left-full w-16 h-0.5 ${
                                isDone ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                              }`}></div>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isDone || isActive 
                              ? "text-[var(--navy)] dark:text-white" 
                              : "text-[var(--text-secondary)]"
                          }`}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-full bg-[var(--bg-secondary)] rounded-sm h-1.5">
                    <motion.div
                      className="h-1.5 rounded-sm"
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
                      style={{ backgroundColor: "var(--navy)" }}
                    />
                  </div>
                  
                  <motion.p
                    className="text-center text-sm font-medium mt-4 text-[var(--text-primary)]"
                    key={currentStep}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {currentStep === "uploading" && (
                      <span className="flex items-center justify-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        Uploading construction plan...
                      </span>
                    )}
                    {currentStep === "analyzing" && (
                      <span className="flex flex-col items-center justify-center gap-2">
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[var(--accent)]" />
                          AI is analyzing your plan...
                        </span>
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </span>
                    )}
                    {currentStep === "complete" && (
                      <span className="flex items-center justify-center gap-2 text-[var(--accent)]">
                        <CheckCircle className="w-4 h-4" />
                        Plan successfully parsed! Review and edit below.
                      </span>
                    )}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* ERROR STATE - ENGINEERING STYLE */}
            {currentStep === "error" && error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="bg-[var(--card-bg)] border border-[var(--border)] border-l-4 border-l-red-500 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-sm ${getErrorColor().replace('text-', 'bg-')}/10`}>
                      {getErrorIcon()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                        {error.type === "network" ? "NETWORK ERROR" : 
                         error.type === "analysis" ? "ANALYSIS FAILED" : 
                         "SAVE ERROR"}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {error.message}
                      </p>
                      {retryCount > 0 && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2 font-bold">
                          ATTEMPT {retryCount} OF {MAX_RETRIES}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRemoveFile}
                      className="flex-1 border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:bg-red-600 text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Remove File
                    </Button>
                    {error.retryable && (
                      <Button
                        onClick={handleRetry}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider"
                        disabled={retryCount >= MAX_RETRIES}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                        {retryCount >= MAX_RETRIES ? "Max Retries" : "Try Again"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - UPLOAD & EDIT */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--card-bg)] border border-[var(--border)]">
                {/* UPLOAD AREA */}
                {!selectedFile && !fileUrl && (
                  <div className="p-10 text-center">
                    <div className="mb-8">
                      <UploadCloud className="w-16 h-16 mx-auto mb-4 text-[var(--navy)] dark:text-white opacity-50" />
                      <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-[var(--text-primary)]">
                        Upload Construction Plan
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-6">
                        Supported formats: JPEG, PNG, PDF, WEBP (Max 20MB)
                      </p>
                    </div>

                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                    />

                    <Label
                      htmlFor="fileUpload"
                      className="cursor-pointer inline-flex items-center px-8 py-4 bg-[var(--navy)] text-white text-[11px] font-black uppercase tracking-[2px] hover:bg-[#001a35] transition-all shadow-lg border border-[var(--border)] mb-4"
                    >
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Select Plan File
                    </Label>
                  </div>
                )}

                {/* FILE UPLOADED STATE */}
                {(selectedFile || fileUrl) && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[var(--navy)] dark:text-white" />
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">
                            {selectedFile?.name || fileUrl?.split("/").pop() || "Uploaded Plan"}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {selectedFile?.size ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {previewUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreviewModal(true)}
                            className="border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="border-red-200 text-red-600 hover:text-white hover:bg-red-600 text-[10px] font-bold uppercase tracking-wider"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* PREVIEW THUMBNAIL */}
                    {previewUrl && (
                      <div 
                        className="mb-6 border border-[var(--border)] rounded-sm overflow-hidden cursor-pointer hover:border-[var(--navy)] transition-colors"
                        onClick={() => setShowPreviewModal(true)}
                      >
                        <div className="aspect-video bg-[var(--bg-secondary)] flex items-center justify-center">
                          <div className="text-center">
                            <Eye className="w-8 h-8 mx-auto mb-2 text-[var(--text-secondary)]" />
                            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                              Click to Preview
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EDITABLE PLAN FORM */}
                    {currentStep === "complete" && editablePlan && (
                      <div className="space-y-6">
                        <div className="border-b border-[var(--border)] pb-4">
                          <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)] mb-2">
                            Edit Extracted Plan
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Review and modify the AI-extracted data
                          </p>
                        </div>

                        {/* BASIC INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                              Floors
                            </Label>
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
                              className="border-[var(--border)] bg-[var(--bg-secondary)]"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                              File Name
                            </Label>
                            <Input
                              value={editablePlan.file_name || ""}
                              onChange={(e) =>
                                setEditablePlan((prev) =>
                                  prev
                                    ? { ...prev, file_name: e.target.value }
                                    : prev
                                )
                              }
                              className="border-[var(--border)] bg-[var(--bg-secondary)]"
                            />
                          </div>
                        </div>

                        {/* ROOMS LIST */}
                        <div className="space-y-4">
                          {editablePlan.rooms.map((room, i) => (
                            <div key={i} className="border border-[var(--border)] p-4 rounded-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-[var(--text-primary)]">
                                  Room {i + 1}: {room.room_name || "Unnamed"}
                                </h4>
                                {room.wallConnectivity && (
                                  <Badge className="bg-[var(--navy)]/10 text-[var(--navy)] dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                    <Link className="w-3 h-3 mr-1" />
                                    {room.wallConnectivity.connectedRooms?.length || 0} connections
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                    Room Name
                                  </Label>
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
                                                  ? {
                                                      ...r,
                                                      room_name: e.target.value,
                                                    }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                    className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                      Length
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="m"
                                      value={room.length}
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                rooms: prev.rooms.map((r, idx) =>
                                                  idx === i
                                                    ? {
                                                        ...r,
                                                        length: e.target.value,
                                                      }
                                                    : r
                                                ),
                                              }
                                            : prev
                                        )
                                      }
                                      className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                      Width
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="m"
                                      value={room.width}
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                rooms: prev.rooms.map((r, idx) =>
                                                  idx === i
                                                    ? {
                                                        ...r,
                                                        width: e.target.value,
                                                      }
                                                    : r
                                                ),
                                              }
                                            : prev
                                        )
                                      }
                                      className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                      Height
                                    </Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="m"
                                      value={room.height}
                                      onChange={(e) =>
                                        setEditablePlan((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                rooms: prev.rooms.map((r, idx) =>
                                                  idx === i
                                                    ? {
                                                        ...r,
                                                        height: e.target.value,
                                                      }
                                                    : r
                                                ),
                                              }
                                            : prev
                                        )
                                      }
                                      className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                    Block Type
                                  </Label>
                                  <Input
                                    placeholder="e.g., Stone"
                                    value={room.blockType}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
                                                      blockType: e.target.value,
                                                    }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                    className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                    Wall Thickness
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="m"
                                    value={room.thickness}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
                                                      thickness: e.target.value,
                                                    }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                    className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                                    Plaster
                                  </Label>
                                  <Input
                                    placeholder="e.g., Cement"
                                    value={room.plaster}
                                    onChange={(e) =>
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
                                                      plaster: e.target.value,
                                                    }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      )
                                    }
                                    className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block flex items-center">
                                    <DoorOpen className="w-3 h-3 mr-1" />
                                    Doors Count
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={room.doors?.length || 0}
                                    onChange={(e) => {
                                      const count = Math.max(
                                        0,
                                        parseInt(e.target.value) || 0
                                      );
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
                                                      doors: Array.from(
                                                        { length: count },
                                                        (_, di) =>
                                                          r.doors[di] || {
                                                            sizeType:
                                                              "standard",
                                                            standardSize:
                                                              "0.9 \u00D7 2.1 m",
                                                            custom: {
                                                              height: "",
                                                              width: "",
                                                              price: "",
                                                            },
                                                            type: "Panel",
                                                            frame: {
                                                              type: "Wood",
                                                              height: "2.7",
                                                              width: "1.2",
                                                              sizeType:
                                                                "standard",
                                                              standardSize:
                                                                "1.2 x 1.2 m",
                                                              custom: {
                                                                height: "1.2",
                                                                width: "1.2",
                                                                price: "",
                                                              },
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
                                    className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block flex items-center">
                                    <LucideAppWindow className="w-3 h-3 mr-1" />
                                    Windows Count
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={room.windows?.length || 0}
                                    onChange={(e) => {
                                      const count = Math.max(
                                        0,
                                        parseInt(e.target.value) || 0
                                      );
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
                                                      windows: Array.from(
                                                        { length: count },
                                                        (_, wi) =>
                                                          r.windows[wi] || {
                                                            sizeType:
                                                              "standard",
                                                            standardSize:
                                                              "1.2 \u00D7 1.2 m",
                                                            custom: {
                                                              height: "",
                                                              width: "",
                                                              price: "",
                                                            },
                                                            type: "Clear",
                                                            frame: {
                                                              type: "Wood",
                                                              height: "2.7",
                                                              width: "1.2",
                                                              sizeType:
                                                                "standard",
                                                              standardSize:
                                                                "1.2 x 1.2 m",
                                                              custom: {
                                                                height: "1.2",
                                                                width: "1.2",
                                                                price: "",
                                                              },
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
                                    className="border-[var(--border)] bg-[var(--bg-secondary)]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/quotes/new")}
                  className="flex-1 border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--navy)] text-[11px] font-bold uppercase tracking-wider py-3"
                >
                  Cancel
                </Button>
                
                {(editablePlan && currentStep === "complete") ||
                (selectedFile && !fileUrl && currentStep !== "error") ? (
                  <Button
                    onClick={handleDone}
                    disabled={
                      currentStep === "uploading" ||
                      currentStep === "analyzing"
                    }
                    className="flex-1 bg-[var(--navy)] hover:bg-[#001a35] text-white text-[11px] font-black uppercase tracking-[2px] py-3"
                  >
                    {currentStep === "uploading" ||
                    currentStep === "analyzing" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save & Continue
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* RIGHT COLUMN - CONNECTIVITY PANEL */}
            <div>
              {showConnectivityPanel && renderConnectivityPanel()}
              
              {/* INFO PANEL */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] border-t-4 border-t-[var(--accent)] mt-8 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)]">
                    AI Analysis Features
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Automatic room detection",
                    "Dimension extraction (L × W × H)",
                    "Wall connectivity mapping",
                    "Door & window counting",
                    "Material classification",
                    "Floor plan optimization"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="text-[var(--text-primary)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
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
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-sm max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-primary)]">
                  Plan Preview
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="border-[var(--border)]"
                >
                  <X className="w-4 h-4" />
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
    </>
  );
};

export default UploadPlan;