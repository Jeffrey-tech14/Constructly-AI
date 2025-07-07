
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Calculator from '@/components/Calculator';
import { 
  Settings, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Package,
  MapPin,
  Wrench,
  Edit3,
  Eye,
  UserCheck,
  UserX,
  Calculator as CalculatorIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [lastUpdateTime] = useState(new Date().toISOString());
  
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Cement (50kg bag)', basePrice: 850, lastUpdated: '2024-01-05', previousPrice: 810 },
    { id: 2, name: 'Steel Bars (12mm)', basePrice: 1200, lastUpdated: '2024-01-04', previousPrice: 1045 },
    { id: 3, name: 'Sand (Lorry)', basePrice: 4500, lastUpdated: '2024-01-03', previousPrice: 4400 },
    { id: 4, name: 'Ballast (Lorry)', basePrice: 4000, lastUpdated: '2024-01-03', previousPrice: 4120 }
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'John Kamau', email: 'john@example.com', tier: 'Free', quotesUsed: 2, lastActive: '2024-01-05', joinDate: '2023-12-01' },
    { id: 2, name: 'Mary Wanjiku', email: 'mary@example.com', tier: 'Intermediate', quotesUsed: 12, lastActive: '2024-01-05', joinDate: '2023-11-15' },
    { id: 3, name: 'David Mutua', email: 'david@example.com', tier: 'Premium', quotesUsed: 25, lastActive: '2024-01-04', joinDate: '2023-10-20' },
    { id: 4, name: 'Sarah Achieng', email: 'sarah@example.com', tier: 'Free', quotesUsed: 3, lastActive: '2024-01-03', joinDate: '2024-01-01' }
  ]);

  const [regions, setRegions] = useState([
    { name: 'Nairobi', multiplier: 1.2, previousMultiplier: 1.15 },
    { name: 'Mombasa', multiplier: 1.15, previousMultiplier: 1.12 },
    { name: 'Kisumu', multiplier: 1.05, previousMultiplier: 1.03 },
    { name: 'Nakuru', multiplier: 1.0, previousMultiplier: 1.0 },
    { name: 'Eldoret', multiplier: 0.95, previousMultiplier: 0.97 }
  ]);

  // Calculate dynamic statistics
  const calculateStats = () => {
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(user => user.tier !== 'Free').length;
    
    // Calculate monthly revenue based on user tiers
    const monthlyRevenue = users.reduce((total, user) => {
      switch (user.tier) {
        case 'Intermediate': return total + 2500;
        case 'Premium': return total + 5000;
        default: return total;
      }
    }, 0);
    
    // Calculate growth metrics
    const newUsersThisMonth = users.filter(user => {
      const joinDate = new Date(user.joinDate);
      const currentMonth = new Date().getMonth();
      return joinDate.getMonth() === currentMonth;
    }).length;
    
    // Count active price alerts
    const priceAlerts = materials.filter(material => {
      const changePercent = ((material.basePrice - material.previousPrice) / material.previousPrice) * 100;
      return Math.abs(changePercent) >= 5; // Alert if price changed by 5% or more
    }).length;

    return {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      newUsersThisMonth,
      priceAlerts
    };
  };

  const stats = calculateStats();

  const calculatePriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: change.toFixed(1),
      isIncrease: change > 0,
      isSignificant: Math.abs(change) >= 5
    };
  };

  const updateMaterialPrice = (materialId: number, newPrice: number) => {
    setMaterials(materials.map(material => 
      material.id === materialId 
        ? { 
            ...material, 
            previousPrice: material.basePrice,
            basePrice: newPrice,
            lastUpdated: new Date().toISOString().split('T')[0]
          } 
        : material
    ));
  };

  const updateRegionMultiplier = (regionName: string, newMultiplier: number) => {
    setRegions(regions.map(region => 
      region.name === regionName 
        ? { 
            ...region, 
            previousMultiplier: region.multiplier,
            multiplier: newMultiplier 
          } 
        : region
    ));
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Free':
        return <Badge variant="secondary">Free</Badge>;
      case 'Intermediate':
        return <Badge className="bg-blue-100 text-blue-800">Intermediate</Badge>;
      case 'Premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  const changeTier = (userId: number, newTier: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, tier: newTier } : user
    ));
  };

  const dynamicStats = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toString(), 
      change: `+${stats.newUsersThisMonth}`, 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      title: 'Active Subscriptions', 
      value: stats.activeSubscriptions.toString(), 
      change: `${Math.round((stats.activeSubscriptions/stats.totalUsers)*100)}%`, 
      icon: <UserCheck className="w-5 h-5" /> 
    },
    { 
      title: 'Monthly Revenue', 
      value: `KSh ${stats.monthlyRevenue.toLocaleString()}`, 
      change: `${stats.activeSubscriptions > 0 ? '+' : ''}${Math.round((stats.monthlyRevenue/50000)*100)}%`, 
      icon: <DollarSign className="w-5 h-5" /> 
    },
    { 
      title: 'Price Alerts', 
      value: stats.priceAlerts.toString(), 
      change: 'Active', 
      icon: <AlertTriangle className="w-5 h-5" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 smooth-transition">
      {/* Navigation */}
      <nav className=" bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Wrench className="w-8 h-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Constructly</span>
              </Link>
              <Badge variant="outline" className="ml-4 text-red-600 border-red-600">
                ADMIN
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCalculatorOpen(true)}
              >
                <CalculatorIcon className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  User Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm">Sign Out</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-350">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, pricing, and system settings</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(lastUpdateTime).toLocaleString()}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dynamicStats.map((stat, index) => (
            <Card className='gradient-card' key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-350">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-350">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Regions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Materials Management */}
          <TabsContent value="materials">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Material Pricing</span>
                  <Button size="sm" className='text-white'>
                    <Edit3 className="w-4 h-4 mr-2 text-" />
                    Bulk Update
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material) => {
                    const priceChange = calculatePriceChange(material.basePrice, material.previousPrice);
                    return (
                      <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{material.name}</h4>
                          <p className="text-sm text-gray-600">Last updated: {material.lastUpdated}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={
                            priceChange.isIncrease 
                              ? (priceChange.isSignificant ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800')
                              : (priceChange.isSignificant ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')
                          }>
                            {priceChange.isIncrease ? '+' : ''}{priceChange.percentage}%
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`price-${material.id}`} className="text-sm">KSh</Label>
                            <Input
                              id={`price-${material.id}`}
                              type="number"
                              value={material.basePrice}
                              onChange={(e) => updateMaterialPrice(material.id, parseInt(e.target.value))}
                              className="w-32"
                            />
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => {
                    const daysSinceJoin = Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24));
                    const daysSinceActive = Math.floor((new Date().getTime() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            {user.quotesUsed} quotes used • Active {daysSinceActive === 0 ? 'today' : `${daysSinceActive} days ago`} • Member for {daysSinceJoin} days
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getTierBadge(user.tier)}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeTier(user.id, 'Free')}
                              className={user.tier === 'Free' ? 'bg-gray-100  text-orange-900 ' : ''}
                            >
                              Free
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeTier(user.id, 'Intermediate')}
                              className={user.tier === 'Intermediate' ? 'bg-blue-100 text-blue-900' : ''}
                            >
                              Int.
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeTier(user.id, 'Premium')}
                              className={user.tier === 'Premium' ? 'bg-purple-100  text-purple-900' : ''}
                            >
                              Prem.
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Pricing */}
          <TabsContent value="regions">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle>Regional Price Multipliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regions.map((region, index) => {
                    const multiplierChange = calculatePriceChange(region.multiplier, region.previousMultiplier);
                    const regionColor = region.multiplier > 1.1 ? 'bg-red-100 text-red-800' : 
                                      region.multiplier > 1.0 ? 'bg-orange-100 text-orange-800' :
                                      region.multiplier === 1.0 ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800';
                    
                    return (
                      <Card key={index} className="p-4 gradient-card">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{region.name}</h4>
                          <Badge className={regionColor}>
                            {region.multiplier > 1 ? '+' : ''}{((region.multiplier - 1) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Label className="text-sm">Multiplier:</Label>
                          <Input
                            type="number"
                            step="0.05"
                            value={region.multiplier}
                            onChange={(e) => updateRegionMultiplier(region.name, parseFloat(e.target.value))}
                            className="w-24"
                          />
                        </div>
                        {Math.abs(parseFloat(multiplierChange.percentage)) > 0 && (
                          <p className="text-xs text-gray-500">
                            Change: {multiplierChange.isIncrease ? '+' : ''}{multiplierChange.percentage}%
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Alerts */}
          <TabsContent value="alerts">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Price Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material) => {
                    const priceChange = calculatePriceChange(material.basePrice, material.previousPrice);
                    if (!priceChange.isSignificant) return null;
                    
                    const alertLevel = Math.abs(parseFloat(priceChange.percentage)) >= 15 ? 'HIGH' :
                                     Math.abs(parseFloat(priceChange.percentage)) >= 10 ? 'MEDIUM' : 'LOW';
                    const alertColor = alertLevel === 'HIGH' ? 'border-red-200 bg-red-50' :
                                      alertLevel === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                                      'border-green-200 bg-green-50';
                    const badgeColor = alertLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                      alertLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800';
                    
                    return (
                      <div key={material.id} className={`p-4 border rounded-lg ${alertColor}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {material.name} Price {priceChange.isIncrease ? 'Spike' : 'Drop'}
                            </h4>
                            <p className="text-gray-700 text-sm">
                              Price {priceChange.isIncrease ? 'increased' : 'decreased'} by {Math.abs(parseFloat(priceChange.percentage))}% 
                              from KSh {material.previousPrice.toLocaleString()} to KSh {material.basePrice.toLocaleString()}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              Triggered: {material.lastUpdated}
                            </p>
                          </div>
                          <Badge className={badgeColor}>{alertLevel}</Badge>
                        </div>
                      </div>
                    );
                  })}
                  
                  {materials.filter(m => calculatePriceChange(m.basePrice, m.previousPrice).isSignificant).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No significant price changes detected</p>
                      <p className="text-sm">Alerts will appear when materials change by 5% or more</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Calculator Modal */}
      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
};

export default AdminDashboard;
