export interface Event {
  date: string;
  name: string;
  type: 'festival' | 'national' | 'regional';
}

export const gujaratEvents2025: Event[] = [
  { date: "2025-01-14", name: "Makar Sankranti / Uttarayan", type: "festival" },
  { date: "2025-01-26", name: "Republic Day", type: "national" },
  { date: "2025-02-26", name: "Maha Shivaratri", type: "festival" },
  { date: "2025-03-14", name: "Holi", type: "festival" },
  { date: "2025-03-30", name: "Ugadi / Gudi Padwa", type: "festival" },
  { date: "2025-04-06", name: "Ram Navami", type: "festival" },
  { date: "2025-04-10", name: "Mahavir Jayanti", type: "festival" },
  { date: "2025-04-14", name: "Ambedkar Jayanti", type: "national" },
  { date: "2025-04-18", name: "Good Friday", type: "festival" },
  { date: "2025-05-01", name: "Gujarat Day / Labour Day", type: "regional" },
  { date: "2025-05-12", name: "Buddha Purnima", type: "festival" },
  { date: "2025-06-07", name: "Rath Yatra", type: "festival" },
  { date: "2025-07-06", name: "Ashadhi Bij", type: "regional" },
  { date: "2025-07-10", name: "Guru Purnima", type: "festival" },
  { date: "2025-08-09", name: "Nag Panchami", type: "festival" },
  { date: "2025-08-15", name: "Independence Day", type: "national" },
  { date: "2025-08-16", name: "Raksha Bandhan", type: "festival" },
  { date: "2025-08-23", name: "Janmashtami", type: "festival" },
  { date: "2025-08-27", name: "Ganesh Chaturthi", type: "festival" },
  { date: "2025-10-01", name: "Navratri Begins", type: "festival" },
  { date: "2025-10-02", name: "Gandhi Jayanti", type: "national" },
  { date: "2025-10-12", name: "Dussehra", type: "festival" },
  { date: "2025-10-20", name: "Diwali", type: "festival" },
  { date: "2025-10-21", name: "Govardhan Puja", type: "festival" },
  { date: "2025-10-22", name: "Bhai Dooj", type: "festival" },
  { date: "2025-10-24", name: "Labh Pancham", type: "regional" },
  { date: "2025-11-01", name: "Sardar Patel Jayanti", type: "regional" },
  { date: "2025-11-05", name: "Dev Diwali", type: "festival" },
  { date: "2025-12-25", name: "Christmas", type: "festival" },
];

export const gujaratEvents2026: Event[] = [
  { date: "2026-01-14", name: "Makar Sankranti / Uttarayan", type: "festival" },
  { date: "2026-01-26", name: "Republic Day", type: "national" },
  { date: "2026-02-15", name: "Maha Shivaratri", type: "festival" },
  { date: "2026-03-03", name: "Holi", type: "festival" },
  { date: "2026-03-19", name: "Ugadi / Gudi Padwa", type: "festival" },
  { date: "2026-03-26", name: "Ram Navami", type: "festival" },
  { date: "2026-04-03", name: "Good Friday", type: "festival" },
  { date: "2026-04-14", name: "Ambedkar Jayanti", type: "national" },
  { date: "2026-05-01", name: "Gujarat Day / Labour Day", type: "regional" },
  { date: "2026-05-31", name: "Buddha Purnima", type: "festival" },
  { date: "2026-06-25", name: "Rath Yatra", type: "festival" },
  { date: "2026-07-29", name: "Guru Purnima", type: "festival" },
  { date: "2026-08-15", name: "Independence Day", type: "national" },
  { date: "2026-08-05", name: "Raksha Bandhan", type: "festival" },
  { date: "2026-08-12", name: "Janmashtami", type: "festival" },
  { date: "2026-08-16", name: "Ganesh Chaturthi", type: "festival" },
  { date: "2026-09-19", name: "Navratri Begins", type: "festival" },
  { date: "2026-10-02", name: "Gandhi Jayanti / Dussehra", type: "national" },
  { date: "2026-10-09", name: "Diwali", type: "festival" },
  { date: "2026-10-10", name: "Govardhan Puja", type: "festival" },
  { date: "2026-10-11", name: "Bhai Dooj", type: "festival" },
  { date: "2026-11-01", name: "Sardar Patel Jayanti", type: "regional" },
  { date: "2026-12-25", name: "Christmas", type: "festival" },
];

export const getEventsForDate = (date: Date): Event[] => {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const events = year === 2025 ? gujaratEvents2025 : gujaratEvents2026;
  return events.filter(e => e.date === dateStr);
};

export const getUpcomingEvents = (count: number = 5): Event[] => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const year = today.getFullYear();
  const events = year === 2025 ? gujaratEvents2025 : gujaratEvents2026;
  
  return events
    .filter(e => e.date >= todayStr)
    .slice(0, count);
};

export const getAllEvents = (): Event[] => {
  const today = new Date();
  const year = today.getFullYear();
  return year === 2025 ? gujaratEvents2025 : gujaratEvents2026;
};
