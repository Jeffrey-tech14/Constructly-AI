import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useLocation } from 'react-router-dom';

export interface Quote {
  rooms: Array<{
    room_name: string;
    length: string;
    width: string;
    height: string;
    doors: string;
    windows: string;
  }>;
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  client_email?: string;
  location: string;
  house_type: string;
  region: string;
  project_type: string;
  custom_specs?: string;
  status: string;
  materials_cost: number;
  labor_cost: number;
  additional_services_cost: number;
  total_amount: number;
  transport_costs: number;
  profit_amount: number;
  materials: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    profit_margin: number;
  }> | null;
  labor: Array<{
    type: string;
    percentage: number;
    cost: number;
  }> | null;
  addons: Array<{
    name: string;
    price: number;
  }> | null;
  equipment: Array<{
    name: string;
    days: number;
    daily_rate: number;
    total_cost: number;
  }> | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // for optional fields like concrete, formwork, etc
}

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user, profile } = useAuth();
  const location = useLocation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSessionIfNeeded = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
      console.warn('🔄 Supabase session expired. Refreshing...');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) console.error('❌ Session refresh failed:', refreshError);
    }
  };

  /**
   * 📨 Fetch quotes from Supabase
   * @param silent - if true, don’t set loading spinner
   */
  const fetchQuotes = useCallback(
    async (silent = false) => {
      if (!user) {
        if (!silent) setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);

        await refreshSessionIfNeeded();

        let query = supabase.from('quotes').select('*');
        if (!profile?.is_admin) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching quotes:', error);
          setQuotes([]); 
          return;
        }

        const quotesData: Quote[] = (data || []).map((item) => ({
          ...item,
          status: item.status as Quote['status'],
          client_email: item.client_email || undefined,
          custom_specs: item.custom_specs || undefined,
          materials: Array.isArray(item.materials) ? item.materials : [],
          labor: Array.isArray(item.labor) ? item.labor : [],
          addons: Array.isArray(item.addons) ? item.addons : [],
          selected_equipment: Array.isArray(item.selected_equipment) ? item.selected_equipment : [],
          selected_services: Array.isArray(item.selected_services) ? item.selected_services : [],
          contract_type: (item.contract_type as Quote['contract_type']) || 'full_contract',
        }));

        if (JSON.stringify(quotesData) !== JSON.stringify(quotes)) {
          setQuotes(quotesData);
        }
      } catch (err) {
        console.error('❌ Unexpected error fetching quotes:', err);
        setQuotes([]);
      } finally {
        if (!silent) setLoading(false);
        if (isInitialLoad) setIsInitialLoad(false);
      }
    },
    [user, profile?.is_admin, quotes, isInitialLoad, location.key]
  );

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('quotes')
      .insert([{ ...quoteData, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as Database;
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const updatedQuote = { ...data, status: data.status as Quote['status'] };
    setQuotes((prev) => prev.map((q) => (q.id === id ? updatedQuote : q)));
    return updatedQuote;
  };

  const deleteQuote = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    return true;
  };

  useEffect(() => {
    if (user && profile !== null) {
      fetchQuotes(); 
  }}, [fetchQuotes, user, profile, quotes, location.key]);

  return {
    quotes,
    loading: isInitialLoad ? loading : false,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
