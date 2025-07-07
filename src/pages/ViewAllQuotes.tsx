
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  User,
  Wrench,
  ArrowLeft
} from 'lucide-react';

const ViewAllQuotes = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock quotes data - in real app this would come from API
  const [quotes] = useState([
    {
      id: 1,
      title: "Residential House - Nairobi",
      client: "John Kamau",
      amount: 2850000,
      status: "approved",
      date: "2024-01-05",
      location: "Nairobi",
      projectType: "Residential",
      lastModified: "2024-01-06",
      materials: { cement: 50, steel: 2, sand: 5 },
      labor: { mason: 10, carpenter: 5 }
    },
    {
      id: 2,
      title: "Office Building Extension",
      client: "Safaricom Ltd",
      amount: 4200000,
      status: "pending",
      date: "2024-01-03",
      location: "Mombasa",
      projectType: "Commercial",
      lastModified: "2024-01-04",
      materials: { cement: 80, steel: 4, sand: 8 },
      labor: { mason: 15, carpenter: 8, electrician: 5 }
    },
    {
      id: 3,
      title: "School Renovation - Kisumu",
      client: "Kisumu County",
      amount: 1650000,
      status: "draft",
      date: "2024-01-02",
      location: "Kisumu",
      projectType: "Renovation",
      lastModified: "2024-01-05",
      materials: { cement: 30, steel: 1, sand: 3 },
      labor: { mason: 8, carpenter: 3 }
    },
    {
      id: 4,
      title: "Warehouse Construction",
      client: "Kenya Distributors",
      amount: 6500000,
      status: "approved",
      date: "2023-12-28",
      location: "Nakuru",
      projectType: "Commercial",
      lastModified: "2024-01-02",
      materials: { cement: 120, steel: 8, sand: 15 },
      labor: { mason: 20, carpenter: 10, electrician: 8 }
    },
    {
      id: 5,
      title: "Apartment Complex - Phase 1",
      client: "Urban Homes Ltd",
      amount: 15800000,
      status: "pending",
      date: "2023-12-25",
      location: "Nairobi",
      projectType: "Residential",
      lastModified: "2024-01-01",
      materials: { cement: 200, steel: 15, sand: 25 },
      labor: { mason: 30, carpenter: 15, plumber: 10, electrician: 12 }
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewQuote = (quoteId: number) => {
    toast({
      title: "Opening Quote",
      description: `Loading quote #${quoteId} details...`,
    });
  };

  const handleEditQuote = (quoteId: number) => {
    toast({
      title: "Edit Quote",
      description: `Opening quote #${quoteId} for editing...`,
    });
  };

  const handleDeleteQuote = (quoteId: number) => {
    toast({
      title: "Delete Quote",
      description: `Quote #${quoteId} has been deleted.`,
      variant: "destructive"
    });
  };

  const handleDownloadPDF = (quoteId: number) => {
    toast({
      title: "Downloading PDF",
      description: `Generating PDF for quote #${quoteId}...`,
    });
  };

  // Filter and sort quotes
  const filteredQuotes = quotes
    .filter(quote => {
      const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'client':
          return a.client.localeCompare(b.client);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const totalValue = filteredQuotes.reduce((sum, quote) => sum + quote.amount, 0);
  const approvedValue = filteredQuotes
    .filter(quote => quote.status === 'approved')
    .reduce((sum, quote) => sum + quote.amount, 0);
  const approvalRate = filteredQuotes.length > 0 
    ? (filteredQuotes.filter(quote => quote.status === 'approved').length / filteredQuotes.length) * 100 
    : 0;

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
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/quotes/new">
                <Button size="sm" className='text-white'>
                  <Plus className="w-4 h-4 mr-2" />
                  New Quote
                </Button>
              </Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray">All Quotes</h1>
          <p className="text-gray-450 mt-2">Manage and track all your construction quotes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className='gradient-card'>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-450">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray">{filteredQuotes.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className='gradient-card'>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-450">Total Value</p>
                  <p className="text-2xl font-bold text-gray">KSh {(totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className='gradient-card'>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-450">Approved Value</p>
                  <p className="text-2xl font-bold text-gray">KSh {(approvedValue / 1000000).toFixed(1)}M</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className='gradient-card'>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-450">Approval Rate</p>
                  <p className="text-2xl font-bold text-gray">{Math.round(approvalRate)}%</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 gradient-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search quotes, clients, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="amount">Sort by Amount</SelectItem>
                    <SelectItem value="client">Sort by Client</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotes List */}
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow gradient-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray">{quote.title}</h3>
                      {getStatusBadge(quote.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-450">
                      <div>
                        <span className="font-medium">Client:</span> {quote.client}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {quote.location}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {quote.projectType}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(quote.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        KSh {quote.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray">
                        Modified: {new Date(quote.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewQuote(quote.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditQuote(quote.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(quote.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteQuote(quote.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredQuotes.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No quotes found</h3>
                <p className="text-gray-450 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : "You haven't created any quotes yet"
                  }
                </p>
                <Link to="/quotes/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllQuotes;
