// src/pages/Profile.tsx
// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  User,
  Settings,
  TrendingUp,
  Calendar,
  Edit,
  Save,
  Crown,
  Shield,
  CreditCard,
  Shell,
  Camera,
  CheckCircle,
  Loader2,
  LucidePersonStanding
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { motion } from "framer-motion";

// RISA Design Tokens (Matches Dashboard)
const RISA_BLUE = "#015B97";
const RISA_BG = "#F0F7FA";
const RISA_TEXT_MAIN = "#333333";
const RISA_TEXT_MUTED = "#666666";
const RISA_BORDER = "#E1EBF2";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    company: profile?.company || "",
    location: profile?.location || "",
    avatar_url: profile?.avatar_url || "",
  });

  useEffect(() => {
    if (profile?.avatar_url) {
      downloadImage(profile.avatar_url);
    } else {
      setAvatarUrl(null);
    }
  }, [profile]);

  async function downloadImage(path: string) {
    try {
      if (path.startsWith("http")) {
        setAvatarUrl(path);
        return;
      }
      const { data, error } = await supabase.storage
        .from("profile-photos")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      if (path) {
        setAvatarUrl(path);
      }
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  const [tierLimits, setTierLimits] = useState<{
    [key: string]: {
      price: number;
      limit: number;
      features: string[];
    };
  }>({});

  const [stats, setStats] = useState({
    total_projects: 0,
    completed_projects: 0,
    total_revenue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardStats(profile.id).then(setStats);
    }
  }, [user, location.key]);

  const fetchDashboardStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("quotes")
      .select("status, profit_amount")
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        total_projects: 0,
        completed_projects: 0,
        total_revenue: 0,
        completionRate: 0,
      };
    }
    const total_projects = data.length;
    const completed_projects = data.filter(
      (q) => q.status === "completed"
    ).length;
    const total_revenue = data.reduce(
      (sum, q) => sum + (q.profit_amount || 0),
      0
    );
    const completionRate =
      total_projects > 0 ? (completed_projects / total_projects) * 100 : 0;
    return {
      total_projects,
      completed_projects,
      total_revenue,
      completionRate,
    };
  };

  useEffect(() => {
    const fetchTiers = async () => {
      const { data, error } = await supabase.from("tiers").select("*");
      if (error) {
        console.error("Failed to fetch tiers:", error);
        return;
      }
      const limits = data.reduce((acc: any, tier: any) => {
        acc[tier.name] = {
          limit: tier.quotes_limit,
          price: tier.price,
          features: tier.features || [],
        };
        return acc;
      }, {});
      setTierLimits({
        ...tierLimits,
        ...limits,
      });
    };
    fetchTiers();
  }, [location.key, user]);

  const tierData = profile?.tier
    ? tierLimits[profile.tier as keyof typeof tierLimits]
    : null;

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      await updateProfile({ ...formData, avatar_url: url });
      setShowAvatarUpload(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  if (!user) {
    navigate("/auth");
  }

  const getTierImage = (tier: string) => {
    switch (tier) {
      case "Free": return <Shell className="w-5 h-5" />;
      case "Intermediate": return <Crown className="w-5 h-5" />;
      case "Professional": return <Shield className="w-5 h-5" />;
      default: return <span className="text-sm font-medium">{tier}</span>;
    }
  };

  const quotaUsagePercentage =
    profile?.quotes_used && profile?.tier && tierLimits[profile.tier]
      ? (profile.quotes_used / tierLimits[profile.tier].limit) * 100
      : 0;

  const projectCompletionRate =
    stats.total_projects > 0
      ? (stats.completed_projects / stats.total_projects) * 100
      : 0;

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8 text-[#015B97] mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2 text-[#333]">
            Loading Profile...
          </h2>
          <p className="text-[#666]">
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FA] font-sans text-[#333]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-[#015B97] text-[10px] font-extrabold uppercase tracking-[1.2px] px-2 py-1 rounded">
                   Account Settings
                </span>
            </div>
            <h1 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight flex items-center gap-3">
              Profile
            </h1>
            <p className="text-[15px] text-[#666] mt-1">
              Manage your personal information and subscription details.
            </p>
          </div>
          <Button
            className="bg-[#015B97] hover:bg-[#004a80] text-white font-extrabold uppercase tracking-[1.2px] text-[12px] h-10 px-6 rounded-[3px] transition-all"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            {isEditing ? (
              <Save className="w-4 h-4 mr-2" />
            ) : (
              <Edit className="w-4 h-4 mr-2" />
            )}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </motion.div>

        {showAvatarUpload && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-[4px] shadow-xl max-w-md w-full">
                 <h3 className="text-lg font-bold mb-4">Update Profile Picture</h3>
                <ProfilePictureUpload
                    currentAvatarUrl={avatarUrl || undefined}
                    onUploadComplete={handleAvatarUpload}
                    onCancel={() => setShowAvatarUpload(false)}
                />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Personal Info & Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Information Card */}
            <Card className="bg-white border border-[#E1EBF2] shadow-sm rounded-[4px]">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center text-[18px] font-bold text-[#333]">
                  <User className="w-5 h-5 mr-2 text-[#015B97]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => setShowAvatarUpload(true)}>
                    <Avatar className="h-28 w-28 border-4 border-[#F0F7FA] shadow-md">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-gray-100 text-[#015B97] text-3xl font-bold">
                        {profile.name?.charAt(0) || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white w-8 h-8" />
                    </div>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-[#015B97] hover:bg-[#004a80] text-white border-2 border-white shadow-sm pointer-events-none"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-[12px] text-[#888] mt-3">Click photo to update</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[13px] font-bold text-[#333] uppercase tracking-wide">Full Name</Label>
                    <Input
                      id="name"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-[#015B97] focus:ring-0"
                      value={isEditing ? formData.name : profile.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[13px] font-bold text-[#333] uppercase tracking-wide">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      className="h-11 bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[13px] font-bold text-[#333] uppercase tracking-wide">Phone Number</Label>
                    <Input
                      id="phone"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-[#015B97] focus:ring-0"
                      value={isEditing ? formData.phone : profile.phone || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+254..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[13px] font-bold text-[#333] uppercase tracking-wide">Company Name</Label>
                    <Input
                      id="company"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-[#015B97] focus:ring-0"
                      value={isEditing ? formData.company : profile.company || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g. Acme Construction"
                    />
                  </div>
                   <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="location" className="text-[13px] font-bold text-[#333] uppercase tracking-wide">Location</Label>
                    <Input
                      id="location"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-[#015B97] focus:ring-0"
                      value={isEditing ? formData.location : profile.location || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g. Nairobi, Kenya"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            {profile.tier !== "Free" && stats.total_projects > 0 && (
              <Card className="bg-white border border-[#E1EBF2] shadow-sm rounded-[4px]">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center text-[18px] font-bold text-[#333]">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#015B97]" />
                    Performance Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-4 bg-blue-50 rounded-[4px]">
                      <p className="text-2xl font-bold text-[#015B97] mb-1">{stats.total_projects}</p>
                      <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Total Projects</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-[4px]">
                      <p className="text-2xl font-bold text-green-600 mb-1">{stats.completed_projects}</p>
                      <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-[4px]">
                      <p className="text-2xl font-bold text-purple-600 mb-1">{Math.round(stats.completionRate)}%</p>
                      <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Success Rate</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-[4px]">
                      <p className="text-2xl font-bold text-[#333] mb-1">KSh {formatCurrency(stats.total_revenue)}</p>
                      <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Total Revenue</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[13px] font-bold text-[#333] mb-2 uppercase tracking-wide">
                      <span>Overall Completion Rate</span>
                      <span>{Math.round(projectCompletionRate)}%</span>
                    </div>
                    <Progress value={projectCompletionRate} className="h-3 bg-gray-100" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Subscription & Account Info */}
          <div className="space-y-6">
            
            {/* Subscription Plan Card */}
            <Card className="bg-white border border-[#E1EBF2] shadow-sm rounded-[4px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#015B97] to-blue-400" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-[16px] font-bold text-[#333]">
                  <span>Current Plan</span>
                  <Badge 
                    className={`
                        text-[10px] font-bold uppercase tracking-wider px-2 py-1 border 
                        ${profile.tier === "Free" ? "bg-green-50 text-green-700 border-green-200" : 
                          profile.tier === "Intermediate" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                          "bg-purple-50 text-purple-700 border-purple-200"}
                    `}
                  >
                     {getTierImage(profile.tier)} <span className="ml-1">{profile.tier}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="text-center py-4 bg-gray-50 rounded-[4px] border border-gray-100">
                  <p className="text-3xl font-bold text-[#015B97]">
                    {profile.tier === "Free" ? "Free" : `KSh ${tierData?.price?.toLocaleString() || "0"}`}
                  </p>
                  <p className="text-[11px] font-bold text-[#888] uppercase tracking-widest mt-1">per month</p>
                </div>

                {profile.tier !== "Professional" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px] font-bold text-[#666] uppercase tracking-wide">
                      <span>Quotes Used</span>
                      <span>{profile?.quotes_used ?? 0} / {tierLimits[profile?.tier]?.limit ?? 0}</span>
                    </div>
                    <Progress 
                        value={quotaUsagePercentage} 
                        className={`h-2 ${quotaUsagePercentage > 90 ? "bg-red-100" : "bg-gray-100"}`} 
                    />
                    {quotaUsagePercentage >= 75 && (
                      <p className="text-[11px] font-bold text-red-600 text-center">Running low on quotes!</p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="text-[12px] font-bold text-[#333] uppercase tracking-wide">Included Features:</h4>
                  <ul className="space-y-2">
                    {tierData?.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-[13px] text-[#555]">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    )) || (
                      <p className="text-sm text-gray-400 italic">No features listed.</p>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card className="bg-white border border-[#E1EBF2] shadow-sm rounded-[4px]">
              <CardHeader className="border-b border-gray-100 pb-3">
                <CardTitle className="flex items-center text-[15px] font-bold text-[#333]">
                  <Calendar className="w-4 h-4 mr-2 text-[#666]" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">Member since</span>
                  <span className="font-bold text-[#333]">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">Last updated</span>
                  <span className="font-bold text-[#333]">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">Account type</span>
                  <span className="font-bold text-[#333]">
                    {profile.is_admin ? "Administrator" : "User"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px] pt-2 border-t border-gray-50">
                   <span className="text-[#666]">Total Quotes Created</span>
                   <span className="font-bold text-[#015B97]">{profile.quotes_used}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;