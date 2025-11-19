import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Heart, Star, Trophy, Target, TrendingUp, Users, Shield, CheckCircle } from "lucide-react";
import { NavigationSection } from "./sections/NavigationSection";
import { SplitSection } from "./sections/SplitSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { TimelineSection } from "./sections/TimelineSection";
import { StatsSection } from "./sections/StatsSection";
import { HeroSection } from "./sections/HeroSection";


interface Section {
  type: string;
  heading: string;
  subheading?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  image?: string;
  video?: string;
  animation?: string;
  items?: any[];
  buttonText?: string;
  html?: string;
  css?: string;
  externalStyles?: string[];
  // Heading formatting
  headingFontSize?: string;
  headingFontFamily?: string;
  headingTextAlign?: string;
  headingFontWeight?: string;
  headingFontStyle?: string;
  headingTextDecoration?: string;
  // Subheading formatting
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  subheadingTextAlign?: string;
  subheadingFontWeight?: string;
  subheadingFontStyle?: string;
  subheadingTextDecoration?: string;
  // Content formatting
  contentFontSize?: string;
  contentFontFamily?: string;
  contentTextAlign?: string;
  contentFontWeight?: string;
  contentFontStyle?: string;
  contentTextDecoration?: string;
  // Stats formatting
  statFontSize?: string;
  statFontFamily?: string;
  statTextAlign?: string;
  statFontWeight?: string;
  statFontStyle?: string;
  statTextDecoration?: string;
  // Stats title formatting
  statTitleFontSize?: string;
  statTitleFontFamily?: string;
  statTitleTextAlign?: string;
  statTitleFontWeight?: string;
  statTitleFontStyle?: string;
  statTitleTextDecoration?: string;
}

const iconMap: Record<string, any> = {
  Sparkles, Zap, Heart, Star, Trophy, Target, TrendingUp, Users, Shield, CheckCircle
};

