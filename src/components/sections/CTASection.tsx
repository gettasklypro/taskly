import { Button } from "@/components/ui/button";

interface CTASectionProps {
  heading?: string;
  subheading?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
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

export const CTASection = ({
  heading = "Ready to Get Started?",
  subheading,
  content,
  buttonText = "Contact Us",
  buttonLink = "#contact",
  image,
  backgroundColor = 'bg-primary',
  textColor = 'text-primary-foreground',
  headingFontSize = 'text-3xl md:text-5xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-xl md:text-2xl',
  subheadingFontFamily = 'font-poppins',
  contentFontSize = 'text-base md:text-lg',
  contentFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick,
  onContentClick
}: CTASectionProps) => {
  return (
    <div className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 relative ${image ? 'min-h-[400px] flex items-center justify-center' : backgroundColor} ${textColor}`}>
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </>
      )}
      <div className={`max-w-4xl mx-auto text-center ${image ? 'relative z-10' : ''}`}>
        <h2 
          className={`${headingFontSize} ${headingFontFamily} font-bold mb-4 sm:mb-6 animate-fade-in ${onHeadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={onHeadingClick}
        >
          {heading}
        </h2>
        {subheading && (
          <p 
            className={`${subheadingFontSize} ${subheadingFontFamily} mb-4 opacity-90 animate-fade-in ${onSubheadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onSubheadingClick}
          >
            {subheading}
          </p>
        )}
        {content && (
          <p 
            className={`${contentFontSize} ${contentFontFamily} mb-6 sm:mb-8 opacity-80 max-w-2xl mx-auto animate-fade-in ${onContentClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onContentClick}
          >
            {content}
          </p>
        )}
        <Button 
          size="lg" 
          variant="secondary"
          className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 animate-scale-in"
          asChild
        >
          <a href={buttonLink}>{buttonText}</a>
        </Button>
      </div>
    </div>
  );
};