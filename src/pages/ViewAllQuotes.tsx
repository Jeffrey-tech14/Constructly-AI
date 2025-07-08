
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/useQuotes';
import { ProjectProgress } from '@/components/ProjectProgress';
import { PDFGenerator } from '@/components/PDFGenerator';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const ViewAllQuotes = () => {
  const { quotes, loading, deleteQuote } = useQuotes();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('quotes');

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Calendar className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'started':
        return <Play className="w-4 h-4" />;
      case 'in_progress':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'started':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await deleteQuote(id);
        toast({
          title: "Quote Deleted",
          description: "Quote has been deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete quote",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <FileText className="w-8 h-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Constructly</span>
              </Link>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your quotes, track project progress, and generate reports</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quotes">All Quotes</TabsTrigger>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="quotes" className="space-y-6">
            {filteredQuotes.length === 0 ? (
              <Card className="gradient-card">
                <CardContent className="pt-6 text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No quotes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by creating your first quote'
                    }
                  </p>
                  <Link to="/quote-builder">
                    <Button>Create New Quote</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredQuotes.map((quote) => (
                  <Card key={quote.id} className="gradient-card hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{quote.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {quote.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(quote.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm font-medium">
                          <DollarSign className="w-4 h-4 mr-2" />
                          KSh {(quote.total_amount / 100).toLocaleString()}
                        </div>
                      </div>

                      {/* House Details */}
                      {(quote.house_type || quote.bedrooms || quote.bathrooms) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          {quote.house_type && (
                            <div className="text-center">
                              <p className="text-sm font-medium">{quote.house_type}</p>
                              <p className="text-xs text-muted-foreground">House Type</p>
                            </div>
                          )}
                          {quote.bedrooms && (
                            <div className="text-center">
                              <p className="text-sm font-medium">{quote.bedrooms}</p>
                              <p className="text-xs text-muted-foreground">Bedrooms</p>
                            </div>
                          )}
                          {quote.bathrooms && (
                            <div className="text-center">
                              <p className="text-sm font-medium">{quote.bathrooms}</p>
                              <p className="text-xs text-muted-foreground">Bathrooms</p>
                            </div>
                          )}
                          {quote.total_volume && (
                            <div className="text-center">
                              <p className="text-sm font-medium">{quote.total_volume.toFixed(1)}m³</p>
                              <p className="text-xs text-muted-foreground">Volume</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <PDFGenerator 
                          quote={quote} 
                          trigger={
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          }
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {filteredQuotes.filter(q => ['started', 'in_progress'].includes(q.status)).map((quote) => (
              <div key={quote.id} className="space-y-4">
                <Card className="gradient-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{quote.title}</CardTitle>
                      <Badge className={getStatusColor(quote.status)}>
                        {getStatusIcon(quote.status)}
                        <span className="ml-1 capitalize">{quote.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {quote.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(quote.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        <DollarSign className="w-4 h-4 mr-2" />
                        KSh {(quote.total_amount / 100).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <ProjectProgress quoteId={quote.id} quoteName={quote.title} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {filteredQuotes.filter(q => q.status === 'completed').map((quote) => (
              <Card key={quote.id} className="gradient-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{quote.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {quote.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(quote.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="w-4 h-4 mr-2" />
                      KSh {(quote.total_amount / 100).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <PDFGenerator 
                      quote={quote} 
                      trigger={
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ViewAllQuotes;
