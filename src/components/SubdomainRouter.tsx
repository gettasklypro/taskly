import { useEffect, useState } from "react";
import PublicWebsiteViewer from "@/pages/PublicWebsiteViewer";

interface SubdomainRouterProps {
  children: React.ReactNode;
}

export const SubdomainRouter = ({ children }: SubdomainRouterProps) => {
  const [isPublicWebsite, setIsPublicWebsite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    console.log("Checking hostname:", hostname);

    // Check if this is a subdomain or custom domain
    const parts = hostname.split(".");

    // Main app domains (where the app itself runs)
    const isMainAppDomain =
      hostname.includes("lovableproject.com") || 
      hostname === "localhost" || 
      hostname === "127.0.0.1" ||
      hostname === "app.gettaskly.ai";

    // Detect subdomain patterns:
    // - subdomain.gettaskly.ai (production subdomains for public websites)
    // - subdomain.lovable.app (Lovable staging subdomains)
    // - subdomain.vercel.app (Vercel preview)
    // - NOT: localhost, gettaskly.ai, www.gettaskly.ai, app.gettaskly.ai (main app)
    const isProductionSubdomain =
      parts.length >= 3 &&
      hostname.includes("gettaskly.ai") &&
      !hostname.startsWith("www.") &&
      !hostname.startsWith("app.") &&
      parts[0] !== "gettaskly.ai";

    const isLovableSubdomain =
      parts.length >= 3 && hostname.includes("lovable.app") && !hostname.startsWith("www.") && parts[0] !== "lovable";

    const isVercelSubdomain =
      parts.length >= 3 && hostname.includes("vercel.app") && !hostname.startsWith("www.") && parts[0] !== "vercel";

    // Custom domain: any domain that's not a main app domain
    const isCustomDomain =
      !isMainAppDomain &&
      !isProductionSubdomain &&
      !isLovableSubdomain &&
      !isVercelSubdomain &&
      !hostname.startsWith("www.gettaskly.ai") &&
      hostname !== "gettaskly.ai";

    if (isProductionSubdomain || isLovableSubdomain || isVercelSubdomain || isCustomDomain) {
      console.log("Detected public website (subdomain or custom domain), showing public website");
      setIsPublicWebsite(true);
    } else {
      console.log("Main app domain, showing app");
      setIsPublicWebsite(false);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isPublicWebsite) {
    return <PublicWebsiteViewer />;
  }

  return <>{children}</>;
};
