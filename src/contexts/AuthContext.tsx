// © 2025 Jeff. All rights reserved.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
  avatar_url?: string;
  subscription_status?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authReady: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Track mounted state
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!userId || !isMounted.current) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        if (isMounted.current) {
          setProfile(null);
        }
      } else if (isMounted.current) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
      if (isMounted.current) {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    let authSubscription: { data: { subscription: any } } | null = null;
    let profileChannel: any = null;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (isMounted.current && data?.session) {
          setUser(data.session.user);
          await fetchProfile(data.session.user.id);
        }

        if (isMounted.current) {
          setAuthReady(true);
          setLoading(false);
        }

        // Subscribe to auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!isMounted.current) return;

          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);

            // Subscribe to profile changes for this user
            if (profileChannel) {
              supabase.removeChannel(profileChannel);
            }

            profileChannel = supabase
              .channel(`profiles-${session.user.id}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "profiles",
                  filter: `id=eq.${session.user.id}`,
                },
                () => {
                  if (isMounted.current) {
                    fetchProfile(session.user.id);
                  }
                }
              )
              .subscribe();
          } else {
            setUser(null);
            if (isMounted.current) {
              setProfile(null);
            }
            if (profileChannel) {
              supabase.removeChannel(profileChannel);
              profileChannel = null;
            }
          }
        });

        authSubscription = { data: { subscription } };
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted.current) {
          setLoading(false);
          setAuthReady(true);
        }
      }
    };

    init();

    return () => {
      isMounted.current = false;

      // Cleanup subscriptions
      if (authSubscription?.data?.subscription) {
        supabase.removeChannel(authSubscription.data.subscription);
      }

      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split("@")[0] },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    return { error };
  };

  const signOut = async () => {
    // Prevent state updates after sign out
    isMounted.current = false;
    await supabase.auth.signOut();

    // Reset mounted state
    setTimeout(() => {
      isMounted.current = true;
    }, 100);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("Not logged in");

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    if (isMounted.current) {
      await fetchProfile(user.id);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      authReady,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      resetPassword,
      refreshProfile: async () => {
        if (user?.id && isMounted.current) {
          await fetchProfile(user.id);
        }
      },
      updateProfile,
    }),
    [user, profile, loading, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const refreshApp = () => window?.location?.reload();
