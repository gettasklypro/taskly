import { Button } from "@/components/ui/button";

interface SplitSectionProps {
  heading: string;
  subheading?: string;
  content?: string;
  buttons?: { text: string; variant?: 'default' | 'outline'; href?: string }[];
  code?: string;
  image?: string;
  layout?: 'text-left' | 'text-right';
  backgroundColor?: string;
  textColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  contentFontSize?: string;
  contentFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onContentClick?: (e: React.MouseEvent) => void;
}

export const SplitSection = ({
  heading,
  subheading,
  content,
  buttons = [],
  code,
  image,
  layout = 'text-left',
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  contentFontSize = 'text-base',
  contentFontFamily = 'font-poppins',
  onHeadingClick,
  onContentClick
}: SplitSectionProps) => {
  const isTextLeft = layout === 'text-left';
  
  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${isTextLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
          <div className="flex-1 space-y-4 sm:space-y-6">
            <h2 
              className={`${headingFontSize} ${headingFontFamily} font-bold animate-fade-in ${onHeadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={onHeadingClick}
            >
              {heading}
            </h2>
            {subheading && (
              <p className="text-lg sm:text-xl text-muted-foreground animate-fade-in">
                {subheading}
              </p>
            )}
            {content && (
              <p 
                className={`${contentFontSize} ${contentFontFamily} text-muted-foreground leading-relaxed animate-fade-in ${onContentClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={onContentClick}
              >
                {content}
              </p>
            )}
            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in">
                {buttons.map((btn, i) => (
                  <Button 
                    key={i}
                    variant={btn.variant as any}
                    size="lg"
                    asChild
                  >
                    <a href={btn.href || '#'}>{btn.text}</a>
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex-1 animate-scale-in">
            {image && (
              <img 
                src={image} 
                alt={heading}
                className="w-full rounded-xl shadow-2xl"
              />
            )}
            {code && (
              <pre className="bg-muted p-6 rounded-xl overflow-x-auto">
                <code className="text-sm">{code}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};