
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/contexts/AuthContext';
import ProjectProgress from '@/components/ProjectProgress';
import PDFGenerator from '@/components/PDFGenerator';
import { Search, Eye, FileText, TrendingUp } from 'lucide-react';

const ViewAllQuotes = () => {
  const { quotes, loading } = useQuotes();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'started':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Quotes</h1>
          <p className="text-muted-foreground">Manage and track all your construction quotes</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search quotes by title or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="started">Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No quotes found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="gradient-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{quote.title}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Client: {quote.client_name}</span>
                      <span>Location: {quote.location}</span>
                      <span>Created: {new Date(quote.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        KSh {(quote.total_amount / 100).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Materials</div>
                    <div className="text-lg font-semibold">
                      KSh {(quote.materials_cost / 100).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Labor</div>
                    <div className="text-lg font-semibold">
                      KSh {(quote.labor_cost / 100).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Add-ons</div>
                    <div className="text-lg font-semibold">
                      KSh {(quote.addons_cost / 100).toLocaleString()}
                    </div>
                  </div>
                </div>

                {quote.custom_specs && (
                  <div className="mb-6 p-4 bg-background/30 rounded-lg">
                    <h4 className="font-medium mb-2">Custom Specifications</h4>
                    <p className="text-sm text-muted-foreground">{quote.custom_specs}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Quote Details - {quote.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>Client:</strong> {quote.client_name}
                          </div>
                          <div>
                            <strong>Email:</strong> {quote.client_email || 'Not provided'}
                          </div>
                          <div>
                            <strong>Location:</strong> {quote.location}
                          </div>
                          <div>
                            <strong>Region:</strong> {quote.region}
                          </div>
                          <div>
                            <strong>Project Type:</strong> {quote.project_type}
                          </div>
                          <div>
                            <strong>Status:</strong> 
                            <Badge className={`ml-2 ${getStatusColor(quote.status)}`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {/* Materials breakdown */}
                        {quote.materials && quote.materials.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Materials</h4>
                            <div className="space-y-2">
                              {quote.materials.map((material: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded">
                                  <div>
                                    <span className="font-medium">{material.name}</span>
                                    <span className="text-muted-foreground ml-2">
                                      ({material.quantity} {material.unit})
                                    </span>
                                  </div>
                                  <span className="font-semibold">
                                    KSh {((material.total_price || 0) / 100).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Equipment breakdown */}
                        {quote.selected_equipment && quote.selected_equipment.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Equipment</h4>
                            <div className="space-y-2">
                              {quote.selected_equipment.map((equipment: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded">
                                  <span className="font-medium">{equipment.name || `Equipment ${index + 1}`}</span>
                                  <span className="font-semibold">
                                    KSh {((equipment.total_cost || 0) / 100).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Progress
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <ProjectProgress 
                        quoteId={quote.id} 
                        quoteName={quote.title}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <PDFGenerator
                        quote={quote}
                        contractorName={profile?.name || 'Contractor'}
                        contractorCompany={profile?.company}
                        contractorPhone={profile?.phone}
                        contractorEmail={profile?.email}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAllQuotes;
