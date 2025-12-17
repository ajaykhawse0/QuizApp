import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Format local datetime WITHOUT converting to UTC
const formatLocalDateTime = (date) => {
  const pad = (n) => (n < 10 ? "0" + n : n);

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
};

export default function DateTimePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);

  const dateValue = value ? new Date(value) : null;

  // When date is selected in the calendar
  const handleDateSelect = (date) => {
    if (!dateValue) {
      // If no time yet, default to 00:00
      onChange(formatLocalDateTime(date));
      return;
    }

    const updated = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      dateValue.getHours(),
      dateValue.getMinutes()
    );

    onChange(formatLocalDateTime(updated));
    setOpen(false);
  };

  // When time is selected
  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);

    if (!dateValue) return;

    const updated = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate(),
      hours,
      minutes
    );

    onChange(formatLocalDateTime(updated));
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <CalendarIcon className="h-4 w-4 text-indigo-500" />
        {label}
      </label>

      {/* Date Picker Input */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex justify-between items-center px-4 py-2 text-left rounded-lg border",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              "border-gray-300 dark:border-gray-600",
              "hover:border-indigo-500 transition-all"
            )}
          >
            {dateValue ? format(dateValue, "PPP") : "Select date"}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleDateSelect}
            className="rounded-md border shadow-md"
          />
        </PopoverContent>
      </Popover>

      {/* Time Picker Input */}
      <input
        type="time"
        value={dateValue ? format(dateValue, "HH:mm") : ""}
        onChange={handleTimeChange}
        className="
          w-full px-4 py-2 rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border border-gray-300 dark:border-gray-600
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-all
        "
      />
    </div>
  );
}
