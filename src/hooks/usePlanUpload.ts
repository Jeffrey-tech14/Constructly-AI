
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlanAnalysis {
  rooms: Array<{
    type: string;
    length: number;
    width: number;
    area: number;
  }>;
  totalArea: number;
  estimatedVolume: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  suggestions: string[];
}

export const usePlanUpload = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const uploadPlan = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `plans/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload plan file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const analyzePlan = async (fileUrl: string): Promise<PlanAnalysis | null> => {
    setAnalyzing(true);
    try {
      // Simulate AI analysis for now - in real implementation this would call an AI service
      // This is a mock analysis based on common house plans
      const mockAnalysis: PlanAnalysis = {
        rooms: [
          { type: 'Living Room', length: 6, width: 4, area: 24 },
          { type: 'Kitchen', length: 4, width: 3.5, area: 14 },
          { type: 'Master Bedroom', length: 4.5, width: 4, area: 18 },
          { type: 'Bedroom 2', length: 3.5, width: 3.5, area: 12.25 },
          { type: 'Bedroom 3', length: 3, width: 3.5, area: 10.5 },
          { type: 'Bathroom 1', length: 2.5, width: 2, area: 5 },
          { type: 'Bathroom 2', length: 2, width: 1.8, area: 3.6 }
        ],
        totalArea: 87.35,
        estimatedVolume: 262.05, // assuming 3m height
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        suggestions: [
          'Consider reinforced foundation for this floor area',
          'Standard electrical layout recommended for 3-bedroom house',
          'Two bathroom setup requires adequate plumbing'
        ]
      };

      // Add some randomization to make it more realistic
      mockAnalysis.totalArea += Math.random() * 20 - 10;
      mockAnalysis.estimatedVolume = mockAnalysis.totalArea * 3; // 3m height assumption

      return mockAnalysis;
    } catch (error) {
      console.error('Error analyzing plan:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the uploaded plan",
        variant: "destructive"
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    uploading,
    analyzing,
    uploadPlan,
    analyzePlan
  };
};
