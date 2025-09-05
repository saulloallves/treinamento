import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Safely formats a date string or Date object
 * Returns '-' if the date is invalid, null, or undefined
 */
export const safeFormatDate = (
  date: string | Date | null | undefined, 
  formatString: string = "dd/MM/yyyy",
  options?: { locale?: any }
): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    return format(dateObj, formatString, { locale: ptBR, ...options });
  } catch (error) {
    console.warn('Invalid date format:', date);
    return '-';
  }
};

/**
 * Safely formats a date with time
 */
export const safeFormatDateTime = (
  date: string | Date | null | undefined
): string => {
  return safeFormatDate(date, "dd/MM/yyyy HH:mm");
};

/**
 * Safely formats a date with detailed time
 */
export const safeFormatDateTimeDetailed = (
  date: string | Date | null | undefined
): string => {
  return safeFormatDate(date, "dd/MM/yyyy 'às' HH:mm");
};