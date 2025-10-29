import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ResponsiveCard = ({ children, onClick, className }: ResponsiveCardProps) => {
  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow h-full flex flex-col",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};

interface ResponsiveCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveCardHeader = ({ children, className }: ResponsiveCardHeaderProps) => {
  return (
    <CardHeader className={cn("pb-3 flex-shrink-0", className)}>
      {children}
    </CardHeader>
  );
};

interface ResponsiveCardContentProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveCardContent = ({ children, className }: ResponsiveCardContentProps) => {
  return (
    <CardContent className={cn("flex-1 flex flex-col justify-between", className)}>
      {children}
    </CardContent>
  );
};

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: "title" | "subtitle" | "body" | "caption" | "badge";
  className?: string;
  title?: string;
  clamp?: number;
}

export const ResponsiveText = ({
  children,
  variant = "body",
  className,
  title,
  clamp
}: ResponsiveTextProps) => {
  const variantClasses = {
    title: "font-semibold text-[clamp(0.875rem,1vw+0.5rem,1.125rem)] leading-tight",
    subtitle: "text-[clamp(0.75rem,0.8vw+0.4rem,0.875rem)] text-muted-foreground",
    body: "text-[clamp(0.75rem,0.8vw+0.4rem,0.875rem)]",
    caption: "text-[clamp(0.625rem,0.7vw+0.35rem,0.75rem)] text-muted-foreground",
    badge: "text-[clamp(0.625rem,0.7vw+0.35rem,0.75rem)]"
  };

  const clampClass = clamp ? `line-clamp-${clamp}` : "";

  return (
    <div
      className={cn(
        variantClasses[variant],
        clampClass,
        variant === "title" && "break-words hyphens-auto",
        className
      )}
      title={title}
      lang="pt-BR"
    >
      {children}
    </div>
  );
};

interface ResponsiveMobileTextProps {
  children: ReactNode;
  variant?: "title" | "subtitle" | "body" | "caption" | "badge";
  className?: string;
  title?: string;
  clamp?: number;
}

export const ResponsiveMobileText = ({
  children,
  variant = "body",
  className,
  title,
  clamp
}: ResponsiveMobileTextProps) => {
  const variantClasses = {
    title: "font-semibold text-[clamp(0.75rem,3vw,0.875rem)] leading-tight",
    subtitle: "text-[clamp(0.625rem,2.5vw,0.75rem)] text-muted-foreground",
    body: "text-[clamp(0.625rem,2.5vw,0.75rem)]",
    caption: "text-[clamp(0.625rem,2vw,0.6875rem)] text-muted-foreground",
    badge: "text-[clamp(0.625rem,2vw,0.6875rem)]"
  };

  const clampClass = clamp ? `line-clamp-${clamp}` : "";

  return (
    <div
      className={cn(
        variantClasses[variant],
        clampClass,
        variant === "title" && "break-words hyphens-auto",
        className
      )}
      title={title}
      lang="pt-BR"
    >
      {children}
    </div>
  );
};
