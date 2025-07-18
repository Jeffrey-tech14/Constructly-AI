import { useState , useEffect} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProjectProgress from '@/components/ProjectProgress';
import { Search, Eye, FileText, TrendingUp, Building2, MapPin, Calendar, Trash2 } from 'lucide-react';
import { QuoteExportDialog } from '@/components/QuoteExportDialog';

const ViewAllQuotes = () => {
  const { quotes, loading, deleteQuote } = useQuotes();
  const { profile } = useAuth(); 
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [deletingQuote, setDeletingQuote] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
    useEffect(() => {
      if (!sessionStorage.getItem('profile_reloaded')) {
        sessionStorage.setItem('profile_reloaded', 'true');
        window.location.reload();
      }
    }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'planning':
        return 'bg-puple-600 text-purple-800 hover:bg-purple-200';
      case 'started':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'on_hold':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

   const filteredQuotes = quotes.filter(quote => {
    const belongsToUser = quote.user_id === profile?.id;
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return belongsToUser && matchesSearch && matchesStatus;
  });

  const handleDeleteQuote = async (quoteId: string, quoteTitle: string) => {
  setDeletingQuote(quoteId);
  try {
    const success = await deleteQuote(quoteId);
    
    if (success) {
      toast({
        title: "Quote Deleted",
        description: `"${quoteTitle}" has been deleted successfully.`,
      });
    } else {
      throw new Error("Failed to delete quote");
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete quote",
      variant: "destructive",
    });
    // Re-fetch quotes to ensure consistency
  } finally {
    setDeletingQuote(null);
  }
};
const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toString();
};


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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950'>
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Building2 className="w-8 h-8 text-primary" />
            All Construction Quotes
          </h1>
          <p className="text-muted-foreground mt-2">Manage and track all your construction quotes with ease</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Badge variant="secondary" className="px-3 py-1 text-black">
            Total: {filteredQuotes.length}
          </Badge>
        </div>
      </div>

      <Card className="gradient-card mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search quotes by title or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredQuotes.length === 0 ? (
          <Card className="gradient-card">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No quotes found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter settings.</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="gradient-card card-hover">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      {quote.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Client:</span> {quote.client_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {quote.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(quote.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        KSh {(formatCurrency(quote.total_amount).toLocaleString())}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-background/50">
                    <CardContent className="text-center p-4">
                      <div className="text-sm text-muted-foreground mb-1">Materials</div>
                      <div className="text-lg font-semibold text-green-600">
                        KSh {(formatCurrency(quote.materials_cost).toLocaleString())}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50">
                    <CardContent className="text-center p-4">
                      <div className="text-sm text-muted-foreground mb-1">Labor</div>
                      <div className="text-lg font-semibold text-blue-600">
                        KSh {(formatCurrency(quote.labor_cost).toLocaleString())}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50">
                    <CardContent className="text-center p-4">
                      <div className="text-sm text-muted-foreground mb-1">Add-ons</div>
                      <div className="text-lg font-semibold text-purple-600">
                        KSh {(formatCurrency(quote.addons_cost).toLocaleString())}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {quote.custom_specs && (
                  <Card className="bg-background/30 mb-6">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Custom Specifications</h4>
                      <p className="text-sm text-muted-foreground">{quote.custom_specs}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 sm:flex-none"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Quote Details - {quote.title}
                        </DialogTitle>
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
                                    KSh {(formatCurrency((material.total_price || 0)).toLocaleString())}
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
                                    KSh {(formatCurrency((equipment.total_cost || 0)).toLocaleString())}
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
                      <Button variant="outline" size="sm" className=" flex-1 sm:flex-none">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Progress
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                    <DialogTitle>
                    </DialogTitle>
                      <ProjectProgress 
                        quoteId={quote.id} 
                        quoteName={quote.title}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTitle>
                    </DialogTitle>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setShowExportDialog(true)} className="text-white flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                        <FileText className="w-4 h-4 mr-2 text-white" />
                        Generate PDF
                      </Button>
                    </DialogTrigger>
                      <QuoteExportDialog
                        open={showExportDialog}
                        onOpenChange={setShowExportDialog}
                        quote={quote}
                      />
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingQuote === quote.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingQuote === quote.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{quote.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteQuote(quote.id, quote.title)}
                          className="bg-red-600 hover:bg-red-200 hover:text-red-800 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </div>
  );
};

export default ViewAllQuotes;