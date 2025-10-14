import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, CheckCircle, Trash2, Loader2, Shield, Crown, Shell, LayoutDashboard, DoorOpen, RefreshCw, Image as ImageIcon, LucideAppWindow, HardDriveDownload, FileIcon, LucideFileText, AlertTriangle, AlertCircle, Eye, X, } from "lucide-react";
import { ExtractedPlan, usePlan } from "@/contexts/PlanContext";
import { usePlanUpload } from "@/hooks/usePlanUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
export interface Door {
    sizeType: string;
    standardSize: string;
    custom: {
        height: string;
        width: string;
        price?: string;
    };
    type: string;
    frame: string;
    count: number;
}
export interface Window {
    sizeType: string;
    standardSize: string;
    custom: {
        height: string;
        width: string;
        price?: string;
    };
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
const PreviewModal = ({ fileUrl, fileType, }: {
    fileUrl: string;
    fileType: string;
}) => {
    const isPDF = fileType === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf");
    const isImage = fileType.startsWith("image/") ||
        fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)$/);
    return (<div className="p-4 max-h-[80vh] w-full overflow-auto">
      {isPDF ? (<iframe src={fileUrl} className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-600" title="PDF Preview"/>) : isImage ? (<img src={fileUrl} alt="Plan preview" className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg object-contain"/>) : (<div className="text-center py-8">
          <FileIcon className="w-16 h-16 mx-auto text-slate-400 mb-4"/>
          <p className="text-slate-600 dark:text-slate-300">
            Preview not available for this file type
          </p>
        </div>)}
    </div>);
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
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const location = useLocation();
    const { quoteData } = location.state || {};
    const { uploadPlan, deletePlan } = usePlanUpload();
    const { setExtractedPlan } = usePlan();
    const { toast } = useToast();
    const MAX_RETRIES = 3;
    useEffect(() => {
        if (quoteData?.plan_file_url) {
            setFileUrl(quoteData.plan_file_url);
            setPreviewUrl(quoteData.plan_file_url);
        }
    }, [quoteData]);
    async function downloadFile(publicUrl, file_name) {
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
        }
        catch (error) {
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
        }
        else if (fileUrl) {
            setError(null);
            setRetryCount((prev) => prev + 1);
            setCurrentStep("analyzing");
            try {
                const response = await fetch(fileUrl);
                if (!response.ok)
                    throw new Error("Failed to fetch file");
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
            }
            catch (err) {
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
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://192.168.0.100:8000/api/plan/upload", {
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
        const fileUrl = await uploadPlan(file);
        await supabase
            .from("quotes")
            .update({ plan_file_url: fileUrl })
            .eq("id", quoteData.id);
        return fileUrl;
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length)
            return;
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
        const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExt || "");
        if (!isValidType) {
            setError({
                message: "Please upload a supported file format (JPEG, PNG, PDF, DWG, DXF, RVT, IFC, ZIP, CSV, XLSX, TXT, WEBP)",
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
                file_url: fileUrl,
                file_name: file.name,
                uploaded_at: new Date().toISOString(),
            });
            setConfidence(Math.min(80 + Math.random() * 20, 100));
            setCurrentStep("complete");
            setRetryCount(0);
        }
        catch (err) {
            console.error("Analysis error:", err);
            let errorType: "analysis" | "network" = "analysis";
            let errorMessage = "Failed to analyze plan. Please try again.";
            if (err.message.includes("Failed to fetch") ||
                err.message.includes("Network")) {
                errorType = "network";
                errorMessage =
                    "Network error. Please check your connection and try again.";
            }
            else if (err.message.includes("Invalid response format")) {
                errorMessage =
                    "The analysis service returned an unexpected format. Please try again.";
            }
            else if (err.message.includes("Server reported issue")) {
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
        if (!selectedFile || !quoteData?.id || !editablePlan)
            return;
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
        }
        catch (error) {
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
                return <AlertCircle className="w-6 h-6"/>;
            case "analysis":
                return <AlertTriangle className="w-6 h-6"/>;
            default:
                return <AlertCircle className="w-6 h-6"/>;
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
    if (!user)
        navigate("/auth");
    if (profile.tier === "Free") {
        const getTierBadge = (tier: string) => {
            switch (tier) {
                case "Free":
                    return (<Badge className="bg-green-100 text-green-800">
              <Shell className="w-3 h-3 mr-1"/>
              Free
            </Badge>);
                case "Intermediate":
                    return (<Badge className="bg-blue-100 text-blue-800">
              <Crown className="w-3 h-3 mr-1"/>
              Intermediate
            </Badge>);
                case "Professional":
                    return (<Badge className="bg-purple-100 text-purple-800 ">
              <Shield className="w-3 h-3 mr-1"/>
              Professional
            </Badge>);
                default:
                    return <Badge>{tier}</Badge>;
            }
        };
        return (<div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 transform hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Shield className="w-8 h-8"/>
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
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="w-4 h-4 mr-2"/>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="min-h-screen animate-fade-in scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="text-center mb-10">
          <h1 className="sm:text-3xl text-2xl font-bold items-center bg-gradient-to-r from-blue-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
            <UploadCloud className="sm:w-8 sm:h-8 mr-3 text-indigo-900 dark:text-white inline-block w-12 h-12 mr-3 -translate-y-1"/>
            Upload & Analyze Plan
          </h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-blue-900 via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-purple-500 bg-clip-text text-transparent mt-2">
            AI-powered extraction of rooms, dimensions, doors, and windows —
            instantly.
          </p>
        </div>

        
        {currentStep !== "idle" && currentStep !== "error" && (<div className="mb-10 p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transform transition-all duration-500 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              {["Uploading", "Analyzing", "Complete"].map((label, idx) => {
                const isDone = (currentStep === "analyzing" && idx < 1) ||
                    (currentStep === "complete" && idx < 2) ||
                    (idx === 2 && currentStep === "complete");
                const isActive = (currentStep === "uploading" && idx === 0) ||
                    (currentStep === "analyzing" && idx === 1) ||
                    (currentStep === "complete" && idx === 2);
                return (<div key={idx} className="flex flex-col items-center space-y-2 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center  font-bold transition-all duration-300 transform ${isDone
                        ? "bg-green-500 text-white scale-110"
                        : isActive
                            ? "bg-blue-500 text-white animate-pulse scale-105"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                      {isDone ? <CheckCircle className="w-7 h-7"/> : idx + 1}
                    </div>
                    <span className={`text-sm font-medium ${isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500"}`}>
                      {label}
                    </span>
                  </div>);
            })}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-300 to-green-600 h-3 rounded-full transition-all duration-500" style={{
                width: currentStep === "uploading"
                    ? "33%"
                    : currentStep === "analyzing"
                        ? "66%"
                        : "100%",
            }}/>
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium">
              {currentStep === "uploading" && "\uD83D\uDCE4 Uploading your plan..."}
              {currentStep === "analyzing" &&
                "\uD83E\uDDE0 Analyzing rooms, doors, windows, and dimensions..."}
              {currentStep === "complete" && "\u2705 Plan successfully parsed!"}
            </p>
          </div>)}

        
        {currentStep === "error" && error && (<div className="mb-10 p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-red-200 dark:border-red-800 transform transition-all duration-500">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 rounded-full bg-red-100 dark:bg-red-900 ${getErrorColor()}`}>
                {getErrorIcon()}
              </div>
              <div>
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
                {retryCount > 0 && (<p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    Attempt {retryCount} of {MAX_RETRIES}
                  </p>)}
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button variant="outline" onClick={handleRemoveFile} className="flex-1 border-red-200 text-red-600 hover:text-white hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2"/>
                Remove File
              </Button>

              {error.retryable && (<Button onClick={handleRetry} className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={retryCount >= MAX_RETRIES}>
                  <RefreshCw className="w-4 h-4 mr-2"/>
                  {retryCount >= MAX_RETRIES
                    ? "Max Retries Reached"
                    : "Try Again"}
                </Button>)}
            </div>

            {retryCount >= MAX_RETRIES && (<div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  💡 <strong>Tip:</strong> Try uploading a clearer image or a
                  different file format. Make sure your plan has clear room
                  labels and dimensions.
                </p>
              </div>)}
          </div>)}

        
        <Card className=" shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-800 text-white py-6">
            <CardTitle className="sm:text-xl font-bold">
              Upload Your Floor Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            
            {(editablePlan && currentStep === "complete") ||
            (fileUrl &&
                (currentStep === "analyzing" || currentStep === "uploading")) ? (<div className="space-y-6 scrollbar-hide">
                
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                  <FileText className="sm:w-7 sm:h-7 text-blue-500"/>
                  <p className="sm:text-lg font-semibold">
                    {selectedFile?.name ||
                fileUrl.split("/").pop() ||
                "Uploaded Plan"}
                  </p>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="ml-auto text-red-500 hover:text-red-700">
                    <Trash2 className="sm:w-6 sm:h-6"/>
                  </Button>
                </div>

                
                {previewUrl && (<Card className="border border-slate-200 dark:border-slate-600 overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-500"/>
                        Plan Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="w-full h-[700px] rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-600" onClick={() => setShowPreviewModal(true)}>
                        <div className="h-full flex flex-col items-center justify-center p-4">
                          <PreviewModal fileUrl={previewUrl} fileType={selectedFile?.type || "image/jpeg"}/>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}

                
                {(currentStep === "analyzing" ||
                currentStep === "uploading") && (<div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4"/>
                    <p className="text-slate-600 dark:text-slate-300">
                      {currentStep === "uploading"
                    ? "Uploading..."
                    : "Analyzing plan..."}
                    </p>
                  </div>)}

                
                {currentStep === "complete" && editablePlan && (<div className="scrollbar-hide">
                    <h3 className="sm:text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <FileText className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300"/>
                      </span>
                      Edit Extracted Plan
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="">Floors</Label>
                          <Input type="number" min="1" value={editablePlan.floors} onChange={(e) => setEditablePlan((prev) => prev
                    ? {
                        ...prev,
                        floors: parseInt(e.target.value) || 1,
                    }
                    : prev)} className="mt-1 "/>
                        </div>
                        <div>
                          <Label className="">File Name</Label>
                          <Input value={editablePlan.file_name || ""} onChange={(e) => setEditablePlan((prev) => prev
                    ? { ...prev, file_name: e.target.value }
                    : prev)} className="mt-1  "/>
                        </div>
                      </div>

                      {editablePlan.rooms.map((room, i) => (<Card key={i} className="p-6 rounded-xl border border-slate-200 dark:border-slate-600 shadow-md transform transition-all hover:scale-102">
                          <h4 className="sm:text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                            Room {i + 1}: {room.room_name || "Unnamed"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input placeholder="Room Name" value={room.room_name} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? {
                                    ...r,
                                    room_name: e.target.value,
                                }
                                : r),
                        }
                        : prev)} className=""/>
                            <Input type="number" step="0.01" placeholder="Length (m)" value={room.length} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? { ...r, length: e.target.value }
                                : r),
                        }
                        : prev)} className=" "/>
                            <Input type="number" step="0.01" placeholder="Width (m)" value={room.width} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? { ...r, width: e.target.value }
                                : r),
                        }
                        : prev)} className=" "/>
                            <Input type="number" step="0.01" placeholder="Height (m)" value={room.height} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? { ...r, height: e.target.value }
                                : r),
                        }
                        : prev)} className=" "/>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input placeholder="Block Type" value={room.blockType} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? {
                                    ...r,
                                    blockType: e.target.value,
                                }
                                : r),
                        }
                        : prev)} className=" "/>
                            <Input type="number" step="0.01" placeholder="Wall Thickness (m)" value={room.thickness} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? {
                                    ...r,
                                    thickness: e.target.value,
                                }
                                : r),
                        }
                        : prev)} className=" "/>
                            <Input placeholder="Plaster" value={room.plaster} onChange={(e) => setEditablePlan((prev) => prev
                        ? {
                            ...prev,
                            rooms: prev.rooms.map((r, idx) => idx === i
                                ? { ...r, plaster: e.target.value }
                                : r),
                        }
                        : prev)} className=" "/>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label className="flex mb-1 items-center ">
                                <DoorOpen className="w-5 h-5 mr-2 text-green-500"/>
                                Doors Count
                              </Label>
                              <Input type="number" min="0" value={room.doors?.length || 0} onChange={(e) => {
                        const count = Math.max(0, parseInt(e.target.value) || 0);
                        setEditablePlan((prev) => prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) => idx === i
                                    ? {
                                        ...r,
                                        doors: Array.from({ length: count }, (_, di) => r.doors[di] || {
                                            sizeType: "standard",
                                            standardSize: "0.9 \u00D7 2.1 m",
                                            custom: {
                                                height: "",
                                                width: "",
                                                price: "",
                                            },
                                            type: "Panel",
                                            frame: "Wood",
                                            count: 1,
                                        }),
                                    }
                                    : r),
                            }
                            : prev);
                    }} className=" "/>
                            </div>
                            <div>
                              <Label className="flex mb-1 items-center ">
                                <LucideAppWindow className="w-5 h-5 mr-2 text-blue-500"/>
                                Windows Count
                              </Label>
                              <Input type="number" min="0" value={room.windows?.length || 0} onChange={(e) => {
                        const count = Math.max(0, parseInt(e.target.value) || 0);
                        setEditablePlan((prev) => prev
                            ? {
                                ...prev,
                                rooms: prev.rooms.map((r, idx) => idx === i
                                    ? {
                                        ...r,
                                        windows: Array.from({ length: count }, (_, wi) => r.windows[wi] || {
                                            sizeType: "standard",
                                            standardSize: "1.2 \u00D7 1.2 m",
                                            custom: {
                                                height: "",
                                                width: "",
                                                price: "",
                                            },
                                            glass: "Clear",
                                            frame: "Aluminum",
                                            count: 1,
                                        }),
                                    }
                                    : r),
                            }
                            : prev);
                    }} className=""/>
                            </div>
                          </div>
                        </Card>))}
                    </div>
                  </div>)}
              </div>) : fileUrl ? (<div className="space-y-6">
                <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-sm">
                  <LucideFileText className="w-10 h-10 text-blue-500"/>
                  <p className="text-xl font-semibold truncate flex-1">
                    {fileUrl.split("/").pop() || "Uploaded Plan"}
                  </p>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-6 h-6"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => downloadFile(fileUrl, fileUrl.split("/").pop() || "Uploaded Plan")} className="">
                    <HardDriveDownload className="w-6 h-6"/>
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => navigate("/quotes/new", { state: { quoteData } })} className="flex-1 text-slate-700 dark:text-slate-200  h-14">
                    Cancel
                  </Button>
                  <Button onClick={handleRetry} variant="secondary" className="text-slate-700 dark:text-slate-200  h-14">
                    <RefreshCw className="w-6 h-6 mr-2"/>
                    Retry Analysis
                  </Button>
                </div>
              </div>) : !selectedFile ? (<div className="border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-2xl p-16 text-center transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl bg-blue-50/30 dark:bg-blue-900/20">
                <UploadCloud className="w-20 h-20 mx-auto mb-4 text-blue-400 dark:text-blue-300"/>
                <p className="mb-4  text-slate-600 dark:text-slate-300">
                  Drag & drop your plan or click to upload
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Supported formats: JPEG, PNG, PDF, DWG, DXF, RVT, IFC, ZIP,
                  CSV, XLSX, WEBP (Max 10MB)
                </p>

                <Input type="file" accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf,.rvt,.ifc,.pln,.zip,.csv,.xlsx,.txt,.webp" onChange={handleFileChange} className="hidden" id="fileUpload"/>

                <Label htmlFor="fileUpload" className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all">
                  📁 Select File
                </Label>
              </div>) : null}

            
            <div className="flex space-x-4 pt-8">
              <Button variant="outline" onClick={() => navigate("/quotes/new")} className="flex-1 dark:hover:bg-blue-900 hover:bg-blue-700 hover:text-white h-14">
                Cancel
              </Button>

              
              {(editablePlan && currentStep === "complete") ||
            (selectedFile && !fileUrl && currentStep !== "error") ? (<Button onClick={handleDone} disabled={currentStep === "uploading" || currentStep === "analyzing"} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold  h-14 rounded-xl shadow-lg transition-all">
                  {currentStep === "uploading" ||
                currentStep === "analyzing" ? (<>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin"/>
                      Processing...
                    </>) : (<>
                      <CheckCircle className="w-6 h-6 mr-3"/>
                      Done
                    </>)}
                </Button>) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default UploadPlan;
