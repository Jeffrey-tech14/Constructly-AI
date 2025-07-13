
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuotes } from '@/hooks/useQuotes';
import { useClientReviews } from '@/hooks/useClientReviews';
import { TrendingUp, DollarSign, FileText, CheckCircle, Star } from 'lucide-react';
import { useMemo } from 'react';

const Reports = () => {
  const { quotes } = useQuotes();
  const { reviews, averageRating } = useClientReviews();

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return value.toString();
  };

  // Calculate monthly data from actual quotes
  const monthlyData = useMemo(() => {
    const monthlyStats: { [key: string]: { quotes: number; revenue: number } } = {};
    
    quotes.forEach(quote => {
      const date = new Date(quote.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { quotes: 0, revenue: 0 };
      }
      
      monthlyStats[monthKey].quotes += 1;
      if (quote.status !== 'draft') {
        monthlyStats[monthKey].revenue += quote.total_amount;
      }
    });

    return Object.entries(monthlyStats)
      .map(([name, stats]) => ({
        name,
        quotes: stats.quotes,
        revenue: stats.revenue // Convert from cents
      }))
      .slice(-6); // Last 6 months
  }, [quotes]);

  const statusData = useMemo(() => {
    const statusCounts = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const colors = {
      approved: '#10b981',
      completed: '#059669',
      in_progress: '#3b82f6',
      started: '#6366f1',
      pending: '#f59e0b',
      draft: '#6b7280',
      rejected: '#ef4444'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [quotes]);

  const activeProjects = quotes.filter(q => ['started', 'in_progress'].includes(q.status));
  const completedProjects = quotes.filter(q => q.status === 'completed');
  const totalRevenue = quotes
    .filter(q => q.status !== 'draft')
    .reduce((sum, q) => sum + q.total_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{quotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  KSh {(formatCurrency(totalRevenue)).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedProjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`KSh ${formatCurrency(Number(value)).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {monthlyData.length > 0 && (
          <Card className="gradient-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Quote Generation Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="quotes" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {reviews.length > 0 && (
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Recent Client Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{review.client_name}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
