import { Card } from "@/components/ui/card";
import { 
  Layout, Grid, Code, Briefcase, Zap, 
  Clock, Mail, Star, Image as ImageIcon, 
  Video, BarChart, FileText 
} from "lucide-react";

interface SectionType {
  type: string;
  label: string;
  description: string;
  icon: any;
}

const sectionTypes: SectionType[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Large header with image background',
    icon: Layout
  },
  {
    type: 'split',
    label: 'Split Layout',
    description: 'Text on one side, code/image on other',
    icon: Code
  },
  {
    type: 'features',
    label: 'Features Grid',
    description: 'Grid of features with icons',
    icon: Grid
  },
  {
    type: 'projects',
    label: 'Projects',
    description: 'Portfolio project showcase',
    icon: Briefcase
  },
  {
    type: 'skills',
    label: 'Skills',
    description: 'Skills with progress bars or grid',
    icon: Zap
  },
  {
    type: 'timeline',
    label: 'Timeline',
    description: 'Experience or education timeline',
    icon: Clock
  },
  {
    type: 'form',
    label: 'Contact Form',
    description: 'Form with input fields',
    icon: Mail
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Customer reviews and feedback',
    icon: Star
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Image grid',
    icon: ImageIcon
  },
  {
    type: 'video',
    label: 'Video',
    description: 'Embedded video player',
    icon: Video
  },
  {
    type: 'stats',
    label: 'Statistics',
    description: 'Number highlights',
    icon: BarChart
  },
  {
    type: 'content',
    label: 'Rich Content',
    description: 'Text-heavy section',
    icon: FileText
  }
];

interface SectionTypeSelectorProps {
  onSelect: (type: string) => void;
}

export const SectionTypeSelector = ({ onSelect }: SectionTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 max-h-[70vh] overflow-y-auto">
      {sectionTypes.map((section) => {
        const Icon = section.icon;
        return (
          <Card
            key={section.type}
            className="p-3 cursor-pointer hover:border-primary hover:bg-accent/50 transition-all group"
            onClick={() => onSelect(section.type)}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-xs">{section.label}</h3>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
