import * as React from "react";
import { CalendarIcon } from "lucide-react";
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

export interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
  inputClassName?: string;
  align?: "start" | "center" | "end";
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecione a data",
  disabled = false,
  disableFuture = false,
  disablePast = false,
  fromDate,
  toDate,
  className,
  inputClassName,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setOpen(false);
  };

  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disableFuture && date > today) return true;
    if (disablePast && date < today) return true;
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;

    return false;
  };

  const displayValue = date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "";

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={displayValue}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              className={cn(
                "pr-10 cursor-pointer",
                !date && "text-muted-foreground",
                inputClassName
              )}
              onClick={() => !disabled && setOpen(true)}
            />
            <CalendarIcon
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                disabled ? "text-muted-foreground/50" : "text-muted-foreground"
              )}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={getDisabledDates}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
