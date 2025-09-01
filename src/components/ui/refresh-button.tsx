import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const RefreshButton = ({ 
  onClick, 
  isRefreshing, 
  disabled = false, 
  className,
  size = "icon",
  variant = "outline"
}: RefreshButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isRefreshing}
      className={cn("shrink-0", className)}
      title={isRefreshing ? "Recarregando..." : "Recarregar"}
    >
      <RotateCcw 
        className={cn(
          "h-4 w-4",
          isRefreshing && "animate-spin"
        )} 
      />
    </Button>
  );
};