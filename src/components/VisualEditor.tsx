import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Image as ImageIcon, Palette, Sparkles, X, Plus
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
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
  links?: { label: string; href: string }[];
  companyName?: string;
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

interface VisualEditorProps {
  sections: Section[];
  onUpdateSection: (index: number, field: string, value: any) => void;
}

export const VisualEditor = ({ sections, onUpdateSection }: VisualEditorProps) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<'heading' | 'subheading' | 'content' | 'stat' | 'statTitle' | null>(null);
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const selectedSection = selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  const handleSectionClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSectionIndex(index);
    setSelectedElement(null);
  };

  const handleElementClick = (element: 'heading' | 'subheading' | 'content' | 'stat' | 'statTitle', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  const handleUpdate = (field: string, value: any) => {
    if (selectedSectionIndex === null) return;
    
    // If an element is selected, prefix the field with the element name
    if (selectedElement && (field === 'fontSize' || field === 'fontFamily' || field === 'textAlign' || 
        field === 'fontWeight' || field === 'fontStyle' || field === 'textDecoration')) {
      field = `${selectedElement}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    }
    
    onUpdateSection(selectedSectionIndex, field, value);
  };

  const handleFormatToggle = (format: 'bold' | 'italic' | 'underline') => {
    const newValue = !textFormatting[format];
    setTextFormatting({ ...textFormatting, [format]: newValue });
    
    if (format === 'bold') {
      handleUpdate('fontWeight', newValue ? 'bold' : 'normal');
    } else if (format === 'italic') {
      handleUpdate('fontStyle', newValue ? 'italic' : 'normal');
    } else if (format === 'underline') {
      handleUpdate('textDecoration', newValue ? 'underline' : 'none');
    }
  };

  const getCurrentFormatting = () => {
    if (!selectedSection || !selectedElement) return { fontSize: 'text-base', fontFamily: 'font-sans', textAlign: 'text-left' };
    
    const prefix = selectedElement;
    return {
      fontSize: selectedSection[`${prefix}FontSize` as keyof Section] as string || 'text-base',
      fontFamily: selectedSection[`${prefix}FontFamily` as keyof Section] as string || 'font-sans',
      textAlign: selectedSection[`${prefix}TextAlign` as keyof Section] as string || 'text-left',
      fontWeight: selectedSection[`${prefix}FontWeight` as keyof Section] as string,
      fontStyle: selectedSection[`${prefix}FontStyle` as keyof Section] as string,
      textDecoration: selectedSection[`${prefix}TextDecoration` as keyof Section] as string,
    };
  };

  const renderEditableSection = (section: Section, index: number) => {
    const isSelected = selectedSectionIndex === index;
    const bgClass = section.backgroundColor || "bg-background";
    const textClass = section.textColor || "text-foreground";
    
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

    const getElementClasses = (element: 'heading' | 'subheading' | 'content') => {
      const isElementSelected = selectedElement === element && isSelected;
      return `cursor-pointer transition-all ${isElementSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`;
    };

    return (
      <div
        key={index}
        onClick={(e) => handleSectionClick(index, e)}
        className={`cursor-pointer transition-all relative group ${
          isSelected ? 'ring-4 ring-primary ring-offset-4' : 'hover:ring-2 hover:ring-primary/50'
        }`}
      >
        <div className={`${bgClass} ${textClass} p-8 min-h-[200px]`}>
          {section.type === 'hero' && (
            <div className="relative -m-8">
              <HeroSection 
                heading={section.heading}
                subheading={section.subheading}
                content={section.content}
                image={(section as any).backgroundImage || section.image}
                buttons={[
                  ...((section as any).primaryButton ? [{
                    text: (section as any).primaryButton.text,
                    variant: 'default' as const,
                    href: (section as any).primaryButton.href
                  }] : []),
                  ...((section as any).secondaryButton ? [{
                    text: (section as any).secondaryButton.text,
                    variant: 'outline' as const,
                    href: (section as any).secondaryButton.href
                  }] : [])
                ]}
                backgroundColor={section.backgroundColor}
                textColor={section.textColor}
                animation={section.animation}
              />
            </div>
          )}

          {(section.type === 'features' || section.type === 'services') && (
            <div>
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold mb-4 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign} ${getElementClasses('heading')}`} 
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              {section.subheading && (
                <p 
                  onClick={(e) => handleElementClick('subheading', e)}
                  className={`mb-8 ${textClass} opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign} ${getElementClasses('subheading')}`} 
                  style={{
                    fontWeight: subheadingFormat.fontWeight,
                    fontStyle: subheadingFormat.fontStyle,
                    textDecoration: subheadingFormat.textDecoration,
                  }}
                >
                  {section.subheading}
                </p>
              )}
              {section.content && (
                <p 
                  onClick={(e) => handleElementClick('content', e)}
                  className={`${textClass} opacity-70 ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign} ${getElementClasses('content')}`} 
                  style={{
                    fontWeight: contentFormat.fontWeight,
                    fontStyle: contentFormat.fontStyle,
                    textDecoration: contentFormat.textDecoration,
                  }}
                >
                  {section.content}
                </p>
              )}
              <div className="grid grid-cols-2 gap-6 mt-8">
                {section.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-6">
                    <CardContent>
                      <div className="text-3xl mb-3">{item.icon === 'Sparkles' ? '✨' : item.icon === 'Zap' ? '⚡' : item.icon === 'Heart' ? '❤️' : item.icon === 'Star' ? '⭐' : item.icon === 'Trophy' ? '🏆' : item.icon === 'Target' ? '🎯' : item.icon === 'TrendingUp' ? '📈' : item.icon === 'Users' ? '👥' : item.icon === 'Shield' ? '🛡️' : '✓'}</div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {section.type === 'video' && section.video && (
            <div className="py-8">
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold text-center mb-8 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`} 
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              <div className="max-w-4xl mx-auto aspect-video">
                <iframe src={section.video} className="w-full h-full rounded-xl" allowFullScreen />
              </div>
            </div>
          )}

          {section.type === 'gallery' && (
            <div className="py-8">
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold text-center mb-12 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`} 
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {section.items?.map((item: any, i: number) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg">
                    <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.type === 'stats' && (
            <div className="py-8">
              {section.heading && (
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold text-center mb-12 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
              )}
              <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
                {section.items?.map((item: any, i: number) => (
                  <div key={i}>
                    <div 
                      className={`mb-2 ${textClass} ${statFormat.fontSize} ${statFormat.fontFamily} ${statFormat.textAlign} cursor-pointer hover:opacity-70 transition-opacity`}
                      style={{
                        fontWeight: statFormat.fontWeight,
                        fontStyle: statFormat.fontStyle,
                        textDecoration: statFormat.textDecoration,
                      }}
                      onClick={(e) => handleElementClick('stat', e)}
                    >
                      {item.stat}
                    </div>
                    <div 
                      className={`${textClass} opacity-70 ${statTitleFormat.fontSize} ${statTitleFormat.fontFamily} ${statTitleFormat.textAlign} cursor-pointer hover:opacity-50 transition-opacity`}
                      style={{
                        fontWeight: statTitleFormat.fontWeight,
                        fontStyle: statTitleFormat.fontStyle,
                        textDecoration: statTitleFormat.textDecoration,
                      }}
                      onClick={(e) => handleElementClick('statTitle', e)}
                    >
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.type === 'form' && (
            <div className="py-8 max-w-2xl mx-auto">
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold mb-4 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign} ${getElementClasses('heading')}`} 
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              {section.subheading && (
                <p 
                  onClick={(e) => handleElementClick('subheading', e)}
                  className={`mb-8 ${textClass} opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign} ${getElementClasses('subheading')}`} 
                  style={{
                    fontWeight: subheadingFormat.fontWeight,
                    fontStyle: subheadingFormat.fontStyle,
                    textDecoration: subheadingFormat.textDecoration,
                  }}
                >
                  {section.subheading}
                </p>
              )}
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
          )}

          {section.type === 'raw-html' && (
            <div className={`${bgClass} ${textClass} overflow-hidden`}>
              {section.externalStyles?.map((styleUrl, idx) => (
                <link key={idx} rel="stylesheet" href={styleUrl} />
              ))}
              {section.css && (
                <style dangerouslySetInnerHTML={{ __html: section.css }} />
              )}
              <div 
                dangerouslySetInnerHTML={{ __html: section.html || '' }}
                className="raw-html-content pointer-events-none"
              />
            </div>
          )}

          {section.type === 'navigation' && (
            <nav className="sticky top-0 z-50 backdrop-blur-sm border-b">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
                <div className="flex gap-6">
                  {section.items?.map((item: any, i: number) => (
                    <a key={i} href={item.href || '#'} className="hover:text-primary transition-colors">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          )}

          {section.type === 'split' && (
            <div className="min-h-screen flex items-center">
              <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                <div>
                  <h1 
                    onClick={(e) => handleElementClick('heading', e)}
                    className={`font-bold mb-6 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                    style={{
                      fontWeight: headingFormat.fontWeight,
                      fontStyle: headingFormat.fontStyle,
                      textDecoration: headingFormat.textDecoration,
                    }}
                  >
                    {section.heading}
                  </h1>
                  {section.subheading && (
                    <p 
                      onClick={(e) => handleElementClick('subheading', e)}
                      className={`mb-8 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${getElementClasses('subheading')}`}
                      style={{
                        fontWeight: subheadingFormat.fontWeight,
                        fontStyle: subheadingFormat.fontStyle,
                        textDecoration: subheadingFormat.textDecoration,
                      }}
                    >
                      {section.subheading}
                    </p>
                  )}
                  {section.content && (
                    <p 
                      onClick={(e) => handleElementClick('content', e)}
                      className={`leading-relaxed ${contentFormat.fontSize} ${contentFormat.fontFamily} ${getElementClasses('content')}`}
                      style={{
                        fontWeight: contentFormat.fontWeight,
                        fontStyle: contentFormat.fontStyle,
                        textDecoration: contentFormat.textDecoration,
                      }}
                    >
                      {section.content}
                    </p>
                  )}
                </div>
                <div className="rounded-xl overflow-hidden bg-card">
                  {section.image ? (
                    <img src={section.image} alt={section.heading} className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-6">
                      {section.content && (
                        <pre 
                          className={`font-mono ${contentFormat.fontSize}`}
                          style={{
                            fontWeight: contentFormat.fontWeight,
                            fontStyle: contentFormat.fontStyle,
                            textDecoration: contentFormat.textDecoration,
                          }}
                        >
                          {section.content}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {section.type === 'about' && (
            <div className="py-16 px-6">
              <div className="max-w-6xl mx-auto">
                <div className={`grid ${section.image ? 'md:grid-cols-2' : 'grid-cols-1'} gap-12 items-center`}>
                  <div className={!section.image ? 'max-w-4xl mx-auto' : ''}>
                    <h2 
                      onClick={(e) => handleElementClick('heading', e)}
                      className={`font-bold mb-6 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign} ${getElementClasses('heading')}`}
                      style={{
                        fontWeight: headingFormat.fontWeight,
                        fontStyle: headingFormat.fontStyle,
                        textDecoration: headingFormat.textDecoration,
                      }}
                    >
                      {section.heading}
                    </h2>
                    {section.content && (
                      <p 
                        onClick={(e) => handleElementClick('content', e)}
                        className={`leading-relaxed ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign} ${getElementClasses('content')}`}
                        style={{
                          fontWeight: contentFormat.fontWeight,
                          fontStyle: contentFormat.fontStyle,
                          textDecoration: contentFormat.textDecoration,
                        }}
                      >
                        {section.content}
                      </p>
                    )}
                  </div>
                  {section.image && (
                    <div className="rounded-xl overflow-hidden">
                      <img src={section.image} alt={section.heading} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {section.type === 'content' && (
            <div className="py-16 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold mb-4 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
                {section.subheading && (
                  <p 
                    onClick={(e) => handleElementClick('subheading', e)}
                    className={`mb-8 opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign} ${getElementClasses('subheading')}`}
                    style={{
                      fontWeight: subheadingFormat.fontWeight,
                      fontStyle: subheadingFormat.fontStyle,
                      textDecoration: subheadingFormat.textDecoration,
                    }}
                  >
                    {section.subheading}
                  </p>
                )}
                {section.content && (
                  <div 
                    onClick={(e) => handleElementClick('content', e)}
                    className={`prose max-w-none ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign} ${getElementClasses('content')}`}
                    style={{
                      fontWeight: contentFormat.fontWeight,
                      fontStyle: contentFormat.fontStyle,
                      textDecoration: contentFormat.textDecoration,
                    }}
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            </div>
          )}

          {section.type === 'skills' && (
            <div className="py-16 px-6">
              <div className="max-w-6xl mx-auto">
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold text-center mb-12 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {section.items?.map((skill: any, i: number) => (
                    <div key={i} className="text-center p-6 rounded-xl border">
                      {skill.icon && <div className="text-4xl mb-3">{skill.icon}</div>}
                      <div className="font-semibold">{skill.name}</div>
                      {skill.level && <div className="text-sm text-primary">{skill.level}%</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section.type === 'projects' && (
            <div className="py-16 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold text-center mb-12 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {section.items?.map((project: any, i: number) => (
                    <div key={i} className="rounded-xl overflow-hidden border group">
                      {project.image && (
                        <div className="aspect-video overflow-hidden">
                          <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-bold mb-2">{project.title}</h3>
                        <p className="text-sm opacity-70 mb-4">{project.description}</p>
                        {project.tags && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag: string, j: number) => (
                              <span key={j} className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section.type === 'timeline' && (
            <div className="py-16 px-6">
              <div className="max-w-5xl mx-auto">
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold text-center mb-12 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
                <div className="space-y-8">
                  {section.items?.map((item: any, i: number) => (
                    <div key={i} className="p-6 rounded-xl border">
                      <div className="text-sm font-semibold text-primary mb-2">{item.period}</div>
                      <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                      <div className="opacity-70 mb-3">{item.organization}</div>
                      {item.description && <p className="text-sm leading-relaxed">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section.type === 'testimonials' && (
            <div className="py-16 px-6">
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold mb-12 text-center ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {section.items?.map((item: any, i: number) => (
                  <div key={i} className="p-6 border border-border rounded-lg">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-full mb-4 object-cover" />
                    )}
                    <p className="mb-4 italic opacity-80">{item.description}</p>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.role || 'Customer'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.type === 'cta' && (
            <div className={`py-20 px-6 relative ${section.image ? 'min-h-[400px] flex items-center justify-center' : ''}`}>
              {section.image && (
                <>
                  <img src={section.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60" />
                </>
              )}
              <div className={`max-w-4xl mx-auto text-center ${section.image ? 'relative z-10 text-white' : ''}`}>
                <h2 
                  onClick={(e) => handleElementClick('heading', e)}
                  className={`font-bold mb-4 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign} ${getElementClasses('heading')}`}
                  style={{
                    fontWeight: headingFormat.fontWeight,
                    fontStyle: headingFormat.fontStyle,
                    textDecoration: headingFormat.textDecoration,
                  }}
                >
                  {section.heading}
                </h2>
                {section.subheading && (
                  <p 
                    onClick={(e) => handleElementClick('subheading', e)}
                    className={`text-xl mb-6 opacity-90 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign} ${getElementClasses('subheading')}`}
                    style={{
                      fontWeight: subheadingFormat.fontWeight,
                      fontStyle: subheadingFormat.fontStyle,
                      textDecoration: subheadingFormat.textDecoration,
                    }}
                  >
                    {section.subheading}
                  </p>
                )}
                {section.content && (
                  <p 
                    onClick={(e) => handleElementClick('content', e)}
                    className={`mb-8 opacity-80 ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign} ${getElementClasses('content')}`}
                    style={{
                      fontWeight: contentFormat.fontWeight,
                      fontStyle: contentFormat.fontStyle,
                      textDecoration: contentFormat.textDecoration,
                    }}
                  >
                    {section.content}
                  </p>
                )}
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:opacity-90 transition-opacity">
                  {section.buttonText || 'Get Started'}
                </button>
              </div>
            </div>
          )}

          {section.type === 'pricing' && (
            <div className="py-16 px-6">
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold text-center mb-12 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${getElementClasses('heading')}`}
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {section.items?.map((item: any, i: number) => (
                  <div key={i} className="p-8 rounded-xl border border-border hover:border-primary transition-colors">
                    <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{item.price}</span>
                      {item.period && <span className="text-muted-foreground">/{item.period}</span>}
                    </div>
                    <ul className="space-y-3 mb-6">
                      {item.features?.map((feature: string, j: number) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-primary mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                      Choose Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.type === 'footer' && (
            <footer className="py-8 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm">
                    © {new Date().getFullYear()} {(section as any).companyName || 'Your Company'}. All rights reserved.
                  </p>
                  <div className="flex items-center gap-6">
                    {((section as any).links || []).map((link: any, i: number) => (
                      <a
                        key={i}
                        href={link.href}
                        className="text-sm hover:text-foreground transition-colors cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
          )}

          {!['hero', 'features', 'services', 'video', 'gallery', 'stats', 'form', 'navigation', 'split', 'about', 'content', 'skills', 'projects', 'timeline', 'raw-html', 'testimonials', 'cta', 'pricing', 'footer'].includes(section.type) && (
            <div>
              <h2 
                onClick={(e) => handleElementClick('heading', e)}
                className={`font-bold mb-4 ${headingFormat.fontSize} ${headingFormat.fontFamily} ${headingFormat.textAlign} ${getElementClasses('heading')}`} 
                style={{
                  fontWeight: headingFormat.fontWeight,
                  fontStyle: headingFormat.fontStyle,
                  textDecoration: headingFormat.textDecoration,
                }}
              >
                {section.heading}
              </h2>
              {section.subheading && (
                <p 
                  onClick={(e) => handleElementClick('subheading', e)}
                  className={`mb-6 ${textClass} opacity-70 ${subheadingFormat.fontSize} ${subheadingFormat.fontFamily} ${subheadingFormat.textAlign} ${getElementClasses('subheading')}`} 
                  style={{
                    fontWeight: subheadingFormat.fontWeight,
                    fontStyle: subheadingFormat.fontStyle,
                    textDecoration: subheadingFormat.textDecoration,
                  }}
                >
                  {section.subheading}
                </p>
              )}
              {section.content && (
                <p 
                  onClick={(e) => handleElementClick('content', e)}
                  className={`leading-relaxed ${textClass} opacity-70 ${contentFormat.fontSize} ${contentFormat.fontFamily} ${contentFormat.textAlign} ${getElementClasses('content')}`} 
                  style={{
                    fontWeight: contentFormat.fontWeight,
                    fontStyle: contentFormat.fontStyle,
                    textDecoration: contentFormat.textDecoration,
                  }}
                >
                  {section.content}
                </p>
              )}
            </div>
          )}
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
            {selectedElement ? `Editing ${selectedElement}` : 'Editing Section'}
          </div>
        )}
      </div>
    );
  };

  const currentFormat = getCurrentFormatting();

  return (
    <div className="flex h-[calc(100vh-200px)] gap-0">
      {/* Editing Sidebar */}
      <div className={`transition-all duration-300 ${selectedSection ? 'w-80' : 'w-0'} overflow-hidden border-r bg-card`}>
        {selectedSection && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {selectedElement ? `Edit ${selectedElement.charAt(0).toUpperCase()}${selectedElement.slice(1)}` : 'Edit Section'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedSectionIndex(null);
                  setSelectedElement(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {selectedElement && (
              <div className="bg-primary/10 p-3 rounded-lg text-sm">
                Click on different text elements to edit their individual formatting
              </div>
            )}

            <Separator />

            {!selectedElement && (
              <>
                {/* Section Type */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Section Type</Label>
                  <Select value={selectedSection.type} onValueChange={(value) => handleUpdate('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="testimonials">Testimonials</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="gallery">Gallery</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="stats">Stats</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="cta">Call to Action</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
              </>
            )}

            {/* Text Formatting - Only show when an element is selected */}
            {selectedElement && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Formatting
                  </Label>
                  <div className="flex gap-1 mb-3">
                    <Toggle
                      pressed={textFormatting.bold}
                      onPressedChange={() => handleFormatToggle('bold')}
                      size="sm"
                    >
                      <Bold className="w-4 h-4" />
                    </Toggle>
                    <Toggle
                      pressed={textFormatting.italic}
                      onPressedChange={() => handleFormatToggle('italic')}
                      size="sm"
                    >
                      <Italic className="w-4 h-4" />
                    </Toggle>
                    <Toggle
                      pressed={textFormatting.underline}
                      onPressedChange={() => handleFormatToggle('underline')}
                      size="sm"
                    >
                      <Underline className="w-4 h-4" />
                    </Toggle>
                    <Separator orientation="vertical" className="mx-1 h-8" />
                    <Toggle
                      pressed={currentFormat.textAlign === 'text-left'}
                      onPressedChange={() => handleUpdate('textAlign', 'text-left')}
                      size="sm"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Toggle>
                    <Toggle
                      pressed={currentFormat.textAlign === 'text-center'}
                      onPressedChange={() => handleUpdate('textAlign', 'text-center')}
                      size="sm"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Toggle>
                    <Toggle
                      pressed={currentFormat.textAlign === 'text-right'}
                      onPressedChange={() => handleUpdate('textAlign', 'text-right')}
                      size="sm"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Toggle>
                  </div>
                </div>

                {/* Font Settings */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Font Family</Label>
                    <Select value={currentFormat.fontFamily} onValueChange={(value) => handleUpdate('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="font-sans">Default Sans Serif</SelectItem>
                        <SelectItem value="font-serif">Default Serif</SelectItem>
                        <SelectItem value="font-mono">Monospace</SelectItem>
                        <SelectItem value="font-poppins">Poppins (Modern)</SelectItem>
                        <SelectItem value="font-inter">Inter (Clean)</SelectItem>
                        <SelectItem value="font-roboto">Roboto (Professional)</SelectItem>
                        <SelectItem value="font-lato">Lato (Friendly)</SelectItem>
                        <SelectItem value="font-openSans">Open Sans (Versatile)</SelectItem>
                        <SelectItem value="font-montserrat">Montserrat (Geometric)</SelectItem>
                        <SelectItem value="font-raleway">Raleway (Elegant)</SelectItem>
                        <SelectItem value="font-playfair">Playfair Display (Elegant Serif)</SelectItem>
                        <SelectItem value="font-merriweather">Merriweather (Readable Serif)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Font Size</Label>
                    <Select value={currentFormat.fontSize} onValueChange={(value) => handleUpdate('fontSize', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-xs">Extra Small</SelectItem>
                        <SelectItem value="text-sm">Small</SelectItem>
                        <SelectItem value="text-base">Base</SelectItem>
                        <SelectItem value="text-lg">Large</SelectItem>
                        <SelectItem value="text-xl">Extra Large</SelectItem>
                        <SelectItem value="text-2xl">2X Large</SelectItem>
                        <SelectItem value="text-3xl">3X Large</SelectItem>
                        <SelectItem value="text-4xl">4X Large</SelectItem>
                        <SelectItem value="text-5xl">5X Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Features Items Editing */}
            {selectedSection.type === 'features' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Features</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { icon: 'Sparkles', title: 'New Feature', description: 'Feature description' }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Feature
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Feature {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Icon</Label>
                        <Select
                          value={item.icon}
                          onValueChange={(value) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], icon: value };
                            handleUpdate('items', newItems);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sparkles">Sparkles</SelectItem>
                            <SelectItem value="Zap">Zap</SelectItem>
                            <SelectItem value="Heart">Heart</SelectItem>
                            <SelectItem value="Star">Star</SelectItem>
                            <SelectItem value="Trophy">Trophy</SelectItem>
                            <SelectItem value="Target">Target</SelectItem>
                            <SelectItem value="TrendingUp">Trending Up</SelectItem>
                            <SelectItem value="Users">Users</SelectItem>
                            <SelectItem value="Shield">Shield</SelectItem>
                            <SelectItem value="CheckCircle">Check Circle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], title: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Feature title"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], description: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Feature description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Stats Items Editing */}
            {selectedSection.type === 'stats' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Stats</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { stat: '0', title: 'New Stat' }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Stat
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Stat {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Number</Label>
                        <Input
                          value={item.stat}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], stat: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="e.g., 100+"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Label</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], title: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="e.g., Happy Clients"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Footer Editing */}
            {selectedSection.type === 'footer' && !selectedElement && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Company Name</Label>
                  <Input
                    value={selectedSection.companyName || 'Your Company'}
                    onChange={(e) => handleUpdate('companyName', e.target.value)}
                    placeholder="Your Company"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Footer Links</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newLinks = [...(selectedSection.links || []), { label: 'New Link', href: '?page=new-page' }];
                        handleUpdate('links', newLinks);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  {selectedSection.links?.map((link: any, i: number) => (
                    <Card key={i} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Link {i + 1}</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newLinks = selectedSection.links?.filter((_: any, idx: number) => idx !== i);
                              handleUpdate('links', newLinks);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Label</Label>
                          <Input
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...(selectedSection.links || [])];
                              newLinks[i] = { ...newLinks[i], label: e.target.value };
                              handleUpdate('links', newLinks);
                            }}
                            placeholder="Link label"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">URL/Page</Label>
                          <Input
                            value={link.href}
                            onChange={(e) => {
                              const newLinks = [...(selectedSection.links || [])];
                              newLinks[i] = { ...newLinks[i], href: e.target.value };
                              handleUpdate('links', newLinks);
                            }}
                            placeholder="?page=page-name"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Gallery Items Editing */}
            {selectedSection.type === 'gallery' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Gallery Images</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { image: '', caption: '' }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Image
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Image {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Image URL</Label>
                        <Input
                          value={item.image || item.url}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], image: e.target.value, url: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Caption</Label>
                        <Input
                          value={item.caption || ''}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], caption: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Image caption"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Projects Items Editing */}
            {selectedSection.type === 'projects' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Projects</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { title: 'New Project', description: '', image: '', tags: [] }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Project
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Project {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], title: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Project title"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], description: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Project description"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Image URL</Label>
                        <Input
                          value={item.image}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], image: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
                        <Input
                          value={Array.isArray(item.tags) ? item.tags.join(', ') : ''}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], tags: e.target.value.split(',').map(t => t.trim()) };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="React, TypeScript, etc."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Timeline Items Editing */}
            {selectedSection.type === 'timeline' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Timeline Items</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { title: 'New Position', organization: '', period: '', description: '' }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Item {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], title: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Position/Title"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Organization</Label>
                        <Input
                          value={item.organization}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], organization: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Company/School"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Period</Label>
                        <Input
                          value={item.period}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], period: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="2020 - 2023"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], description: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Testimonials Items Editing */}
            {selectedSection.type === 'testimonials' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Testimonials</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { name: 'Customer Name', role: 'Position', description: 'Testimonial text', image: '' }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Testimonial
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Testimonial {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input
                          value={item.name || item.title}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], name: e.target.value, title: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Customer name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Role</Label>
                        <Input
                          value={item.role}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], role: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Position/Company"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Testimonial</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], description: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="What they said..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Image URL</Label>
                        <Input
                          value={item.image}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], image: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Pricing Items Editing */}
            {selectedSection.type === 'pricing' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Pricing Plans</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { name: 'Plan Name', price: '$0', period: 'month', features: [] }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Plan
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Plan {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Plan Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], name: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Basic, Pro, etc."
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Price</Label>
                        <Input
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], price: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="$99"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Period</Label>
                        <Input
                          value={item.period}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], period: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="month, year, etc."
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Features (one per line)</Label>
                        <Textarea
                          value={Array.isArray(item.features) ? item.features.join('\n') : ''}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], features: e.target.value.split('\n').filter(f => f.trim()) };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                          rows={4}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Skills Items Editing */}
            {selectedSection.type === 'skills' && !selectedElement && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Skills</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(selectedSection.items || []), { name: 'New Skill', level: 80, icon: '⚡' }];
                      handleUpdate('items', newItems);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Skill
                  </Button>
                </div>
                {selectedSection.items?.map((item: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Skill {i + 1}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSection.items?.filter((_: any, idx: number) => idx !== i);
                            handleUpdate('items', newItems);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Skill Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], name: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="Skill name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Level (%)</Label>
                        <Input
                          type="number"
                          value={item.level}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], level: parseInt(e.target.value) || 0 };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="80"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Icon (emoji)</Label>
                        <Input
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[i] = { ...newItems[i], icon: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                          placeholder="⚡"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Separator />
              </div>
            )}

            {/* Content */}
            {!selectedElement && selectedSection.type !== 'footer' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Heading</Label>
                  <Input
                    value={selectedSection.heading}
                    onChange={(e) => handleUpdate('heading', e.target.value)}
                    placeholder="Enter heading"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Subheading</Label>
                  <Input
                    value={selectedSection.subheading || ''}
                    onChange={(e) => handleUpdate('subheading', e.target.value)}
                    placeholder="Enter subheading"
                  />
                </div>

                {!['form', 'gallery', 'video', 'stats'].includes(selectedSection.type) && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Content</Label>
                    <Textarea
                      value={selectedSection.content || ''}
                      onChange={(e) => handleUpdate('content', e.target.value)}
                      placeholder="Enter content"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer Editor */}
            {!selectedElement && selectedSection.type === 'footer' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Company Name</Label>
                  <Input
                    value={(selectedSection as any).companyName || ''}
                    onChange={(e) => handleUpdate('companyName', e.target.value)}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Footer Links</Label>
                  <div className="space-y-2">
                    {((selectedSection as any).links || []).map((link: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Link {index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentLinks = (selectedSection as any).links || [];
                                const newLinks = currentLinks.filter((_: any, i: number) => i !== index);
                                handleUpdate('links', newLinks);
                              }}
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => {
                              const currentLinks = [...((selectedSection as any).links || [])];
                              currentLinks[index] = { ...link, label: e.target.value };
                              handleUpdate('links', currentLinks);
                            }}
                          />
                          <Input
                            placeholder="?page=privacy-policy"
                            value={link.href}
                            onChange={(e) => {
                              const currentLinks = [...((selectedSection as any).links || [])];
                              currentLinks[index] = { ...link, href: e.target.value };
                              handleUpdate('links', currentLinks);
                            }}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentLinks = (selectedSection as any).links || [];
                        const newLink = { label: 'New Link', href: '?page=new-page' };
                        handleUpdate('links', [...currentLinks, newLink]);
                      }}
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!selectedElement && <Separator />}

            {/* Form Fields Editor */}
            {!selectedElement && selectedSection.type === 'form' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-muted-foreground">Form Fields</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newField = { label: 'New Field', type: 'text', placeholder: '', required: false };
                      handleUpdate('items', [...(selectedSection.items || []), newField]);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedSection.items?.map((field: any, index: number) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Field {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = selectedSection.items?.filter((_: any, i: number) => i !== index);
                              handleUpdate('items', newItems);
                            }}
                          >
                            <X className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Label"
                          value={field.label}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[index] = { ...field, label: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[index] = { ...field, type: value };
                            handleUpdate('items', newItems);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Phone</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Placeholder"
                          value={field.placeholder}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.items || [])];
                            newItems[index] = { ...field, placeholder: e.target.value };
                            handleUpdate('items', newItems);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`required-${index}`}
                            checked={field.required}
                            onChange={(e) => {
                              const newItems = [...(selectedSection.items || [])];
                              newItems[index] = { ...field, required: e.target.checked };
                              handleUpdate('items', newItems);
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`required-${index}`} className="text-xs">Required</Label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground mb-2">Button Text</Label>
                  <Input
                    value={selectedSection.buttonText || 'Submit'}
                    onChange={(e) => handleUpdate('buttonText', e.target.value)}
                    placeholder="Submit"
                  />
                </div>
              </div>
            )}

            {!selectedElement && selectedSection.type === 'form' && <Separator />}

            {/* Image */}
            {!selectedElement && ['hero', 'about', 'split', 'cta', 'gallery'].includes(selectedSection.type) && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {selectedSection.type === 'hero' ? 'Background Image URL' : 'Image URL'}
                </Label>
                <Input
                  value={selectedSection.image || ''}
                  onChange={(e) => handleUpdate('image', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            )}

            {/* Video */}
            {!selectedElement && selectedSection.type === 'video' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  YouTube Embed URL
                </Label>
                <Input
                  value={selectedSection.video || ''}
                  onChange={(e) => handleUpdate('video', e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
            )}

            {/* Colors */}
            {!selectedElement && (
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Colors
                </Label>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Background</Label>
                  <Select value={selectedSection.backgroundColor || 'bg-background'} onValueChange={(value) => handleUpdate('backgroundColor', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-background">Default</SelectItem>
                      <SelectItem value="bg-secondary">Secondary</SelectItem>
                      <SelectItem value="bg-muted">Muted</SelectItem>
                      <SelectItem value="bg-primary/10">Primary Light</SelectItem>
                      <SelectItem value="bg-slate-900">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2">Text Color</Label>
                  <Select value={selectedSection.textColor || 'text-foreground'} onValueChange={(value) => handleUpdate('textColor', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-foreground">Default</SelectItem>
                      <SelectItem value="text-primary">Primary</SelectItem>
                      <SelectItem value="text-secondary-foreground">Secondary</SelectItem>
                      <SelectItem value="text-muted-foreground">Muted</SelectItem>
                      <SelectItem value="text-white">White</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Animation */}
            {!selectedElement && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Animation
                  </Label>
                  <Select value={selectedSection.animation || 'fade-in'} onValueChange={(value) => handleUpdate('animation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade-in">Fade In</SelectItem>
                      <SelectItem value="scale-in">Scale In</SelectItem>
                      <SelectItem value="slide-in-right">Slide In Right</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {sections.map((section, index) => renderEditableSection(section, index))}
        </div>
      </div>
    </div>
  );
};