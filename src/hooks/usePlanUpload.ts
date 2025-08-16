
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from "uuid";

export interface PlanAnalysis {
  floors: number;
  rooms: Array<{
    name: string;
    length: number;
    width: number;
    height?: number;
    doors?: number;
    windows?: number;
  }>;
}

export const usePlanUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

 const uploadPlan = async (file: File): Promise<string | null> => {
  setUploading(true);
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueName = `${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('plans') // 👈 your bucket name
      .upload(uniqueName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // ✅ Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('plans')
      .getPublicUrl(uniqueName);

    const publicUrl = publicUrlData.publicUrl;

    toast({
      title: "Plan Uploaded",
      description: "Plan file uploaded successfully"
    });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading plan:', error);
    toast({
      title: "Upload Error",
      description: "Failed to upload plan file",
      variant: "destructive"
    });
    return null;
  } finally {
    setUploading(false);
  }
};

  const analyzePlan = async (url: string): Promise<PlanAnalysis | null> => {
    setAnalyzing(true);
    try {
      
      
    } catch (error) {
      console.error('Error analyzing plan:', error);
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    uploadPlan,
    analyzePlan,
    uploading,
    analyzing
  };
};
