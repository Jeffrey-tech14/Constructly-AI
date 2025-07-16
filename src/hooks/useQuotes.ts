import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

export interface Quote {
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
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'started' | 'in_progress' | 'completed';
  materials_cost: number;
  labor_cost: number;
  addons_cost: number;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 🔥 Refresh Supabase session if expired
   */
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

        // 🌱 Refresh session first
        await refreshSessionIfNeeded();

        let query = supabase.from('quotes').select('*');
        if (!profile?.is_admin) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching quotes:', error);
          setQuotes([]); // fallback to empty
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

        // 🧠 Only update state if data actually changed
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
    [user?.id, profile?.is_admin, quotes, isInitialLoad]
  );

  /**
   * ➕ Create a new quote
   */
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

  /**
   * ✏️ Update existing quote
   */
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

  /**
   * ❌ Delete a quote
   */
  const deleteQuote = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    return true;
  };

  /**
   * 📡 Start polling + subscribe to real-time updates
   */
  useEffect(() => {
    if (user && profile !== null) {
      fetchQuotes(); // 🔥 Initial fetch with spinner

      // 🕒 Polling every 5 seconds
      const startInterval = () => {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            fetchQuotes(true); // silent refresh
          }, 5000);
        }
      };

      const stopInterval = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      // 👀 Pause/resume polling on tab visibility change
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchQuotes(true);
          startInterval();
        } else {
          stopInterval();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 📡 Real-time Postgres changes
      const quotesChannel = supabase
        .channel('public:quotes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
          console.log('🔄 Realtime change detected → refreshing quotes');
          fetchQuotes(true);
        })
        .subscribe();

      startInterval();

      return () => {
        stopInterval();
        supabase.removeChannel(quotesChannel);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [fetchQuotes, user, profile]);

  return {
    quotes,
    loading: isInitialLoad ? loading : false,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
