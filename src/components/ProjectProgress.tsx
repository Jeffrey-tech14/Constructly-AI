
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CheckCircle, Clock, Play, Pause } from 'lucide-react';

interface ProjectProgressProps {
  quoteId: string;
  quoteName: string;
}

interface ProjectProgressData {
  id?: string;
  status: 'planning' | 'started' | 'in_progress' | 'completed' | 'on_hold';
  progress_percentage: number;
  notes?: string;
  milestone_date?: string;
}

const ProjectProgress = ({ quoteId, quoteName }: ProjectProgressProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<ProjectProgressData>({
    status: 'planning',
    progress_percentage: 0,
    notes: '',
    milestone_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProjectProgress();
  }, [quoteId]);

  const fetchProjectProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_progress')
        .select('*')
        .eq('quote_id', quoteId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        setProgressData({
          id: data.id,
          status: data.status,
          progress_percentage: data.progress_percentage,
          notes: data.notes || '',
          milestone_date: data.milestone_date || ''
        });
      }
    } catch (error) {
      console.error('Error fetching project progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const updateData = {
        quote_id: quoteId,
        status: progressData.status,
        progress_percentage: progressData.progress_percentage,
        notes: progressData.notes || null,
        milestone_date: progressData.milestone_date || null
      };

      let result;
      if (progressData.id) {
        // Update existing
        result = await supabase
          .from('project_progress')
          .update(updateData)
          .eq('id', progressData.id)
          .select()
          .single();
      } else {
        // Create new
        result = await supabase
          .from('project_progress')
          .insert([updateData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setProgressData(prev => ({ ...prev, id: result.data.id }));
      
      toast({
        title: "Progress Updated",
        description: "Project progress has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project progress",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Calendar className="w-4 h-4" />;
      case 'started':
        return <Play className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'on_hold':
        return <Pause className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'started':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading project progress...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Progress - {quoteName}</span>
          <Badge className={getStatusColor(progressData.status)}>
            {getStatusIcon(progressData.status)}
            <span className="ml-1 capitalize">{progressData.status.replace('_', ' ')}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Progress Percentage</Label>
            <span className="text-2xl font-bold text-primary">{progressData.progress_percentage}%</span>
          </div>
          <Progress value={progressData.progress_percentage} className="w-full h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Project Status</Label>
            <Select 
              value={progressData.status} 
              onValueChange={(value: any) => setProgressData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="percentage">Progress Percentage</Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              value={progressData.progress_percentage}
              onChange={(e) => setProgressData(prev => ({ 
                ...prev, 
                progress_percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
              }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="milestone">Next Milestone Date</Label>
          <Input
            id="milestone"
            type="date"
            value={progressData.milestone_date}
            onChange={(e) => setProgressData(prev => ({ ...prev, milestone_date: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="notes">Progress Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about current progress, challenges, or next steps..."
            value={progressData.notes}
            onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />
        </div>

        <Button 
          onClick={updateProgress} 
          disabled={updating}
          className="w-full"
        >
          {updating ? 'Updating...' : 'Update Progress'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectProgress;
