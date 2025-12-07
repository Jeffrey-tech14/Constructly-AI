// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
  ImageIcon,
=======
  Image as ImageIcon,
>>>>>>> origin/main
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

// RISA Color Palette
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

export interface ParsedPlan {
  rooms: Room[];
  floors: number;
  file_url?: string;
  uploaded_at?: string;
  file_name?: string;
  note?: string;
<<<<<<< HEAD
=======
  // NEW: Added connectivity data
>>>>>>> origin/main
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
<<<<<<< HEAD
          className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700"
=======
          className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-600"
>>>>>>> origin/main
          title="PDF Preview"
        />
      ) : isImage ? (
        <img
          src={fileUrl}
          alt="Plan preview"
<<<<<<< HEAD
          className="max-w-full max-h-[70vh] mx-auto rounded-xl shadow-md object-contain"
=======
          className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg object-contain"
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const { quoteData } = location.state || {};
  const { uploadPlan, deletePlan } = usePlanUpload();
  const { toast } = useToast();
  const MAX_RETRIES = 3;
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from(bucketName)
        .list("", {
          limit: 1,
          search: filePath.split("/").pop(),
        });
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);
      if (error) {
        throw error;
      }
=======

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);

      if (error) {
        throw error;
      }

>>>>>>> origin/main
      const signedResponse = await fetch(data.signedUrl);
      if (!signedResponse.ok) {
        throw new Error(`HTTP error! status: ${signedResponse.status}`);
      }
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Analysis failed: ${res.status} - ${errorText}`);
    }
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
    if (!result.rooms || !Array.isArray(result.rooms)) {
      throw new Error("Invalid response format: missing rooms array");
    }
=======

    if (!result.rooms || !Array.isArray(result.rooms)) {
      throw new Error("Invalid response format: missing rooms array");
    }

>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "pdf", "webp"];
    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/webp",
    ];
<<<<<<< HEAD
    const isValidType =
      validTypes.includes(file.type) || validExtensions.includes(fileExt || "");
=======

    const isValidType =
      validTypes.includes(file.type) || validExtensions.includes(fileExt || "");

>>>>>>> origin/main
    if (!isValidType) {
      setError({
        message: "Please upload a supported file format (JPEG, PNG, PDF, WEBP)",
        type: "upload",
        retryable: true,
      });
      setCurrentStep("error");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> origin/main
    if (file.size > 20 * 1024 * 1024) {
      setError({
        message: "File size must be less than 20MB",
        type: "upload",
        retryable: true,
      });
      setCurrentStep("error");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> origin/main
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setConfidence(0);
    setError(null);
<<<<<<< HEAD
=======

>>>>>>> origin/main
    try {
      setCurrentStep("uploading");
      setCurrentStep("analyzing");
      const data = await analyzePlan(file, setError, setCurrentStep);
<<<<<<< HEAD
=======

      // NEW: Process connectivity data if available
>>>>>>> origin/main
      const processedPlan: ExtractedPlan = {
        ...data,
        file_url: fileUrl,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
<<<<<<< HEAD
=======
        // Add wall connectivity to rooms if available
>>>>>>> origin/main
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
<<<<<<< HEAD
                externalWallArea: 0,
=======
                externalWallArea: 0, // Will be calculated based on wall types
>>>>>>> origin/main
              }
            : undefined,
        })),
        connectivity: data.connectivity,
      };
<<<<<<< HEAD
=======

>>>>>>> origin/main
      setEditablePlan(processedPlan);
      setConfidence(Math.min(80 + Math.random() * 20, 100));
      setCurrentStep("complete");
      setRetryCount(0);
    } catch (err) {
      console.error("Analysis error:", err);
      let errorType: "analysis" | "network" = "analysis";
      let errorMessage = "Failed to analyze plan. Please try again.";
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
    try {
      setCurrentStep("uploading");
      toast({
        title: "Uploading plan",
        description: "Please wait",
      });
<<<<<<< HEAD
      const fileUrl = await uploadAndSave(selectedFile);
      setFileUrl(fileUrl);
=======

      const fileUrl = await uploadAndSave(selectedFile);
      setFileUrl(fileUrl);

>>>>>>> origin/main
      const finalPlan: ExtractedPlan = {
        ...editablePlan,
        file_url: fileUrl,
        uploaded_at: new Date().toISOString(),
        file_name: selectedFile.name,
      };
<<<<<<< HEAD
      setExtractedPlan(finalPlan);
      setCurrentStep("complete");
=======

      setExtractedPlan(finalPlan);
      setCurrentStep("complete");

>>>>>>> origin/main
      toast({
        title: "Plan Saved",
        description: `${finalPlan.rooms.length} rooms across ${finalPlan.floors} floor(s) with wall connectivity analysis.`,
      });
<<<<<<< HEAD
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
=======
    console.log(error);
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
  // NEW: Get shared walls for a specific room
>>>>>>> origin/main
  const getSharedWallsForRoom = (roomId: string) => {
    if (!editablePlan?.connectivity?.sharedWalls) return [];
    return editablePlan.connectivity.sharedWalls.filter(
      (wall) => wall.room1Id === roomId || wall.room2Id === roomId
    );
  };

<<<<<<< HEAD
=======
  // NEW: Get room connections
>>>>>>> origin/main
  const getRoomConnections = (roomId: string) => {
    const room = editablePlan?.rooms.find(
      (r) => r.wallConnectivity?.roomId === roomId
    );
    return room?.wallConnectivity?.connectedRooms || [];
  };

<<<<<<< HEAD
  const renderConnectivityPanel = () => {
    if (!editablePlan?.connectivity) return null;
    const efficiency = editablePlan.connectivity.efficiency;
    return (
      <Card className="border-l-4 border-l-blue-500 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Network className="w-5 h-5 mr-2 text-blue-500" />
            Wall Connectivity Analysis
          </CardTitle>
          <CardDescription className="text-sm">
=======
  // NEW: Render connectivity panel
  const renderConnectivityPanel = () => {
    if (!editablePlan?.connectivity) return null;

    const efficiency = editablePlan.connectivity.efficiency;

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Network className="w-5 h-5 mr-2 text-blue-500" />
            Wall Connectivity Analysis
          </CardTitle>
          <CardDescription>
>>>>>>> origin/main
            AI-detected room connections and shared walls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
<<<<<<< HEAD
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {Math.round(efficiency.spaceUtilization * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Space Use</div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {Math.round(efficiency.wallEfficiency * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Wall Eff.</div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {Math.round(efficiency.connectivityScore * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Connectivity</div>
            </div>
          </div>
          <div className="pb-3">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Link className="w-3.5 h-3.5 mr-1.5" />
              Shared Walls ({editablePlan.connectivity.sharedWalls.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
=======
          {/* Efficiency Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(efficiency.spaceUtilization * 100)}%
              </div>
              <div className="text-xs text-gray-500">Space Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(efficiency.wallEfficiency * 100)}%
              </div>
              <div className="text-xs text-gray-500">Wall Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(efficiency.connectivityScore * 100)}%
              </div>
              <div className="text-xs text-gray-500">Connectivity</div>
            </div>
          </div>

          {/* Shared Walls List */}
          <div className="pb-3">
            <h4 className="font-semibold mb-2 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Shared Walls ({editablePlan.connectivity.sharedWalls.length})
            </h4>
            <div className="space-y-2  overflow-y-auto">
>>>>>>> origin/main
              {editablePlan.connectivity.sharedWalls.map((wall, index) => {
                const room1 = editablePlan.rooms.find(
                  (r) => r.wallConnectivity?.roomId === wall.room1Id
                );
                const room2 = editablePlan.rooms.find(
                  (r) => r.wallConnectivity?.roomId === wall.room2Id
                );
<<<<<<< HEAD
                return (
                  <div
                    key={wall.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs"
                  >
                    <div className="flex items-center">
                      <ArrowRightLeft className="w-3 h-3 mr-1.5 text-blue-500" />
                      {room1?.room_name || wall.room1Id} ↔{" "}
                      {room2?.room_name || wall.room2Id}
                    </div>
                    <div className="text-gray-500">
                      {wall.sharedLength.toFixed(1)}m ({wall.sharedArea.toFixed(1)}m²)
=======

                return (
                  <div
                    key={wall.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    <div className="flex items-center">
                      <ArrowRightLeft className="w-3 h-3 mr-2 text-blue-500" />
                      {room1?.room_name || wall.room1Id} ↔{" "}
                      {room2?.room_name || wall.room2Id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {wall.sharedLength.toFixed(1)}m (
                      {wall.sharedArea.toFixed(1)}m²)
>>>>>>> origin/main
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
<<<<<<< HEAD
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Room Connections</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {editablePlan.rooms.map((room, index) => {
                const connections = getRoomConnections(`room_${index}`);
                if (connections.length === 0) return null;
                return (
                  <div
                    key={index}
                    className="flex items-start p-2 bg-blue-50 dark:bg-blue-900/10 rounded text-xs"
                  >
                    <div className="font-medium w-28 flex-shrink-0 truncate">
                      {room.room_name || `Room ${index + 1}`}
                    </div>
                    <div className="flex-1 text-gray-600 dark:text-gray-300 ml-2">
=======

          {/* Room Connections */}
          <div className="mt-5">
            <h4 className="font-semibold mb-2">Room Connections</h4>
            <div className="space-y-2">
              {editablePlan.rooms.map((room, index) => {
                const connections = getRoomConnections(`room_${index}`);
                if (connections.length === 0) return null;

                return (
                  <div
                    key={index}
                    className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm"
                  >
                    <div className="font-medium w-32 truncate">
                      {room.room_name || `Room ${index + 1}`}:
                    </div>
                    <div className="flex-1 text-gray-600 dark:text-gray-300">
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

>>>>>>> origin/main
  if (profile?.tier === "Free") {
    const getTierBadge = (tier: string) => {
      switch (tier) {
        case "Free":
          return (
            <Badge className="bg-green-100 text-green-800">
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
            <Badge className="bg-purple-100 text-purple-800 ">
              <Shield className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          );
        default:
          return <Badge>{tier}</Badge>;
      }
    };
<<<<<<< HEAD
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Card className="max-w-md w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
          <CardHeader className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow">
              <Shield className="w-7 h-7" />
=======

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 transform hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8" />
>>>>>>> origin/main
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Upgrade Required
            </CardTitle>
          </CardHeader>
<<<<<<< HEAD
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm">
=======
          <CardContent className="space-y-5 text-center">
            <p className="text-slate-600 dark:text-slate-300 ">
>>>>>>> origin/main
              Upgrade to access AI-powered plan parsing and advanced features.
            </p>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {getTierBadge(profile.tier)}
            </div>
            <Button
<<<<<<< HEAD
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow"
=======
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg"
>>>>>>> origin/main
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
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
=======
    <div className="min-h-screen animate-fade-in scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
>>>>>>> origin/main
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
<<<<<<< HEAD
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <UploadCloud className="w-6 h-6" />
            Upload & Analyze Plan
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            AI-powered extraction of rooms, dimensions, doors, and windows — instantly generate accurate construction estimates.
          </p>
=======
          className="flex items-center justify-between mb-10"
        >
          <div className="text-center">
            <div className="flex items-center sm:text-2xl text-xl font-bold bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
              <UploadCloud className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
              Upload & Analyze Plan
            </div>
            <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text mt-2">
              AI-powered extraction of rooms, dimensions, doors, and windows —
              instantly generate accurate construction estimates.
            </p>
          </div>
          <div className="w-10"></div>
>>>>>>> origin/main
        </motion.div>

        {/* Progress Steps */}
        {currentStep !== "idle" && currentStep !== "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
<<<<<<< HEAD
            <Card className="rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <CardContent className="p-5 sm:p-6">
                <div className="flex justify-between items-center mb-5">
=======
            <Card className="">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
>>>>>>> origin/main
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
<<<<<<< HEAD
                    return (
                      <div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDone
                              ? "bg-green-500 text-white"
                              : isActive
                              ? "bg-blue-600 text-white animate-pulse"
=======

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
                              ? "bg-blue-600 text-white shadow-lg animate-pulse"
>>>>>>> origin/main
                              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {isDone ? (
<<<<<<< HEAD
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <IconComponent className="w-4 h-4" />
                          )}
                        </motion.div>
                        <span
                          className={`text-xs font-medium ${
=======
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </motion.div>
                        <span
                          className={`text-sm font-medium ${
>>>>>>> origin/main
                            isActive || isDone
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
<<<<<<< HEAD
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-blue-600"
=======
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
>>>>>>> origin/main
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
<<<<<<< HEAD
                  />
                </div>
                <motion.p
                  className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4"
=======
                    style={{ backgroundColor: RISA_BLUE }}
                  />
                </div>
                <motion.p
                  className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4"
>>>>>>> origin/main
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
<<<<<<< HEAD
                      <div className="flex space-x-1 mb-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.8, 1] }}
=======
                      <div className="flex space-x-1 mb-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
>>>>>>> origin/main
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.2,
<<<<<<< HEAD
=======
                              repeatType: "loop",
>>>>>>> origin/main
                            }}
                          />
                        ))}
                      </div>
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI is analyzing your plan...
                      </span>
                      {analysisTimeLeft !== null && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
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
<<<<<<< HEAD
            <Card className="rounded-xl border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div
                    className={`p-2 rounded-full bg-red-100 dark:bg-red-900/30 ${getErrorColor()}`}
                  >
                    {getErrorIcon()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
=======
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
>>>>>>> origin/main
                      {error.type === "network"
                        ? "Connection Error"
                        : error.type === "analysis"
                        ? "Analysis Failed"
                        : "Save Error"}
                    </h3>
<<<<<<< HEAD
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                      {error.message}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
=======
                    <p className="text-red-600 dark:text-red-300">
                      {error.message}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-sm text-red-500 dark:text-red-400 mt-1">
>>>>>>> origin/main
                        Attempt {retryCount} of {MAX_RETRIES}
                      </p>
                    )}
                  </div>
                </div>
<<<<<<< HEAD
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-5">
                  <Button
                    variant="outline"
                    onClick={handleRemoveFile}
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove File
                  </Button>
                  {error.retryable && (
                    <Button
                      onClick={handleRetry}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={retryCount >= MAX_RETRIES}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {retryCount >= MAX_RETRIES ? "Max Retries Reached" : "Try Again"}
                    </Button>
                  )}
                </div>
                {retryCount >= MAX_RETRIES && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                      💡 <strong>Tip:</strong> Try uploading a clearer image or a different file format. Ensure room labels and dimensions are visible.
=======
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
>>>>>>> origin/main
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

<<<<<<< HEAD
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
=======
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
>>>>>>> origin/main
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
<<<<<<< HEAD
            className="lg:col-span-2"
          >
            <Card className="rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 text-white">
                <CardTitle className="text-center font-semibold text-lg">
                  Upload Your Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-6">
                {(editablePlan && currentStep === "complete") ||
                (fileUrl && (currentStep === "analyzing" || currentStep === "uploading")) ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedFile?.name || fileUrl?.split("/").pop() || "Uploaded Plan"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
=======
            className="lg:col-span-2 space-y-8"
          >
            <Card className="text-center">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-800 rounded-t-3xl text-white">
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
                      <FileText className="sm:w-7 sm:h-7 text-blue-500" />
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
>>>>>>> origin/main
                      </Button>
                    </div>

                    {previewUrl && (
<<<<<<< HEAD
                      <Card className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            Plan Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div
                            className="h-80 sm:h-96 w-full rounded-lg overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700"
                            onClick={() => setShowPreviewModal(true)}
                          >
                            <PreviewModal
                              fileUrl={previewUrl}
                              fileType={selectedFile?.type || "image/jpeg"}
                            />
=======
                      <Card className="border border-slate-200 dark:border-slate-600 overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-blue-500" />
                            Plan Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div
                            className="w-full h-[700px] rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600"
                            onClick={() => setShowPreviewModal(true)}
                          >
                            <div className="h-full flex flex-col items-center justify-center p-4">
                              <PreviewModal
                                fileUrl={previewUrl}
                                fileType={selectedFile?.type || "image/jpeg"}
                              />
                            </div>
>>>>>>> origin/main
                          </div>
                        </CardContent>
                      </Card>
                    )}

<<<<<<< HEAD
                    {(currentStep === "analyzing" || currentStep === "uploading") && (
                      <div className="text-center py-6">
                        <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                          {currentStep === "uploading" ? "Uploading..." : "Analyzing plan..."}
=======
                    {(currentStep === "analyzing" ||
                      currentStep === "uploading") && (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-600 dark:text-slate-300">
                          {currentStep === "uploading"
                            ? "Uploading..."
                            : "Analyzing plan..."}
>>>>>>> origin/main
                        </p>
                      </div>
                    )}

                    {currentStep === "complete" && editablePlan && (
<<<<<<< HEAD
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            Edit Extracted Plan
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-slate-700 dark:text-slate-300">Floors</Label>
=======
                      <div className="scrollbar-hide">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                            <span className="bg-blue-100 dark:bg-primary p-2 rounded-full mr-3">
                              <FileText className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
                            </span>
                            Edit Extracted Plan
                          </h3>
                        </div>

                        <div className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label className="">Floors</Label>
>>>>>>> origin/main
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
<<<<<<< HEAD
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-slate-700 dark:text-slate-300">File Name</Label>
=======
                                className="mt-1 "
                              />
                            </div>
                            <div>
                              <Label className="">File Name</Label>
>>>>>>> origin/main
                              <Input
                                value={editablePlan.file_name || ""}
                                onChange={(e) =>
                                  setEditablePlan((prev) =>
                                    prev
                                      ? { ...prev, file_name: e.target.value }
                                      : prev
                                  )
                                }
<<<<<<< HEAD
                                className="mt-1"
=======
                                className="mt-1  "
>>>>>>> origin/main
                              />
                            </div>
                          </div>

                          {editablePlan.rooms.map((room, i) => (
                            <Card
                              key={i}
<<<<<<< HEAD
                              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                                  Room {i + 1}: {room.room_name || "Unnamed"}
                                </h4>
                                {room.wallConnectivity && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Link className="w-3 h-3 mr-1" />
                                    {room.wallConnectivity.connectedRooms?.length || 0} connections
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
=======
                              className="p-6  border border-slate-200 dark:border-slate-600 shadow-md transform transition-all hover:scale-102"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                                  Room {i + 1}: {room.room_name || "Unnamed"}
                                </h4>
                                {room.wallConnectivity && (
                                  <Badge
                                    variant="outline"
                                    className="flex items-center"
                                  >
                                    <Link className="w-3 h-3 mr-1" />
                                    {room.wallConnectivity.connectedRooms
                                      ?.length || 0}{" "}
                                    connections
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, room_name: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    room_name: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
=======
                                  className=""
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, length: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    length: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
=======
                                  className=" "
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, width: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    width: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
=======
                                  className=" "
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, height: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    height: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
=======
                                  className=" "
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, blockType: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    blockType: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
=======
                                  className=" "
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, thickness: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    thickness: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
=======
                                  className=" "
>>>>>>> origin/main
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
<<<<<<< HEAD
                                                ? { ...r, plaster: e.target.value }
=======
                                                ? {
                                                    ...r,
                                                    plaster: e.target.value,
                                                  }
>>>>>>> origin/main
                                                : r
                                            ),
                                          }
                                        : prev
                                    )
                                  }
<<<<<<< HEAD
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label className="flex items-center text-sm mb-1">
                                    <DoorOpen className="w-4 h-4 mr-1.5 text-green-500" />
                                    Doors
=======
                                  className=" "
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <Label className="flex mb-1 items-center ">
                                    <DoorOpen className="w-5 h-5 mr-2 text-green-500" />
                                    Doors Count
>>>>>>> origin/main
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={room.doors?.length || 0}
                                    onChange={(e) => {
<<<<<<< HEAD
                                      const count = Math.max(0, parseInt(e.target.value) || 0);
=======
                                      const count = Math.max(
                                        0,
                                        parseInt(e.target.value) || 0
                                      );
>>>>>>> origin/main
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
<<<<<<< HEAD
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
=======
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
                                                                "standard", // "standard" | "custom"
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
>>>>>>> origin/main
                                                      ),
                                                    }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      );
                                    }}
<<<<<<< HEAD
                                  />
                                </div>
                                <div>
                                  <Label className="flex items-center text-sm mb-1">
                                    <LucideAppWindow className="w-4 h-4 mr-1.5 text-blue-500" />
                                    Windows
=======
                                    className=" "
                                  />
                                </div>
                                <div>
                                  <Label className="flex mb-1 items-center ">
                                    <LucideAppWindow className="w-5 h-5 mr-2 text-blue-500" />
                                    Windows Count
>>>>>>> origin/main
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={room.windows?.length || 0}
                                    onChange={(e) => {
<<<<<<< HEAD
                                      const count = Math.max(0, parseInt(e.target.value) || 0);
=======
                                      const count = Math.max(
                                        0,
                                        parseInt(e.target.value) || 0
                                      );
>>>>>>> origin/main
                                      setEditablePlan((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rooms: prev.rooms.map((r, idx) =>
                                                idx === i
                                                  ? {
                                                      ...r,
<<<<<<< HEAD
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
=======
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
                                                                "standard", // "standard" | "custom"
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
>>>>>>> origin/main
                                                      ),
                                                    }
                                                  : r
                                              ),
                                            }
                                          : prev
                                      );
                                    }}
<<<<<<< HEAD
=======
                                    className=""
>>>>>>> origin/main
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
<<<<<<< HEAD

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                        >
                          {currentStep === "uploading" || currentStep === "analyzing" ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Done
                            </>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : fileUrl ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <LucideFileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium truncate">
                          {fileUrl.split("/").pop() || "Uploaded Plan"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadFile(fileUrl, fileUrl.split("/").pop() || "Plan")
                          }
                          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <HardDriveDownload className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/quotes/new", { state: { quoteData } })}
                        className="flex-1 h-12"
=======
                  </div>
                ) : fileUrl ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                      <LucideFileText className="w-10 h-10 text-blue-500" />
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
                            fileUrl.split("/").pop() || "Uploaded Plan"
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
                          navigate("/quotes/new", { state: { quoteData } })
                        }
                        className="flex-1 text-slate-700 dark:text-slate-200  h-14"
>>>>>>> origin/main
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRetry}
                        variant="secondary"
<<<<<<< HEAD
                        className="flex-1 h-12 text-slate-700 dark:text-slate-200"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
=======
                        className="text-slate-700 dark:text-slate-200  h-14"
                      >
                        <RefreshCw className="w-6 h-6 mr-2" />
>>>>>>> origin/main
                        Retry Analysis
                      </Button>
                    </div>
                  </div>
                ) : !selectedFile ? (
<<<<<<< HEAD
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-8 text-center transition-colors hover:border-blue-500 dark:hover:border-blue-500 bg-blue-50/20 dark:bg-blue-900/10">
                    <UploadCloud className="w-12 h-12 mx-auto mb-3 text-blue-500 dark:text-blue-400" />
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      Drag & drop your plan or click to upload
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Supported: JPEG, PNG, PDF, WEBP (Max 20MB)
                    </p>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp"
=======
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-2xl p-16 text-center transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl bg-blue-50/30 dark:bg-primary/20">
                    <UploadCloud className="w-20 h-20 mx-auto mb-4 text-blue-400 dark:text-blue-300" />
                    <p className="mb-4  text-slate-600 dark:text-slate-300">
                      Drag & drop your plan or click to upload
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Supported formats: JPEG, PNG, PDF, WEBP (Max 10MB)
                    </p>

                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf,.rvt,.ifc,.pln,.zip,.csv,.xlsx,.txt,.webp"
>>>>>>> origin/main
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                    />
<<<<<<< HEAD
                    <Label
                      htmlFor="fileUpload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg shadow transition-colors"
=======

                    <Label
                      htmlFor="fileUpload"
                      className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all"
>>>>>>> origin/main
                    >
                      📁 Select File
                    </Label>
                  </div>
                ) : null}
<<<<<<< HEAD
=======

                <div className="flex space-x-4 pt-8">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/quotes/new")}
                    className="flex-1 dark:hover:bg-primary hover:bg-blue-700 hover:text-white h-14"
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
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold  h-14 rounded-xl shadow-lg transition-all"
                    >
                      {currentStep === "uploading" ||
                      currentStep === "analyzing" ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6 mr-3" />
                          Done
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
>>>>>>> origin/main
              </CardContent>
            </Card>
          </motion.div>

<<<<<<< HEAD
=======
          {/* NEW: Connectivity Panel Sidebar */}
>>>>>>> origin/main
          {showConnectivityPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
<<<<<<< HEAD
=======
              className="lg:col-span-1"
>>>>>>> origin/main
            >
              {renderConnectivityPanel()}
            </motion.div>
          )}
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Preview Modal */}
>>>>>>> origin/main
      <AnimatePresence>
        {showPreviewModal && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
<<<<<<< HEAD
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Plan Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
=======
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
>>>>>>> origin/main
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

<<<<<<< HEAD
export default UploadPlan;
=======
export default UploadPlan;
>>>>>>> origin/main
