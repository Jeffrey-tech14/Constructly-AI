
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calculator as CalculatorIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';
import Calculator from '@/components/Calculator';
import Reports from '@/components/Reports';
import Calendar from '@/components/Calendar';
import DashboardSettings from '@/components/DashboardSettings';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { quotes } = useQuotes();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  const stats = {
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    approvedQuotes: quotes.filter(q => q.status === 'approved').length,
    totalRevenue: quotes
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + q.total_amount, 0)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.name || user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedQuotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {(stats.totalRevenue / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{quote.title}</p>
                      <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KSh {(quote.total_amount / 100).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground capitalize">{quote.status}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Quote Success Rate</span>
                    <span className="font-medium">
                      {stats.totalQuotes > 0 
                        ? Math.round((stats.approvedQuotes / stats.totalQuotes) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Quote Value</span>
                    <span className="font-medium">
                      KSh {stats.totalQuotes > 0 
                        ? Math.round(stats.totalRevenue / stats.totalQuotes / 100).toLocaleString()
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Projects</span>
                    <span className="font-medium">{profile?.total_projects || 0}</span>
                  </div>
                  <Button 
                    onClick={() => setIsCalculatorOpen(true)}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    <CalculatorIcon className="w-4 h-4 mr-2" />
                    Quick Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Construction Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full"
              >
                <CalculatorIcon className="w-4 h-4 mr-2" />
                Open Calculator
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Reports />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Calendar />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <DashboardSettings />
        </TabsContent>
      </Tabs>

      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
