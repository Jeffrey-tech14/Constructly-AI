import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  ImageIcon as Image,
  LucideAppWindow,
  HardDriveDownload,
  FileIcon,
  LucideFileText,
  AlertTriangle,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  Target,
  Building,
  Ruler,
  Edit3,
  Download,
  ArrowRight,
  Zap,
  BarChart3,
  Maximize2,
} from "lucide-react";
import { ExtractedPlan, usePlan } from "@/contexts/PlanContext";
import { usePlanUpload } from "@/hooks/usePlanUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// RISA Color Palette
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

// --- Interfaces ---
export interface Door {
  sizeType: string;
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  type: string;
  frame: string;
  count: number;
}
export interface Window {
  sizeType: string;
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  glass: string;
  frame: string;
  count: number;
}
export interface Room {
  roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string;
  length: string;
  height: string;
  customBlock: {
    length: string;
    height: string;
    thickness: string;
    price: string;
  };
  plaster: string;
  doors: Door[];
  windows: Window[];
}
export interface ParsedPlan {
  rooms: Room[];
  floors: number;
  file_url?: string;
  uploaded_at?: string;
  file_name?: string;
  note?: string;
}

// Enhanced Preview Modal Component
const PreviewModal = ({
  fileUrl,
  fileType,
  fileName,
  onClose,
}: {
  fileUrl: string;
  fileType: string;
  fileName: string;
  onClose: () => void;
}) => {
  const isPDF =
    fileType === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf");
  const isImage =
    fileType.startsWith("image/") ||
    fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/);
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Plan Preview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{fileName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Open in New Tab
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
        <div className="p-6 max-h-[80vh] w-full overflow-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          {isPDF ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg"
              title="PDF Preview"
            />
          ) : isImage ? (
            <div className="flex flex-col items-center">
              <img
                src={fileUrl}
                alt="Plan preview"
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain border-4 border-white dark:border-gray-700"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Click outside or press ESC to close
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileIcon className="w-24 h-24 mx-auto text-gray-400 mb-6" />
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Preview not available for this file type
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(fileUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Editable Plan Section
const EditablePlanSection = ({
  editablePlan,
  setEditablePlan,
}: {
  editablePlan: ExtractedPlan;
  setEditablePlan: React.Dispatch<React.SetStateAction<ExtractedPlan | null>>;
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
            <Building className="w-4 h-4" />
            Number of Floors
          </Label>
          <Input
            type="number"
            min="1"
            value={editablePlan.floors}
            onChange={(e) =>
              setEditablePlan((prev) =>
                prev
                  ? { ...prev, floors: parseInt(e.target.value) || 1 }
                  : prev
            )
            }
            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4" />
            File Name
          </Label>
          <Input
            value={editablePlan.file_name || ""}
            onChange={(e) =>
              setEditablePlan((prev) =>
                prev ? { ...prev, file_name: e.target.value } : prev
              )
            }
            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: RISA_BLUE }} />
          Room Details ({editablePlan.rooms.length} rooms detected)
        </h4>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {editablePlan.rooms.map((room, i) => (
            <Card key={i} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-4">
                <h5 className="font-medium mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Room {i + 1}: {room.room_name || "Unnamed"}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Room Name</Label>
                    <Input
                      placeholder="Room Name"
                      value={room.room_name}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, room_name: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Length (m)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Length"
                      value={room.length}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, length: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Width (m)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Width"
                      value={room.width}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, width: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Height (m)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Height"
                      value={room.height}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, height: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Block Type</Label>
                    <Input
                      placeholder="Block Type"
                      value={room.blockType}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, blockType: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Wall Thickness (m)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Thickness"
                      value={room.thickness}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, thickness: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Plaster Type</Label>
                    <Input
                      placeholder="Plaster"
                      value={room.plaster}
                      onChange={(e) =>
                        setEditablePlan((prev) =>
                          prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) =>
                                  idx === i ? { ...r, plaster: e.target.value } : r
                                ),
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs flex items-center text-gray-700 dark:text-gray-300 mb-1">
                      <DoorOpen className="w-3 h-3 mr-1 text-green-500" /> Doors Count
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
                                            frame: "Wood",
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
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center text-gray-700 dark:text-gray-300 mb-1">
                      <LucideAppWindow className="w-3 h-3 mr-1 text-blue-500" /> Windows Count
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
                                            glass: "Clear",
                                            frame: "Aluminum",
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
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Edit Modal for Large Screens
const EditModal = ({
  editablePlan,
  setEditablePlan,
  isOpen,
  onClose,
}: {
  editablePlan: ExtractedPlan;
  setEditablePlan: React.Dispatch<React.SetStateAction<ExtractedPlan | null>>;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Extracted Plan
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <EditablePlanSection
            editablePlan={editablePlan}
            setEditablePlan={setEditablePlan}
          />
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <Button
            onClick={onClose}
            className="w-full rounded-full font-semibold"
            style={{ backgroundColor: RISA_BLUE, color: RISA_WHITE }}
          >
            Close & Save Later
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const UploadPlan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
  const { uploadPlan, deletePlan } = usePlanUpload();
  const { setExtractedPlan } = usePlan();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (quoteData?.plan_file_url) {
      setFileUrl(quoteData.plan_file_url);
      setPreviewUrl(quoteData.plan_file_url);
    }
  }, [quoteData]);

  // Close modals on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPreviewModal(false);
        setShowEditModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Timer for analysis phase
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (currentStep === "analyzing") {
      const ESTIMATED_DURATION = 15; // seconds
      setAnalysisTimeLeft(ESTIMATED_DURATION);

      timer = setInterval(() => {
        setAnalysisTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            if (timer) clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAnalysisTimeLeft(null);
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep]);

  // Auto-open edit modal on desktop when complete
  useEffect(() => {
    if (currentStep === "complete" && window.innerWidth >= 1024) {
      setShowEditModal(true);
    }
  }, [currentStep]);

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
        toast({
          title: "Download Started",
          description: "File download has begun.",
        });
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
      toast({
        title: "Download Started",
        description: "File download has begun.",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the file.",
        variant: "destructive",
      });
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

  const handleRetry = () => {
    if (selectedFile && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(selectedFile);
      fileInputRef.current.files = dt.files;
      setError(null);
      setRetryCount((prev) => prev + 1);
      handleFileChange({ target: { files: [selectedFile] } } as any);
    }
  };

  const analyzePlan = async (
    file: File,
    setError: Function,
    setCurrentStep: Function
  ): Promise<ParsedPlan> => {
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
    const validExtensions = [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "dwg",
      "dxf",
      "rvt",
      "ifc",
      "pln",
      "zip",
      "csv",
      "xlsx",
      "txt",
      "webp",
    ];
    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/acad",
      "application/x-acad",
      "image/vnd.dwg",
      "image/vnd.dxf",
      "application/dxf",
      "application/dwg",
      "application/vnd.autodesk.revit",
      "model/vnd.ifc",
      "application/octet-stream",
      "application/x-twinmotion",
      "application/zip",
      "application/x-zip-compressed",
      "text/plain",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/webp",
    ];
    const isValidType =
      validTypes.includes(file.type) || validExtensions.includes(fileExt || "");
    if (!isValidType) {
      setError({
        message:
          "Please upload a supported file format (JPEG, PNG, PDF, DWG, DXF, RVT, IFC, ZIP, CSV, XLSX, TXT, WEBP)",
        type: "upload",
        retryable: true,
      });
      setCurrentStep("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError({
        message: "File size must be less than 10MB",
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
      setEditablePlan({
        ...data,
        file_url: undefined,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
      });
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
        errorMessage =
          "Server reported issue: Automatic detection failed. Please try again";
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
        description: `${finalPlan.rooms.length} rooms across ${finalPlan.floors} floor(s).`,
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

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Free Tier Block
  if (profile.tier === "Free") {
    const getTierBadge = (tier: string) => {
      switch (tier) {
        case "Free":
          return (
            <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
              <Shell className="w-3 h-3 mr-1" /> Free
            </Badge>
          );
        case "Intermediate":
          return (
            <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
              <Crown className="w-3 h-3 mr-1" /> Intermediate
            </Badge>
          );
        case "Professional":
          return (
            <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">
              <Shield className="w-3 h-3 mr-1" /> Professional
            </Badge>
          );
        default:
          return <Badge>{tier}</Badge>;
      }
    };
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="text-center pb-4">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: RISA_BLUE }}
              >
                <Shield className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Upgrade Required
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Upgrade to access AI-powered plan parsing and advanced features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-center">
              <div className="flex justify-center">{getTierBadge(profile.tier)}</div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: RISA_BLUE,
                    color: RISA_WHITE,
                    padding: "0.75rem 2rem",
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </motion.div>
            <div className="text-center flex-1">
              <Badge className="mb-3 text-xs bg-blue-600 text-white dark:bg-blue-700">
                <UploadCloud className="w-3 h-3 mr-1" /> AI Plan Analysis
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: RISA_BLUE }}>
                Upload & Analyze Plan
              </h1>
              <p className="text-gray-600 mt-2 dark:text-gray-300 text-sm max-w-2xl mx-auto">
                AI-powered extraction of rooms, dimensions, doors, and windows — instantly generate accurate construction estimates.
              </p>
            </div>
            <div className="w-10"></div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        {currentStep !== "idle" && currentStep !== "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  {[
                    { label: "Uploading", icon: UploadCloud },
                    { label: "Analyzing", icon: BarChart3 },
                    { label: "Complete", icon: CheckCircle }
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
                      <div key={idx} className="flex flex-col items-center space-y-3 flex-1">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                            isDone
                              ? "bg-green-500 text-white shadow-lg"
                              : isActive
                              ? "bg-blue-600 text-white shadow-lg"
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
            <Card className="border border-red-200 dark:border-red-800 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
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
                      💡 <strong>Tip:</strong> Try uploading a clearer image or a
                      different file format. Make sure your plan has clear room
                      labels and dimensions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Upload Card */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <UploadCloud className="w-5 h-5" style={{ color: RISA_BLUE }} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Upload Your Floor Plan</div>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Supported formats: JPG, PNG, PDF, DWG, DXF, RVT, IFC, ZIP, CSV, XLSX, WEBP (Max 10MB)
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {fileUrl ? (
                    <motion.div
                      key="file-uploaded"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <LucideFileText className="w-6 h-6" style={{ color: RISA_BLUE }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {selectedFile?.name || "Uploaded Plan"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedFile?.size ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Plan file'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPreviewModal(true)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(fileUrl, selectedFile?.name || "plan")}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            onClick={() => navigate("/quotes/new", { state: { quoteData } })}
                            className="w-full rounded-full border-gray-300 dark:border-gray-600"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button 
                            variant="outline" 
                            onClick={handleRetry} 
                            className="w-full rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Analysis
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : !selectedFile ? (
                    <motion.div
                      key="file-upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div
                        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                        style={{ borderColor: RISA_BLUE }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud className="w-16 h-16 mx-auto mb-4" style={{ color: RISA_BLUE }} />
                        <p className="text-gray-600 mb-4 text-lg font-medium dark:text-gray-300">
                          Drag & drop your floor plan
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          or click to browse files
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                            style={{
                              backgroundColor: RISA_BLUE,
                              color: RISA_WHITE,
                              padding: "0.75rem 2rem",
                            }}
                          >
                            Choose File
                          </Button>
                        </motion.div>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf,.rvt,.ifc,.pln,.zip,.csv,.xlsx,.txt,.webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file-processing"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <FileText className="w-6 h-6" style={{ color: RISA_BLUE }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                      {previewUrl && (
                        <Card className="border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" style={{ color: RISA_BLUE }} />
                                Plan Preview
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreviewModal(true)}
                                className="flex items-center gap-2"
                              >
                                <Maximize2 className="w-4 h-4" />
                                Expand
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div
                              className="w-full h-64 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
                              onClick={() => setShowPreviewModal(true)}
                            >
                              {selectedFile.type.startsWith('image/') ? (
                                <img
                                  src={previewUrl}
                                  alt="Plan preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : selectedFile.type === 'application/pdf' ? (
                                <div className="text-center p-4">
                                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                  <p className="text-gray-600 dark:text-gray-300">PDF Document</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Click to view</p>
                                </div>
                              ) : (
                                <div className="text-center p-4">
                                  <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                  <p className="text-gray-600 dark:text-gray-300">{selectedFile.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Click to preview</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Data Editing Section — Mobile Only */}
            {currentStep === "complete" && editablePlan && (
              <div className="lg:hidden">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                    <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                          <Edit3 className="w-5 h-5" style={{ color: RISA_BLUE }} />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">Review & Edit Extracted Data</div>
                          <CardDescription className="text-gray-600 dark:text-gray-300">
                            Verify and modify the AI-extracted plan details
                          </CardDescription>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <EditablePlanSection
                        editablePlan={editablePlan}
                        setEditablePlan={setEditablePlan}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  onClick={() => navigate("/quotes/new")}
                  className="w-full rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 h-12"
                >
                  Cancel
                </Button>
              </motion.div>
              {!fileUrl && selectedFile && currentStep !== "error" && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleDone}
                    disabled={currentStep === "uploading" || currentStep === "analyzing"}
                    className="w-full rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 h-12"
                    style={{
                      backgroundColor: RISA_BLUE,
                      color: RISA_WHITE,
                    }}
                  >
                    {currentStep === "uploading" || currentStep === "analyzing" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save & Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Zap className="w-5 h-5" style={{ color: RISA_BLUE }} />
                  AI-Powered Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { icon: Building, text: "Automatic room detection" },
                    { icon: Ruler, text: "Precise dimension extraction" },
                    { icon: DoorOpen, text: "Door and window identification" },
                    { icon: BarChart3, text: "Material quantity calculations" },
                    { icon: Target, text: "95%+ accuracy guarantee" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <item.icon className="w-4 h-4" style={{ color: RISA_BLUE }} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Eye className="w-5 h-5" style={{ color: RISA_BLUE }} />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• JPG/JPEG images</p>
                  <p>• PNG images</p>
                  <p>• PDF documents</p>
                  <p>• DWG/DXF CAD files</p>
                  <p>• RVT/IFC BIM files</p>
                  <p>• ZIP archives</p>
                  <p>• CSV/XLSX data files</p>
                  <p>• WEBP images</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Maximum file size: 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showPreviewModal && previewUrl && (
        <PreviewModal
          fileUrl={previewUrl}
          fileType={selectedFile?.type || ""}
          fileName={selectedFile?.name || "Plan File"}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
      {showEditModal && editablePlan && (
        <EditModal
          editablePlan={editablePlan}
          setEditablePlan={setEditablePlan}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default UploadPlan;
