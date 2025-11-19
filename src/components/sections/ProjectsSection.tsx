import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

interface Project {
  title: string;
  description: string;
  image: string;
  tags?: string[];
  liveUrl?: string;
  githubUrl?: string;
}

interface ProjectsSectionProps {
  heading: string;
  subheading?: string;
  projects: Project[];
  backgroundColor?: string;
  textColor?: string;
  layout?: 'grid' | 'masonry' | 'featured';
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  onHeadingClick?: (e: React.MouseEvent) => void;
  onSubheadingClick?: (e: React.MouseEvent) => void;
}

export const ProjectsSection = ({
  heading,
  subheading,
  projects,
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  layout = 'grid',
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick
}: ProjectsSectionProps) => {
  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-7xl mx-auto">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project, i) => (
            <div 
              key={i} 
              className="group bg-muted/30 rounded-xl overflow-hidden hover:shadow-xl transition-all animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                  {project.description}
                </p>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, j) => (
                      <span 
                        key={j} 
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-3">
                  {project.liveUrl && (
                    <Button size="sm" variant="default" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Live
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </a>
                    </Button>
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