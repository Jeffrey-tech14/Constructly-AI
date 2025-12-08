import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  CloudUpload,
  Layers,
  Globe,
  Cpu,
  Server
} from "lucide-react";
import { ExtractedPlan, usePlan } from "@/contexts/PlanContext";
import { usePlanUpload } from "@/hooks/usePlanUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Room } from "@/hooks/useMasonryCalculator";

// UPDATED: Sleek dark theme colors matching auth page
const THEME = {
  DARK_BG: "#0A0A0A",
  CARD_BG: "#1A1A1A",
  ACCENT_PRIMARY: "#3B82F6", // Blue accent
  ACCENT_SECONDARY: "#8B5CF6", // Purple accent
  TEXT_LIGHT: "#E5E5E5",
  TEXT_MUTED: "#A3A3A3",
  BORDER_COLOR: "#2A2A2A",
  SUCCESS: "#10B981",
  GRADIENT: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
  GLASS_BG: "rgba(26, 26, 26, 0.7)"
};

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
          className="w-full h-[70vh] rounded-xl border border-gray-800"
          title="PDF Preview"
        />
      ) : isImage ? (
        <img
          src={fileUrl}
          alt="Plan preview"
          className="max-w-full max-h-[70vh] mx-auto rounded-xl shadow-2xl object-contain"
        />
      ) : (
        <div className="text-center py-8">
          <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400">
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
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const { quoteData } = location.state || {};
  const { uploadPlan, deletePlan } = usePlanUpload();
  const { toast } = useToast();
  const MAX_RETRIES = 3;

  const { extractedPlan, setExtractedPlan } = usePlan();

  // File drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileInput(file);
    }
  };

  const handleFileInput = (file: File) => {
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
    analyzeFile(file);
  };

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
      analyzeFile(selectedFile);
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

  const analyzeFile = async (file: File) => {
    setCurrentStep("uploading");
    setCurrentStep("analyzing");
    
    try {
      const data = await analyzePlan(file, setError, setCurrentStep);

      // Process connectivity data if available
      const processedPlan: ExtractedPlan = {
        ...data,
        file_url: fileUrl,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
        // Add wall connectivity to rooms if available
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
    handleFileInput(file);
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
        return "text-orange-400";
      case "analysis":
        return "text-red-400";
      case "save":
        return "text-red-400";
      default:
        return "text-red-400";
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
      <Card className="border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Network className="w-5 h-5 mr-2 text-blue-400" />
            Wall Connectivity Analysis
          </CardTitle>
          <CardDescription className="text-gray-400">
            AI-detected room connections and shared walls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Efficiency Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(efficiency.spaceUtilization * 100)}%
              </div>
              <div className="text-xs text-gray-400">Space Utilization</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(efficiency.wallEfficiency * 100)}%
              </div>
              <div className="text-xs text-gray-400">Wall Efficiency</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(efficiency.connectivityScore * 100)}%
              </div>
              <div className="text-xs text-gray-400">Connectivity</div>
            </div>
          </div>

          {/* Shared Walls List */}
          <div className="pb-3">
            <h4 className="font-semibold mb-2 flex items-center text-gray-300">
              <Link className="w-4 h-4 mr-2 text-blue-400" />
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
                    className="flex items-center justify-between p-2 bg-gray-900/30 rounded-lg text-sm"
                  >
                    <div className="flex items-center">
                      <ArrowRightLeft className="w-3 h-3 mr-2 text-blue-400" />
                      <span className="text-gray-300">
                        {room1?.room_name || wall.room1Id} ↔{" "}
                        {room2?.room_name || wall.room2Id}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {wall.sharedLength.toFixed(1)}m (
                      {wall.sharedArea.toFixed(1)}m²)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Connections */}
          <div className="mt-5">
            <h4 className="font-semibold mb-2 text-gray-300">Room Connections</h4>
            <div className="space-y-2">
              {editablePlan.rooms.map((room, index) => {
                const connections = getRoomConnections(`room_${index}`);
                if (connections.length === 0) return null;

                return (
                  <div
                    key={index}
                    className="flex items-center p-2 bg-blue-900/20 rounded text-sm"
                  >
                    <div className="font-medium w-32 truncate text-gray-300">
                      {room.room_name || `Room ${index + 1}`}:
                    </div>
                    <div className="flex-1 text-gray-400">
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
            <Badge className="bg-green-900/30 text-green-400 border-green-800">
              <Shell className="w-3 h-3 mr-1" />
              Free
            </Badge>
          );
        case "Intermediate":
          return (
            <Badge className="bg-blue-900/30 text-blue-400 border-blue-800">
              <Crown className="w-3 h-3 mr-1" />
              Intermediate
            </Badge>
          );
        case "Professional":
          return (
            <Badge className="bg-purple-900/30 text-purple-400 border-purple-800">
              <Shield className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          );
        default:
          return <Badge>{tier}</Badge>;
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <Card className="max-w-md w-full bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-lg border border-gray-800/50 shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Upgrade Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-gray-400">
              Upgrade to access AI-powered plan parsing and advanced features.
            </p>
            <div className="text-sm font-medium">
              {getTierBadge(profile.tier)}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg"
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
    <div className="min-h-screen bg-black animate-fade-in scrollbar-hide">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950"></div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 mb-6"
          >
            <UploadCloud className="w-8 h-8 text-blue-400" />
          </motion.div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Upload & Analyze Plan
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
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
            <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  {[
                    { label: "Uploading", icon: CloudUpload },
                    { label: "Analyzing", icon: Cpu },
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
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                              : isActive
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : "bg-gray-900 text-gray-400"
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
                              ? "text-blue-400"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2">
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
                    style={{ background: THEME.GRADIENT }}
                  />
                </div>
                <motion.p
                  className="text-center text-sm text-gray-400 mt-4"
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
                        <span className="text-xs text-blue-400 font-medium">
                          Est. time: {analysisTimeLeft}s
                        </span>
                      )}
                    </span>
                  )}
                  {currentStep === "complete" && (
                    <span className="flex items-center justify-center gap-2 text-green-400">
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
            <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-red-800/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`p-3 rounded-full bg-red-900/30 ${getErrorColor()}`}
                  >
                    {getErrorIcon()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-400">
                      {error.type === "network"
                        ? "Connection Error"
                        : error.type === "analysis"
                        ? "Analysis Failed"
                        : "Save Error"}
                    </h3>
                    <p className="text-red-300">
                      {error.message}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-sm text-red-400 mt-1">
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
                      className="w-full border-red-800 text-red-400 hover:text-white hover:bg-red-900/30"
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
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
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
                  <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-800">
                    <p className="text-yellow-300 text-sm">
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
            className="lg:col-span-2 space-y-8"
          >
            <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-lg border border-gray-800/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-800/20 rounded-t-2xl border-b border-gray-800">
                <CardTitle className="text-xl font-bold text-white">
                  Upload Your Floor Plan
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Drag & drop or click to upload your construction plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {(editablePlan && currentStep === "complete") ||
                (fileUrl &&
                  (currentStep === "analyzing" ||
                    currentStep === "uploading")) ? (
                  <div className="space-y-6 scrollbar-hide">
                    {/* File Info Card */}
                    <div className="flex items-center justify-between p-5 bg-gray-900/50 rounded-xl border border-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {selectedFile?.name ||
                              fileUrl.split("/").pop() ||
                              "Uploaded Plan"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {selectedFile?.size
                              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                              : "File uploaded"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {previewUrl && (
                      <Card className="border border-gray-800 bg-gray-900/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center text-white">
                            <Eye className="w-5 h-5 mr-2 text-blue-400" />
                            Plan Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div
                            className="w-full h-[600px] rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all border border-gray-800"
                            onClick={() => setShowPreviewModal(true)}
                          >
                            <div className="h-full flex flex-col items-center justify-center p-4">
                              <PreviewModal
                                fileUrl={previewUrl}
                                fileType={selectedFile?.type || "image/jpeg"}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {(currentStep === "analyzing" ||
                      currentStep === "uploading") && (
                      <div className="text-center py-12">
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 mx-auto border-4 border-blue-500/20 border-t-blue-500 rounded-full mb-4"
                          />
                          <Loader2 className="w-12 h-12 mx-auto text-blue-400 absolute inset-0 m-auto animate-spin" />
                        </div>
                        <p className="text-gray-400 mt-4">
                          {currentStep === "uploading"
                            ? "Uploading..."
                            : "Analyzing plan..."}
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStep === "complete" && editablePlan && (
                      <div className="scrollbar-hide">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mr-3">
                              <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Edit Extracted Plan
                            </h3>
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-400 border-blue-500/30">
                            {editablePlan.rooms.length} rooms • {editablePlan.floors} floor(s)
                          </Badge>
                        </div>

                        <div className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label className="text-gray-300 mb-2">Floors</Label>
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
                                className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 mb-2">File Name</Label>
                              <Input
                                value={editablePlan.file_name || ""}
                                onChange={(e) =>
                                  setEditablePlan((prev) =>
                                    prev
                                      ? { ...prev, file_name: e.target.value }
                                      : prev
                                  )
                                }
                                className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>

                          {editablePlan.rooms.map((room, i) => (
                            <Card
                              key={i}
                              className="p-6 bg-gray-900/30 border border-gray-800 backdrop-blur-sm"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-blue-400">
                                  Room {i + 1}: {room.room_name || "Unnamed"}
                                </h4>
                                {room.wallConnectivity && (
                                  <Badge
                                    variant="outline"
                                    className="flex items-center bg-blue-900/20 text-blue-400 border-blue-800"
                                  >
                                    <Link className="w-3 h-3 mr-1" />
                                    {room.wallConnectivity.connectedRooms
                                      ?.length || 0}{" "}
                                    connections
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <Label className="flex mb-2 items-center text-gray-300">
                                    <DoorOpen className="w-4 h-4 mr-2 text-green-400" />
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
                                                              "0.9 × 2.1 m",
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
                                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                                  />
                                </div>
                                <div>
                                  <Label className="flex mb-2 items-center text-gray-300">
                                    <LucideAppWindow className="w-4 h-4 mr-2 text-blue-400" />
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
                                                              "1.2 × 1.2 m",
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
                                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
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
                    <div className="flex items-center space-x-4 p-5 bg-gray-900/50 rounded-xl border border-gray-800">
                      <LucideFileText className="w-10 h-10 text-blue-400" />
                      <p className="text-lg font-semibold text-white truncate flex-1">
                        {fileUrl.split("/").pop() || "Uploaded Plan"}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-5 h-5" />
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
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                        >
                          <HardDriveDownload className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate("/quotes/new", { state: { quoteData } })
                        }
                        className="flex-1 text-gray-300 border-gray-700 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRetry}
                        variant="secondary"
                        className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Retry Analysis
                      </Button>
                    </div>
                  </div>
                ) : !selectedFile ? (
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-blue-500/30 hover:border-blue-500/50 bg-gray-900/20'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 flex items-center justify-center">
                      <UploadCloud className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="mb-4 text-gray-300">
                      {isDragging ? "Drop your file here" : "Drag & drop your plan or click to upload"}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
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
                      className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                      <CloudUpload className="w-5 h-5 mr-2" />
                      Select File
                    </Label>
                  </div>
                ) : null}

                <div className="flex space-x-4 pt-8">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/quotes/new")}
                    className="flex-1 text-gray-300 border-gray-700 hover:bg-gray-800"
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
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                      {currentStep === "uploading" ||
                      currentStep === "analyzing" ? (
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

          {/* Connectivity Panel Sidebar */}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
                <h3 className="text-lg font-semibold text-white">Plan Preview</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
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