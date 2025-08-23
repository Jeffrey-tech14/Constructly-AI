
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  User, 
  Settings, 
  TrendingUp, 
  Calendar,
  Wrench,
  ArrowLeft,
  Edit,
  Save,
  Crown,
  Shield,
  CreditCard,
  Shell,
  ImageUpIcon,
  LucidePersonStanding
} from 'lucide-react';
import { AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    location: profile?.location || ''
  });

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
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
    .from('quotes')
    .select('status, profit_amount')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      total_projects: 0,
      completed_projects: 0,
      total_revenue: 0,
      completionRate: 0,
    };
  }

  const total_projects = data.length;
  const completed_projects = data.filter(q => q.status === 'completed').length;
  const total_revenue = data.reduce((sum, q) => sum + (q.profit_amount || 0), 0);
  const completionRate = total_projects > 0
    ? (completed_projects / total_projects) * 100
    : 0;

  return {
    total_projects,
    completed_projects,
    total_revenue,
    completionRate,
  };
};


  useEffect(() => {
    const fetchTiers = async () => {
      const { data, error } = await supabase.from('tiers').select('*');
      if (error) {
        console.error('Failed to fetch tiers:', error);
        return;
      }

      const limits = data.reduce((acc: any, tier: any) => {
        acc[tier.name] = {
          limit: tier.quotes_limit, 
          price: tier.price,
          features: tier.features || [] 
        };
        return acc;
      }, {});

      setTierLimits({
        ...tierLimits,
        ...limits
      });
    };

    fetchTiers();
  }, [location.key, user]);


  const tierData = tierLimits[profile.tier as keyof typeof tierLimits];
  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleUpgrade = () => {
    navigate('/payment');
  };

  if(!user){
    navigate('/auth')
  }

 const getTierBadge = (tier: string) => {
      switch (tier) {
        case 'Free':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"><Shell className="w-3 h-3 mr-1" /> Free</Badge>;
        case 'Intermediate':
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
        case 'Professional':
          return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200"><Shield className="w-3 h-3 mr-1" />Professional</Badge>;
        default:
          return <Badge>{tier}</Badge>;
      }
    };

  const quotaUsagePercentage =
    profile?.quotes_used && profile?.tier && tierLimits[profile.tier]
      ? profile.quotes_used / tierLimits[profile.tier].limit * 100
      : 0;

  const projectCompletionRate = stats.total_projects > 0 
    ? (stats.completed_projects / stats.total_projects) * 100  
    : 0;

  if (!profile) {
      fetchDashboardStats(profile.id).then(setStats);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="sm:text-2xl text-lg font-bold mb-4">Loading Profile...</h2>
            <p className="text-muted-foreground">Please wait while we load your profile information.</p>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen  animate-fade-in smooth-transition">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between items-start">
          <div className='items-center'>
            <h1 className="sm:text-3xl items-center text-2xl flex font-bold bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              <LucidePersonStanding className="sm:w-8 sm:h-8 mr-2 text-purple-900 dark:text-blue-300" />Profile</h1>
            <p className="text-sm sm:text-lg bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text mt-2">Manage your account and subscription</p>
          </div>
          <Button className='text-white' onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? <Save className="w-4 h-4 mr-2 text-white" /> : <Edit className="w-4 h-4 mr-2 text-white" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? formData.name : profile.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={isEditing ? formData.phone : (profile.phone || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={isEditing ? formData.company : (profile.company || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={isEditing ? formData.location : (profile.location || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your location"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            
            {profile.tier !== 'Free' && stats.total_projects > 0 && (
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="sm:text-2xl text-lg font-bold text-primary">{stats.total_projects}</p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="sm:text-2xl text-lg font-bold text-green-600">{stats.completed_projects}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="sm:text-2xl text-lg font-bold text-blue-600">{Math.round(stats.completionRate)}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="sm:text-2xl text-lg font-bold text-purple-600">
                      KSh {formatCurrency(stats.total_revenue)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>

                
               <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Project Completion Rate</span>
                  <span>{Math.round(projectCompletionRate)}%</span>
                </div>

                {/* Dynamic progress bar color */}
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      projectCompletionRate >= 75
                        ? 'bg-green-500'
                        : projectCompletionRate >= 50
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${projectCompletionRate}%` }}
                  ></div>
                </div>
              </div>

              </CardContent>
            </Card>
            )}
          </div>

          {/* Subscription & Usage */}
          <div className="space-y-6">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current Plan
                  {getTierBadge(profile.tier)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="sm:text-3xl text-2xl sm:text-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {profile.tier === 'Free'
                        ? 'Free'
                        : `KSh ${tierData?.price?.toLocaleString() || '0'}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      per month
                    </p>
                  </div>

                  {profile.tier !== "Professional" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quotes Used</span>
                        <span>
                          {profile?.quotes_used ?? 0}/{tierLimits[profile?.tier]?.limit ?? 0}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quotaUsagePercentage >= 75
                          ? 'bg-red-500'
                          : quotaUsagePercentage >= 50
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${quotaUsagePercentage}%` }}
                    ></div>
                    </div>
                      {quotaUsagePercentage >= 75 && (
                        <p className="text-sm text-red-600">Running low on quotes!</p>
                      )}
                    </div>
                    
                  )}
                  

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    {tierData?.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    )) || <p className="text-sm text-red-500">No features found</p>}
                  </div>

                  <Button 
                    className="w-full text-white" 
                    onClick={handleUpgrade}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {profile.tier === 'Professional' ? 'Manage Subscription' : 'Upgrade Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Member since:</span>
                  <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last updated:</span>
                  <span>{new Date(profile.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Account type:</span>
                  <span>{profile.is_admin ? 'Administrator' : 'User'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quotes used:</span>
                  <span>{profile.quotes_used}</span>
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
