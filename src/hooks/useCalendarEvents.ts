import { useState, useEffect } from "react";

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  isCustom: boolean;
}

const STORAGE_KEY = "cmjh-custom-calendar-events";

export function useCalendarEvents() {
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load custom calendar events:", error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customEvents));
    } catch (error) {
      console.error("Failed to save custom calendar events:", error);
    }
  }, [customEvents]);

  const addEvent = (date: string, title: string) => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      date,
      title,
      isCustom: true,
    };
    setCustomEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (id: string, date: string, title: string) => {
    setCustomEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, date, title } : event))
    );
  };

  const deleteEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const resetToDefault = () => {
    setCustomEvents([]);
  };

  // 將自訂事件按月份分組
  const getCustomEventsByMonth = (): Record<string, CalendarEvent[]> => {
    const grouped: Record<string, CalendarEvent[]> = {};
    customEvents.forEach((event) => {
      const monthKey = event.date.substring(0, 7); // "YYYY-MM"
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    return grouped;
  };

  return {
    customEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    resetToDefault,
    getCustomEventsByMonth,
  };
}

