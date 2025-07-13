import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, TrendingUp, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';


const QuotesTab = ({ refreshKey }: { refreshKey: number }) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
    const { data, error } = await supabase
        .from('quotes_with_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Error', description: 'Failed to fetch quotes', variant: 'destructive' });
      } else {
        setQuotes(data || []);
      }
      setLoading(false);
    };

    fetchQuotes();
  }, [refreshKey]);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.profile.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className='gradient-card'>
      <CardHeader>
        <CardTitle>All Quotes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by Status" />
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

        {filteredQuotes.length === 0 && (
          <p className="text-center text-muted-foreground">No quotes found</p>
        )}

        {filteredQuotes.map((quote) => (
          <div key={quote.id} className="border rounded p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Quote #{quote.id}</p>
                <p className="text-sm text-muted-foreground">
                   Contractor: {quote.profile?.name || 'Unknown'}
                </p>
                <p>Contractor: {quote.profile?.name || 'Unknown'}</p>
                <p>Email: {quote.profile?.email || 'N/A'}</p>

                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {new Date(quote.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Status: {quote.status}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">KSh {formatCurrency(quote.total_amount).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Progress: {quote.progress_percentage || 0}%
              </p>
              <Progress value={quote.progress_percentage  || 0} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuotesTab;
