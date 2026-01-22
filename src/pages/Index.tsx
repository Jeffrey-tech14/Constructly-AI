// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/Hero";
import WhoItsForSection from "@/components/sections/WhoItsForSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PublicLayout from "@/components/PublicLayout";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Fetch pricing tiers from Supabase
  useEffect(() => {
    let cancelled = false;
    const fetchTiers = async () => {
      setTiersLoading(true);
      setTiersError(null);
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("id", { ascending: true });

      if (!cancelled) {
        if (error) {
          setTiersError(error.message || "Failed to load pricing tiers.");
          setTiers([]);
        } else {
          setTiers(Array.isArray(data) ? data : []);
        }
        setTiersLoading(false);
      }
    };

    fetchTiers();
    return () => {
      cancelled = true;
    };
  }, []);

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PublicLayout>
      <style>{`
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .video-container video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: #000;
        }

        @media (max-width: 640px) {
          html {
            font-size: 15px;
          }
        }
      `}</style>

      {/* Hero Section */}
      <Hero
        scrollTo={scrollTo}
        demoOpen={demoOpen}
        setDemoOpen={setDemoOpen}
      />

      {/* Who It's For Section */}
      <WhoItsForSection scrollTo={scrollTo} />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </PublicLayout>
  );
};

export default Index;