import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Trash2, Globe, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getPlanFeatures } from "@/lib/planFeatures";
import UpgradePrompt from "@/components/UpgradePrompt";
import CustomDomainInstructions from "@/components/CustomDomainInstructions";

export const WebsiteBuilder = () => {
  // Mobile detection - show message on mobile devices
  const [isMobile] = useState(() => /Mobi|Android/i.test(navigator.userAgent));

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [websiteToPublish, setWebsiteToPublish] = useState<any>(null);
  const [domainType, setDomainType] = useState<"subdomain" | "custom">("subdomain");
  const [customDomain, setCustomDomain] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [websiteToEdit, setWebsiteToEdit] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // AI Generation form state
  const [businessDescription, setBusinessDescription] = useState("");

  // Fetch user profile with plan
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("plan_type").eq("id", user!.id).single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const planFeatures = getPlanFeatures(profile?.plan_type);

  // Fetch templates from database
  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_public", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's websites with their pages
  const { data: websites, refetch } = useQuery({
    queryKey: ["websites", user?.id],
    queryFn: async () => {
      const { data: websitesData, error: websitesError } = await supabase
        .from("websites")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (websitesError) throw websitesError;

      // Fetch first page for each website to get preview image
      const websitesWithPages = await Promise.all(
        websitesData.map(async (website) => {
          const { data: pages } = await supabase
            .from("pages")
            .select("content")
            .eq("website_id", website.id)
            .eq("is_homepage", true)
            .limit(1)
            .single();

          return { ...website, homePage: pages };
        }),
      );

      return websitesWithPages;
    },
    enabled: !!user,
  });

  // Helper to extract first image from website content
  const getPreviewImage = (website: any) => {
    if (!website.homePage?.content) return null;

    // Look for hero section with image
    const heroSection = website.homePage.content.find((section: any) => section.type === "hero" && section.image);

    if (heroSection?.image) return heroSection.image;

    // Look for any section with items that have images
    for (const section of website.homePage.content) {
      if (section.items && section.items.length > 0) {
        const itemWithImage = section.items.find((item: any) => item.image);
        if (itemWithImage?.image) return itemWithImage.image;
      }
    }

    return null;
  };

  const handleGenerateThemes = async () => {
    if (!user) {
      toast.error("Please log in to generate themes");
      navigate("/login");
      return;
    }

    // Check site limit
    if (websites && websites.length >= planFeatures.maxSites) {
      toast.error(
        `You've reached the maximum of ${planFeatures.maxSites} ${planFeatures.maxSites === 1 ? "site" : "sites"} on your plan`,
      );
      return;
    }

    if (!businessDescription.trim()) {
      toast.error("Please describe your business");
      return;
    }

    setGenerating(true);
    try {
      // Get the current session to ensure we have a valid token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error("Please log in again to continue");
        navigate("/login");
        return;
      }

      // Extract category from description using simple keywords
      const descLower = businessDescription.toLowerCase();
      let category = "other";
      if (descLower.includes("fitness") || descLower.includes("gym") || descLower.includes("wellness")) {
        category = "fitness";
      } else if (descLower.includes("coach")) {
        category = "coaching";
      } else if (descLower.includes("design") || descLower.includes("creative")) {
        category = "creative";
      } else if (descLower.includes("consult")) {
        category = "consulting";
      }

      const { data, error } = await supabase.functions.invoke("generate-website-template", {
        body: {
          prompt: businessDescription,
          category: category,
          businessName: "My Business",
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
          toast.error("Authentication failed. Please log in again.");
          navigate("/login");
          return;
        }
        // Extract error message from context if available
        const errorMessage = (error as any).context?.error || error.message || "Failed to generate theme";
        toast.error(errorMessage);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data?.message || "Website theme generated!");
      setBusinessDescription("");
      refetch();

      // Navigate to the builder with the new website
      if (data?.websiteId) {
        navigate(`/website-builder/edit/${data.websiteId}`);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate theme");
    } finally {
      setGenerating(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    // Check site limit
    if (websites && websites.length >= planFeatures.maxSites) {
      toast.error(
        `You've reached the maximum of ${planFeatures.maxSites} ${planFeatures.maxSites === 1 ? "site" : "sites"} on your plan`,
      );
      return;
    }

    try {
      // Fetch the template data
      const { data: template, error: templateError } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Create a new website with the template
      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .insert({
          user_id: user?.id,
          name: template.name,
          description: template.description,
          category: template.category,
          template_id: template.id,
          status: "draft",
        })
        .select()
        .single();

      if (websiteError) throw websiteError;

      // Create the home page with template content
      const { error: pageError } = await supabase.from("pages").insert({
        website_id: website.id,
        title: "Home",
        slug: "home",
        is_homepage: true,
        content: template.preview_data,
      });

      if (pageError) throw pageError;

      toast.success("Template created!");
      refetch();
      navigate(`/website-builder/edit/${website.id}`);
    } catch (error: any) {
      console.error("Template error:", error);
      toast.error(error.message || "Failed to use template");
    }
  };

  const publishMutation = useMutation({
    mutationFn: async ({
      websiteId,
      slug,
      domain,
      siteTitle,
      faviconUrl,
    }: {
      websiteId: string;
      slug?: string;
      domain?: string;
      siteTitle?: string;
      faviconUrl?: string;
    }) => {
      // If custom domain is provided, add it to Vercel first
      if (domain && domain.trim()) {
        const { data: vercelResponse, error: vercelError } = await supabase.functions.invoke("add-vercel-domain", {
          body: { domain: domain.trim() },
        });

        if (vercelError) {
          throw new Error("Failed to connect domain to Vercel: " + vercelError.message);
        }

        if (!vercelResponse?.success) {
          throw new Error(vercelResponse?.error || "Failed to add domain to Vercel");
        }
      }

      // Prepare merged business fields from profile if website missing them
      let mergedFields: Record<string, any> = {};
      try {
        const { data: existingSite } = await supabase.from('websites').select('user_id, business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number').eq('id', websiteId).single();
        if (existingSite) {
          const needsMerge = !existingSite.whatsapp_full_number || !existingSite.business_name;
          if (needsMerge) {
            const ownerId = existingSite.user_id || user?.id;
            if (ownerId) {
              const { data: profileData } = await supabase.from('profiles').select('business_name, business_description, whatsapp_country_code, whatsapp_number, whatsapp_full_number').eq('id', ownerId).single();
              if (profileData) {
                if (!existingSite.business_name && profileData.business_name) mergedFields.business_name = profileData.business_name;
                if (!existingSite.business_description && profileData.business_description) mergedFields.business_description = profileData.business_description;
                if (!existingSite.whatsapp_country_code && profileData.whatsapp_country_code) mergedFields.whatsapp_country_code = profileData.whatsapp_country_code;
                if (!existingSite.whatsapp_number && profileData.whatsapp_number) mergedFields.whatsapp_number = profileData.whatsapp_number;
                if (!existingSite.whatsapp_full_number && profileData.whatsapp_full_number) mergedFields.whatsapp_full_number = profileData.whatsapp_full_number;
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to prepare merged profile business settings before publish', e);
      }

      const updateData: any = { status: "published" };
      if (slug) updateData.slug = slug;
      if (domain) updateData.domain = domain;
      if (siteTitle) updateData.site_title = siteTitle;
      if (faviconUrl) updateData.favicon_url = faviconUrl;

      // Include merged fields in the same update to ensure atomic write
      const finalUpdate = Object.keys(mergedFields).length ? { ...updateData, ...mergedFields } : updateData;

      // Call Edge Function to perform publish update with service role credentials
      const { data: fnResp, error: fnInvokeErr } = await supabase.functions.invoke('publish-website', {
        body: { websiteId, slug, domain, siteTitle, faviconUrl },
      });

      if (fnInvokeErr) {
        throw new Error(fnInvokeErr.message || 'Failed to invoke publish function');
      }
      if (!fnResp || !fnResp.success) {
        throw new Error(fnResp?.error || 'Publish function returned failure');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", user?.id] });
      toast.success("Website published successfully!");
      setPublishDialogOpen(false);
      setWebsiteToPublish(null);
      setCustomDomain("");
      setDomainType("subdomain");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to publish website");
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      // Get the website to check if it has a custom domain
      const { data: website } = await supabase.from("websites").select("domain").eq("id", websiteId).single();

      // If website has a custom domain, remove it from Vercel
      if (website?.domain) {
        try {
          const { data: vercelResponse } = await supabase.functions.invoke("remove-vercel-domain", {
            body: { domain: website.domain },
          });

          if (!vercelResponse?.success) {
            console.error("Failed to remove domain from Vercel:", vercelResponse?.error);
            // Continue with unpublishing even if domain removal fails
          }
        } catch (error) {
          console.error("Error removing domain from Vercel:", error);
          // Continue with unpublishing even if domain removal fails
        }
      }

      // Unpublish the website and clear domain fields
      const { error } = await supabase
        .from("websites")
        .update({
          status: "draft",
          domain: null,
          slug: null,
        })
        .eq("id", websiteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", user?.id] });
      toast.success("Website unpublished successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unpublish website");
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ websiteId, name, description }: { websiteId: string; name: string; description?: string }) => {
      const { error } = await supabase.from("websites").update({ name, description }).eq("id", websiteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", user?.id] });
      toast.success("Website updated successfully!");
      setEditDialogOpen(false);
      setWebsiteToEdit(null);
      setEditName("");
      setEditDescription("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update website");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      // First delete all pages associated with the website
      const { error: pagesError } = await supabase.from("pages").delete().eq("website_id", websiteId);

      if (pagesError) throw pagesError;

      // Then delete the website itself
      const { error: websiteError } = await supabase.from("websites").delete().eq("id", websiteId);

      if (websiteError) throw websiteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", user?.id] });
      toast.success("Website deleted successfully!");
      setDeleteDialogOpen(false);
      setWebsiteToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete website");
    },
  });

  const handleDeleteClick = (websiteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWebsiteToDelete(websiteId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (websiteToDelete) {
      deleteMutation.mutate(websiteToDelete);
    }
  };

  const handlePublish = (website: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setWebsiteToPublish(website);
    setSiteTitle(website.site_title || website.name);
    setFaviconUrl(website.favicon_url || "");
    setFaviconFile(null);
    setPublishDialogOpen(true);
  };

  const handleFaviconUpload = async (file: File) => {
    if (!websiteToPublish || !user) return;

    setUploadingFavicon(true);
    try {
      // Upload to Supabase Storage - use user ID as first folder for RLS
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${websiteToPublish.id}/favicon-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage.from("website-images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("website-images").getPublicUrl(fileName);

      setFaviconUrl(publicUrl);
      toast.success("Favicon uploaded successfully!");
    } catch (error: any) {
      console.error("Favicon upload error:", error);
      toast.error(error.message || "Failed to upload favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleConfirmPublish = () => {
    if (!websiteToPublish) return;

    if (domainType === "custom") {
      // Validate custom domain format
      if (!customDomain || !customDomain.includes(".")) {
        toast.error("Please enter a valid custom domain");
        return;
      }

      // Basic domain validation
      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        toast.error("Please enter a valid domain (e.g., yourdomain.com)");
        return;
      }

      // Prevent using reserved domains
      if (
        customDomain.includes("lovableproject.com") ||
        customDomain.includes("gettaskly.ai") ||
        customDomain.includes("vercel.app")
      ) {
        toast.error("You cannot use this domain. Please use your own custom domain.");
        return;
      }

      publishMutation.mutate({
        websiteId: websiteToPublish.id,
        domain: customDomain.toLowerCase().trim(),
        siteTitle: siteTitle.trim() || websiteToPublish.name,
        faviconUrl: faviconUrl.trim(),
      });
    } else {
      const slug = websiteToPublish.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      publishMutation.mutate({
        websiteId: websiteToPublish.id,
        slug,
        siteTitle: siteTitle.trim() || websiteToPublish.name,
        faviconUrl: faviconUrl.trim(),
      });
    }
  };

  const handleUnpublish = (websiteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    unpublishMutation.mutate(websiteId);
  };

  const handleEditClick = (website: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setWebsiteToEdit(website);
    setEditName(website.name);
    setEditDescription(website.description || "");
    setEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!websiteToEdit || !editName.trim()) {
      toast.error("Please enter a website name");
      return;
    }
    editMutation.mutate({
      websiteId: websiteToEdit.id,
      name: editName,
      description: editDescription,
    });
  };

  const getSubdomain = (website: any) => {
    // If custom domain is set, use that
    if (website.domain) {
      return website.domain;
    }
    // Otherwise, generate subdomain from slug or name
    const slug =
      website.slug ||
      website.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    return `${slug}.gettaskly.ai`;
  };

  // State for modal management and filters
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [aiOptionType, setAiOptionType] = useState<"describe" | "url" | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [templateFilter, setTemplateFilter] = useState<'all' | 'builder' | 'cleaner' | 'electrician' | 'plumber'>('all');

  // Show mobile message if on mobile device
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <div className="space-y-6 max-w-md">
          <div className="text-6xl mb-4">🖥️</div>
          <h2 className="text-2xl sm:text-3xl font-semibold">This feature is best enjoyed on desktop</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Please open this page from your computer to access the builder tools.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="mt-6 w-full sm:w-auto">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Filter templates to show only specific ones
  const allowedTemplates = ["cleaner", "builder", "plumber", "electrician"];
  const baseFilteredTemplates = templates?.filter((template) => 
    allowedTemplates.some((keyword) => 
      template.name.toLowerCase().includes(keyword)
    )
  );

  // Apply category filter
  const filteredTemplates = baseFilteredTemplates?.filter((template) => {
    if (templateFilter === 'all') return true;
    return template.name.toLowerCase().includes(templateFilter);
  });

  // Group templates by category
  const templatesByCategory =
    filteredTemplates?.reduce(
      (acc, template) => {
        const cat = template.category || "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(template);
        return acc;
      },
      {} as Record<string, typeof filteredTemplates>,
    ) || {};

  const categoryLabels: Record<string, string> = {
    fitness: "Fitness & Wellness",
    coaching: "Coaching",
    creative: "Creative & Design",
    consulting: "Consulting",
    other: "Other Industries",
  };

  const handleCreateFromScratch = async () => {
    // Check site limit
    if (websites && websites.length >= planFeatures.maxSites) {
      toast.error(
        `You've reached the maximum of ${planFeatures.maxSites} ${planFeatures.maxSites === 1 ? "site" : "sites"} on your plan`,
      );
      return;
    }

    try {
      // Create a blank website
      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .insert({
          user_id: user?.id,
          name: "Untitled Website",
          description: "A new website",
          status: "draft",
        })
        .select()
        .single();

      if (websiteError) throw websiteError;

      // Create blank homepage
      const { error: pageError } = await supabase.from("pages").insert({
        website_id: website.id,
        title: "Home",
        slug: "home",
        is_homepage: true,
        content: [],
      });

      if (pageError) throw pageError;

      toast.success("Blank website created!");
      navigate(`/website-builder/edit/${website.id}`);
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error.message || "Failed to create website");
    }
  };

  const handleImportFromUrl = async () => {
    if (!user) {
      toast.error("Please log in to create a website");
      navigate("/login");
      return;
    }

    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Check site limit
    if (websites && websites.length >= planFeatures.maxSites) {
      toast.error(
        `You've reached the maximum of ${planFeatures.maxSites} ${planFeatures.maxSites === 1 ? "site" : "sites"} on your plan`,
      );
      return;
    }

    setGenerating(true);
    try {
      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError || !session) {
        console.error('Session refresh failed:', sessionError);
        toast.error("Please log in again to continue");
        navigate("/login");
        return;
      }

      // Use AI to generate website based on the URL context
      const prompt = `Create a professional website similar to ${urlInput}. Generate appropriate content and sections based on this reference.`;

      const { data, error } = await supabase.functions.invoke("generate-website-template", {
        body: {
          prompt: prompt,
          category: "other",
          businessName: "My Business",
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
          toast.error("Authentication failed. Please log in again.");
          navigate("/login");
          return;
        }
        // Extract error message from context if available
        const errorMessage = (error as any).context?.error || error.message || "Failed to create website";
        toast.error(errorMessage);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data?.message || "Website created successfully!");
      setUrlInput("");
      setAiModalOpen(false);
      refetch();

      // Navigate to the builder with the new website
      if (data?.websiteId) {
        navigate(`/website-builder/edit/${data.websiteId}`);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to create website");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-12 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">How do you want to build your site?</h1>
          <p className="text-muted-foreground text-lg">Pick a starting point. You can change it later.</p>
        </div>

        {/* Main Option Cards */}
        <div className="space-y-6">
          {/* AI or Import Card - Full Width Top */}
          <Card
            className="relative border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover-lift group overflow-hidden"
            onClick={() => {
              setAiOptionType("describe");
              setAiModalOpen(true);
            }}
          >
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                Smart Start
              </span>
            </div>
            <CardContent className="p-8 pt-16 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Use AI or Import a Site</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Describe what you want, or enter your existing site URL — we'll generate your new site automatically.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">• 3–5 min setup</p>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Row: Create from Scratch & Use Template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create from Scratch Card */}
            <Card
              className="border-2 border-border/50 hover:border-primary/30 transition-all cursor-pointer hover-lift group"
              onClick={handleCreateFromScratch}
            >
              <CardContent className="p-8 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">Create from scratch</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Start with an empty canvas. Drag in sections and layouts to build it your way.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">• Full control</p>
                </div>
              </CardContent>
            </Card>

            {/* Use a Template Card */}
            <Card
              className="border-2 border-border/50 hover:border-primary/30 transition-all cursor-pointer hover-lift group"
              onClick={() => setTemplateModalOpen(true)}
            >
              <CardContent className="p-8 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">Use a template</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Choose from ready-made designs for service, local, personal, and product sites.
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">• {filteredTemplates?.length || 4}+ templates</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Websites Link */}
        {websites && websites.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate("/website-builder/my-sites")} className="gap-2">
              <Globe className="w-4 h-4" />
              View My Websites ({websites.length})
            </Button>
          </div>
        )}
      </div>

      {/* AI/Import Modal */}
      <Dialog open={aiModalOpen} onOpenChange={(open) => {
        setAiModalOpen(open);
        if (!open) setAiOptionType(null);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Use AI or Import a Site</DialogTitle>
            <DialogDescription>Choose how you want to start building your website.</DialogDescription>
          </DialogHeader>

          {/* Tab buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant={aiOptionType === "describe" ? "default" : "outline"}
              onClick={() => setAiOptionType("describe")}
              className="flex-1"
            >
              Describe business
            </Button>
            <Button
              variant={aiOptionType === "url" ? "default" : "outline"}
              onClick={() => setAiOptionType("url")}
              className="flex-1"
            >
              Import website
            </Button>
          </div>

          {aiOptionType === "describe" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="business-description" className="text-base font-semibold">Describe your business</Label>
                <Textarea
                  id="business-description"
                  placeholder="e.g. Local electrician in London offering emergency call-outs, rewiring and inspecsions"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="min-h-[120px]"
                  disabled={generating}
                />
                <p className="text-sm text-muted-foreground">
                  Add services + location for better generated pages.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAiModalOpen(false)} disabled={generating}>
                  Back
                </Button>
                <Button onClick={handleGenerateThemes} disabled={generating || !businessDescription.trim()}>
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Build My Website"
                  )}
                </Button>
              </div>
            </div>
          ) : aiOptionType === "url" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">Website URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={generating}
                />
                <p className="text-xs text-muted-foreground">
                  We'll use AI to create a similar website for you
                </p>
              </div>
              {generating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating your website...
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAiModalOpen(false)} disabled={generating}>
                  Back
                </Button>
                <Button onClick={handleImportFromUrl} disabled={generating || !urlInput.trim()}>
                  {generating ? "Creating..." : "Create Website"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Template Selection Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select from ready-made designs. Each template can be fully customized.
            </DialogDescription>
          </DialogHeader>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap pt-4 pb-2 border-b">
            <Button
              variant={templateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateFilter('all')}
            >
              All
            </Button>
            <Button
              variant={templateFilter === 'builder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateFilter('builder')}
            >
              Builders
            </Button>
            <Button
              variant={templateFilter === 'cleaner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateFilter('cleaner')}
            >
              Cleaners
            </Button>
            <Button
              variant={templateFilter === 'electrician' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateFilter('electrician')}
            >
              Electricians
            </Button>
            <Button
              variant={templateFilter === 'plumber' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTemplateFilter('plumber')}
            >
              Plumbers
            </Button>
          </div>

          <div className="py-4">
            {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h3 className="text-lg font-semibold mb-4">{categoryLabels[category] || "Templates"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:border-primary transition-all overflow-hidden group"
                      onClick={() => {
                        handleUseTemplate(template.id);
                        setTemplateModalOpen(false);
                      }}
                    >
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={
                            template.thumbnail_url ||
                            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          Select Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Website</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this website? This action cannot be undone and will delete all pages
              associated with this website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publish Website</DialogTitle>
            <DialogDescription>Choose how you want to publish your website</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="siteTitle" className="text-xs">
                Page Title
              </Label>
              <Input
                id="siteTitle"
                placeholder="e.g., M&E Cleaning - Professional Services"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="text-sm h-9"
              />
              <p className="text-[10px] text-muted-foreground">Appears in browser tab</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faviconUrl" className="text-xs">
                Favicon (Optional)
              </Label>
              <p className="text-[10px] text-muted-foreground mb-2">16x16 or 32x32 pixels recommended</p>

              {faviconUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded border border-border">
                    <img
                      src={faviconUrl}
                      alt="Favicon preview"
                      className="w-6 h-6 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">Favicon uploaded</p>
                      <p className="text-[10px] text-muted-foreground truncate">{faviconUrl.split("/").pop()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFaviconUrl("");
                        setFaviconFile(null);
                      }}
                      className="h-7 px-2 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById("faviconFile") as HTMLInputElement;
                      if (input) input.click();
                    }}
                    disabled={uploadingFavicon}
                    className="w-full text-xs h-8"
                  >
                    Change Favicon
                  </Button>
                  <Input
                    id="faviconFile"
                    type="file"
                    accept="image/png,image/x-icon,image/jpeg,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFaviconFile(file);
                        handleFaviconUpload(file);
                      }
                    }}
                    disabled={uploadingFavicon}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="faviconFile"
                      type="file"
                      accept="image/png,image/x-icon,image/jpeg,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFaviconFile(file);
                          handleFaviconUpload(file);
                        }
                      }}
                      disabled={uploadingFavicon}
                      className="flex-1 text-xs h-8"
                    />
                    {uploadingFavicon && <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />}
                  </div>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or enter URL</span>
                    </div>
                  </div>

                  <Input
                    id="faviconUrl"
                    placeholder="https://yourdomain.com/favicon.ico"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    disabled={uploadingFavicon}
                    className="text-xs h-8"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Domain Type</Label>
              <Select
                value={domainType}
                onValueChange={(value: "subdomain" | "custom") => setDomainType(value)}
                disabled={!planFeatures.customDomain}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subdomain">Subdomain (Free)</SelectItem>
                  <SelectItem value="custom" disabled={!planFeatures.customDomain}>
                    Custom Domain {!planFeatures.customDomain && "(Pro Only)"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {!planFeatures.customDomain && (
                <p className="text-[10px] text-muted-foreground">Custom domains available on Pro plan</p>
              )}
            </div>

            {domainType === "subdomain" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Published At:</Label>
                <div className="p-2 bg-muted rounded text-xs font-mono">
                  {websiteToPublish ? getSubdomain(websiteToPublish) : "your-site.gettaskly.ai"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customDomain" className="text-xs">
                    Custom Domain
                  </Label>
                  <Input
                    id="customDomain"
                    placeholder="yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="text-sm h-9"
                  />
                </div>

                {customDomain && <CustomDomainInstructions domain={customDomain} />}
              </div>
            )}
          </div>
          <Button
            onClick={handleConfirmPublish}
            className="w-full gradient-primary"
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Publish Website
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>Update your website name and description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="websiteName">Website Name</Label>
              <Input
                id="websiteName"
                placeholder="e.g., My Awesome Business"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteDescription">Description (Optional)</Label>
              <Textarea
                id="websiteDescription"
                placeholder="Brief description of your website"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <Button onClick={handleConfirmEdit} className="w-full" disabled={editMutation.isPending || !editName.trim()}>
            {editMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
