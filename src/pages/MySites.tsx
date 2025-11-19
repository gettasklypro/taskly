import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Globe, Pencil, X, Loader2 } from "lucide-react";
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

export const MySites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [editSiteTitle, setEditSiteTitle] = useState("");

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

      const updateData: any = { status: "published" };
      if (slug) updateData.slug = slug;
      if (domain) updateData.domain = domain;
      if (siteTitle) updateData.site_title = siteTitle;
      if (faviconUrl) updateData.favicon_url = faviconUrl;

      const { error } = await supabase.from("websites").update(updateData).eq("id", websiteId);

      if (error) throw error;
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
          }
        } catch (error) {
          console.error("Error removing domain from Vercel:", error);
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
    mutationFn: async ({ websiteId, name, description, siteTitle }: { websiteId: string; name: string; description?: string; siteTitle?: string }) => {
      const updateData: any = { name, description };
      if (siteTitle) updateData.site_title = siteTitle;
      
      const { error } = await supabase.from("websites").update(updateData).eq("id", websiteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", user?.id] });
      toast.success("Website updated successfully!");
      setEditDialogOpen(false);
      setWebsiteToEdit(null);
      setEditName("");
      setEditDescription("");
      setEditSiteTitle("");
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
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${websiteToPublish.id}/favicon-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage.from("website-images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) throw error;

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
      if (!customDomain || !customDomain.includes(".")) {
        toast.error("Please enter a valid custom domain");
        return;
      }

      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        toast.error("Please enter a valid domain (e.g., yourdomain.com)");
        return;
      }

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
    setEditSiteTitle(website.site_title || "");
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
      siteTitle: editSiteTitle,
    });
  };

  const getSubdomain = (website: any) => {
    if (website.domain) {
      return website.domain;
    }
    const slug =
      website.slug ||
      website.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    return `${slug}.gettaskly.ai`;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="My Websites" description="Manage all your websites in one place" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/website-builder")}>
            ← Back to Builder
          </Button>
          <span className="text-sm text-muted-foreground">
            {websites?.length || 0} / {planFeatures.maxSites} {websites?.length === 1 ? "site" : "sites"}
          </span>
        </div>

        {websites && websites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website, index) => (
              <Card
                key={website.id}
                className="gradient-card hover-lift border-border/50 cursor-pointer relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/website-builder/edit/${website.id}`)}
              >
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => handleEditClick(website, e)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => handleDeleteClick(website.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {getPreviewImage(website) ? (
                  <div className="h-40 overflow-hidden bg-muted">
                    <img
                      src={getPreviewImage(website)}
                      alt={website.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary to-accent opacity-80" />
                )}
                <CardHeader>
                  <CardTitle className="text-base">{website.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{website.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {website.status}
                    </span>
                    {website.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                        {website.category}
                      </span>
                    )}
                  </div>
                  {website.status === "published" && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Published at:</p>
                      <a
                        href={`https://${getSubdomain(website)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-3 h-3" />
                        {getSubdomain(website)}
                      </a>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    {website.status === "draft" ? (
                      <Button
                        variant="default"
                        className="w-full gradient-primary"
                        size="sm"
                        onClick={(e) => handlePublish(website, e)}
                        disabled={publishMutation.isPending}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Publish Website
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const subdomain = website.domain || getSubdomain(website);
                            window.open(`https://${subdomain}`, "_blank");
                          }}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          View Website
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm"
                          onClick={(e) => handleUnpublish(website.id, e)}
                          disabled={unpublishMutation.isPending}
                        >
                          Unpublish
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't created any websites yet.</p>
            <Button onClick={() => navigate("/website-builder")}>Create Your First Website</Button>
          </div>
        )}

        {websites && websites.length >= planFeatures.maxSites && user && (
          <div className="max-w-4xl mx-auto">
            <UpgradePrompt
              userId={user.id}
              feature="More Websites"
              description={`You've reached the maximum of ${planFeatures.maxSites} ${planFeatures.maxSites === 1 ? "site" : "sites"} on your current plan. Upgrade to Pro to create up to 10 websites.`}
              onUpgrade={() => {
                refetchProfile();
                refetch();
              }}
            />
          </div>
        )}
      </div>

      {/* Delete Dialog */}
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

      {/* Publish Dialog */}
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
                    {uploadingFavicon ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Replace Favicon"
                    )}
                  </Button>
                </div>
              ) : (
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
                  {uploadingFavicon ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Favicon"
                  )}
                </Button>
              )}
              <input
                id="faviconFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFaviconFile(file);
                    handleFaviconUpload(file);
                  }
                }}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs">Domain Type</Label>
              <Select value={domainType} onValueChange={(value: "subdomain" | "custom") => setDomainType(value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subdomain">Use Subdomain (Free)</SelectItem>
                  <SelectItem value="custom">Custom Domain</SelectItem>
                </SelectContent>
              </Select>

              {domainType === "subdomain" ? (
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Your site will be published at:</p>
                  <p className="text-sm font-medium">
                    {websiteToPublish?.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")}
                    .gettaskly.ai
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="text-sm h-9"
                  />
                  <CustomDomainInstructions domain={customDomain} />
                </>
              )}
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                onClick={() => setPublishDialogOpen(false)}
                className="flex-1 text-xs h-9"
                disabled={publishMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPublish}
                disabled={publishMutation.isPending || (domainType === "custom" && !customDomain)}
                className="flex-1 text-xs h-9"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>Update your website details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="editName">Website Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="My Awesome Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description (Optional)</Label>
              <Input
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="A brief description of your website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSiteTitle">Page Title (Optional)</Label>
              <Input
                id="editSiteTitle"
                value={editSiteTitle}
                onChange={(e) => setEditSiteTitle(e.target.value)}
                placeholder="Appears in browser tab"
              />
              <p className="text-xs text-muted-foreground">This will appear in the browser tab when visitors view your site</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmEdit} disabled={editMutation.isPending || !editName.trim()} className="flex-1">
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
