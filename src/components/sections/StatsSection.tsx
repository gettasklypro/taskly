interface StatsSectionProps {
  heading?: string;
  subheading?: string;
  items: {
    value: string;
    label: string;
    icon?: string;
  }[];
  backgroundColor?: string;
  textColor?: string;
  layout?: 'horizontal' | 'vertical';
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const StatsSection = ({
  heading,
  subheading,
  items = [],
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  layout = 'horizontal',
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick
}: StatsSectionProps) => {
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
        
        <div className={`grid ${layout === 'vertical' ? 'grid-cols-2 gap-8' : 'grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8'}`}>
          {items.map((stat, i) => (
            <div 
              key={i} 
              className="text-center animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {stat.icon && <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{stat.icon}</div>}
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};