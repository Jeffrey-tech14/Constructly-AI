import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { ExtractedPlan, usePlan } from "@/contexts/PlanContext";
import { usePlanUpload } from "@/hooks/usePlanUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
}

const UploadPlan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "uploading" | "analyzing" | "complete"
  >("idle");
  const [confidence, setConfidence] = useState<number>(0);
  const [extractedDataPreview, setExtractedDataPreview] =
    useState<ParsedPlan | null>(null);
  const [editablePlan, setEditablePlan] = useState<ExtractedPlan | null>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const { quoteData } = location.state || {};
  const { uploadPlan, deletePlan } = usePlanUpload();
  const { setExtractedPlan } = usePlan();
  const { toast } = useToast();

  useEffect(() => {
    if (quoteData?.plan_file_url) {
      setFileUrl(quoteData.plan_file_url);
      setPreviewUrl(quoteData.plan_file_url);
    }
  }, [quoteData]);

  async function downloadFile(publicUrl, file_name) {
    try {
      // First, try to get file info to see if it's accessible
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split("/");
      const bucketName = pathParts[5];
      const filePath = pathParts.slice(6).join("/");

      // Try to get file info (this will work for both public and private)
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from(bucketName)
        .list("", {
          limit: 1,
          search: filePath.split("/").pop(),
        });

      // Try direct download first (for public files)
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

      // If direct download fails, try signed URL (for private files)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);

      if (error) {
        throw error;
      }

      // Download using signed URL
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
      // Delete from Supabase
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
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleFileChange({ target: { files: [selectedFile] } } as any);
    }
  };

  // --- Analyze with backend (only) ---
  const analyzePlan = async (file: File): Promise<ParsedPlan> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://192.168.0.100:8000/api/plan/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to parse plan");
    return res.json();
  };

  // --- Upload permanently to Supabase + update DB ---
  const uploadAndSave = async (file: File): Promise<string> => {
    const fileUrl = await uploadPlan(file);
    await supabase
      .from("quotes")
      .update({ plan_file_url: fileUrl })
      .eq("id", quoteData.id);
    return fileUrl;
  };

  // --- Handle file input (preview only) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setConfidence(0);

    try {
      setCurrentStep("uploading");
      setCurrentStep("analyzing");

      const data = await analyzePlan(file);

      setEditablePlan({
        ...data,
        file_url: undefined,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
      });

      setConfidence(Math.min(80 + Math.random() * 20, 100));
      setCurrentStep("complete");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to analyze plan.",
        variant: "destructive",
      });
      setCurrentStep("idle");
    }
  };

  // --- Handle final save (Supabase + context + navigate) ---
  const handleDone = async () => {
    if (!selectedFile || !quoteData?.id || !editablePlan) return;

    try {
      // 1. Upload to Supabase + update quote
      toast({
        title: "Uploading plan",
        description: "Please wait",
      });
      const fileUrl = await uploadAndSave(selectedFile);
      setFileUrl(fileUrl);

      // 2. Finalize plan with user edits
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

      // 3. Navigate back
      navigate("/quotes/new");
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Could not save plan.",
        variant: "destructive",
      });
      setCurrentStep("idle");
    }
  };

  if (!user) navigate("/auth");

  if (profile.tier === "Free") {
    const getTierBadge = (tier: string) => {
      switch (tier) {
        case "Free":
          return (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Shell className="w-3 h-3 mr-1" />
              Free
            </Badge>
          );
        case "Intermediate":
          return (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Crown className="w-3 h-3 mr-1" />
              Intermediate
            </Badge>
          );
        case "Professional":
          return (
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Shield className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          );
        default:
          return <Badge>{tier}</Badge>;
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 transform hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Upgrade Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-slate-600 dark:text-slate-300 ">
              Upgrade to access AI-powered plan parsing and advanced features.
            </p>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
    <div className="min-h-screen animate-fade-in scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="sm:text-3xl text-2xl font-bold items-center bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            <UploadCloud className="sm:w-8 sm:h-8 mr-3 text-blue-900 dark:text-blue-400 inline-block w-12 h-12 mr-3 -translate-y-1" />
            Upload & Analyze Plan
          </h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-900 bg-clip-text text-transparent mt-2">
            AI-powered extraction of rooms, dimensions, doors, and windows —
            instantly.
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep !== "idle" && (
          <div className="mb-10 p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transform transition-all duration-500 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              {["Uploading", "Analyzing", "Complete"].map((label, idx) => {
                const isDone =
                  (currentStep === "analyzing" && idx < 1) ||
                  (currentStep === "complete" && idx < 2) ||
                  (idx === 2 && currentStep === "complete");
                const isActive =
                  (currentStep === "uploading" && idx === 0) ||
                  (currentStep === "analyzing" && idx === 1) ||
                  (currentStep === "complete" && idx === 2);

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center space-y-2 flex-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center  font-bold transition-all duration-300 transform ${
                        isDone
                          ? "bg-green-500 text-white scale-110"
                          : isActive
                          ? "bg-blue-500 text-white animate-pulse scale-105"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      }`}
                    >
                      {isDone ? <CheckCircle className="w-7 h-7" /> : idx + 1}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-300 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width:
                    currentStep === "uploading"
                      ? "33%"
                      : currentStep === "analyzing"
                      ? "66%"
                      : "100%",
                }}
              />
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium">
              {currentStep === "uploading" && "📤 Uploading your plan..."}
              {currentStep === "analyzing" &&
                "🧠 Analyzing rooms, doors, windows, and dimensions..."}
              {currentStep === "complete" && "✅ Plan successfully parsed!"}
            </p>
          </div>
        )}

        {/* Main Card */}
        <Card className="backdrop-blur-md bg-white/85 dark:bg-slate-800/85 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-6">
            <CardTitle className="sm:text-xl font-bold">
              Upload Your Floor Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {fileUrl ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                  <LucideFileText className="w-10 h-10 text-blue-500" />
                  <p className="text-xl font-semibold truncate flex-1">
                    {selectedFile?.name || "Uploaded Plan"}
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
                        selectedFile?.name || "Uploaded Plan"
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
                    onClick={() => navigate("/quotes/new")}
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
                    Retry
                  </Button>
                </div>
              </div>
            ) : !selectedFile ? (
              <div className="border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-2xl p-16 text-center transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl bg-blue-50/30 dark:bg-blue-900/20">
                <UploadCloud className="w-20 h-20 mx-auto mb-4 text-blue-400 dark:text-blue-300" />
                <p className="mb-4  text-slate-600 dark:text-slate-300">
                  Drag & drop your plan or click to upload
                </p>
                <Input
                  type="file"
                  accept=".jpg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <Label
                  htmlFor="fileUpload"
                  className="cursor-pointer inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  📁 Select File
                </Label>
              </div>
            ) : (
              <div className="space-y-6 scrollbar-hide">
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                  <FileText className="sm:w-7 sm:h-7 text-blue-500" />
                  <p className="sm:text-lg font-semibold">
                    {selectedFile.name}
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

                {currentStep === "complete" && editablePlan && (
                  <div className="scrollbar-hide">
                    <h3 className="sm:text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <FileText className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
                      </span>
                      Edit Extracted Plan
                    </h3>
                    <div className="space-y-6">
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
                                  : prev
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
                                  : prev
                              )
                            }
                            className="mt-1  "
                          />
                        </div>
                      </div>

                      {editablePlan.rooms.map((room, i) => (
                        <div
                          key={i}
                          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-md transform transition-all hover:scale-102"
                        >
                          <h4 className="sm:text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                            Room {i + 1}: {room.room_name || "Unnamed"}
                          </h4>
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
                              className=""
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
                              className=" "
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
                              className=" "
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
                              className=" "
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
                              className=" "
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
                              className=" "
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
                              className=" "
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label className="flex mb-1 items-center ">
                                <DoorOpen className="w-5 h-5 mr-2 text-green-500" />
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
                                                        sizeType: "standard",
                                                        standardSize:
                                                          "0.9 × 2.1 m",
                                                        custom: {
                                                          height: "",
                                                          width: "",
                                                          price: "",
                                                        },
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
                                className=" "
                              />
                            </div>
                            <div>
                              <Label className="flex mb-1 items-center ">
                                <LucideAppWindow className="w-5 h-5 mr-2 text-blue-500" />
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
                                                        sizeType: "standard",
                                                        standardSize:
                                                          "1.2 × 1.2 m",
                                                        custom: {
                                                          height: "",
                                                          width: "",
                                                          price: "",
                                                        },
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
                                className=""
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

            <div className="flex space-x-4 pt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/quotes/new")}
                className="flex-1 dark:hover:bg-blue-900 hover:bg-blue-700 hover:text-white h-14"
              >
                Cancel
              </Button>
              {!fileUrl && selectedFile && (
                <Button
                  onClick={handleDone}
                  disabled={
                    currentStep === "uploading" || currentStep === "analyzing"
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPlan;
