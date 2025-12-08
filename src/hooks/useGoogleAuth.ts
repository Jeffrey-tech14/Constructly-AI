// src/hooks/useGoogleAuth.ts
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // ← Add to .env

export const useGoogleAuth = () => {
  const signInWithGoogle = useCallback(async (): Promise<GoogleUser | null> => {
    return new Promise((resolve) => {
      const google = (window as any).google;
      if (!google) {
        console.error('Google SDK not loaded');
        resolve(null);
        return;
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'openid email profile',
        callback: async (response: any) => {
          if (response.error) {
            console.error('Google OAuth error:', response);
            resolve(null);
            return;
          }

          // Verify and get user info
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }).then(res => res.json());

          const user: GoogleUser = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          };

          // Save to your profiles table (bypass Supabase Auth)
          const { error } = await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar,
                tier: 'Free',
                quotes_used: 0,
                total_projects: 0,
                completed_projects: 0,
                total_revenue: 0,
                is_admin: false,
                subscription_status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

          if (error) {
            console.error('Failed to save profile:', error);
          }

          // Save to session
          localStorage.setItem('google_user', JSON.stringify(user));
          resolve(user);
        },
      });

      tokenClient.requestAccessToken();
    });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('google_user');
    // Optional: revoke token
    const google = (window as any).google;
    if (google) google.accounts.id.disableAutoSelect();
  }, []);

  const getUser = useCallback((): GoogleUser | null => {
    const userStr = localStorage.getItem('google_user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  return {
    signInWithGoogle,
    signOut,
    getUser,
  };
};