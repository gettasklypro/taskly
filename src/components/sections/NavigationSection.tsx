import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavigationItem {
  label: string;
  href: string;
}

interface NavigationSectionProps {
  items?: NavigationItem[];
  logo?: string;
  logoText?: string;
  showThemeToggle?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onItemClick?: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const NavigationSection = ({ 
  items = [], 
  logo, 
  logoText = "Portfolio",
  heading,
  showThemeToggle = true,
  backgroundColor = "bg-background/95",
  textColor = "text-foreground",
  onItemClick
}: NavigationSectionProps & { heading?: string }) => {
  const displayText = heading || logoText;
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('NavigationSection rendered with items:', items, 'onItemClick:', !!onItemClick);

  return (
    <div className={`relative ${mobileMenuOpen ? 'min-h-screen' : ''}`}>
      <nav className={`sticky top-0 z-50 backdrop-blur-md ${backgroundColor} ${textColor} border-b border-border/40 shadow-sm @container`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
              {logo && (
                <img 
                  src={logo} 
                  alt={displayText} 
                  className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 object-contain" 
                />
              )}
              <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate max-w-[150px] sm:max-w-[200px] @[600px]:max-w-none">
                {displayText}
              </span>
            </div>

            {/* Desktop Navigation - Only show when container is wide enough */}
            <div className="hidden @[800px]:flex items-center gap-1 lg:gap-2 flex-1 justify-center px-8">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hover:text-primary transition-all duration-200 whitespace-nowrap rounded-md hover:bg-accent/50"
                  onClick={(e) => {
                    console.log('Anchor clicked:', item.href, 'handler exists:', !!onItemClick, 'handler:', onItemClick);
                    if (onItemClick) {
                      console.log('Calling handler with:', item.href, e);
                      onItemClick(item.href, e);
                      console.log('Handler called');
                    }
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {showThemeToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent"
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}
              
              {/* Mobile Menu Button - Show when container is narrow */}
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="@[800px]:hidden h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`fixed top-0 left-0 bottom-0 w-[280px] sm:w-[340px] max-w-[85%] bg-background ${textColor} shadow-2xl animate-slide-in-left overflow-y-auto border-r border-border`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  {logo && (
                    <img 
                      src={logo} 
                      alt={displayText} 
                      className="h-10 w-10 object-contain" 
                    />
                  )}
                  <h2 className="text-xl font-bold">{displayText}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-9 w-9 hover:bg-accent"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    className="py-3 px-4 text-base font-medium hover:bg-accent hover:text-primary rounded-lg transition-all duration-200 border border-transparent hover:border-border"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      onItemClick?.(item.href, e);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
