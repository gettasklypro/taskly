import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const businessTypes = [
  "Cleaning",
  "Decorating",
  "Electricians",
  "Handyman",
  "HVAC",
  "Landscaping",
  "Pest Control",
  "Plumbing",
  "Roofing"
];

const teamSizes = ["Solo", "2–5", "6–20", "20+"];

const countries = [
  { name: "United States", currency: "USD" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Canada", currency: "CAD" },
  { name: "Australia", currency: "AUD" },
  { name: "New Zealand", currency: "NZD" },
  { name: "Ireland", currency: "EUR" },
  { name: "Germany", currency: "EUR" },
  { name: "France", currency: "EUR" },
  { name: "Spain", currency: "EUR" },
  { name: "Italy", currency: "EUR" },
  { name: "Netherlands", currency: "EUR" },
  { name: "Belgium", currency: "EUR" },
  { name: "Sweden", currency: "SEK" },
  { name: "Norway", currency: "NOK" },
  { name: "Denmark", currency: "DKK" },
  { name: "Switzerland", currency: "CHF" },
  { name: "Poland", currency: "PLN" },
  { name: "Czech Republic", currency: "CZK" },
  { name: "Japan", currency: "JPY" },
  { name: "Singapore", currency: "SGD" },
  { name: "India", currency: "INR" },
  { name: "Brazil", currency: "BRL" },
  { name: "Mexico", currency: "MXN" },
  { name: "South Africa", currency: "ZAR" },
];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Profile data
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setEmail(profile.email || "");
        setFullName(profile.full_name || "");
        setBusinessName(profile.business_name || "");
        setBusinessType(profile.business_type || "");
        setTeamSize(profile.team_size || "");
        setCountry(profile.country || "");
        setCurrency(profile.currency || "USD");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          business_name: businessName || null,
          business_type: businessType || null,
          team_size: teamSize || null,
          country: country || null,
          currency: currency
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const countryData = countries.find(c => c.name === selectedCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Profile Settings" 
        description="Manage your personal and business information"
      />
      
      <div className="p-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/settings")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Please contact support to update your email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Select value={teamSize} onValueChange={setTeamSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input
                    id="currency"
                    type="text"
                    value={currency}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Currency is automatically set based on your country selection.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/settings")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
