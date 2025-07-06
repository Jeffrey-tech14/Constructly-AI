
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  FileText, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Wrench,
  ArrowLeft,
  Edit,
  Save,
  Crown,
  Shield
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // User data - in real app this would come from API/database
  const [userData, setUserData] = useState({
    name: 'John Kamau',
    email: 'john@example.com',
    phone: '+254 712 345 678',
    company: 'Kamau Construction Ltd',
    location: 'Nairobi, Kenya',
    joinDate: '2024-01-15',
    tier: 'Free', // Free, Intermediate, Premium
    isAdmin: false, // This would be fetched from database
    quotesUsed: 2,
    totalProjects: 5,
    completedProjects: 3,
    totalRevenue: 8500000, // KSh
    lastLogin: new Date().toISOString().split('T')[0]
  });

  const tierLimits = {
    Free: { quotes: 3, price: 0, features: ['3 quotes/month', 'Basic templates', 'Email support'] },
    Intermediate: { quotes: Infinity, price: 2500, features: ['Unlimited quotes', 'PDF export', '5 blueprint uploads', 'Priority support'] },
    Premium: { quotes: Infinity, price: 5000, features: ['All Intermediate features', '3D preview', 'Advanced analytics', 'White-label reports', '24/7 support'] }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleUpgrade = (newTier: string) => {
    // In real app, this would integrate with payment system
    toast({
      title: "Upgrade Request",
      description: `Upgrading to ${newTier} plan. Redirecting to payment...`,
    });
    // Simulate upgrade - in real app this would be handled by payment flow
    setTimeout(() => {
      setUserData(prev => ({ ...prev, tier: newTier }));
      toast({
        title: "Plan Upgraded!",
        description: `Welcome to ${newTier} plan!`,
      });
    }, 2000);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Free':
        return <Badge variant="secondary">Free</Badge>;
      case 'Intermediate':
        return <Badge className="bg-blue-100 text-blue-800"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
      case 'Premium':
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Premium</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  const quotaUsagePercentage = userData.tier === 'Free' 
    ? (userData.quotesUsed / tierLimits.Free.quotes) * 100 
    : 0;

  const projectCompletionRate = userData.totalProjects > 0 
    ? (userData.completedProjects / userData.totalProjects) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Wrench className="w-8 h-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Constructly</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {userData.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account and subscription</p>
          </div>
          <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
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
                      value={userData.name}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={userData.company}
                      onChange={(e) => setUserData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={userData.location}
                    onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{userData.totalProjects}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{userData.completedProjects}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{Math.round(projectCompletionRate)}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">KSh {(userData.totalRevenue / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current Plan
                  {getTierBadge(userData.tier)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {userData.tier === 'Free' ? 'Free' : `KSh ${tierLimits[userData.tier as keyof typeof tierLimits].price.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {userData.tier === 'Free' ? 'per month' : 'per month'}
                    </p>
                  </div>

                  {userData.tier === 'Free' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quotes Used</span>
                        <span>{userData.quotesUsed}/{tierLimits.Free.quotes}</span>
                      </div>
                      <Progress value={quotaUsagePercentage} className="w-full" />
                      {quotaUsagePercentage > 80 && (
                        <p className="text-sm text-yellow-600">Running low on quotes!</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tierLimits[userData.tier as keyof typeof tierLimits].features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {userData.tier !== 'Premium' && (
                    <div className="space-y-2">
                      {userData.tier === 'Free' && (
                        <Button 
                          className="w-full" 
                          onClick={() => handleUpgrade('Intermediate')}
                        >
                          Upgrade to Intermediate
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleUpgrade('Premium')}
                      >
                        {userData.tier === 'Free' ? 'Upgrade to Premium' : 'Upgrade to Premium'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Member since:</span>
                  <span>{new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last login:</span>
                  <span>{new Date(userData.lastLogin).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Account type:</span>
                  <span>{userData.isAdmin ? 'Administrator' : 'User'}</span>
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
