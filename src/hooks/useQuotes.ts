
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Quote {
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  client_email?: string;
  location: string;
  region: string;
  project_type: string;
  custom_specs?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  materials_cost: number;
  labor_cost: number;
  addons_cost: number;
  total_amount: number;
  materials: any[];
  labor: any[];
  addons: any[];
  created_at: string;
  updated_at: string;
}

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchQuotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase.from('quotes').select('*');
      
      // If not admin, only get user's quotes
      if (!profile?.is_admin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('quotes')
      .insert([{ ...quoteData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    setQuotes(prev => [data, ...prev]);
    return data;
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    setQuotes(prev => prev.map(quote => quote.id === id ? data : quote));
    return data;
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setQuotes(prev => prev.filter(quote => quote.id !== id));
  };

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user, profile?.is_admin]);

  return {
    quotes,
    loading,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote
  };
};
