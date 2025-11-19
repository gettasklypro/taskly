import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, X, ChevronRight, ChevronDown, Eye, Monitor, Smartphone, EyeOff, ArrowUp, ArrowDown, Layout, Grid, Code, Briefcase, Zap, Clock, Mail, Star, Image as ImageIcon, Video, BarChart, FileText, Users, Split, Phone, ListPlus, Megaphone, Menu, Upload } from "lucide-react";
import { IconPicker } from "@/components/IconPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeroSection } from "@/components/sections/HeroSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { VideoSection } from "@/components/sections/VideoSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { NavigationSection } from "@/components/sections/NavigationSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { SplitSection } from "@/components/sections/SplitSection";
import { CTASection } from "@/components/sections/CTASection";
import { FooterSection } from "@/components/sections/FooterSection";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: any[];
  is_homepage: boolean;
}

interface Section {
  type: string;
  heading: string;
  subheading?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  image?: string;
  logo?: string;
  video?: string;
  animation?: string;
  items?: any[];
  buttonText?: string;
  buttonLink?: string;
  html?: string;
  css?: string;
  fontSize?: string;
  fontFamily?: string;
  fields?: any[];
  headingFontSize?: string;
  headingFontFamily?: string;
  subheadingFontSize?: string;
  subheadingFontFamily?: string;
  contentFontSize?: string;
  contentFontFamily?: string;
  links?: { label: string; href: string; }[];
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  hidden?: boolean;
}

// Icon mapping for section types
const sectionIconMap: Record<string, any> = {
  hero: Layout,
  navigation: Menu,
  about: FileText,
  gallery: ImageIcon,
  testimonials: Star,
  video: Video,
  features: Grid,
  services: Grid,
  stats: BarChart,
  team: Users,
  timeline: Clock,
  projects: Briefcase,
  skills: Zap,
  split: Split,
  contact: Mail,
  forms: ListPlus,
  cta: Megaphone,
  footer: Code,
  custom: Code,
};

const sectionTypes = [
  { id: 'hero', label: 'Hero', category: 'header' },
  { id: 'navigation', label: 'Navigation', category: 'header' },
  { id: 'about', label: 'About', category: 'template' },
  { id: 'gallery', label: 'Gallery', category: 'template' },
  { id: 'testimonials', label: 'Reviews', category: 'template' },
  { id: 'video', label: 'Video', category: 'template' },
  { id: 'features', label: 'Features', category: 'template' },
  { id: 'services', label: 'Services', category: 'template' },
  { id: 'stats', label: 'Stats', category: 'template' },
  { id: 'team', label: 'Team', category: 'template' },
  { id: 'timeline', label: 'Timeline', category: 'template' },
  { id: 'projects', label: 'Projects', category: 'template' },
  { id: 'skills', label: 'Skills', category: 'template' },
  { id: 'split', label: 'Split', category: 'template' },
  { id: 'contact', label: 'Contact Form', category: 'template' },
  { id: 'cta', label: 'CTA', category: 'template' },
  { id: 'footer', label: 'Footer', category: 'footer' },
  { id: 'custom', label: 'Custom HTML', category: 'template' },
];

const layoutTemplates = [
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Service cards in grid + Pricing + CTA',
    sections: []
  },
  {
    id: 'list',
    name: 'List Style',
    description: 'Detailed service list + Process + Contact',
    sections: []
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Hero service + Other services + Reviews',
    sections: []
  }
];

