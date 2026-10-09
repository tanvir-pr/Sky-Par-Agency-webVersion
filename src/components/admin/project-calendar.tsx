"use client";

import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface ProjectCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface ProjectCalendarProps {
  events: ProjectCalendarEvent[];
  defaultView?: View;
}

export function ProjectCalendar({ events, defaultView = "month" }: ProjectCalendarProps) {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={["month", "week", "day", "agenda"]}
      defaultView={defaultView}
      popup
      style={{ height: "100%" }}
    />
  );
}
