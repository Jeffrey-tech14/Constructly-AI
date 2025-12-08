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
  DraftingCompass,
  ArrowLeft,
  Edit,
  Save,
  Crown,
  Shield,
  CreditCard,
  Shell,
  ImageUpIcon,
  LucidePersonStanding,
  Camera,
  Check,
  CheckCircle,
  Loader2,
  Phone,
  Building,
  MapPin,
  Mail,
  Users,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { motion } from "framer-motion";

// RISA Color Palette (from Index.tsx) - Using CSS variables for better theming integration
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";

// Component is already structured to use existing logic hooks and functions.
// Only the JSX structure and Tailwind classes are modified for a better UI.

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

  // --- Logic Functions (Maintained) ---

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
      case "Free":
        return <Shell className="w-6 h-6" />;
      case "Intermediate":
        return <Crown className="w-6 h-6" />;
      case "Professional":
        return <Shield className="w-6 h-6" />;
      default:
        return <span className="text-sm font-medium">{tier}</span>;
    }
  };

  // Removed getTierBadge as a separate function, integrating logic directly for more modern badge styles

  const quotaUsagePercentage =
    profile?.quotes_used && profile?.tier && tierLimits[profile.tier]
      ? (profile.quotes_used / tierLimits[profile.tier].limit) * 100
      : 0;

  const projectCompletionRate =
    stats.total_projects > 0
      ? (stats.completed_projects / stats.total_projects) * 100
      : 0;

  // --- Loading State UI (Updated) ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-card shadow-xl rounded-lg">
          <Loader2 className="animate-spin h-10 w-10 text-primary mb-4 mx-auto" />
          <h2 className="text-2xl font-extrabold text-card-foreground">
            Loading Profile...
          </h2>
          <p className="text-muted-foreground mt-2">
            Fetching your account details.
          </p>
        </div>
      </div>
    );
  }

  // --- Main Profile UI (Updated) ---
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-border/70">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl flex items-center font-extrabold text-foreground">
              <LucidePersonStanding className="w-8 h-8 mr-3 text-primary" />
              My Profile
            </h1>
            <p className="text-sm sm:text-md text-muted-foreground mt-1">
              Manage your personal information, statistics, and subscription plan.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              className="group"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Button>
            <Button
              className="transition-colors duration-200"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Avatar Upload Modal */}
        {showAvatarUpload && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <ProfilePictureUpload
              currentAvatarUrl={avatarUrl || undefined}
              onUploadComplete={handleAvatarUpload}
              onCancel={() => setShowAvatarUpload(false)}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Personal Info & Stats) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle className="flex items-center text-lg font-semibold text-primary">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-md">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={`${profile.name}'s avatar`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/20 text-primary text-3xl font-semibold">
                        {profile.name
                          ? profile.name.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      title="Change Profile Picture"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer"
                      onClick={() => setShowAvatarUpload(true)}
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setShowAvatarUpload(true)}
                    className="mt-2 text-sm text-primary hover:text-primary/80 p-0 h-auto"
                  >
                    <ImageUpIcon className="w-4 h-4 mr-1" />
                    Update Profile Picture
                  </Button>
                </div>

                {/* Profile Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      <User className="w-4 h-4 inline mr-1 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={isEditing ? formData.name : profile.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="h-10 text-base"
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      <Mail className="w-4 h-4 inline mr-1 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="h-10 text-base bg-muted/50"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      <Phone className="w-4 h-4 inline mr-1 text-muted-foreground" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={isEditing ? formData.phone : profile.phone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="h-10 text-base"
                    />
                  </div>
                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">
                      <Building className="w-4 h-4 inline mr-1 text-muted-foreground" />
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={
                        isEditing ? formData.company : profile.company || ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      placeholder="Enter your company name"
                      className="h-10 text-base"
                    />
                  </div>
                  {/* Location (Full Width) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      <MapPin className="w-4 h-4 inline mr-1 text-muted-foreground" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={
                        isEditing ? formData.location : profile.location || ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      placeholder="Enter your location (City, Country)"
                      className="h-10 text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card (Only for non-Free users with projects) */}
            {profile.tier !== "Free" && stats.total_projects > 0 && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-muted/30 rounded-t-lg">
                  <CardTitle className="flex items-center text-lg font-semibold text-primary">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Business Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Stat Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {/* Total Projects */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-lg bg-card border border-border/70"
                    >
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.total_projects}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Projects
                      </p>
                    </motion.div>
                    {/* Completed Projects */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-lg bg-card border border-border/70"
                    >
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.completed_projects}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </motion.div>
                    {/* Success Rate */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-lg bg-card border border-border/70"
                    >
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(projectCompletionRate)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Success Rate
                      </p>
                    </motion.div>
                    {/* Total Revenue */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-lg bg-card border border-border/70"
                    >
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        KSh {formatCurrency(stats.total_revenue)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                    </motion.div>
                  </div>

                  {/* Completion Rate Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-foreground font-medium">
                      <span>Project Completion Rate</span>
                      <span>{Math.round(projectCompletionRate)}%</span>
                    </div>

                    <div className="h-3 rounded-full overflow-hidden bg-muted/70">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          projectCompletionRate >= 75
                            ? "bg-green-500"
                            : projectCompletionRate >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${projectCompletionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column (Plan & Account Info) */}
          <div className="space-y-8">
            {/* Current Plan Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0 border-b">
                <div
                  className={`flex flex-col items-center p-6 rounded-t-lg ${
                    profile.tier === "Free"
                      ? "bg-green-100 dark:bg-green-900/40"
                      : profile.tier === "Intermediate"
                      ? "bg-blue-100 dark:bg-blue-900/40"
                      : "bg-purple-100 dark:bg-purple-900/40"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-card shadow-lg text-3xl font-bold text-primary mb-3">
                    {getTierImage(profile.tier)}
                  </div>
                  <CardTitle className="flex flex-col items-center space-y-1">
                    <span className="text-xl font-extrabold text-foreground">
                      {profile.tier} Plan
                    </span>
                    <Badge
                      className={`text-xs font-semibold ${
                        profile.tier === "Free"
                          ? "bg-green-500 hover:bg-green-600"
                          : profile.tier === "Intermediate"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-purple-500 hover:bg-purple-600"
                      } text-white`}
                    >
                      Current Subscription
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-primary">
                    {profile.tier === "Free"
                      ? "Free"
                      : `KSh ${tierData?.price?.toLocaleString() || "0"}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.tier !== "Free" ? "per month" : "Always Free"}
                  </p>
                </div>

                {/* Quota Usage */}
                {profile.tier !== "Professional" && (
                  <div className="space-y-2 border-t pt-4 border-border/70">
                    <div className="flex justify-between text-sm font-medium text-foreground">
                      <span>Quotes Used</span>
                      <span>
                        <span
                          className={`${
                            quotaUsagePercentage >= 75
                              ? "text-red-500"
                              : "text-primary"
                          } font-semibold`}
                        >
                          {profile?.quotes_used ?? 0}
                        </span>
                        /
                        {tierLimits[profile?.tier]?.limit ?? 0}
                      </span>
                    </div>
                    <Progress
                      value={quotaUsagePercentage}
                      className="h-2.5"
                      indicatorClassName={
                        quotaUsagePercentage >= 75
                          ? "bg-red-500"
                          : quotaUsagePercentage >= 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />
                    {quotaUsagePercentage >= 75 && (
                      <p className="text-sm text-red-500 font-medium">
                        Running low on quotes! Consider upgrading.
                      </p>
                    )}
                  </div>
                )}

                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-base border-b pb-2 text-primary flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Plan Features:
                  </h4>
                  <ul className="space-y-2">
                    {tierData?.features?.length > 0
                      ? tierData.features.map((feature, idx) => (
                          <li key={idx} className="flex text-sm items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))
                      : (
                        <p className="text-sm text-muted-foreground">
                          No specific features listed for this tier.
                        </p>
                      )}
                  </ul>
                </div>
                <Button asChild className="w-full">
                  <Link to="/pricing">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {profile.tier === "Professional"
                      ? "Manage Subscription"
                      : "Upgrade Your Plan"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-muted/30 rounded-t-lg">
                <CardTitle className="flex items-center text-lg font-semibold text-primary">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm">
                {/* Member Since */}
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Member since:
                  </span>
                  <span className="text-foreground font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                {/* Last Updated */}
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground flex items-center">
                    <Settings className="w-4 h-4 mr-2" /> Last updated:
                  </span>
                  <span className="text-foreground font-medium">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {/* Account Type */}
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground flex items-center">
                    <Crown className="w-4 h-4 mr-2" /> Account type:
                  </span>
                  <span className="text-foreground font-medium">
                    {profile.is_admin ? "Administrator" : "User"}
                  </span>
                </div>
                {/* Total Quotes Used */}
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground flex items-center">
                    <DraftingCompass className="w-4 h-4 mr-2" /> Lifetime Quotes:
                  </span>
                  <span className="text-foreground font-medium">
                    {profile.quotes_used}
                  </span>
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