interface VideoSectionProps {
  heading?: string;
  subheading?: string;
  content?: string;
  video?: string;
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

export const VideoSection = ({
  heading = "Watch Our Story",
  subheading,
  content,
  video,
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  contentFontSize = 'text-base',
  contentFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick,
  onContentClick
}: VideoSectionProps) => {
  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-5xl mx-auto">
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
            className={`${subheadingFontSize} ${subheadingFontFamily} text-center text-muted-foreground mb-6 sm:mb-8 animate-fade-in px-4 ${onSubheadingClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onSubheadingClick}
          >
            {subheading}
          </p>
        )}
        
        {video && (
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl mb-6 animate-fade-in" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={video}
              title={heading || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
        {content && (
          <p 
            className={`${contentFontSize} ${contentFontFamily} text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto px-4 ${onContentClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onContentClick}
          >
            {content}
          </p>
        )}
      </div>
    </div>
  );
};