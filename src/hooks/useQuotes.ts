
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
      
      // Type cast the data to ensure proper types
      const quotesData: Quote[] = (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'pending' | 'approved' | 'rejected',
        client_email: item.client_email || undefined,
        custom_specs: item.custom_specs || undefined,
        materials: item.materials || [],
        labor: item.labor || [],
        addons: item.addons || [],
      }));
      
      setQuotes(quotesData);
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
    
    // Type cast the returned data
    const newQuote: Quote = {
      ...data,
      status: data.status as 'draft' | 'pending' | 'approved' | 'rejected',
      client_email: data.client_email || undefined,
      custom_specs: data.custom_specs || undefined,
      materials: data.materials || [],
      labor: data.labor || [],
      addons: data.addons || [],
    };
    
    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Type cast the returned data
    const updatedQuote: Quote = {
      ...data,
      status: data.status as 'draft' | 'pending' | 'approved' | 'rejected',
      client_email: data.client_email || undefined,
      custom_specs: data.custom_specs || undefined,
      materials: data.materials || [],
      labor: data.labor || [],
      addons: data.addons || [],
    };
    
    setQuotes(prev => prev.map(quote => quote.id === id ? updatedQuote : quote));
    return updatedQuote;
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
