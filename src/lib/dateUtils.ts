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

/**
 * Check if a lesson has finished based on its start time and duration
 */
export const hasLessonFinished = (
  startTime: string | Date | null | undefined,
  durationMinutes: number = 60
): boolean => {
  if (!startTime) return false;
  
  try {
    const start = new Date(startTime);
    if (isNaN(start.getTime())) return false;
    
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const now = new Date();
    
    return now > end;
  } catch (error) {
    console.warn('Error checking lesson finish status:', error);
    return false;
  }
};

/**
 * Check if a lesson is currently happening or upcoming
 */
export const isLessonUpcoming = (
  startTime: string | Date | null | undefined,
  durationMinutes: number = 60
): boolean => {
  if (!startTime) return true; // Lessons without scheduled time are considered upcoming

  return !hasLessonFinished(startTime, durationMinutes);
};

/**
 * Verifica se o acesso à aula está dentro da janela de tolerância
 * @param lessonDate Data/hora de início da aula
 * @param toleranceMinutes Minutos de tolerância após o início (padrão: 15)
 * @returns true se ainda está dentro da janela, false se expirou
 */
export const isWithinLessonAccessWindow = (
  lessonDate: string | Date | null | undefined,
  toleranceMinutes: number = 15
): boolean => {
  if (!lessonDate) return true; // Sem data definida = sempre permitir

  try {
    const now = new Date();
    const lessonTime = new Date(lessonDate);

    if (isNaN(lessonTime.getTime())) return true; // Data inválida = permitir

    const diffMs = now.getTime() - lessonTime.getTime();
    const minutesLate = Math.floor(diffMs / (1000 * 60));

    return minutesLate <= toleranceMinutes;
  } catch (error) {
    console.warn('Error checking lesson access window:', error);
    return true; // Em caso de erro, permitir acesso
  }
};