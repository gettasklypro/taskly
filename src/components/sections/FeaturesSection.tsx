import * as LucideIcons from "lucide-react";
import { CheckCircle2 } from "lucide-react";

interface FeaturesSectionProps {
  heading?: string;
  subheading?: string;
  items?: Array<{ title: string; description: string | string[]; icon?: string }>;
  backgroundColor?: string;
  textColor?: string;
  columns?: number;
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const FeaturesSection = ({
  heading = "Features",
  subheading,
  items = [],
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  columns = 3,
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick
}: FeaturesSectionProps) => {
  const gridClass = columns === 2 
    ? 'grid-cols-1 md:grid-cols-2' 
    : columns === 4 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h2 
            className={`${headingFontSize} ${headingFontFamily} font-bold text-center mb-3 sm:mb-4 animate-fade-in ${onHeadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onHeadingClick}
          >
            {heading}
          </h2>
        )}
        {subheading && (
          <p 
            className={`${subheadingFontSize} ${subheadingFontFamily} text-center text-muted-foreground mb-8 sm:mb-12 animate-fade-in px-4 ${onSubheadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onSubheadingClick}
          >
            {subheading}
          </p>
        )}
        
        <div className={`grid ${gridClass} gap-6 sm:gap-8`}>
          {items.map((feature, i) => {
            const IconComponent = feature.icon && (LucideIcons as any)[feature.icon] 
              ? (LucideIcons as any)[feature.icon] 
              : LucideIcons.Sparkles;
            
            return (
              <div 
                key={i} 
                className="group p-6 sm:p-8 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all hover:shadow-lg animate-scale-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                {Array.isArray(feature.description) ? (
                  <ul className="space-y-2">
                    {feature.description.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};