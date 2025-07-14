
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types'; // Make sure this is your updated Quote interface

// In your useQuotes.ts file
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
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'started' | 'in_progress' | 'completed';
  materials_cost: number;
  labor_cost: number;
  addons_cost: number;
  total_amount: number;
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
  concrete: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    profit_margin: number;
  }> | null;
  formwork: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    profit_margin: number;
  }> | null;
  rebar: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    profit_margin: number;
  }> | null;
  plaster: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    profit_margin: number;
  }> | null;
  painting: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
  }> | null;
     ceiling: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      profit_margin: number;
    }> | null;
  overhead_amount: number;
  contingency_amount: number;
  permit_cost: number;
  profit_amount: number;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  equipment_costs?: number;
  transport_costs?: number;
  additional_services_cost?: number;
  overall_profit_amount?: number;
  selected_equipment?: any[];
  selected_services?: any[];
  house_length?: number;
  house_width?: number;
  house_height?: number;
  total_volume?: number;
  contract_type?: 'full_contract' | 'labor_only';
  house_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  plan_file_url?: string;
  // Add the rooms property
  rooms?: Array<{
    room_type_id: string;
    length: number;
    width: number;
    height?: number;
  }>;
}

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchQuotes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching quotes for user:', user.id, 'is_admin:', profile?.is_admin);
      
      let query = supabase.from('quotes').select('*');
      
      // If not admin, only get user's quotes
      if (!profile?.is_admin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotes:', error);
        setQuotes([]);
        return;
      }
      
      // Type cast the data to ensure proper types
      const quotesData: Quote[] = (data || []).map(item => ({
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
      
      console.log('Quotes fetched successfully:', quotesData.length);
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.is_admin]);

  const createQuote = async (quoteData: Omit<Quote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('quotes')
    .insert([{
      ...quoteData,
      user_id: user.id
    }])
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
    
    // Type cast the returned data
    const updatedQuote: Quote = {
      ...data,
      status: data.status as Quote['status'],
      client_email: data.client_email || undefined,
      custom_specs: data.custom_specs || undefined,
      materials: Array.isArray(data.materials) ? data.materials : [],
      labor: Array.isArray(data.labor) ? data.labor : [],
      addons: Array.isArray(data.addons) ? data.addons : [],
      selected_equipment: Array.isArray(data.selected_equipment) ? data.selected_equipment : [],
      selected_services: Array.isArray(data.selected_services) ? data.selected_services : [],
      contract_type: (data.contract_type as Quote['contract_type']) || 'full_contract',
    };
    
    setQuotes(prev => prev.map(quote => quote.id === id ? updatedQuote : quote));
    return updatedQuote;
  };

  const deleteQuote = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    // Optimistic update
    setQuotes(prev => {
      const newQuotes = prev.filter(quote => quote.id !== id);
      console.log('Quotes after deletion:', newQuotes.length); // Debug log
      return newQuotes;
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteQuote:', error);
    return false;
  }
};

  useEffect(() => {
    // Only fetch quotes once when user and profile are available
    if (user && profile !== null) {
      fetchQuotes();
    }
  }, [fetchQuotes]);

  return {
    quotes,
    loading,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote
  };
};
