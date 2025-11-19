interface GallerySectionProps {
  heading?: string;
  subheading?: string;
  items?: Array<{ url?: string; image?: string; caption?: string; title?: string; description?: string }>;
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

export const GallerySection = ({
  heading = "Gallery",
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
}: GallerySectionProps) => {
  const gridClass = columns === 2 
    ? 'grid-cols-1 md:grid-cols-2' 
    : columns === 4 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

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
        
        <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
          {items.map((item, i) => {
            const imageUrl = item.url || item.image;
            const caption = item.caption || item.title;
            const description = item.description;
            
            return (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-xl aspect-square animate-scale-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img 
                  src={imageUrl} 
                  alt={caption || `Gallery image ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {(caption || description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                    {caption && <p className="text-white text-base sm:text-lg font-medium mb-1">{caption}</p>}
                    {description && <p className="text-white/90 text-xs sm:text-sm">{description}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};