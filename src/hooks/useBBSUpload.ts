// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const useBBSUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  /**
   * Check if a file URL already exists and is valid
   */
  const fileUrlExists = async (publicUrl: string): Promise<boolean> => {
    try {
      if (!publicUrl) return false;
      const response = await fetch(publicUrl, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  /**
   * Upload BBS file to Supabase storage
   */
  const uploadBBS = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const uniqueName = `${uuidv4()}.${fileExt}`;


      const { data, error } = await supabase.storage
        .from("bbs")
        .upload(uniqueName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }


      const { data: publicUrlData } = supabase.storage
        .from("bbs")
        .getPublicUrl(uniqueName);

      const publicUrl = publicUrlData.publicUrl;
      
      toast({
        title: "BBS Uploaded",
        description: "Bar Bending Schedule file uploaded successfully",
      });

      return publicUrl;
    } catch (error) {
      console.error("Error uploading BBS:", error);
      toast({
        title: "Upload Error",
        description:
          error instanceof Error ? error.message : "Failed to upload BBS file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete BBS file from Supabase storage
   */
  const deleteBBS = async (publicUrl: string): Promise<boolean> => {
    try {
      const url = new URL(publicUrl);
      const pathname = decodeURIComponent(url.pathname);
      const filePath = pathname.split("/bbs/")[1];
      if (!filePath) {
        throw new Error("Invalid URL: Could not extract file path");
      }
      const { error } = await supabase.storage.from("bbs").remove([filePath]);
      if (error) throw error;
      toast({
        title: "BBS Deleted",
        description: "The BBS file has been removed from storage.",
      });
      return true;
    } catch (error) {
      console.error("Error deleting BBS:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the BBS file.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadBBS,
    deleteBBS,
    fileUrlExists,
    uploading,
  };
};
