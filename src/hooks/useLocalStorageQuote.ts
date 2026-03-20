// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback } from "react";

const STORAGE_KEY = "draft_quote_data";

interface SavedQuote {
  timestamp: number;
  data: any;
}

export const useLocalStorageQuote = () => {
  // Save quote to local storage
  const saveQuoteToStorage = useCallback((quoteData: any) => {
    try {
      const savedQuote: SavedQuote = {
        timestamp: Date.now(),
        data: quoteData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuote));
      return true;
    } catch (error) {
      console.error("Error saving quote to local storage:", error);
      return false;
    }
  }, []);

  // Load quote from local storage
  const loadQuoteFromStorage = useCallback((): SavedQuote | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as SavedQuote;
      }
      return null;
    } catch (error) {
      console.error("Error loading quote from local storage:", error);
      return null;
    }
  }, []);

  // Delete saved quote from local storage
  const deleteQuoteFromStorage = useCallback((): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error deleting quote from local storage:", error);
      return false;
    }
  }, []);

  // Check if a saved quote exists
  const hasSavedQuote = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedQuote = JSON.parse(saved).data;
      return savedQuote.user_id !== "";
    } catch (error) {
      return false;
    }
  }, []);

  return {
    saveQuoteToStorage,
    loadQuoteFromStorage,
    deleteQuoteFromStorage,
    hasSavedQuote,
  };
};
