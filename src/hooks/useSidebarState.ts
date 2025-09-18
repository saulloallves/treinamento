import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "./use-mobile";

// Global sidebar state
let globalSidebarOpen = false;
const listeners: ((isOpen: boolean) => void)[] = [];

const notifyListeners = (isOpen: boolean) => {
  globalSidebarOpen = isOpen;
  listeners.forEach(listener => listener(isOpen));
};

export const useSidebarState = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(globalSidebarOpen || !isMobile);
  }, [isMobile]);

  useEffect(() => {
    const listener = (newIsOpen: boolean) => {
      setIsOpen(newIsOpen);
    };
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const updateSidebarState = useCallback((newIsOpen: boolean) => {
    notifyListeners(newIsOpen);
  }, []);

  return {
    isOpen,
    updateSidebarState
  };
};