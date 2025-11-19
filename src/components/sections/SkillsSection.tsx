interface Skill {
  name: string;
  level: number;
  icon?: string;
  category?: string;
}

interface SkillsSectionProps {
  heading: string;
  subheading?: string;
  skills: Skill[];
  layout?: 'grid' | 'bars' | 'categories';
  backgroundColor?: string;
  textColor?: string;
  showPercentages?: boolean;
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const SkillsSection = ({
  heading,
  subheading,
  skills,
  layout = 'grid',
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  showPercentages = true,
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick
}: SkillsSectionProps) => {
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
        
        <div className="space-y-6">
          {skills.map((skill, i) => (
            <div 
              key={i} 
              className="animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm sm:text-base font-medium">{skill.name}</span>
                {showPercentages && (
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                )}
              </div>
              <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};