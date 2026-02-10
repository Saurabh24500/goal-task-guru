import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { getAllEvents, getEventsForDate, getUpcomingEvents, Event, addUserEvent } from '@/data/gujaratEvents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [allEvents, setAllEvents] = useState<Event[]>(() => getAllEvents());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setAllEvents(getAllEvents());
  }, [refreshKey]);

  const upcomingEvents = getUpcomingEvents(5);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Get dates that have events
  const eventDates = allEvents.map(e => new Date(e.date));

  // Build modifiers per color (for user events) so days can be styled by chosen color
  const colorMap = new Map<string, Date[]>();
  allEvents.forEach(ev => {
    if (ev.color) {
      const key = `c_${ev.color.replace('#', '')}`;
      const arr = colorMap.get(key) || [];
      arr.push(new Date(ev.date));
      colorMap.set(key, arr);
    }
  });

  const modifiers: any = { hasEvent: eventDates };
  const modifiersStyles: any = {
    hasEvent: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      textDecorationColor: 'hsl(var(--primary))',
      textUnderlineOffset: '4px',
    }
  };

  // Add color-based modifiers/styles
  colorMap.forEach((dates, key) => {
    modifiers[key] = dates;
    const colorHex = `#${key.slice(2)}`;
    modifiersStyles[key] = {
      background: `${colorHex}20`,
      border: `1px solid ${colorHex}30`,
      color: colorHex,
    };
  });

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
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
          
          {/* Selected Date Events */}
          {selectedDateEvents.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">
                {selectedDate?.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
              </h4>
              <div className="space-y-2">
                {selectedDateEvents.map((event, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg border`} style={{ background: event.color ? `${event.color}20` : undefined, borderColor: event.color ? `${event.color}30` : undefined }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-medium">{event.name}</span>
                        {event.description && <div className="text-xs text-muted-foreground mt-1">{event.description}</div>}
                      </div>
                      <div className="ml-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: event.color || (event.type === 'festival' ? 'var(--primary)' : event.type === 'national' ? 'var(--secondary)' : 'var(--accent)') }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Add custom event form */}
          <div className="mt-4 p-4 bg-muted/60 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Add event</h4>
            <div className="space-y-2">
              <Input placeholder="Event name" value={''} onChange={() => {}} className="bg-card" aria-label="placeholder" style={{ display: 'none' }} />
              {/* We'll use controlled fields below */}
              <EventCreator selectedDate={selectedDate} onAdd={() => setRefreshKey(k => k + 1)} />
            </div>
          </div>
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

type EventCreatorProps = {
  selectedDate?: Date;
  onAdd?: () => void;
};

const EventCreator = ({ selectedDate, onAdd }: EventCreatorProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState<string>(selectedDate ? selectedDate.toISOString().split('T')[0] : '');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#f97316');

  useEffect(() => {
    if (selectedDate) setDate(selectedDate.toISOString().split('T')[0]);
  }, [selectedDate]);

  const handleAdd = () => {
    if (!name || !date) return;
    addUserEvent({ date, name, type: 'user', description, color });
    setName('');
    setDescription('');
    setColor('#f97316');
    onAdd?.();
  };

  return (
    <div className="space-y-2">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-0" />
      </div>
      <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex justify-end">
        <Button onClick={handleAdd} size="sm">Add</Button>
      </div>
    </div>
  );
};
