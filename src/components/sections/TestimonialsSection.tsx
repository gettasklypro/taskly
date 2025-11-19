import { Star } from "lucide-react";

interface TestimonialsSectionProps {
  heading?: string;
  subheading?: string;
  items?: Array<{ name: string; role: string; description: string; image?: string; rating?: number }>;
  backgroundColor?: string;
  textColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const TestimonialsSection = ({
  heading = "What Our Clients Say",
  subheading,
  items = [],
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick
}: TestimonialsSectionProps) => {
  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-6xl mx-auto">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="bg-muted/30 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-shadow animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-base sm:text-lg">{item.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
              
              {item.rating && (
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star 
                      key={j} 
                      className={`w-4 h-4 ${j < item.rating! ? 'fill-primary text-primary' : 'text-muted'}`} 
                    />
                  ))}
                </div>
              )}
              
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">"{item.description}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};