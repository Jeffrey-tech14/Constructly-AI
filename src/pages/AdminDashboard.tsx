
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  UserX
} from 'lucide-react';

const AdminDashboard = () => {
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Cement (50kg bag)', basePrice: 850, lastUpdated: '2024-01-05', trend: '+5%' },
    { id: 2, name: 'Steel Bars (12mm)', basePrice: 1200, lastUpdated: '2024-01-04', trend: '+15%' },
    { id: 3, name: 'Sand (Lorry)', basePrice: 4500, lastUpdated: '2024-01-03', trend: '+2%' },
    { id: 4, name: 'Ballast (Lorry)', basePrice: 4000, lastUpdated: '2024-01-03', trend: '-3%' }
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'John Kamau', email: 'john@example.com', tier: 'Free', quotesUsed: 2, lastActive: '2024-01-05' },
    { id: 2, name: 'Mary Wanjiku', email: 'mary@example.com', tier: 'Intermediate', quotesUsed: 12, lastActive: '2024-01-05' },
    { id: 3, name: 'David Mutua', email: 'david@example.com', tier: 'Premium', quotesUsed: 25, lastActive: '2024-01-04' },
    { id: 4, name: 'Sarah Achieng', email: 'sarah@example.com', tier: 'Free', quotesUsed: 3, lastActive: '2024-01-03' }
  ]);

  const [regions] = useState([
    { name: 'Nairobi', multiplier: 1.2, color: 'bg-red-100 text-red-800' },
    { name: 'Mombasa', multiplier: 1.15, color: 'bg-orange-100 text-orange-800' },
    { name: 'Kisumu', multiplier: 1.05, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Nakuru', multiplier: 1.0, color: 'bg-green-100 text-green-800' },
    { name: 'Eldoret', multiplier: 0.95, color: 'bg-blue-100 text-blue-800' }
  ]);

  const stats = [
    { title: 'Total Users', value: '1,247', change: '+23', icon: <Users className="w-5 h-5" /> },
    { title: 'Active Subscriptions', value: '234', change: '+12', icon: <UserCheck className="w-5 h-5" /> },
    { title: 'Monthly Revenue', value: 'KSh 585,000', change: '+8%', icon: <DollarSign className="w-5 h-5" /> },
    { title: 'Price Alerts', value: '3', change: 'Active', icon: <AlertTriangle className="w-5 h-5" /> }
  ];

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
              <Badge variant="outline" className="ml-4 text-red-600 border-red-600">
                ADMIN
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, pricing, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Material Pricing</span>
                  <Button size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Bulk Update
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{material.name}</h4>
                        <p className="text-sm text-gray-600">Last updated: {material.lastUpdated}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={
                          material.trend.startsWith('+') 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }>
                          {material.trend}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`price-${material.id}`} className="text-sm">KSh</Label>
                          <Input
                            id={`price-${material.id}`}
                            type="number"
                            value={material.basePrice}
                            onChange={(e) => {
                              const newPrice = parseInt(e.target.value);
                              setMaterials(materials.map(m => 
                                m.id === material.id ? { ...m, basePrice: newPrice } : m
                              ));
                            }}
                            className="w-32"
                          />
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          {user.quotesUsed} quotes used • Last active: {user.lastActive}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getTierBadge(user.tier)}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTier(user.id, 'Free')}
                            className={user.tier === 'Free' ? 'bg-gray-100' : ''}
                          >
                            Free
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTier(user.id, 'Intermediate')}
                            className={user.tier === 'Intermediate' ? 'bg-blue-100' : ''}
                          >
                            Int.
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTier(user.id, 'Premium')}
                            className={user.tier === 'Premium' ? 'bg-purple-100' : ''}
                          >
                            Prem.
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regional Pricing */}
          <TabsContent value="regions">
            <Card>
              <CardHeader>
                <CardTitle>Regional Price Multipliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regions.map((region, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{region.name}</h4>
                        <Badge className={region.color}>
                          {region.multiplier > 1 ? '+' : ''}{((region.multiplier - 1) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Multiplier:</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={region.multiplier}
                          className="w-24"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Price Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-red-900">Steel Bars Price Spike</h4>
                        <p className="text-red-700 text-sm">Price increased by 15% in the last week</p>
                        <p className="text-red-600 text-xs mt-1">Triggered: Jan 5, 2024</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">HIGH</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-yellow-900">Cement Price Increase</h4>
                        <p className="text-yellow-700 text-sm">Price increased by 5% this month</p>
                        <p className="text-yellow-600 text-xs mt-1">Triggered: Jan 3, 2024</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900">Ballast Price Drop</h4>
                        <p className="text-green-700 text-sm">Price decreased by 3% this week</p>
                        <p className="text-green-600 text-xs mt-1">Triggered: Jan 2, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">LOW</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
