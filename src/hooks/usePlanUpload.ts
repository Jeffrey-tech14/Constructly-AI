
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PlanAnalysis {
  bedrooms: number;
  bathrooms: number;
  floors: number;
  totalArea: number;
  estimatedVolume: number;
  rooms: Array<{
    type: string;
    length: number;
    width: number;
    area: number;
  }>;
}

export const usePlanUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const uploadPlan = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      // For now, return a placeholder URL since we don't have Supabase storage configured
      // In a real implementation, this would upload to Supabase storage
      const mockUrl = URL.createObjectURL(file);
      
      toast({
        title: "Plan Uploaded",
        description: "Plan file uploaded successfully"
      });
      
      return mockUrl;
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
      // Mock analysis - in a real implementation, this would use AI/ML to analyze the plan
      const mockAnalysis: PlanAnalysis = {
        bedrooms: Math.floor(Math.random() * 3) + 2, // 2-4 bedrooms
        bathrooms: Math.floor(Math.random() * 2) + 1, // 1-2 bathrooms
        floors: 1,
        totalArea: Math.floor(Math.random() * 100) + 100, // 100-200 sq meters
        estimatedVolume: 0,
        rooms: [
          { type: 'Living Room', length: 5, width: 4, area: 20 },
          { type: 'Kitchen', length: 4, width: 3, area: 12 },
          { type: 'Master Bedroom', length: 4, width: 4, area: 16 },
          { type: 'Bathroom', length: 2, width: 2, area: 4 }
        ]
      };
      
      mockAnalysis.estimatedVolume = mockAnalysis.totalArea * 3; // Assume 3m height
      
      return mockAnalysis;
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
