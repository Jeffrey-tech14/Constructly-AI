import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false); // 👈 Track if we’ve already loaded
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // ✅ Only set loading true for first load
      if (!hasLoadedOnce.current) setLoading(true);

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      if (!hasLoadedOnce.current) {
        setLoading(false);       // ✅ End first load animation
        hasLoadedOnce.current = true; // ✅ Mark first load complete
      }
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ ...eventData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // 🔄 Refresh every 5s
    return () => clearInterval(interval);
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    deleteEvent,
    refetch: fetchEvents
  };
};
