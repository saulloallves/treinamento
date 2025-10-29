import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  buttonClassName?: string;
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
  buttonClassName,
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

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "dd/MM/yyyy", { locale: ptBR })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
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
