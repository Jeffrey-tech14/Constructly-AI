
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuotes } from '@/hooks/useQuotes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'milestone' | 'project_start' | 'project_end';
  quote_id: string;
  location?: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const { quotes } = useQuotes();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchCalendarEvents();
  }, [user, currentDate]);

  const fetchCalendarEvents = async () => {
    if (!user) return;

    try {
      // Create project events from quotes
      const projectEvents: CalendarEvent[] = quotes
        .filter(quote => quote.status === 'started' || quote.status === 'in_progress' || quote.status === 'completed')
        .map(quote => ({
          id: `start-${quote.id}`,
          title: `${quote.title} - Start`,
          date: quote.created_at.split('T')[0],
          type: 'project_start' as const,
          quote_id: quote.id,
          location: quote.location
        }));

      setEvents(projectEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'project_start':
        return 'bg-green-100 text-green-800';
      case 'project_end':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Project Calendar
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold min-w-48 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div
                key={index}
                className={`p-2 min-h-24 border border-gray-200 dark:border-gray-700 ${
                  day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                } ${
                  selectedDate && day && day.toDateString() === selectedDate.toDateString()
                    ? 'bg-primary/10 border-primary'
                    : ''
                }`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium mb-1">
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getEventsForDate(day).slice(0, 2).map(event => (
                        <Badge
                          key={event.id}
                          className={`text-xs px-1 py-0 ${getEventColor(event.type)}`}
                        >
                          {event.title.substring(0, 10)}...
                        </Badge>
                      ))}
                      {getEventsForDate(day).length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{getEventsForDate(day).length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      {selectedDate && (
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>
              Events for {selectedDate.toDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-muted-foreground">No events scheduled for this date.</p>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map(event => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          {event.location && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={getEventColor(event.type)}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter(event => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getEventColor(event.type)}>
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            {events.filter(event => new Date(event.date) >= new Date()).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