export const WebsiteEditor = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showAddSectionMenu, setShowAddSectionMenu] = useState<{
    header: boolean;
    template: boolean;
    footer: boolean;
  }>({
    header: false,
    template: false,
    footer: false,
  });
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [textEditPopover, setTextEditPopover] = useState<{
    show: boolean;
    sectionIndex: number;
    element: 'heading' | 'subheading' | 'content';
    x: number;
    y: number;
  } | null>(null);
  // Track unsaved changes per page to prevent loss when switching tabs
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any[]>>({});

  // Fetch website data and template
  const { data: website } = useQuery({
    queryKey: ['website', websiteId],
    queryFn: async () => {
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .select('*')
        .eq('id', websiteId)
        .single();
      
      if (websiteError) throw websiteError;
      
      if (websiteData.template_id) {
        const { data: templateData } = await supabase
          .from('templates')
          .select('preview_data')
          .eq('id', websiteData.template_id)
          .single();
        
        return { ...websiteData, templateData: templateData?.preview_data };
      }
      
      return websiteData;
    },
    enabled: !!websiteId,
  });

  const { data: pages } = useQuery({
    queryKey: ['pages', websiteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('website_id', websiteId)
        .order('is_homepage', { ascending: false });
      
      if (error) throw error;
      
      if (data.length > 0 && !selectedPageId) {
        setSelectedPageId(data[0].id);
        const content = Array.isArray(data[0].content) ? data[0].content : [];
        if (content.length === 0) {
          setShowLayoutPicker(true);
        }
      }
      
      return data as Page[];
    },
    enabled: !!websiteId,
  });

  // Get selected page with unsaved changes applied
  const selectedPage = pages?.find(p => p.id === selectedPageId);
  const pageWithUnsavedChanges = selectedPage && selectedPageId && unsavedChanges[selectedPageId]
    ? { ...selectedPage, content: unsavedChanges[selectedPageId] }
    : selectedPage;

  const updatePageMutation = useMutation({
    mutationFn: async ({ pageId, updates }: { pageId: string; updates: any }) => {
      const { error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', pageId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pages', websiteId] });
      // Clear unsaved changes for this page after successful save
      setUnsavedChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[variables.pageId];
        return newChanges;
      });
      toast.success("Changes saved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save");
    },
  });

  const handleSave = () => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    updatePageMutation.mutate({
      pageId: selectedPageId,
      updates: { content: pageWithUnsavedChanges.content }
    });
  };

  const handleUpdateSection = (index: number, field: string, value: any) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    const newContent = [...pageWithUnsavedChanges.content];
    newContent[index] = { ...newContent[index], [field]: value };
    
    // Store in unsaved changes instead of query cache
    setUnsavedChanges(prev => ({
      ...prev,
      [selectedPageId]: newContent
    }));
  };

  const handleAddSection = (type: string) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    const newSection: Section = {
      type: type,
      heading: 'New Section',
      subheading: 'Add your content here',
      content: '',
      backgroundColor: 'bg-background',
      textColor: 'text-foreground',
      animation: 'fade-in',
      items: type === 'gallery' ? [{ image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', title: '', description: '' }] :
        type === 'testimonials' ? [{ name: 'Client Name', role: 'Position', description: 'Great service!', rating: 5, image: '' }] :
        type === 'features' || type === 'services' ? [{ title: 'Feature 1', description: 'Feature description', icon: 'Sparkles' }] :
        type === 'team' ? [{ name: 'Team Member', role: 'Position', bio: 'Bio', image: '' }] :
        type === 'stats' ? [{ value: '100+', label: 'Stat Label', icon: 'BarChart3' }] :
        type === 'timeline' ? [{ title: 'Event 1', description: 'Event description', date: '2024' }] :
        type === 'projects' ? [{ title: 'Project 1', description: 'Project description', image: '', tags: [] }] :
        type === 'skills' ? [{ name: 'Skill 1', level: 80 }] :
        type === 'navigation' ? [
          { label: 'Home', href: '/' },
          { label: 'About', href: '#about' },
          { label: 'Contact', href: '#contact' }
        ] : [],
      fields: type === 'forms' ? [
        { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
        { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
        { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...', required: true }
      ] : [],
      buttonText: 'Submit',
      fontSize: 'text-base',
      fontFamily: 'font-poppins',
      headingFontSize: 'text-3xl',
      headingFontFamily: 'font-poppins',
      subheadingFontSize: 'text-xl',
      subheadingFontFamily: 'font-poppins',
      contentFontSize: 'text-base',
      contentFontFamily: 'font-poppins',
      ...(type === 'footer' && {
        links: [
          { label: "Privacy Policy", href: "?page=privacy-policy" },
          { label: "Terms of Service", href: "?page=terms-of-service" },
          { label: "Refund Policy", href: "?page=refund-policy" }
        ],
        companyName: "Your Company"
      })
    };
    
    const newContent = [...pageWithUnsavedChanges.content, newSection];
    setUnsavedChanges(prev => ({
      ...prev,
      [selectedPageId]: newContent
    }));
    setEditingSectionIndex(newContent.length - 1);
    toast.success(`${type} section added!`);
  };

  const handleDeleteSection = (index: number) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    const newContent = pageWithUnsavedChanges.content.filter((_, i) => i !== index);
    setUnsavedChanges(prev => ({
      ...prev,
      [selectedPageId]: newContent
    }));
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null);
    }
    toast.success("Section removed");
  };

  const handleToggleVisibility = (index: number) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    const newContent = [...pageWithUnsavedChanges.content];
    newContent[index] = { ...newContent[index], hidden: !newContent[index].hidden };
    
    setUnsavedChanges(prev => ({
      ...prev,
      [selectedPageId]: newContent
    }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    const newContent = [...pageWithUnsavedChanges.content];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newContent.length) return;
    
    [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
    
    setUnsavedChanges(prev => ({
      ...prev,
      [selectedPageId]: newContent
    }));
    
    setEditingSectionIndex(targetIndex);
  };

  const handleImageUpload = async (file: File, sectionIndex: number, itemIndex: number) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${websiteId}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('website-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error("Failed to upload image");
        console.error(uploadError);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      // Update the gallery item with the new image URL
      const newContent = [...pageWithUnsavedChanges.content];
      const items = [...newContent[sectionIndex].items];
      items[itemIndex] = { ...items[itemIndex], image: publicUrl };
      newContent[sectionIndex] = { ...newContent[sectionIndex], items };

      setUnsavedChanges(prev => ({
        ...prev,
        [selectedPageId]: newContent
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    }
  };

  const handleSectionImageUpload = async (file: File, sectionIndex: number) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${websiteId}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('website-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error("Failed to upload image");
        console.error(uploadError);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      // Update the section with the new image URL
      handleUpdateSection(sectionIndex, 'image', publicUrl);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    }
  };

  const handleLogoUpload = async (file: File, sectionIndex: number) => {
    if (!pageWithUnsavedChanges || !selectedPageId) return;
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${websiteId}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('website-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error("Failed to upload logo");
        console.error(uploadError);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      // Update the section with the new logo URL
      handleUpdateSection(sectionIndex, 'logo', publicUrl);

      toast.success("Logo uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo");
    }
  };

  const toggleSection = (index: number) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAddSectionMenu = (category: 'header' | 'template' | 'footer') => {
    setShowAddSectionMenu(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getSectionsByCategory = (category: string) => {
    return sectionTypes.filter(type => type.category === category);
  };

  const getPageSectionsByCategory = (category: string) => {
    if (!pageWithUnsavedChanges?.content) return [];
    
    const categoryTypes = sectionTypes
      .filter(type => type.category === category)
      .map(type => type.id);
    
    return pageWithUnsavedChanges.content
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => categoryTypes.includes(section.type));
  };

  const handleTextClick = (e: React.MouseEvent, sectionIndex: number, element: 'heading' | 'subheading' | 'content') => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTextEditPopover({
      show: true,
      sectionIndex,
      element,
      x: rect.left,
      y: rect.bottom + window.scrollY + 8
    });
  };

  const renderSection = (section: Section, index: number, enableTextClick = false) => {
    const createTextClickHandler = (element: 'heading' | 'subheading' | 'content') => 
      enableTextClick ? (e: React.MouseEvent) => handleTextClick(e, index, element) : undefined;
    
    // Create section ID for anchor navigation (same logic as PublicWebsiteViewer)
    let sectionId = section.type;
    if (section.heading) {
      const normalizedHeading = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      sectionId = normalizedHeading || section.type;
    }
    
    let sectionContent;
    switch (section.type) {
      case 'hero':
        const buttons = [];
        if (section.buttonText) {
          buttons.push({
            text: section.buttonText,
            variant: 'default' as const,
            href: '#'
          });
        }
        sectionContent = (
          <HeroSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            content={section.content}
            image={section.image}
            buttons={buttons}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            animation={section.animation}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            contentFontSize={section.contentFontSize}
            contentFontFamily={section.contentFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
            onContentClick={createTextClickHandler('content')}
          />
        );
        break;
      case 'navigation':
        // Create navigation click handler for preview mode
        const handlePreviewNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
          console.log('=== HANDLER CALLED ===');
          console.log('Preview nav clicked:', href);
          console.log('Event:', e);
          if (href.startsWith('#')) {
            console.log('Is anchor link, preventing default');
            e.preventDefault();
            const targetId = href.slice(1);
            console.log('Looking for element with ID:', targetId);
            const element = document.getElementById(targetId);
            console.log('Found element:', element);
            if (element) {
              console.log('Scrolling to element');
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              console.log('Scrolled to element');
            } else {
              console.error('Element not found with ID:', targetId);
            }
          }
        };
        
        console.log('Rendering navigation with items:', section.items);
        console.log('Handler function:', handlePreviewNavClick);
        
        sectionContent = (
          <NavigationSection
            key={index}
            items={section.items || []}
            logo={section.logo}
            logoText={section.heading === "Portfolio" ? website?.name : (section.heading || website?.name)}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            onItemClick={handlePreviewNavClick}
          />
        );
        break;
      case 'gallery':
        sectionContent = (
          <GallerySection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            items={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'testimonials':
        sectionContent = (
          <TestimonialsSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            items={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'video':
        sectionContent = (
          <VideoSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            content={section.content}
            video={section.video}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            contentFontSize={section.contentFontSize}
            contentFontFamily={section.contentFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
            onContentClick={createTextClickHandler('content')}
          />
        );
        break;
      case 'services':
      case 'features':
        sectionContent = (
          <FeaturesSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            items={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            columns={viewMode === 'mobile' ? 2 : 3}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'team':
        sectionContent = (
          <TeamSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            items={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'contact':
      case 'forms':
        sectionContent = (
          <ContactSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            content={section.content}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            buttonText={section.buttonText}
            email={section.email}
            phone={section.phone}
            address={section.address}
            fields={section.fields}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            contentFontSize={section.contentFontSize}
            contentFontFamily={section.contentFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
            onContentClick={createTextClickHandler('content')}
          />
        );
        break;
      case 'stats':
        sectionContent = (
          <StatsSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            items={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            layout={viewMode === 'mobile' ? 'vertical' : 'horizontal'}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'timeline':
        sectionContent = (
          <TimelineSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            items={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'projects':
        sectionContent = (
          <ProjectsSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            projects={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'skills':
        sectionContent = (
          <SkillsSection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            skills={section.items || []}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
          />
        );
        break;
      case 'split':
        sectionContent = (
          <SplitSection
            key={index}
            heading={section.heading}
            content={section.content}
            image={section.image}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            contentFontSize={section.contentFontSize}
            contentFontFamily={section.contentFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onContentClick={createTextClickHandler('content')}
          />
        );
        break;
      case 'text':
      case 'content':
      case 'about':
        sectionContent = (
          <section key={index} className={`py-16 px-4 ${section.backgroundColor || 'bg-background'} ${section.textColor || 'text-foreground'}`}>
            <div className="container mx-auto max-w-4xl">
              {section.image && (
                <img src={section.image} alt={section.heading || 'Content'} className="mx-auto rounded-lg shadow-lg max-w-full h-auto mb-8" />
              )}
              {section.heading && (
                <h2 
                  className={`${section.headingFontSize || 'text-3xl md:text-4xl'} font-bold mb-4 ${section.headingFontFamily || 'font-poppins'} ${enableTextClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={createTextClickHandler('heading')}
                >
                  {section.heading}
                </h2>
              )}
              {section.subheading && (
                <p 
                  className={`${section.subheadingFontSize || 'text-xl'} mb-4 text-muted-foreground ${section.subheadingFontFamily || 'font-poppins'} ${enableTextClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={createTextClickHandler('subheading')}
                >
                  {section.subheading}
                </p>
              )}
              {section.content && (
                <p 
                  className={`${section.contentFontSize || 'text-lg'} whitespace-pre-wrap ${section.contentFontFamily || 'font-poppins'} ${enableTextClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={createTextClickHandler('content')}
                >
                  {section.content}
                </p>
              )}
            </div>
          </section>
        );
        break;
      case 'cta':
        sectionContent = (
          <CTASection
            key={index}
            heading={section.heading}
            subheading={section.subheading}
            content={section.content}
            buttonText={section.buttonText}
            buttonLink={section.buttonLink || '#'}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            headingFontSize={section.headingFontSize}
            headingFontFamily={section.headingFontFamily}
            subheadingFontSize={section.subheadingFontSize}
            subheadingFontFamily={section.subheadingFontFamily}
            contentFontSize={section.contentFontSize}
            contentFontFamily={section.contentFontFamily}
            onHeadingClick={createTextClickHandler('heading')}
            onSubheadingClick={createTextClickHandler('subheading')}
            onContentClick={createTextClickHandler('content')}
          />
        );
        break;
      case 'footer':
        sectionContent = (
          <FooterSection
            key={index}
            heading={section.heading}
            backgroundColor={section.backgroundColor}
            textColor={section.textColor}
            links={section.links || [
              { label: "Privacy Policy", href: "?page=privacy-policy" },
              { label: "Terms of Service", href: "?page=terms-of-service" },
              { label: "Refund Policy", href: "?page=refund-policy" }
            ]}
            companyName={section.companyName || website?.name || 'Your Company'}
          />
        );
        break;
      case 'custom':
        sectionContent = (
          <div key={index}>
            <style>{section.css}</style>
            <div dangerouslySetInnerHTML={{ __html: section.html || '' }} />
          </div>
        );
        break;
      default:
        sectionContent = null;
        break;
    }
    
    return sectionContent;
  };

  const editingSection = editingSectionIndex !== null && pageWithUnsavedChanges?.content?.[editingSectionIndex];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden w-full">
      {/* Top Bar - Shopify Style */}
      <header className="border-b border-border bg-background h-14 flex items-center px-4 flex-shrink-0 z-50">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/website-builder')}
            className="h-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-border" />
            <h1 className="text-sm font-medium">{website?.name}</h1>
          </div>

          <Select value={selectedPageId || ''} onValueChange={setSelectedPageId}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {pages?.map(page => (
                <SelectItem key={page.id} value={page.id} className="text-sm">
                  {page.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <Button 
              variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="sm" 
              className="h-7 px-2"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="sm" 
              className="h-7 px-2"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => window.open(`/preview/${websiteId}`, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button onClick={handleSave} disabled={updatePageMutation.isPending} size="sm" className="h-8">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tree Structure */}
        <aside className="w-64 border-r border-border bg-background overflow-y-auto flex-shrink-0">
          <div className="p-3">
            {/* Header Section */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Header
              </div>
              
              {/* Header Sections */}
              <div className="space-y-0.5 mb-2">
                {getPageSectionsByCategory('header').map(({ section, index }) => {
                  const SectionIcon = sectionIconMap[section.type] || Layout;
                  return (
                    <div key={index}>
                      <button
                        onClick={() => {
                          setEditingSectionIndex(index);
                          toggleSection(index);
                        }}
                        className={`group flex items-center justify-between w-full text-xs py-2 px-2 rounded hover:bg-muted/50 transition-colors ${
                          editingSectionIndex === index ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                        } ${section.hidden ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {collapsedSections[index] ? (
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          )}
                          <SectionIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate capitalize">{section.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'down');
                            }}
                             disabled={index === pageWithUnsavedChanges!.content.length - 1}
                          >
                            <ArrowDown className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(index);
                            }}
                          >
                            {section.hidden ? (
                              <EyeOff className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Eye className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </button>
                    
                    {!collapsedSections[index] && (
                      <div className="ml-5 pl-2 border-l border-border">
                        <div className="text-xs text-muted-foreground py-1 px-2">
                          {section.heading || 'Untitled'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>

              {/* Add Section Button for Header */}
              <button
                onClick={() => toggleAddSectionMenu('header')}
                className="flex items-center gap-2 text-xs text-primary py-2 px-2 hover:bg-muted/50 rounded w-full"
              >
                <Plus className="w-3 h-3" />
                <span>Add section</span>
              </button>

              {/* Add Section Menu for Header */}
              {showAddSectionMenu.header && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                  {getSectionsByCategory('header').map(type => {
                    const Icon = sectionIconMap[type.id] || Layout;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleAddSection(type.id);
                          toggleAddSectionMenu('header');
                        }}
                        className="flex items-center gap-2 w-full text-xs py-1.5 px-2 hover:bg-muted/50 rounded text-left"
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Template Section */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Template
              </div>
              
              {/* Template Sections */}
              <div className="space-y-0.5 mb-2">
                {getPageSectionsByCategory('template').map(({ section, index }) => {
                  const SectionIcon = sectionIconMap[section.type] || Layout;
                  return (
                    <div key={index}>
                      <button
                        onClick={() => {
                          setEditingSectionIndex(index);
                          toggleSection(index);
                        }}
                        className={`group flex items-center justify-between w-full text-xs py-2 px-2 rounded hover:bg-muted/50 transition-colors ${
                          editingSectionIndex === index ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                        } ${section.hidden ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {collapsedSections[index] ? (
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          )}
                          <SectionIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate capitalize">{section.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'down');
                            }}
                             disabled={index === pageWithUnsavedChanges!.content.length - 1}
                          >
                            <ArrowDown className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(index);
                            }}
                          >
                            {section.hidden ? (
                              <EyeOff className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Eye className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </button>
                    
                    {!collapsedSections[index] && (
                      <div className="ml-5 pl-2 border-l border-border">
                        <div className="text-xs text-muted-foreground py-1 px-2">
                          {section.heading || 'Untitled'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>

              {/* Add Section Button for Template */}
              <button
                onClick={() => toggleAddSectionMenu('template')}
                className="flex items-center gap-2 text-xs text-primary py-2 px-2 hover:bg-muted/50 rounded w-full"
              >
                <Plus className="w-3 h-3" />
                <span>Add section</span>
              </button>

              {/* Add Section Menu for Template */}
              {showAddSectionMenu.template && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                  {getSectionsByCategory('template').map(type => {
                    const Icon = sectionIconMap[type.id] || Layout;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleAddSection(type.id);
                          toggleAddSectionMenu('template');
                        }}
                        className="flex items-center gap-2 w-full text-xs py-1.5 px-2 hover:bg-muted/50 rounded text-left"
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Footer
              </div>
              
              {/* Footer Sections */}
              <div className="space-y-0.5 mb-2">
                {getPageSectionsByCategory('footer').map(({ section, index }) => {
                  const SectionIcon = sectionIconMap[section.type] || Layout;
                  return (
                    <div key={index}>
                      <button
                        onClick={() => {
                          setEditingSectionIndex(index);
                          toggleSection(index);
                        }}
                        className={`group flex items-center justify-between w-full text-xs py-2 px-2 rounded hover:bg-muted/50 transition-colors ${
                          editingSectionIndex === index ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                        } ${section.hidden ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {collapsedSections[index] ? (
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          )}
                          <SectionIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate capitalize">{section.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(index, 'down');
                            }}
                            disabled={index === pageWithUnsavedChanges!.content.length - 1}
                          >
                            <ArrowDown className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(index);
                            }}
                          >
                            {section.hidden ? (
                              <EyeOff className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Eye className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </button>
                    
                    {!collapsedSections[index] && (
                      <div className="ml-5 pl-2 border-l border-border">
                        <div className="text-xs text-muted-foreground py-1 px-2">
                          {section.heading || 'Untitled'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>

              {/* Add Section Button for Footer */}
              <button
                onClick={() => toggleAddSectionMenu('footer')}
                className="flex items-center gap-2 text-xs text-primary py-2 px-2 hover:bg-muted/50 rounded w-full"
              >
                <Plus className="w-3 h-3" />
                <span>Add section</span>
              </button>

              {/* Add Section Menu for Footer */}
              {showAddSectionMenu.footer && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                  {getSectionsByCategory('footer').map(type => {
                    const Icon = sectionIconMap[type.id] || Layout;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleAddSection(type.id);
                          toggleAddSectionMenu('footer');
                        }}
                        className="flex items-center gap-2 w-full text-xs py-1.5 px-2 hover:bg-muted/50 rounded text-left"
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>
        
        {/* Center - Live Preview */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/10">
          <div className={`${viewMode === 'mobile' ? 'flex justify-center py-8' : ''}`}>
            {selectedPage?.content && selectedPage.content.length > 0 ? (
              <div className={`bg-background min-h-full ${viewMode === 'mobile' ? 'w-[375px] shadow-2xl overflow-hidden' : 'w-full'} transition-all duration-300`}>
                {selectedPage.content.map((section: Section, index: number) => {
                  if (section.hidden) return null;
                  
                  // Generate section ID for anchor navigation
                  let sectionId = section.type;
                  if (section.heading) {
                    const normalizedHeading = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    sectionId = normalizedHeading || section.type;
                  }
                  
                  console.log(`Section ${index}: type="${section.type}", heading="${section.heading}", id="${sectionId}"`);
                  
                  return (
                    <div
                      key={index}
                      id={sectionId}
                      onClick={(e) => {
                        // Don't capture clicks on navigation links
                        if ((e.target as HTMLElement).tagName !== 'A') {
                          setEditingSectionIndex(index);
                        }
                      }}
                      className={`relative transition-all overflow-hidden ${
                        editingSectionIndex === index ? 'ring-2 ring-primary ring-inset' : 'hover:ring-1 hover:ring-muted-foreground/20 hover:ring-inset'
                      }`}
                    >
                      {renderSection(section, index, true)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">No sections yet</p>
                  <Button onClick={() => setShowLayoutPicker(true)} variant="outline">
                    Choose a Layout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Text Edit Popover */}
        {textEditPopover?.show && selectedPage && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setTextEditPopover(null)}
            />
            <div
              className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-4"
              style={{
                left: `${textEditPopover.x}px`,
                top: `${textEditPopover.y}px`,
              }}
            >
              <div className="space-y-3 w-64">
                <div className="text-xs font-semibold text-muted-foreground mb-2 capitalize">
                  Edit {textEditPopover.element}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Font Size</Label>
                  <Select 
                    value={
                      textEditPopover.element === 'heading' 
                        ? selectedPage.content[textEditPopover.sectionIndex]?.headingFontSize || 'text-base'
                        : textEditPopover.element === 'subheading'
                        ? selectedPage.content[textEditPopover.sectionIndex]?.subheadingFontSize || 'text-base'
                        : selectedPage.content[textEditPopover.sectionIndex]?.contentFontSize || 'text-base'
                    } 
                    onValueChange={(value) => {
                      const field = textEditPopover.element === 'heading' 
                        ? 'headingFontSize' 
                        : textEditPopover.element === 'subheading' 
                        ? 'subheadingFontSize' 
                        : 'contentFontSize';
                      handleUpdateSection(textEditPopover.sectionIndex, field, value);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="text-xs">XS</SelectItem>
                      <SelectItem value="text-sm">SM</SelectItem>
                      <SelectItem value="text-base">Base</SelectItem>
                      <SelectItem value="text-lg">LG</SelectItem>
                      <SelectItem value="text-xl">XL</SelectItem>
                      <SelectItem value="text-2xl">2XL</SelectItem>
                      <SelectItem value="text-3xl">3XL</SelectItem>
                      <SelectItem value="text-4xl">4XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <Select 
                    value={
                      textEditPopover.element === 'heading' 
                        ? selectedPage.content[textEditPopover.sectionIndex]?.headingFontFamily || 'font-poppins'
                        : textEditPopover.element === 'subheading'
                        ? selectedPage.content[textEditPopover.sectionIndex]?.subheadingFontFamily || 'font-poppins'
                        : selectedPage.content[textEditPopover.sectionIndex]?.contentFontFamily || 'font-poppins'
                    } 
                    onValueChange={(value) => {
                      const field = textEditPopover.element === 'heading' 
                        ? 'headingFontFamily' 
                        : textEditPopover.element === 'subheading' 
                        ? 'subheadingFontFamily' 
                        : 'contentFontFamily';
                      handleUpdateSection(textEditPopover.sectionIndex, field, value);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="font-poppins">Poppins</SelectItem>
                      <SelectItem value="font-playfair">Playfair</SelectItem>
                      <SelectItem value="font-roboto">Roboto</SelectItem>
                      <SelectItem value="font-lato">Lato</SelectItem>
                      <SelectItem value="font-merriweather">Merriweather</SelectItem>
                      <SelectItem value="font-openSans">Open Sans</SelectItem>
                      <SelectItem value="font-montserrat">Montserrat</SelectItem>
                      <SelectItem value="font-raleway">Raleway</SelectItem>
                      <SelectItem value="font-inter">Inter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setTextEditPopover(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Right Sidebar - Properties Panel */}
        {editingSection && (
          <aside className="w-80 border-l border-border bg-background overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="text-sm font-semibold capitalize">{editingSection.type}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSectionIndex(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Heading */}
                <div>
                  <Label className="text-xs">Heading</Label>
                  <Input
                    value={editingSection.heading || ''}
                    onChange={(e) => handleUpdateSection(editingSectionIndex, 'heading', e.target.value)}
                    placeholder="Section heading"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Subheading */}
                {editingSection.type !== 'custom' && (
                  <>
                    <div>
                      <Label className="text-xs">Subheading</Label>
                      <Input
                        value={editingSection.subheading || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'subheading', e.target.value)}
                        placeholder="Optional subheading"
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <Label className="text-xs">Content</Label>
                      <Textarea
                        value={editingSection.content || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'content', e.target.value)}
                        rows={3}
                        placeholder="Section content"
                        className="text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Appearance Section */}
                <div className="pt-3 border-t">
                  <Label className="text-xs font-semibold mb-3 block">Appearance</Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Background</Label>
                      <Select 
                        value={editingSection.backgroundColor || 'bg-background'} 
                        onValueChange={(value) => handleUpdateSection(editingSectionIndex, 'backgroundColor', value)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="bg-background">Default</SelectItem>
                          <SelectItem value="bg-secondary">Secondary</SelectItem>
                          <SelectItem value="bg-muted">Muted</SelectItem>
                          <SelectItem value="gradient-to-br from-primary to-accent">Gradient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Text Color</Label>
                      <Select 
                        value={editingSection.textColor || 'text-foreground'} 
                        onValueChange={(value) => handleUpdateSection(editingSectionIndex, 'textColor', value)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="text-foreground">Default</SelectItem>
                          <SelectItem value="text-white">White</SelectItem>
                          <SelectItem value="text-primary">Primary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Font Size</Label>
                        <Select 
                          value={editingSection.fontSize || 'text-base'} 
                          onValueChange={(value) => handleUpdateSection(editingSectionIndex, 'fontSize', value)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="text-xs">XS</SelectItem>
                            <SelectItem value="text-sm">SM</SelectItem>
                            <SelectItem value="text-base">Base</SelectItem>
                            <SelectItem value="text-lg">LG</SelectItem>
                            <SelectItem value="text-xl">XL</SelectItem>
                            <SelectItem value="text-2xl">2XL</SelectItem>
                            <SelectItem value="text-3xl">3XL</SelectItem>
                            <SelectItem value="text-4xl">4XL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Font</Label>
                        <Select 
                          value={editingSection.fontFamily || 'font-sans'} 
                          onValueChange={(value) => handleUpdateSection(editingSectionIndex, 'fontFamily', value)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="font-poppins">Poppins</SelectItem>
                            <SelectItem value="font-playfair">Playfair</SelectItem>
                            <SelectItem value="font-roboto">Roboto</SelectItem>
                            <SelectItem value="font-lato">Lato</SelectItem>
                            <SelectItem value="font-merriweather">Merriweather</SelectItem>
                            <SelectItem value="font-openSans">Open Sans</SelectItem>
                            <SelectItem value="font-montserrat">Montserrat</SelectItem>
                            <SelectItem value="font-raleway">Raleway</SelectItem>
                            <SelectItem value="font-inter">Inter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type-specific fields */}
                {['hero', 'gallery', 'about', 'split', 'cta'].includes(editingSection.type) && (
                  <div>
                    <Label className="text-xs">Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editingSection.image || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'image', e.target.value)}
                        placeholder="Image URL or upload file"
                        className="h-9 text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              await handleSectionImageUpload(file, editingSectionIndex);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {editingSection.type === 'video' && (
                  <div>
                    <Label className="text-xs">YouTube URL</Label>
                    <Input
                      value={editingSection.video || ''}
                      onChange={(e) => handleUpdateSection(editingSectionIndex, 'video', e.target.value)}
                      placeholder="https://youtube.com/embed/..."
                      className="h-9 text-sm"
                    />
                  </div>
                )}

                {(editingSection.type === 'contact' || editingSection.type === 'cta') && (
                  <div>
                    <Label className="text-xs">Button Text</Label>
                    <Input
                      value={editingSection.buttonText || ''}
                      onChange={(e) => handleUpdateSection(editingSectionIndex, 'buttonText', e.target.value)}
                      placeholder="Submit"
                      className="h-9 text-sm"
                    />
                  </div>
                )}

                {/* Contact-specific fields */}
                {editingSection.type === 'contact' && (
                  <div className="pt-3 border-t space-y-4">
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        value={editingSection.email || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'email', e.target.value)}
                        placeholder="contact@example.com"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={editingSection.phone || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Address</Label>
                      <Textarea
                        value={editingSection.address || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'address', e.target.value)}
                        placeholder="123 Street, City, State 12345"
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Footer-specific fields */}
                {editingSection.type === 'footer' && (
                  <div className="pt-3 border-t space-y-4">
                    <div>
                      <Label className="text-xs">Company Name</Label>
                      <Input
                        value={editingSection.companyName || 'Your Company'}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'companyName', e.target.value)}
                        placeholder="Your Company"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold">Footer Links</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentLinks = editingSection.links || [];
                            handleUpdateSection(editingSectionIndex, 'links', [...currentLinks, { label: 'New Link', href: '?page=new-page' }]);
                          }}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Link
                        </Button>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(editingSection.links || []).map((link: any, idx: number) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Link #{idx + 1}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => {
                                  const newLinks = editingSection.links?.filter((_: any, i: number) => i !== idx) || [];
                                  handleUpdateSection(editingSectionIndex, 'links', newLinks);
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={link.label || ''}
                                onChange={(e) => {
                                  const newLinks = [...(editingSection.links || [])];
                                  newLinks[idx] = { ...link, label: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'links', newLinks);
                                }}
                                placeholder="Link Label"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={link.href || ''}
                                onChange={(e) => {
                                  const newLinks = [...(editingSection.links || [])];
                                  newLinks[idx] = { ...link, href: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'links', newLinks);
                                }}
                                placeholder="?page=page-name"
                                className="h-8 text-xs"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Logo Upload */}
                {editingSection.type === 'navigation' && (
                  <div className="pt-3 border-t">
                    <Label className="text-xs">Logo</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editingSection.logo || ''}
                        onChange={(e) => handleUpdateSection(editingSectionIndex, 'logo', e.target.value)}
                        placeholder="Logo URL or upload file"
                        className="h-9 text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              await handleLogoUpload(file, editingSectionIndex);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {editingSection.logo && (
                      <div className="mt-2">
                        <img src={editingSection.logo} alt="Logo preview" className="h-10 w-10 object-contain" />
                      </div>
                    )}
                  </div>
                )}

                {/* Items management */}
                {['gallery', 'testimonials', 'features', 'services', 'team', 'stats', 'timeline', 'projects', 'skills', 'navigation', 'contact'].includes(editingSection.type) && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-xs font-semibold">
                        {editingSection.type === 'contact' ? 'Form Fields' : 'Items'}
                      </Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentItems = editingSection.type === 'contact' ? (editingSection.fields || []) : (editingSection.items || []);
                          const newItem = editingSection.type === 'gallery' ? { image: '', title: '', description: '' } :
                            editingSection.type === 'testimonials' ? { name: '', role: '', description: '', rating: 5 } :
                            editingSection.type === 'features' || editingSection.type === 'services' ? { title: '', description: '', icon: 'Sparkles' } :
                            editingSection.type === 'team' ? { name: '', role: '', bio: '' } :
                            editingSection.type === 'stats' ? { value: '', label: '' } :
                            editingSection.type === 'timeline' ? { title: '', description: '', date: '' } :
                            editingSection.type === 'projects' ? { title: '', description: '', image: '', tags: [] } :
                            editingSection.type === 'skills' ? { name: '', level: 50 } :
                            editingSection.type === 'navigation' ? { label: '', href: '' } :
                            editingSection.type === 'contact' ? { id: '', label: '', type: 'text', required: false } : {};
                          const fieldName = editingSection.type === 'contact' ? 'fields' : 'items';
                          handleUpdateSection(editingSectionIndex, fieldName, [...currentItems, newItem]);
                        }}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {(editingSection.type === 'contact' ? editingSection.fields : editingSection.items)?.map((item: any, idx: number) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => {
                                const fieldName = editingSection.type === 'contact' ? 'fields' : 'items';
                                const current = editingSection.type === 'contact' ? editingSection.fields : editingSection.items;
                                handleUpdateSection(editingSectionIndex, fieldName, current.filter((_: any, i: number) => i !== idx));
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                          
                          {/* Simplified item inputs based on type */}
                          {editingSection.type === 'contact' && (
                            <div className="space-y-2">
                              <Input
                                value={item.label || ''}
                                onChange={(e) => {
                                  const newFields = [...editingSection.fields];
                                  newFields[idx] = { ...item, label: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'fields', newFields);
                                }}
                                placeholder="Field Label"
                                className="h-8 text-xs"
                              />
                              <Select
                                value={item.type || 'text'}
                                onValueChange={(value) => {
                                  const newFields = [...editingSection.fields];
                                  newFields[idx] = { ...item, type: value };
                                  handleUpdateSection(editingSectionIndex, 'fields', newFields);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="tel">Phone</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {(editingSection.type === 'features' || editingSection.type === 'services') && (
                            <div className="space-y-2">
                              <Input
                                value={item.title || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, title: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Title"
                                className="h-8 text-xs"
                              />
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                  Description (one bullet point per line)
                                </Label>
                                <Textarea
                                  value={Array.isArray(item.description) ? item.description.join('\n') : item.description || ''}
                                  onChange={(e) => {
                                    const newItems = [...editingSection.items];
                                    const lines = e.target.value.split('\n').filter(line => line.trim());
                                    newItems[idx] = { ...item, description: lines.length > 0 ? lines : e.target.value };
                                    handleUpdateSection(editingSectionIndex, 'items', newItems);
                                  }}
                                  placeholder="Enter bullet points, one per line&#10;Example:&#10;Feature benefit 1&#10;Feature benefit 2&#10;Feature benefit 3"
                                  rows={4}
                                  className="text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Icon</Label>
                                <IconPicker
                                  value={item.icon || 'Sparkles'}
                                  onChange={(value) => {
                                    const newItems = [...editingSection.items];
                                    newItems[idx] = { ...item, icon: value };
                                    handleUpdateSection(editingSectionIndex, 'items', newItems);
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {editingSection.type === 'gallery' && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Image</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={item.image || item.url || ''}
                                    onChange={(e) => {
                                      const newItems = [...editingSection.items];
                                      newItems[idx] = { ...item, image: e.target.value };
                                      handleUpdateSection(editingSectionIndex, 'items', newItems);
                                    }}
                                    placeholder="Image URL or upload file"
                                    className="h-8 text-xs flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          await handleImageUpload(file, editingSectionIndex, idx);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    <Upload className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <Input
                                value={item.title || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, title: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Title"
                                className="h-8 text-xs"
                              />
                              <Textarea
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, description: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Description"
                                rows={2}
                                className="text-xs"
                              />
                            </div>
                          )}

                          {editingSection.type === 'testimonials' && (
                            <div className="space-y-2">
                              <Input
                                value={item.name || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, name: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Name"
                                className="h-8 text-xs"
                              />
                              <Textarea
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, description: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Review"
                                rows={2}
                                className="text-xs"
                              />
                            </div>
                          )}

                          {editingSection.type === 'team' && (
                            <div className="space-y-2">
                              <Input
                                value={item.name || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, name: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Name"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.role || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, role: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Role"
                                className="h-8 text-xs"
                              />
                              <Textarea
                                value={item.bio || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, bio: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Bio"
                                rows={2}
                                className="text-xs"
                              />
                            </div>
                          )}

                          {editingSection.type === 'stats' && (
                            <div className="space-y-2">
                              <Input
                                value={item.value || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, value: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Value (e.g., 100+)"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.label || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, label: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Label"
                                className="h-8 text-xs"
                              />
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Icon (Optional)</Label>
                                <IconPicker
                                  value={item.icon || ''}
                                  onChange={(value) => {
                                    const newItems = [...editingSection.items];
                                    newItems[idx] = { ...item, icon: value };
                                    handleUpdateSection(editingSectionIndex, 'items', newItems);
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {editingSection.type === 'timeline' && (
                            <div className="space-y-2">
                              <Input
                                value={item.date || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, date: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Date"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.title || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, title: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Title"
                                className="h-8 text-xs"
                              />
                              <Textarea
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, description: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Description"
                                rows={2}
                                className="text-xs"
                              />
                            </div>
                          )}

                          {editingSection.type === 'projects' && (
                            <div className="space-y-2">
                              <Input
                                value={item.title || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, title: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Title"
                                className="h-8 text-xs"
                              />
                              <Textarea
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, description: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Description"
                                rows={2}
                                className="text-xs"
                              />
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Image</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={item.image || ''}
                                    onChange={(e) => {
                                      const newItems = [...editingSection.items];
                                      newItems[idx] = { ...item, image: e.target.value };
                                      handleUpdateSection(editingSectionIndex, 'items', newItems);
                                    }}
                                    placeholder="Image URL or upload file"
                                    className="h-8 text-xs flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          await handleImageUpload(file, editingSectionIndex, idx);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    <Upload className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {editingSection.type === 'skills' && (
                            <div className="space-y-2">
                              <Input
                                value={item.name || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, name: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Skill Name"
                                className="h-8 text-xs"
                              />
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.level || 50}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, level: parseInt(e.target.value) || 0 };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Level (0-100)"
                                className="h-8 text-xs"
                              />
                            </div>
                          )}

                          {editingSection.type === 'navigation' && (
                            <div className="space-y-2">
                              <Input
                                value={item.label || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, label: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Label"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.href || ''}
                                onChange={(e) => {
                                  const newItems = [...editingSection.items];
                                  newItems[idx] = { ...item, href: e.target.value };
                                  handleUpdateSection(editingSectionIndex, 'items', newItems);
                                }}
                                placeholder="Link (e.g., #about)"
                                className="h-8 text-xs"
                              />
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
          )}
        </div>
      </div>
  );
};
