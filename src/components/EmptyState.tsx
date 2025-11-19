import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  tipsLabel?: string;
  onTipsClick?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tipsLabel,
  onTipsClick,
}: EmptyStateProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Card content */}
      <Card className="relative w-full max-w-md mx-4 p-8 text-center space-y-6 border-2 border-foreground/10 shadow-2xl animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Icon className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {description}
        </p>

        {/* Action Button */}
        <Button 
          onClick={onAction}
          size="lg"
          className="w-full max-w-xs mx-auto"
        >
          {actionLabel}
        </Button>

        {/* Optional Tips Link */}
        {tipsLabel && onTipsClick && (
          <button
            onClick={onTipsClick}
            className="text-sm text-primary hover:underline focus:outline-none"
          >
            {tipsLabel}
          </button>
        )}
      </Card>
    </div>
  );
};
