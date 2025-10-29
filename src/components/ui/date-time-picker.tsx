import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
  className?: string;
  inputClassName?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecione data e hora",
  disabled = false,
  disableFuture = false,
  disablePast = false,
  className,
  inputClassName,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : "12:00"
  );

  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disableFuture && date > today) return true;
    if (disablePast && date < today) return true;

    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const [hours, minutes] = selectedTime.split(":");
      date.setHours(parseInt(hours), parseInt(minutes));
      onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(":");
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
      setOpen(false);
    }
  };

  const displayValue = value
    ? format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "";

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="relative"
            onClick={() => !disabled && setOpen(true)}
          >
            <Input
              value={displayValue}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              tabIndex={-1}
              className={cn(
                "pr-10 cursor-pointer pointer-events-none",
                !value && "text-muted-foreground",
                inputClassName
              )}
            />
            <CalendarIcon
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                disabled ? "text-muted-foreground/50" : "text-muted-foreground"
              )}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={getDisabledDates}
              locale={ptBR}
            />
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedTime.split(":")[0]} onValueChange={(h) => handleTimeChange(`${h}:${selectedTime.split(":")[1]}`)}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">:</span>
                <Select value={selectedTime.split(":")[1]} onValueChange={(m) => handleTimeChange(`${selectedTime.split(":")[0]}:${m}`)}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
