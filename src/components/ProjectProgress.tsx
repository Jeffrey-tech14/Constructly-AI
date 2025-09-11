import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Pencil,
} from "lucide-react";
import { useLocation } from "react-router-dom";

interface ProjectProgressProps {
  quoteId: string;
  quoteName: string;
}

interface ProjectProgressData {
  id?: string;
  status:
    | "draft"
    | "planning"
    | "started"
    | "in_progress"
    | "completed"
    | "on_hold";
  progress_percentage: number;
  notes?: string;
  milestone_date?: string;
}

const ProjectProgress = ({ quoteId, quoteName }: ProjectProgressProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [progressData, setProgressData] = useState<ProjectProgressData>({
    status: "planning",
    progress_percentage: 0,
    notes: "",
    milestone_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProjectProgress();
  }, [quoteId, user, location.key]);

  const fetchProjectProgress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("progress_percentage, progress_notes, milestone_date, status")
        .eq("id", quoteId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching quote progress:", error);
        return;
      }

      if (data) {
        setProgressData({
          status: data.status as
            | "draft"
            | "planning"
            | "started"
            | "in_progress"
            | "completed"
            | "on_hold",
          progress_percentage: data.progress_percentage || 0,
          notes: data.progress_notes || "",
          milestone_date: data.milestone_date || "",
        });
      }
    } catch (error) {
      console.error("Error fetching project progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const updateData = {
        status: progressData.status,
        progress_percentage: progressData.progress_percentage,
        progress_notes: progressData.notes || null,
        milestone_date: progressData.milestone_date || null,
      };

      const { error } = await supabase
        .from("quotes")
        .update(updateData)
        .eq("id", quoteId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating progress:", error);
        toast({
          title: "Update Failed",
          description: "Failed to update project progress",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Progress Updated",
        description: "Project progress has been updated successfully",
      });
      fetchProjectProgress();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update project progress",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Pencil className="w-4 h-4" />;
      case "planning":
        return <Calendar className="w-4 h-4" />;
      case "started":
        return <Play className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "on_hold":
        return <Pause className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "hover:bg-gray-100 bg-gray-100 text-gray-800";
      case "planning":
        return "hover:bg-purple-100 bg-purple-100 text-purple-800";
      case "started":
        return "hover:bg-blue-100 bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "completed":
        return "hover:bg-green-100 bg-green-100 text-green-800";
      case "on_hold":
        return "hover:bg-red-100 bg-red-100 text-red-800";
      default:
        return "hover:bg-gray-100 bg-gray-100 text-gray-800";
    }
  };

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case "draft":
        return "hover:bg-gray-800 bg-gray-800";
      case "planning":
        return "hover:bg-purple-800 bg-purple-800";
      case "started":
        return "hover:bg-blue-800 bg-blue-800";
      case "in_progress":
        return "hover:bg-amber-800 bg-amber-800";
      case "completed":
        return "hover:bg-green-800 bg-green-800";
      case "on_hold":
        return "hover:bg-red-800 bg-red-800";
      default:
        return "hover:bg-gray-800 bg-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className="bg-transparent">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"></div>
          <p className="text-white mt-2">Loading project progress...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-white">Project Progress - {quoteName}</span>
          <Badge className={getStatusColor(progressData.status)}>
            {getStatusIcon(progressData.status)}
            <span className="ml-1 capitalize">
              {progressData.status.replace("_", " ")}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-white">Progress Percentage</Label>
            <span
              className={`sm:text-2xl text-lg font-bold hover:bg-transparent ${getStatusColor(
                progressData.status
              )} bg-transparent`}
            >
              {progressData.progress_percentage}%
            </span>
          </div>
          <Progress
            indicatorColor={`${getIndicatorColor(progressData.status)} `}
            value={progressData.progress_percentage}
            className="w-full h-3 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white" htmlFor="status">
              Project Status
            </Label>
            <Select
              value={progressData.status}
              onValueChange={(value: any) =>
                setProgressData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white" htmlFor="percentage">
              Progress Percentage
            </Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              value={progressData.progress_percentage}
              onChange={(e) =>
                setProgressData((prev) => ({
                  ...prev,
                  progress_percentage: Math.min(
                    100,
                    Math.max(0, parseInt(e.target.value) || 0)
                  ),
                }))
              }
            />
          </div>
        </div>

        <div>
          <Label className="text-white" htmlFor="milestone">
            Next Milestone Date
          </Label>
          <Input
            id="milestone"
            type="date"
            value={progressData.milestone_date}
            onChange={(e) =>
              setProgressData((prev) => ({
                ...prev,
                milestone_date: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label className="text-white" htmlFor="notes">
            Progress Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Add notes about current progress, challenges, or next steps..."
            value={progressData.notes}
            onChange={(e) =>
              setProgressData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={4}
          />
        </div>

        <Button
          onClick={updateProgress}
          disabled={updating}
          className="w-full text-white"
        >
          {updating ? "Updating..." : "Update Progress"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectProgress;
