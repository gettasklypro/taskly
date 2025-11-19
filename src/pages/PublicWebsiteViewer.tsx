import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import * as LucideIcons from "lucide-react";
import { Loader2, CheckCircle } from "lucide-react";
import { HeroSection } from "@/components/sections/HeroSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { NavigationSection } from "@/components/sections/NavigationSection";

const PublicWebsiteViewer = () => {
  const {
    slug: pathSlug,
    page: pagePath,
    websiteId,
  } = useParams<{ slug: string; page?: string; websiteId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [website, setWebsite] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [allPages, setAllPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWebsite = async () => {
      try {
        // If websiteId is provided (preview mode), fetch by ID
        if (websiteId) {
          console.log("Loading website in preview mode with ID:", websiteId);

          const { data: websiteData, error: websiteError } = await supabase
            .from("websites")
            .select("*")
            .eq("id", websiteId)
            .maybeSingle();

          if (websiteError) throw new Error("Website not found");
          if (!websiteData) throw new Error("Website not found");

          // Fetch all pages for this website
          const { data: pagesData, error: pagesError } = await supabase
            .from("pages")
            .select("*")
            .eq("website_id", websiteData.id)
            .order("is_homepage", { ascending: false });

          if (pagesError) throw new Error("Pages not found");
          if (!pagesData || pagesData.length === 0) throw new Error("No pages found");

          setAllPages(pagesData);
          setWebsite(websiteData);

          // Set favicon if available
          if (websiteData.favicon_url) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = websiteData.favicon_url;
          }

          // Helper function to update meta tags
          const updateMetaTag = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
              meta = document.querySelector(`meta[name="${property}"]`);
            }
            if (!meta) {
              meta = document.createElement("meta");
              if (property.startsWith("og:") || property.startsWith("twitter:")) {
                meta.setAttribute("property", property);
              } else {
                meta.setAttribute("name", property);
              }
              document.head.appendChild(meta);
            }
            meta.setAttribute("content", content);
          };

          // Helper function to make URLs absolute
          const makeAbsoluteUrl = (url: string): string => {
            if (!url) return "";
            if (url.startsWith("http://") || url.startsWith("https://")) {
              return url;
            }
            const origin = window.location.origin;
            return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
          };

          // In preview mode, check for page query parameter
          const pageParam = searchParams.get("page");
          let targetPage;

          if (pageParam) {
            // Find page by slug or title - normalize slugs by removing leading slashes
            const normalizedParam = pageParam.replace(/^\//, "");
            targetPage = pagesData.find((p) => {
              const normalizedSlug = p.slug?.replace(/^\//, "") || "";
              const normalizedTitle = p.title?.toLowerCase().replace(/\s+/g, "-") || "";
              return normalizedSlug === normalizedParam || normalizedTitle === normalizedParam;
            });
          }

          // Default to homepage if no page specified or not found
          if (!targetPage) {
            targetPage = pagesData.find((p) => p.is_homepage) || pagesData[0];
          }

          // Extract hero section data from the current page for meta tags
          let metaTitle = "";
          let metaDescription = "";
          let metaImage = "";

          if (targetPage && targetPage.content && Array.isArray(targetPage.content)) {
            const heroSection = (targetPage.content as any[]).find((section) => section && section.type === "hero");
            if (heroSection) {
              metaTitle = heroSection.heading || "";
              metaDescription = heroSection.content || "";
              metaImage = heroSection.image || "";
            }
          }

          // Fallbacks for title and description
          if (!metaTitle) {
            metaTitle = websiteData.site_title || websiteData.name || "Taskly — All-in-One Service Management";
          }
          if (!metaDescription) {
            metaDescription =
              websiteData.description ||
              "Streamline your service business with Taskly's website builder and CRM tools.";
          }

          // Image priority: favicon > hero image > default icon
          let ogImage = "";
          if (websiteData.favicon_url) {
            ogImage = makeAbsoluteUrl(websiteData.favicon_url);
          } else if (metaImage) {
            ogImage = makeAbsoluteUrl(metaImage);
          } else {
            ogImage = makeAbsoluteUrl("/icon-512.png");
          }

          // Update document title
          document.title = metaTitle;

          // Update all meta tags
          updateMetaTag("description", metaDescription);
          updateMetaTag("og:type", "website");
          updateMetaTag("og:url", window.location.href);
          updateMetaTag("og:title", metaTitle);
          updateMetaTag("og:description", metaDescription);
          updateMetaTag("og:image", ogImage);
          updateMetaTag("twitter:card", "summary_large_image");
          updateMetaTag("twitter:title", metaTitle);
          updateMetaTag("twitter:description", metaDescription);
          updateMetaTag("twitter:image", ogImage);

          setCurrentPage(targetPage);
          setLoading(false);
          return;
        }

        let slug = pathSlug;
        let currentPath = pagePath;
        let lookupByDomain = false;

        // If no path slug, try to detect from hostname (subdomain or custom domain)
        if (!slug) {
          const hostname = window.location.hostname;
          const pathname = window.location.pathname;
          console.log("Checking hostname:", hostname, "pathname:", pathname);

          const parts = hostname.split(".");

          // Check if this is a main app domain
          const isMainAppDomain =
            hostname.includes("lovableproject.com") || hostname === "localhost" || hostname === "127.0.0.1";

          // Check if this is a subdomain (*.gettaskly.ai or *.lovable.app)
          const isSubdomain = 
            (parts.length >= 3 && hostname.includes("gettaskly.ai") && !hostname.startsWith("www.")) ||
            (parts.length >= 3 && hostname.includes("lovable.app") && !hostname.startsWith("www."));

          if (isMainAppDomain) {
            console.log("Main app domain, not a public website");
            setError("This page is not available");
            setLoading(false);
            return;
          } else if (isSubdomain) {
            // Subdomain: extract slug from first part
            slug = parts[0];
            currentPath = pathname.replace(/^\//, "") || undefined;
            console.log("Detected subdomain slug:", slug, "path:", currentPath);
          } else {
            // Custom domain: look up by full hostname
            lookupByDomain = true;
            currentPath = pathname.replace(/^\//, "") || undefined;
            console.log("Detected custom domain:", hostname, "path:", currentPath);
          }
        }

        console.log("Loading website...", lookupByDomain ? "by domain" : "by slug:", slug || window.location.hostname);

        // Fetch published website
        let websiteData;
        let websiteError;

        if (lookupByDomain) {
          // Look up by custom domain
          const result = await supabase
            .from("websites")
            .select("*")
            .eq("domain", window.location.hostname)
            .eq("status", "published")
            .maybeSingle();

          websiteData = result.data;
          websiteError = result.error;
        } else {
          // Look up by slug
          const result = await supabase
            .from("websites")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

          websiteData = result.data;
          websiteError = result.error;
        }

        if (websiteError) throw new Error("Website not found");
        if (!websiteData) throw new Error("Website not found");

        // Fetch all pages for this website
        const { data: pagesData, error: pagesError } = await supabase
          .from("pages")
          .select("*")
          .eq("website_id", websiteData.id)
          .order("is_homepage", { ascending: false });

        if (pagesError) throw new Error("Pages not found");
        if (!pagesData || pagesData.length === 0) throw new Error("No pages found");

        setAllPages(pagesData);
        setWebsite(websiteData);

        // Set favicon if available
        if (websiteData.favicon_url) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = websiteData.favicon_url;
        }

        // Helper function to update meta tags
        const updateMetaTag = (property: string, content: string) => {
          let meta = document.querySelector(`meta[property="${property}"]`);
          if (!meta) {
            meta = document.querySelector(`meta[name="${property}"]`);
          }
          if (!meta) {
            meta = document.createElement("meta");
            if (property.startsWith("og:") || property.startsWith("twitter:")) {
              meta.setAttribute("property", property);
            } else {
              meta.setAttribute("name", property);
            }
            document.head.appendChild(meta);
          }
          meta.setAttribute("content", content);
        };

        // Helper function to make URLs absolute
        const makeAbsoluteUrl = (url: string): string => {
          if (!url) return "";
          if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
          }
          const origin = window.location.origin;
          return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
        };

        // Determine which page to show based on route
        let targetPage;

        if (currentPath) {
          // Find the page by slug or title - normalize slugs by removing leading slashes
          const normalizedPath = currentPath.replace(/^\//, "");
          targetPage = pagesData.find((p) => {
            const normalizedSlug = p.slug?.replace(/^\//, "") || "";
            const normalizedTitle = p.title?.toLowerCase().replace(/\s+/g, "-") || "";
            return normalizedSlug === normalizedPath || normalizedTitle === normalizedPath;
          });

          console.log("Looking for page with path:", normalizedPath, "found:", targetPage?.title);
        }

        // Default to homepage if no page specified or not found
        if (!targetPage) {
          targetPage = pagesData.find((p) => p.is_homepage) || pagesData[0];
        }

        // Extract hero section data from the current page for meta tags
        let metaTitle = "";
        let metaDescription = "";
        let metaImage = "";

        if (targetPage && targetPage.content && Array.isArray(targetPage.content)) {
          const heroSection = (targetPage.content as any[]).find((section) => section && section.type === "hero");
          if (heroSection) {
            metaTitle = heroSection.heading || "";
            metaDescription = heroSection.content || "";
            metaImage = heroSection.image || "";
          }
        }

        // Fallbacks for title and description
        if (!metaTitle) {
          metaTitle = websiteData.site_title || websiteData.name || "Taskly — All-in-One Service Management";
        }
        if (!metaDescription) {
          metaDescription =
            websiteData.description || "Streamline your service business with Taskly's website builder and CRM tools.";
        }

        // Image priority: favicon > hero image > default icon
        let ogImage = "";
        if (websiteData.favicon_url) {
          ogImage = makeAbsoluteUrl(websiteData.favicon_url);
        } else if (metaImage) {
          ogImage = makeAbsoluteUrl(metaImage);
        } else {
          ogImage = makeAbsoluteUrl("/icon-512.png");
        }

        // Update document title
        document.title = metaTitle;

        // Update all meta tags
        updateMetaTag("description", metaDescription);
        updateMetaTag("og:type", "website");
        updateMetaTag("og:url", window.location.href);
        updateMetaTag("og:title", metaTitle);
        updateMetaTag("og:description", metaDescription);
        updateMetaTag("og:image", ogImage);
        updateMetaTag("twitter:card", "summary_large_image");
        updateMetaTag("twitter:title", metaTitle);
        updateMetaTag("twitter:description", metaDescription);
        updateMetaTag("twitter:image", ogImage);

        setCurrentPage(targetPage);
      } catch (err: any) {
        setError(err.message || "Failed to load website");
      } finally {
        setLoading(false);
      }
    };

    loadWebsite();
  }, [pathSlug, pagePath, websiteId, location.pathname]);

  const renderSection = (section: any, index: number) => {
    // Handle backgroundColor properly - check if it's a gradient or solid color
    let bgClass = "";
    if (section.backgroundColor) {
      // If it contains gradient keywords, prefix with bg-
      if (
        section.backgroundColor.includes("gradient-") ||
        section.backgroundColor.includes("from-") ||
        section.backgroundColor.includes("to-")
      ) {
        bgClass = `bg-${section.backgroundColor}`;
      } else if (section.backgroundColor.startsWith("bg-")) {
        bgClass = section.backgroundColor;
      } else {
        bgClass = section.backgroundColor;
      }
    } else if (section.background === "dark") {
      bgClass = "bg-gray-900 text-white";
    } else if (section.background === "accent") {
      bgClass = "bg-primary/10";
    } else {
      bgClass = "bg-background";
    }

    const textColorClass = section.textColor || "";
    const sectionClasses = `py-16 px-4 ${bgClass} ${textColorClass} ${section.animation || ""}`;

    // Create a section ID for anchor navigation
    // Priority: normalized heading > section type
    let sectionId = section.type;
    if (section.heading) {
      const normalizedHeading = section.heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      sectionId = normalizedHeading || section.type;
    }

    // Use the generated sectionId directly (no arbitrary mapping)
    const finalId = sectionId;

    switch (section.type) {
      case "navigation":
        // Transform navigation items to handle clicks properly
        const navItems =
          section.items?.map((item: any) => {
            const href = item.href || "";

            return {
              label: item.label,
              href: href,
            };
          }) || [];

        // Create click handler for navigation items
        const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
          // For anchor links, use smooth scrolling
          if (href.startsWith("#")) {
            e.preventDefault();
            const targetId = href.slice(1);
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            return;
          }

          // Detect if we're on a public website (subdomain or custom domain)
          const hostname = window.location.hostname;
          const isMainAppDomain =
            hostname.includes("lovableproject.com") || hostname === "localhost" || hostname === "127.0.0.1";

          const isPublicWebsite = !isMainAppDomain;

          // Handle home page link specially
          if (href === "/") {
            e.preventDefault();
            // In preview mode
            if (websiteId) {
              navigate(`/preview/${websiteId}`);
            } else if (isPublicWebsite) {
              // On subdomain or custom domain, just reload the root
              window.location.href = "/";
            } else {
              // In /site/ path mode, reload the homepage
              const homepage = allPages.find((p) => p.is_homepage);
              if (homepage && pathSlug) {
                navigate(`/site/${pathSlug}`);
              }
            }
            return;
          }

          // For page links (not starting with http)
          if (!href.startsWith("http")) {
            e.preventDefault();
            const cleanHref = href.replace(/^\//, "");

            // In preview mode
            if (websiteId) {
              navigate(`/preview/${websiteId}?page=${cleanHref}`);
            } else if (isPublicWebsite) {
              // On subdomain or custom domain, navigate to page path
              window.location.href = `/${cleanHref}`;
            } else {
              // In /site/ path mode
              navigate(`/site/${pathSlug}/${cleanHref}`);
            }
            return;
          }

          // For external links, let default behavior handle it (opens in new tab if target="_blank")
        };

        return (
          <NavigationSection
            key={index}
            items={navItems}
            logo={section.logo}
            logoText={section.logoText === "Portfolio" || section.heading === "Portfolio" ? website?.name : (section.logoText || section.heading || website?.name)}
            heading={section.heading}
            showThemeToggle={false}
            backgroundColor={section.backgroundColor || "bg-background/95"}
            textColor={section.textColor || "text-foreground"}
            onItemClick={handleNavClick}
          />
        );

      case "hero":
        const buttons = [];
        if (section.primaryButton) {
          buttons.push({
            text: section.primaryButton.text,
            variant: "default",
            href: section.primaryButton.href,
          });
        }
        if (section.secondaryButton) {
          buttons.push({
            text: section.secondaryButton.text,
            variant: "outline",
            href: section.secondaryButton.href,
          });
        }

        return (
          <div key={index} id={finalId}>
            <HeroSection
              heading={section.heading}
              subheading={section.subheading}
              content={section.content}
              image={section.backgroundImage || section.image}
              buttons={buttons}
              backgroundColor={section.backgroundColor}
              textColor={section.textColor}
              animation={section.animation}
            />
          </div>
        );

      case "text":
      case "content":
      case "about":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto max-w-4xl">
              {section.image && (
                <img
                  src={section.image}
                  alt={section.heading || "Content"}
                  className="mx-auto rounded-lg shadow-lg max-w-full h-auto mb-8"
                />
              )}
              {section.heading && <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.heading}</h2>}
              {section.subheading && <p className="text-xl mb-4 text-muted-foreground">{section.subheading}</p>}
              {section.content && <p className="text-lg whitespace-pre-wrap">{section.content}</p>}
            </div>
          </section>
        );

      case "services":
      case "features":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              {section.subheading && (
                <p className="text-center text-muted-foreground mb-12 text-lg">{section.subheading}</p>
              )}
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {section.items?.map((item: any, idx: number) => {
                  const ItemIcon =
                    item.icon && (LucideIcons as any)[item.icon]
                      ? (LucideIcons as any)[item.icon]
                      : LucideIcons.Sparkles;
                  return (
                    <div key={idx} className="text-center p-6">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                      )}
                      {!item.image && (
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <ItemIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                      {item.title && <h3 className="text-xl font-semibold mb-2">{item.title}</h3>}
                      {item.description &&
                        (Array.isArray(item.description) ? (
                          <ul className="space-y-2 text-left">
                            {item.description.map((point: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">{item.description}</p>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "stats":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              {section.subheading && (
                <p className="text-center text-muted-foreground mb-12 text-lg">{section.subheading}</p>
              )}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-8">
                {section.items?.map((stat: any, idx: number) => (
                  <div key={idx} className="text-center p-6">
                    {stat.icon && <div className="text-4xl mb-4">{stat.icon}</div>}
                    <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.stat || stat.value}
                    </div>
                    <div className="text-sm md:text-base font-medium">{stat.title || stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "projects":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items?.map((project: any, idx: number) => (
                  <div key={idx} className="rounded-lg overflow-hidden bg-card border">
                    {project.image && (
                      <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-6">
                      {project.title && <h3 className="text-xl font-semibold mb-2">{project.title}</h3>}
                      {project.description && <p className="text-muted-foreground">{project.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "skills":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {section.items?.map((skill: any, idx: number) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "timeline":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto max-w-4xl">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              <div className="space-y-8">
                {section.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-32 text-muted-foreground">{item.date}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                      {item.subtitle && <p className="text-muted-foreground mb-2">{item.subtitle}</p>}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "testimonials":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              {section.subheading && (
                <p className="text-center text-muted-foreground mb-12 text-lg">{section.subheading}</p>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items?.map((testimonial: any, idx: number) => (
                  <div key={idx} className="bg-card p-6 rounded-lg border">
                    {testimonial.image && (
                      <img
                        src={testimonial.image}
                        alt={testimonial.title || testimonial.name}
                        className="w-12 h-12 rounded-full mb-4"
                      />
                    )}
                    <p className="mb-4 italic">"{testimonial.description || testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.title || testimonial.name}</p>
                      {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "gallery":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{section.heading}</h2>
              )}
              <div className="grid md:grid-cols-3 gap-4">
                {section.items?.map((item: any, idx: number) => {
                  const imageUrl = item.image || item.url;
                  const caption = item.caption || item.title;
                  const description = item.description;

                  return (
                    <div key={idx} className="group relative overflow-hidden rounded-xl aspect-square">
                      <img
                        src={imageUrl}
                        alt={caption || `Gallery image ${idx + 1}`}
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
          </section>
        );

      case "video":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto max-w-4xl">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{section.heading}</h2>
              )}
              {section.videoUrl && (
                <div className="aspect-video">
                  <iframe
                    src={section.videoUrl}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </section>
        );

      case "cta":
        return (
          <section
            key={index}
            id={finalId}
            className={`${section.image ? "relative min-h-[400px] flex items-center justify-center" : sectionClasses}`}
          >
            {section.image && (
              <>
                <img src={section.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
              </>
            )}
            <div
              className={`container mx-auto text-center max-w-3xl ${section.image ? "relative z-10 text-white" : ""}`}
            >
              {section.heading && <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.heading}</h2>}
              {section.content && <p className="text-lg mb-8 opacity-90">{section.content}</p>}
              {section.buttonText && (
                <a
                  href={section.buttonUrl || "#"}
                  className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  {section.buttonText}
                </a>
              )}
            </div>
          </section>
        );

      case "form":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto max-w-2xl">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{section.heading}</h2>
              )}
              <form className="space-y-4">
                {section.fields?.map((field: any, idx: number) => (
                  <div key={idx}>
                    <label className="block mb-2 font-medium">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={4}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </form>
            </div>
          </section>
        );

      case "raw-html":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto" dangerouslySetInnerHTML={{ __html: section.html }} />
          </section>
        );

      case "footer":
        return (
          <div key={index}>
            <FooterSection
              backgroundColor={section.backgroundColor}
              textColor={section.textColor}
              links={section.links}
              companyName={website?.name || section.companyName}
            />
          </div>
        );

      case "contact":
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto max-w-4xl">
              {section.heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{section.heading}</h2>
              )}
              {section.subheading && (
                <p className="text-center text-muted-foreground mb-8 text-lg">{section.subheading}</p>
              )}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {section.email && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Email</h3>
                      <a href={`mailto:${section.email}`} className="text-primary hover:underline">
                        {section.email}
                      </a>
                    </div>
                  )}
                  {section.phone && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Phone</h3>
                      <a href={`tel:${section.phone}`} className="text-primary hover:underline">
                        {section.phone}
                      </a>
                    </div>
                  )}
                  {section.address && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-muted-foreground">{section.address}</p>
                    </div>
                  )}
                </div>
                <form className="space-y-4">
                  {section.fields?.map((field: any, idx: number) => (
                    <div key={idx}>
                      <label className="block mb-2 font-medium">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full px-4 py-2 border rounded-lg bg-background"
                          rows={4}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full px-4 py-2 border rounded-lg bg-background"
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    {section.buttonText || "Submit"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        );

      default:
        // For unknown types, try to render basic content structure
        return (
          <section key={index} id={finalId} className={sectionClasses}>
            <div className="container mx-auto max-w-4xl">
              {section.heading && <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.heading}</h2>}
              {section.subheading && <p className="text-xl mb-4 text-muted-foreground">{section.subheading}</p>}
              {section.content && <p className="text-lg whitespace-pre-wrap">{section.content}</p>}
            </div>
          </section>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !website || !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Website Not Found</h1>
          <p className="text-muted-foreground">
            {error || "This website is not available or hasn't been published yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentPage?.content?.map((section: any, index: number) => renderSection(section, index))}
    </div>
  );
};

export default PublicWebsiteViewer;
