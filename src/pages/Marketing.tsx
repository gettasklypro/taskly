import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Megaphone, Mail, Users, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  scheduled_date: string | null;
  created_at: string;
};

export const Marketing = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scheduled_date: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Campaign name is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("campaigns").insert([{
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        scheduled_date: formData.scheduled_date || null,
        status: 'draft',
      }] as any);

      if (error) throw error;

      toast.success("Campaign created successfully!");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", scheduled_date: "" });
      fetchCampaigns();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    }
  };

  const getOpenRate = (campaign: Campaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Marketing" 
        description="Create and manage marketing campaigns"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new marketing campaign
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Spring Promotion 2025"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Campaign details..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Schedule Send Date</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Campaign</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="p-3 sm:p-4 md:p-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="relative min-h-[400px] p-4">
            <EmptyState
              icon={Megaphone}
              title="Reach customers at scale"
              description="Create and manage marketing campaigns to grow your business. Track performance and optimize your outreach."
              actionLabel="Create Your First Campaign"
              onAction={() => setIsDialogOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover-lift cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'} className="text-xs">
                          {campaign.status}
                        </Badge>
                      </div>
                      {campaign.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{campaign.description}</p>
                      )}
                      {campaign.scheduled_date && (
                        <p className="text-xs text-muted-foreground">
                          Scheduled: {new Date(campaign.scheduled_date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold">{campaign.sent_count}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{campaign.opened_count}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Opened</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{campaign.clicked_count}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Clicked</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">{getOpenRate(campaign)}%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Open Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};