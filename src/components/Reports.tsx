
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText,
  Calendar,
  MapPin,
  Download,
  Filter
} from 'lucide-react';

interface ReportData {
  totalRevenue: number;
  totalQuotes: number;
  averageQuoteValue: number;
  completionRate: number;
  monthlyRevenue: { month: string; revenue: number }[];
  regionBreakdown: { region: string; count: number; revenue: number }[];
  projectTypeBreakdown: { type: string; count: number }[];
}

const Reports = () => {
  const { quotes } = useQuotes();
  const { profile } = useAuth();
  const [timeframe, setTimeframe] = useState('3_months');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    generateReportData();
  }, [quotes, timeframe]);

  const generateReportData = () => {
    if (!quotes.length) return;

    const now = new Date();
    const filterDate = new Date();
    
    switch (timeframe) {
      case '1_month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3_months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6_months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1_year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredQuotes = quotes.filter(quote => 
      new Date(quote.created_at) >= filterDate
    );

    const totalRevenue = filteredQuotes.reduce((sum, quote) => sum + quote.total_amount, 0);
    const totalQuotes = filteredQuotes.length;
    const averageQuoteValue = totalQuotes > 0 ? totalRevenue / totalQuotes : 0;
    const completedQuotes = filteredQuotes.filter(q => q.status === 'completed').length;
    const completionRate = totalQuotes > 0 ? (completedQuotes / totalQuotes) * 100 : 0;

    // Monthly revenue breakdown
    const monthlyRevenue: { [key: string]: number } = {};
    filteredQuotes.forEach(quote => {
      const month = new Date(quote.created_at).toISOString().substring(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + quote.total_amount;
    });

    const monthlyRevenueArray = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Region breakdown
    const regionBreakdown: { [key: string]: { count: number; revenue: number } } = {};
    filteredQuotes.forEach(quote => {
      if (!regionBreakdown[quote.region]) {
        regionBreakdown[quote.region] = { count: 0, revenue: 0 };
      }
      regionBreakdown[quote.region].count++;
      regionBreakdown[quote.region].revenue += quote.total_amount;
    });

    const regionBreakdownArray = Object.entries(regionBreakdown)
      .map(([region, data]) => ({ region, ...data }));

    // Project type breakdown
    const projectTypeBreakdown: { [key: string]: number } = {};
    filteredQuotes.forEach(quote => {
      const type = quote.house_type || quote.project_type || 'Other';
      projectTypeBreakdown[type] = (projectTypeBreakdown[type] || 0) + 1;
    });

    const projectTypeBreakdownArray = Object.entries(projectTypeBreakdown)
      .map(([type, count]) => ({ type, count }));

    setReportData({
      totalRevenue,
      totalQuotes,
      averageQuoteValue,
      completionRate,
      monthlyRevenue: monthlyRevenueArray,
      regionBreakdown: regionBreakdownArray,
      projectTypeBreakdown: projectTypeBreakdownArray
    });
  };

  const exportReport = () => {
    // In a real implementation, this would generate and download a PDF/Excel report
    const reportContent = {
      timeframe,
      generatedAt: new Date().toISOString(),
      data: reportData
    };
    
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction-report-${timeframe}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Reports</h2>
          <p className="text-muted-foreground">Analyze your construction business performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month">Last Month</SelectItem>
              <SelectItem value="3_months">Last 3 Months</SelectItem>
              <SelectItem value="6_months">Last 6 Months</SelectItem>
              <SelectItem value="1_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {(reportData.totalRevenue / 100).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {reportData.totalQuotes} quotes
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quote Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {(reportData.averageQuoteValue / 100).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per project
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Projects completed
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Date(item.month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(item.revenue / Math.max(...reportData.monthlyRevenue.map(r => r.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      KSh {(item.revenue / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.regionBreakdown.map((item) => (
                <div key={item.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {item.region}
                    </span>
                    <Badge variant="secondary">
                      {item.count} projects
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(item.revenue / Math.max(...reportData.regionBreakdown.map(r => r.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span>KSh {(item.revenue / 100).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Types */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Project Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportData.projectTypeBreakdown.map((item) => (
              <Card key={item.type} className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{item.count}</div>
                <div className="text-sm text-muted-foreground capitalize">{item.type}</div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Recent Quote Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.slice(0, 5).map((quote) => (
              <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{quote.title}</h4>
                    <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    KSh {(quote.total_amount / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
