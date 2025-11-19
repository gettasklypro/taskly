interface TeamSectionProps {
  heading?: string;
  subheading?: string;
  items?: Array<{ name: string; role: string; bio?: string; image?: string }>;
  backgroundColor?: string;
  textColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const TeamSection = ({
  heading = "Meet Our Team",
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
}: TeamSectionProps) => {
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {items.map((member, i) => (
            <div 
              key={i} 
              className="group text-center animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative mb-4 mx-auto w-40 h-40 sm:w-48 sm:h-48">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-3xl sm:text-4xl font-bold text-muted-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-sm sm:text-base text-primary font-medium mb-2">{member.role}</p>
              {member.bio && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">{member.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};