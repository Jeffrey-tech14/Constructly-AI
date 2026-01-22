// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
} from "date-fns";
import { TimePicker } from "./ui/timepicker";
const Calendar = () => {
  const { events, createEvent, deleteEvent, loading } = useCalendarEvents();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_time: "",
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    try {
      await createEvent({
        title: formData.title,
        description: formData.description,
        event_date: format(selectedDate, "yyyy-MM-dd"),
        event_time: formData.event_time || undefined,
      });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setFormData({ title: "", description: "", event_time: "" });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  // Get the days to display
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add previous month's days to fill the first week
  const firstDayOfWeek = monthStart.getDay();
  const previousMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  );
  const previousMonthEnd = endOfMonth(previousMonth);
  const daysToShow = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysToShow.push(
      new Date(
        previousMonthEnd.getFullYear(),
        previousMonthEnd.getMonth(),
        previousMonthEnd.getDate() - i
      )
    );
  }
  daysToShow.push(...daysInMonth);

  // Fill remaining days
  const remainingDays = 42 - daysToShow.length;
  for (let i = 1; i <= remainingDays; i++) {
    daysToShow.push(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i)
    );
  }

  const getEventCount = (date: Date) => {
    return events.filter(
      (event) =>
        format(new Date(event.event_date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    ).length;
  };

  const upcomingEvents = events
    .filter((event) => new Date(event.event_date) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    )
    .slice(0, 5);

  const eventsForSelectedDate = selectedDate
    ? events.filter(
        (event) =>
          format(new Date(event.event_date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
      )
    : [];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="sm:text-2xl text-lg font-bold">Calendar</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-white hover:bg-blue-500">
              <Plus className="w-4 h-4 mr-2 text-white" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <Label className="text-white" htmlFor="title">
                  Event Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label className="text-white" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white" htmlFor="time">
                  Time (optional)
                </Label>
                <TimePicker
                  value={formData.event_time}
                  onChange={(val) =>
                    setFormData({ ...formData, event_time: val })
                  }
                />
              </div>

              <div>
                <Label className="text-white">Date</Label>
                <p className="text-sm dark:text-muted-foreground text-gray-400">
                  {selectedDate
                    ? format(selectedDate, "PPP")
                    : "No date selected"}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-white" disabled={loading}>
                  Create Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Cards Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Month Navigation and Calendar Grid */}
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1
                        )
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1
                        )
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Today
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-sm text-slate-600 dark:text-slate-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar date cards */}
              <div className="grid grid-cols-7 gap-2">
                {daysToShow.map((date, index) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isTodayDate = isToday(date);
                  const eventCount = getEventCount(date);
                  const isSelected =
                    selectedDate &&
                    format(date, "yyyy-MM-dd") ===
                      format(selectedDate, "yyyy-MM-dd");

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        aspect-square p-2 rounded-lg border-2 transition-all duration-200
                        flex flex-col items-center justify-center
                        ${
                          !isCurrentMonth
                            ? "bg-slate-50 dark:glass border-slate-100 dark:border-slate-800 text-slate-400"
                            : isSelected
                            ? "bg-primary border-blue-600 text-white shadow-md scale-105"
                            : isTodayDate
                            ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white shadow-sm"
                            : "bg-white dark:bg-blue-900/10 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-400 hover:shadow-md"
                        }
                      `}
                    >
                      <span className="font-semibold text-sm">
                        {format(date, "d")}
                      </span>
                      {eventCount > 0 && (
                        <span
                          className={`
                          text-xs font-bold mt-1 px-1.5 py-0.5 rounded-full
                          ${
                            isSelected
                              ? "bg-white/30 text-white"
                              : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                          }
                        `}
                        >
                          {eventCount} {eventCount === 1 ? "event" : "events"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Events for selected date */}
          {selectedDate && eventsForSelectedDate.length > 0 && (
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <CalendarDays className="w-5 h-5 mr-2 text-blue-500" />
                  Events for {format(selectedDate, "MMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {event.title}
                        </div>
                        {event.event_time && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.event_time}
                          </div>
                        )}
                        {event.description && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {selectedDate && eventsForSelectedDate.length === 0 && (
            <Card className="border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="py-8">
                <p className="text-center text-slate-500 dark:text-slate-400">
                  No events scheduled for {format(selectedDate, "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming Events Sidebar */}
        <div>
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center mt-1">
                            <CalendarDays className="w-3 h-3 mr-1 flex-shrink-0" />
                            {format(new Date(event.event_date), "MMM d")}
                          </div>
                          {event.event_time && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center mt-0.5">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              {event.event_time}
                            </div>
                          )}
                          {event.description && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {event.description}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No upcoming events
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Calendar;
