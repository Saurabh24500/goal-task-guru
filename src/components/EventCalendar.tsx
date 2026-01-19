import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { getAllEvents, getEventsForDate, getUpcomingEvents, Event } from '@/data/gujaratEvents';

const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const allEvents = getAllEvents();
  const upcomingEvents = getUpcomingEvents(5);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Get dates that have events
  const eventDates = allEvents.map(e => new Date(e.date));

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'festival': return 'bg-primary/20 text-primary border-primary/30';
      case 'national': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'regional': return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  const getEventTypeDot = (type: Event['type']) => {
    switch (type) {
      case 'festival': return 'bg-primary';
      case 'national': return 'bg-secondary';
      case 'regional': return 'bg-accent';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 gradient-warm rounded-lg">
          <MapPin className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground">Gujarat Calendar</h2>
          <p className="text-sm text-muted-foreground">Festivals & Events</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-lg border border-border p-3"
            modifiers={{
              hasEvent: eventDates,
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                textDecorationColor: 'hsl(var(--primary))',
                textUnderlineOffset: '4px',
              }
            }}
          />
          
          {/* Selected Date Events */}
          {selectedDateEvents.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">
                {selectedDate?.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
              </h4>
              <div className="space-y-2">
                {selectedDateEvents.map((event, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg border ${getEventTypeColor(event.type)}`}>
                    <span className="text-sm font-medium">{event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="lg:w-64">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Upcoming Events</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${getEventTypeDot(event.type)}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(event.date).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-muted-foreground mb-3">Event Types</h4>
            <div className="space-y-2">
              {[
                { type: 'festival' as const, label: 'Festivals' },
                { type: 'national' as const, label: 'National Holidays' },
                { type: 'regional' as const, label: 'Gujarat Special' },
              ].map(({ type, label }) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getEventTypeDot(type)}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
