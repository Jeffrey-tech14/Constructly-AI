import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, CheckCircle, Trash2, LayoutDashboard, Shell, Crown, Shield } from 'lucide-react';
import { usePlan } from '@/contexts/PlanContext';
import { usePlanUpload } from '@/hooks/usePlanUpload';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';
import { Badge } from '@/components/ui/badge';

export interface Door {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  type: string; // Panel | Flush | Metal
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Window {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  glass: string; // Clear | Frosted | Tinted
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Room {
  roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string; // Hollow, Solid, etc
  length: string;
  height: string;
  customBlock: { length: string; height: string; thickness: string; price: string };
  plaster: string; // "None" | "One Side" | "Both Sides"
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
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [extractedDataPreview, setExtractedDataPreview] = useState<ParsedPlan | null>(null);
  const { uploadPlan, uploading } = usePlanUpload();
  const { setExtractedPlan } = usePlan();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Optional: Preview parsing result immediately
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://192.168.0.100:8000/api/plan/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data)
        setExtractedDataPreview(data);
      }
    } catch (err) {
      console.warn('Could not preview plan', err);
    }
  }
};

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDone = async () => {
  if (!selectedFile) return;

  try {
    const fileUrl = await uploadPlan(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    //make sure this url is same as network http://192.168.0.100 part only, the port number 8000 should not be the same as network port number
    //do this for this file and index.ts in constructly-api-plan folder
    const response = await fetch('http://192.168.0.100:8000/api/plan/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to parse plan');
    }

    const extractedData: ParsedPlan = await response.json(); 

    const enrichedData = {
      ...extractedData,
      file_url: fileUrl,
      uploaded_at: new Date().toISOString(),
      file_name: selectedFile.name,
    };

    setExtractedPlan(enrichedData);

    toast({
      title: 'Plan Parsed Successfully',
      description: `${extractedData.rooms.length} rooms detected across ${extractedData.floors} floor(s).`,
      variant: 'default',
    });

    navigate(-1);
  } catch (error) {
    console.error('Error extracting plan:', error);
    toast({
      title: 'Error extracting plan',
      description: 'Please check your file and try again.',
      variant: 'destructive',
    });
  }
};

  if(!user){
      navigate('/auth')
    }
    
 const getTierBadge = (tier: string) => {
        switch (tier) {
          case 'Free':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"><Shell className="w-3 h-3 mr-1" /> Free</Badge>;
          case 'Intermediate':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
          case 'Professional':
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200"><Shield className="w-3 h-3 mr-1" />Professional</Badge>;
          default:
            return <Badge>{tier}</Badge>;
        }
      };

  if (profile.tier === "Free") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <Card className="gradient-card p-10 rounded-lg">
          <div className="text-center">
            <h2 className="sm:text-2xl text-lg font-bold mb-4">
              You do not have permission to use this feature
            </h2>
            <p className="text-muted-foreground">
              Please upgrade your plan to access more quote allocations and features.
            </p>
            <div className="text-muted-foreground">
              Current Plan: {getTierBadge(profile.tier)}
            </div>
            <Button
              className="w-full mt-10 text-white"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Go to dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="mb-8">
          <h1 className="sm:text-3xl text-2xl flex font-bold bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text bg-clip-text text-transparent">
            <UploadCloud className="sm:w-8 sm:h-8 mr-2 text-purple-900 dark:text-white" />
            Upload Plan</h1>
          <p className="bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text bg-clip-text text-transparent mt-2">Automatically derive dimentions, rooms e.t.c from your plan</p>
        </div>
        <Card className="gradient-card rounded-2xl border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center sm:text-2xl text-lg">Upload Your Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400">
                <UploadCloud className="w-12 h-12 mb-2" />
                <p className="mb-2">Drag & drop your plan here or click to upload</p>
                <Input
                  type="file"
                  accept=".jpg,.png,.pdf,.dwg,.dxf,.rvt,.pln,.ifc,.skp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <Label
                  htmlFor="fileUpload"
                  className="cursor-pointer px-4 py-2 mt-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                >
                  Select File
                </Label>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <FileText className="w-10 h-10 text-blue-500" />
                <p className="text-lg font-medium">{selectedFile.name}</p>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 hover:text-red-800 hover:bg-red-200"
                  onClick={handleRemoveFile}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove File</span>
                </Button>
                {selectedFile && extractedDataPreview && (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold mb-3">Detected Rooms</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {extractedDataPreview.rooms.map((room, i) => (
                        <div key={i} className="flex justify-between text-sm p-2 bg-white dark:bg-slate-700 rounded">
                          <span>{room.room_name}</span>
                          <span>{room.length}m × {room.width}m</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {extractedDataPreview.floors} floor(s) detected
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/quotes/new')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDone}
                disabled={!selectedFile}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow hover:shadow-lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPlan;
