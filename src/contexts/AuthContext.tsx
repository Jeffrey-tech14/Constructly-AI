import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Preferences } from '@capacitor/preferences';

interface Profile {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  location?: string;
  tier: string;
  quotes_used: number;
  total_projects: number;
  completed_projects: number;
  total_revenue: number;
  is_admin: boolean;
  overall_profit_margin?: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean; // still fetching profile
  authReady: boolean; // true when initial auth check is done
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const prevUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      console.log('Fetching profile:');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        console.log(data)
      console.log('Fetching profile12:');

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } finally {
      setLoading(false); // ✅ Always reset loading
    }
  };


  useEffect(() => {
     let isMounted = true;

  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        prevUserId.current = session.user.id;
        setUser(session.user);
        await fetchProfile(session.user.id); // fetch profile immediately
      } else {
        prevUserId.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false); // ✅ important for "no session"
      }
    } catch (err) {
      console.error('Error getting initial session:', err);
      setLoading(false); // ✅ important for error cases
    } finally {
      if (isMounted) setAuthReady(true);
    }
  };

  initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        if (session.user.id !== prevUserId.current) {
          prevUserId.current = session.user.id;
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } else {
        prevUserId.current = null;
        setUser(null);
        setProfile(null);
      }

      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const {data, error } = await supabase.auth.signInWithPassword({ email, password });
     if (data.session) {
      await Preferences.set({
        key: 'supabase_session',
        value: JSON.stringify(data.session),
      });
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name: name || email.split('@')[0] }
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    await fetchProfile(user.id);
  };

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    authReady,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshProfile,
    updateProfile
  }), [user, profile, loading, authReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const refreshApp = () => {
  if (window && window.location) {
    console.log("Refreshing app like a browser...");
    
    window.location.reload();
  }
};

