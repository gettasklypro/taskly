import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface ContactSectionProps {
  heading?: string;
  subheading?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  email?: string;
  phone?: string;
  address?: string;
  fields?: FormField[];
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

export const ContactSection = ({
  heading = "Get In Touch",
  subheading,
  content,
  backgroundColor = 'bg-background',
  textColor = 'text-foreground',
  buttonText = "Send Message",
  email,
  phone,
  address,
  fields = [],
  headingFontSize = 'text-3xl md:text-4xl',
  headingFontFamily = 'font-poppins',
  subheadingFontSize = 'text-lg',
  subheadingFontFamily = 'font-poppins',
  contentFontSize = 'text-base',
  contentFontFamily = 'font-poppins',
  onHeadingClick,
  onSubheadingClick,
  onContentClick
}: ContactSectionProps) => {
  // Default fields if none provided
  const defaultFields: FormField[] = [
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
    { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...', required: true }
  ];
  
  const formFields = fields.length > 0 ? fields : defaultFields;
  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 ${backgroundColor} ${textColor}`}>
      <div className="max-w-6xl mx-auto">
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
        {content && (
          <p 
            className={`${contentFontSize} ${contentFontFamily} text-center text-muted-foreground mb-8 sm:mb-12 animate-fade-in px-4 ${onContentClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onContentClick}
          >
            {content}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          {/* Contact Information */}
          {(email || phone || address) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              {email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary">
                      {email}
                    </a>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href={`tel:${phone}`} className="text-muted-foreground hover:text-primary">
                      {phone}
                    </a>
                  </div>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Contact Form */}
          <form className="space-y-4 sm:space-y-6">
            {formFields.map((field, i) => (
              <div key={i}>
                <Label htmlFor={field.id} className="text-sm sm:text-base">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {field.type === 'textarea' ? (
                  <Textarea 
                    id={field.id}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="mt-1.5 bg-card border-2"
                  />
                ) : field.type === 'select' ? (
                  <Select>
                    <SelectTrigger className="mt-1.5 bg-card border-2">
                      <SelectValue placeholder={field.placeholder || 'Select an option'} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, j) => (
                        <SelectItem key={j} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-2 mt-1.5">
                    <Checkbox id={field.id} required={field.required} />
                    <label htmlFor={field.id} className="text-sm">
                      {field.placeholder}
                    </label>
                  </div>
                ) : (
                  <Input 
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="mt-1.5 bg-card border-2"
                  />
                )}
              </div>
            ))}
            
            <Button type="submit" size="lg" className="w-full text-base sm:text-lg py-5 sm:py-6">
              {buttonText}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};