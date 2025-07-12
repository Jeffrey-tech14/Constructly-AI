
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
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
  CreditCard
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    location: profile?.location || ''
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Profile...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile information.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!sessionStorage.getItem('profile_reloaded')) {
      sessionStorage.setItem('profile_reloaded', 'true');
      window.location.reload();
    }
  }, []);

const [tierLimits, setTierLimits] = useState<{
  [key: string]: {
    quotes: number ;
    price: number;
    features: string[];
  };
}>({
  Free: {
    quotes: 3,
    price: 0,
    features: ['3 quotes/month', 'Basic templates', 'Email support']
  }
});

  useEffect(() => {
    const fetchTiers = async () => {
      const { data, error } = await supabase.from('tiers').select('*');
      if (error) {
        console.error('Failed to fetch tiers:', error);
        return;
      }

      // Build tierLimits from Supabase data
      const limits = data.reduce((acc: any, tier: any) => {
        acc[tier.name] = {
          quotes: tier.quotes_limit ?? Infinity, // fallback if null
          price: tier.price,
          features: tier.features || [] // assuming Supabase has a features column (JSON/text[]), else you can hardcode
        };
        return acc;
      }, {});

      setTierLimits({
        ...tierLimits,
        ...limits
      });
    };

    fetchTiers();
  }, []);


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

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Free':
        return <Badge variant="secondary">Free</Badge>;
      case 'Basic':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
      case 'Intermediate':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
      case 'Professional':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><Shield className="w-3 h-3 mr-1" />Premium</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  const quotaUsagePercentage = profile.tier === 'Free' 
    ? (profile.quotes_used / tierLimits.Free.quotes) * 100 
    : 0;

  const projectCompletionRate = profile.total_projects > 0 
    ? (profile.completed_projects / profile.total_projects) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 smooth-transition">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your account and subscription</p>
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
                    <p className="text-2xl font-bold text-primary">{profile.total_projects}</p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{profile.completed_projects}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{Math.round(projectCompletionRate)}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">KSh {(profile.total_revenue000).toFixed(1)}K</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Project Completion Rate</span>
                    <span>{Math.round(projectCompletionRate)}%</span>
                  </div>
                  <Progress value={projectCompletionRate} className="w-full" />
                </div>
              </CardContent>
            </Card>
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
                    <p className="text-3xl font-bold text-primary">
                      {profile.tier === 'Free'
                        ? 'Free'
                        : `KSh ${tierData?.price?.toLocaleString() || '0'}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      per month
                    </p>
                  </div>

                  {profile.tier === 'Free' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quotes Used</span>
                        <span>{profile.quotes_used}/{tierLimits.Free.quotes}</span>
                      </div>
                      <Progress value={quotaUsagePercentage} className="w-full" />
                      {quotaUsagePercentage > 80 && (
                        <p className="text-sm text-yellow-600">Running low on quotes!</p>
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
                    {profile.tier === 'Premium' ? 'Manage Subscription' : 'Upgrade Plan'}
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