export const SectionPreview = ({ section }: { section: Section }) => {
  const Icon = section.items?.[0]?.icon ? iconMap[section.items[0].icon] : Sparkles;
  const bgClass = section.backgroundColor || "bg-background";
  const textClass = section.textColor || "text-foreground";
  const animClass = section.animation || "fade-in";
  
  // Get formatting for each element
  const headingFormat = {
    fontSize: section.headingFontSize || 'text-base',
    fontFamily: section.headingFontFamily || 'font-sans',
    textAlign: section.headingTextAlign || 'text-left',
    fontWeight: section.headingFontWeight,
    fontStyle: section.headingFontStyle,
    textDecoration: section.headingTextDecoration,
  };
  
  const subheadingFormat = {
    fontSize: section.subheadingFontSize || 'text-base',
    fontFamily: section.subheadingFontFamily || 'font-sans',
    textAlign: section.subheadingTextAlign || 'text-left',
    fontWeight: section.subheadingFontWeight,
    fontStyle: section.subheadingFontStyle,
    textDecoration: section.subheadingTextDecoration,
  };
  
  const contentFormat = {
    fontSize: section.contentFontSize || 'text-base',
    fontFamily: section.contentFontFamily || 'font-sans',
    textAlign: section.contentTextAlign || 'text-left',
    fontWeight: section.contentFontWeight,
    fontStyle: section.contentFontStyle,
    textDecoration: section.contentTextDecoration,
  };
  
  const statFormat = {
    fontSize: section.statFontSize || 'text-5xl',
    fontFamily: section.statFontFamily || 'font-sans',
    textAlign: section.statTextAlign || 'text-center',
    fontWeight: section.statFontWeight || 'font-bold',
    fontStyle: section.statFontStyle,
    textDecoration: section.statTextDecoration,
  };
  
  const statTitleFormat = {
    fontSize: section.statTitleFontSize || 'text-base',
    fontFamily: section.statTitleFontFamily || 'font-sans',
    textAlign: section.statTitleTextAlign || 'text-center',
    fontWeight: section.statTitleFontWeight,
    fontStyle: section.statTitleFontStyle,
    textDecoration: section.statTitleTextDecoration,
  };

  // Handle raw HTML sections
  if (section.type === 'raw-html') {
    return (
      <div className={`${bgClass} ${textClass} overflow-hidden`}>
        {section.externalStyles?.map((styleUrl, idx) => (
          <link key={idx} rel="stylesheet" href={styleUrl} />
        ))}
        {section.css && (
          <style dangerouslySetInnerHTML={{ __html: section.css }} />
        )}
        <div 
          dangerouslySetInnerHTML={{ __html: section.html || '' }}
          className="raw-html-content"
        />
      </div>
    );
  }

  // Handle new advanced section types
  if (section.type === 'navigation') {
    return <NavigationSection {...section} />;
  }

  if (section.type === 'split') {
    return <SplitSection {...section} />;
  }

  if (section.type === 'projects') {
    return <ProjectsSection {...section} projects={section.items || []} />;
  }

  if (section.type === 'skills') {
    return <SkillsSection {...section} skills={section.items || []} />;
  }

  if (section.type === 'timeline') {
    return <TimelineSection {...section} items={section.items || []} />;
  }

  if (section.type === 'stats') {
    return <StatsSection {...section} items={section.items || []} />;
  }
  
  // Use enhanced hero section
  if (section.type === 'hero') {
    const buttons = [];
    if ((section as any).primaryButton) {
      buttons.push({
        text: (section as any).primaryButton.text,
        variant: 'default' as const,
        href: (section as any).primaryButton.href
      });
    }
    if ((section as any).secondaryButton) {
      buttons.push({
        text: (section as any).secondaryButton.text,
        variant: 'outline' as const,
        href: (section as any).secondaryButton.href
      });
    }
    
    return <HeroSection 
      {...section} 
      image={(section as any).backgroundImage || section.image}
      buttons={buttons}
    />;
  }

  // Handle content/about sections
  if (section.type === 'content' || section.type === 'about') {
    return (
      <div className={`py-16 px-6 ${bgClass} ${textClass}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`font-bold mb-6 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
            fontWeight: headingFormat.fontWeight,
            fontStyle: headingFormat.fontStyle,
            textDecoration: headingFormat.textDecoration,
          }}>{section.heading}</h2>
          {section.subheading && <p className={`mb-6 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign}`} style={{
            fontWeight: subheadingFormat.fontWeight,
            fontStyle: subheadingFormat.fontStyle,
            textDecoration: subheadingFormat.textDecoration,
          }}>{section.subheading}</p>}
          {section.content && <p className={`leading-relaxed ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign}`} style={{
            fontWeight: contentFormat.fontWeight,
            fontStyle: contentFormat.fontStyle,
            textDecoration: contentFormat.textDecoration,
          }}>{section.content}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} ${textClass} ${animClass}`}>

      {(section.type === 'features' || section.type === 'services') && (
        <div className={`py-16 px-6`}>
          <h2 className={`font-bold mb-4 ${textClass} ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
            fontWeight: headingFormat.fontWeight,
            fontStyle: headingFormat.fontStyle,
            textDecoration: headingFormat.textDecoration,
          }}>{section.heading}</h2>
          {section.subheading && <p className={`mb-12 ${textClass} opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign}`} style={{
            fontWeight: subheadingFormat.fontWeight,
            fontStyle: subheadingFormat.fontStyle,
            textDecoration: subheadingFormat.textDecoration,
          }}>{section.subheading}</p>}
          <div className="!grid !grid-cols-2 gap-8 max-w-6xl mx-auto">
            {section.items?.map((item: any, i: number) => {
              const ItemIcon = iconMap[item.icon] || Sparkles;
              return (
                <Card key={i} className="hover-lift border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                      <ItemIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {section.type === 'gallery' && (
        <div className={`py-16 px-6`}>
          <h2 className={`font-bold mb-12 ${textClass} ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
            fontWeight: headingFormat.fontWeight,
            fontStyle: headingFormat.fontStyle,
            textDecoration: headingFormat.textDecoration,
          }}>{section.heading}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {section.items?.map((item: any, i: number) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg hover-scale">
                <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'video' && section.video && (
        <div className={`py-16 px-6`}>
          <h2 className={`font-bold mb-8 ${textClass} ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
            fontWeight: headingFormat.fontWeight,
            fontStyle: headingFormat.fontStyle,
            textDecoration: headingFormat.textDecoration,
          }}>{section.heading}</h2>
          <div className="max-w-4xl mx-auto aspect-video">
            <iframe src={section.video} className="w-full h-full rounded-xl" allowFullScreen />
          </div>
        </div>
      )}

      {section.type === 'stats' && (
        <div className="py-16 px-6">
          <div className="!grid !grid-cols-2 gap-8 max-w-5xl mx-auto">
            {section.items?.map((item: any, i: number) => (
              <div key={i}>
                <div className={`mb-2 ${textClass} ${statFormat.fontSize} ${statFormat.fontFamily} ${statFormat.textAlign}`} style={{
                  fontWeight: statFormat.fontWeight,
                  fontStyle: statFormat.fontStyle,
                  textDecoration: statFormat.textDecoration,
                }}>{item.stat}</div>
                <div className={`${textClass} opacity-70 ${statTitleFormat.fontSize} ${statTitleFormat.fontFamily} ${statTitleFormat.textAlign}`} style={{
                  fontWeight: statTitleFormat.fontWeight,
                  fontStyle: statTitleFormat.fontStyle,
                  textDecoration: statTitleFormat.textDecoration,
                }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'form' && (
        <div className={`py-16 px-6`}>
          <div className="max-w-2xl mx-auto">
            <h2 className={`font-bold mb-4 ${textClass} ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
              fontWeight: headingFormat.fontWeight,
              fontStyle: headingFormat.fontStyle,
              textDecoration: headingFormat.textDecoration,
            }}>{section.heading}</h2>
            {section.subheading && <p className={`mb-8 ${textClass} opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign}`} style={{
              fontWeight: subheadingFormat.fontWeight,
              fontStyle: subheadingFormat.fontStyle,
              textDecoration: subheadingFormat.textDecoration,
            }}>{section.subheading}</p>}
            <div className="space-y-4">
              {section.items?.map((field: any, i: number) => (
                <div key={i}>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      rows={4} 
                      className="w-full px-4 py-2 border rounded-lg bg-background border-border" 
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input 
                      type={field.type} 
                      className="w-full px-4 py-2 border rounded-lg bg-background border-border" 
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
              <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-smooth">
                {section.buttonText || 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {section.type === 'cta' && (
        <div className={`py-20 px-6`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`font-bold mb-4 ${textClass} ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
              fontWeight: headingFormat.fontWeight,
              fontStyle: headingFormat.fontStyle,
              textDecoration: headingFormat.textDecoration,
            }}>{section.heading}</h2>
            {section.subheading && <p className={`text-xl mb-6 ${textClass} opacity-90 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign}`} style={{
              fontWeight: subheadingFormat.fontWeight,
              fontStyle: subheadingFormat.fontStyle,
              textDecoration: subheadingFormat.textDecoration,
            }}>{section.subheading}</p>}
            {section.content && <p className={`mb-8 ${textClass} opacity-80 ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign}`} style={{
              fontWeight: contentFormat.fontWeight,
              fontStyle: contentFormat.fontStyle,
              textDecoration: contentFormat.textDecoration,
            }}>{section.content}</p>}
            <button className="px-8 py-4 bg-white text-primary rounded-lg font-bold text-lg hover-scale shadow-glow">
              {section.buttonText || 'Get Started'}
            </button>
          </div>
        </div>
      )}

      {section.type === 'testimonials' && (
        <div className={`py-16 px-6`}>
          <h2 className={`font-bold mb-12 ${textClass} text-center ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
            fontWeight: headingFormat.fontWeight,
            fontStyle: headingFormat.fontStyle,
            textDecoration: headingFormat.textDecoration,
          }}>{section.heading}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {section.items?.map((item: any, i: number) => (
              <div key={i} className="p-6 border border-border rounded-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 italic">{item.description}</p>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.role || 'Customer'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!['hero', 'features', 'services', 'gallery', 'video', 'stats', 'form', 'cta', 'testimonials', 'navigation', 'split', 'projects', 'skills', 'timeline', 'about', 'content'].includes(section.type) && (
        <div className={`py-12 px-6 max-w-4xl mx-auto`}>
          <h2 className={`font-bold mb-4 ${textClass} ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign}`} style={{
            fontWeight: headingFormat.fontWeight,
            fontStyle: headingFormat.fontStyle,
            textDecoration: headingFormat.textDecoration,
          }}>{section.heading}</h2>
          {section.subheading && <p className={`mb-6 ${textClass} opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign}`} style={{
            fontWeight: subheadingFormat.fontWeight,
            fontStyle: subheadingFormat.fontStyle,
            textDecoration: subheadingFormat.textDecoration,
          }}>{section.subheading}</p>}
          {section.content && <p className={`leading-relaxed ${textClass} opacity-70 ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign}`} style={{
            fontWeight: contentFormat.fontWeight,
            fontStyle: contentFormat.fontStyle,
            textDecoration: contentFormat.textDecoration,
          }}>{section.content}</p>}
        </div>
      )}
    </div>
  );
};