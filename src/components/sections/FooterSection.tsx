interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  heading?: string;
  backgroundColor?: string;
  textColor?: string;
  links?: FooterLink[];
  companyName?: string;
}

export const FooterSection = ({
  backgroundColor = "bg-muted",
  textColor = "text-muted-foreground",
  links = [
    { label: "Privacy Policy", href: "?page=privacy-policy" },
    { label: "Terms of Service", href: "?page=terms-of-service" },
    { label: "Refund Policy", href: "?page=refund-policy" }
  ],
  companyName = "Your Company"
}: FooterSectionProps) => {
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Extract page name from href and remove leading slash if present
    let pageSlug = href.includes('=') ? href.split('=')[1] : href.replace('?page=', '');
    // Strip leading slash to avoid double slashes in URL
    pageSlug = pageSlug.replace(/^\//, '');
    
    // Detect if we're on a public website (subdomain or custom domain)
    const hostname = window.location.hostname;
    const isMainAppDomain = hostname.includes('lovableproject.com') || 
                           hostname === 'localhost' ||
                           hostname === '127.0.0.1';
    
    const isPublicWebsite = !isMainAppDomain;
    
    // Check if we're in preview mode
    const isPreview = window.location.pathname.includes('/preview/');
    
    if (isPreview) {
      // In preview mode, use query parameters and force reload
      const currentUrl = window.location.href.split('?')[0]; // Remove existing params
      window.location.href = `${currentUrl}?page=${pageSlug}`;
    } else if (isPublicWebsite) {
      // On subdomain or custom domain, navigate to page path
      window.location.href = `/${pageSlug}`;
    } else {
      // In /site/ path mode, navigate to the page path
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      
      // Build base path (e.g., /site/slug)
      const basePath = pathParts.slice(0, 3).join('/');
      window.location.href = `${basePath}/${pageSlug}`;
    }
  };

  return (
    <footer className={`${backgroundColor} ${textColor} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleNavigation(e, link.href)}
                className="text-sm hover:text-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
