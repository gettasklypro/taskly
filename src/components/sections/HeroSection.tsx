import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  heading: string;
  subheading?: string;
  content?: string;
  image?: string;
  buttons?: { text: string; variant?: 'default' | 'outline'; href?: string }[];
  backgroundColor?: string;
  textColor?: string;
  animation?: string;
  overlay?: boolean;
  gradientText?: boolean;
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  contentFontSize?: string;
  contentFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
  onContentClick?: (e: React.MouseEvent) => void;
}

export const HeroSection = ({
  heading,
  subheading,
  content,
  image,
  buttons = [],
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  animation = 'fade-in',
  overlay = true,
  gradientText = false,
  headingFontSize = 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  subheadingFontFamily = 'font-poppins',
  contentFontSize = 'text-lg sm:text-xl md:text-2xl',
  contentFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick,
  onContentClick
}: HeroSectionProps) => {
  const hasImage = !!image;
  
  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${!hasImage ? backgroundColor : ''} ${!hasImage ? textColor : 'text-white'}`}>
      {/* Background Image */}
      {hasImage && (
        <>
          <img 
            src={image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {overlay && <div className="absolute inset-0 bg-black/50" />}
        </>
      )}
      
      {/* Ambient effects (if no image) */}
      {!hasImage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 px-4 sm:px-6 py-16 sm:py-24 text-center max-w-6xl mx-auto animate-${animation}`}>
        <h1 
          className={`${headingFontSize || 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'} font-black mb-8 sm:mb-10 leading-[1.1] tracking-tight ${headingFontFamily} ${gradientText ? 'bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent' : ''} ${onHeadingClick ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity duration-300`}
          onClick={onHeadingClick}
        >
          {heading}
        </h1>
        
        {subheading && (
          <p 
            className={`${subheadingFontSize || 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'} mb-12 sm:mb-14 font-normal leading-[1.4] ${subheadingFontFamily} ${onSubheadingClick ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity duration-300 max-w-5xl mx-auto`}
            onClick={onSubheadingClick}
          >
            {subheading}
          </p>
        )}
        
        {content && (
          <p 
            className={`${contentFontSize || 'text-lg sm:text-xl md:text-2xl'} mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed ${contentFontFamily} ${onContentClick ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity duration-300`}
            onClick={onContentClick}
          >
            {content}
          </p>
        )}
        
        {buttons.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            {buttons.map((btn, i) => (
              <Button 
                key={i}
                variant={btn.variant as any}
                size="lg"
                className={btn.variant === 'default' 
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto' 
                  : 'border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto'
                }
              >
                {btn.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
