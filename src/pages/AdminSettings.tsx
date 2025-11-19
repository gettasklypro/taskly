import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DatabaseExporter } from "@/components/DatabaseExporter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const AdminSettings = () => {
  const [companyName, setCompanyName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || "");
      setSupportEmail(settings.support_email || "");
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("app_settings")
        .update({
          company_name: companyName,
          support_email: supportEmail,
        })
        .eq("id", settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>
              Update your company information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your SaaS"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@yoursaas.com"
                className="mt-2"
              />
            </div>

            <Button onClick={() => updateMutation.mutate()}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>
              Export all database tables including empty ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download a complete backup of your database in JSON format. 
                The export includes all tables (even empty ones), with metadata, 
                record counts, and a summary of your data.
              </p>
              <DatabaseExporter />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
