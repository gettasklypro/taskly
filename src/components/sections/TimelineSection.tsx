import { Calendar } from "lucide-react";

interface TimelineItem {
  title: string;
  organization: string;
  period: string;
  description?: string;
  tags?: string[];
  bullets?: string[];
}

interface TimelineSectionProps {
  heading: string;
  subheading?: string;
  items: TimelineItem[];
  backgroundColor?: string;
  textColor?: string;
  style?: 'left' | 'center' | 'cards';
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const TimelineSection = ({
  heading,
  subheading,
  items,
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  style = 'left',
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick
}: TimelineSectionProps) => {
  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-5xl mx-auto">
        <h2 
          className={`${headingFontSize} ${headingFontFamily} font-bold text-center mb-3 sm:mb-4 animate-fade-in ${onHeadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={onHeadingClick}
        >
          {heading}
        </h2>
        {subheading && (
          <p 
            className={`${subheadingFontSize} ${subheadingFontFamily} text-center text-muted-foreground mb-8 sm:mb-12 animate-fade-in px-4 ${onSubheadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onSubheadingClick}
          >
            {subheading}
          </p>
        )}
        
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />
          
          {items.map((item, i) => (
            <div 
              key={i} 
              className="relative mb-8 sm:mb-12 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex items-start gap-4 md:gap-8">
                <div className="flex-shrink-0 w-4 h-4 md:absolute md:left-1/2 md:-translate-x-1/2 rounded-full bg-primary border-4 border-background z-10 mt-1.5" />
                
                <div className="flex-1 bg-muted/30 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                      <Calendar className="w-4 h-4" />
                      {item.period}
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-primary font-medium mb-3">{item.organization}</p>
                  
                  {item.description && (
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  
                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="space-y-2 mb-3">
                      {item.bullets.map((bullet, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, j) => (
                        <span 
                          key={j} 
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};