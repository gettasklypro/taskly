import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Logo } from "@/components/Logo";

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

const mainGoals = [
  "Schedule & manage jobs",
  "Send quotes or invoices faster",
  "Manage clients & payments",
  "Grow and track my team"
];

const referralSources = [
  "Google Search",
  "Friend or Colleague",
  "YouTube",
  "TikTok",
  "Instagram",
  "Advertisement",
  "Other"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form data
  const [businessType, setBusinessType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [mainGoal, setMainGoal] = useState("");
  const [referralSource, setReferralSource] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);

    // Check if onboarding is already completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      navigate("/dashboard");
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          business_type: businessType || null,
          team_size: teamSize || null,
          country: country || null,
          currency: currency,
          main_goal: mainGoal || null,
          referral_source: referralSource || null,
          onboarding_completed: true
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Welcome! Your account is all set up.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const countryData = countries.find(c => c.name === selectedCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }
  };

  const progressValue = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          {currentStep !== 2 && (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Step {currentStep} of 4</span>
            <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-8 md:p-12">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <h1 className="text-3xl md:text-4xl font-bold">Welcome to Taskly 👋</h1>
                <p className="text-lg text-muted-foreground">
                  Let's set up your account — this will only take a minute.
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll tailor your experience based on your business type and goals.
                </p>
              </div>
              <div className="pt-8 flex justify-center">
                <Button onClick={handleNext} size="lg" className="min-w-40">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">Tell us about your business</h2>
                <p className="text-muted-foreground">We'll tailor Taskly to your workflow.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base mb-3 block">What type of business do you run?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {businessTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setBusinessType(type)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          businessType === type
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-primary/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base mb-3 block">Team size</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {teamSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setTeamSize(size)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            teamSize === size
                              ? "border-primary bg-primary/5"
                              : "border-input hover:border-primary/50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base mb-3 block">Country</Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your country" />
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

                <div>
                  <Label className="text-base mb-3 block">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                      <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                      <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                      <SelectItem value="PLN">PLN - Polish Zloty</SelectItem>
                      <SelectItem value="CZK">CZK - Czech Koruna</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                      <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                      <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Main Goal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">What's your main goal today?</h2>
                <p className="text-muted-foreground">This helps us prioritize the right features for you.</p>
              </div>

              <RadioGroup value={mainGoal} onValueChange={setMainGoal} className="space-y-3">
                {mainGoals.map((goal) => (
                  <div
                    key={goal}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      mainGoal === goal
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-primary/50"
                    }`}
                    onClick={() => setMainGoal(goal)}
                  >
                    <RadioGroupItem value={goal} id={goal} />
                    <Label htmlFor={goal} className="text-base font-medium cursor-pointer flex-1">
                      {goal}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Referral Source */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">How did you hear about us?</h2>
                <p className="text-muted-foreground">We'd love to know how you found us!</p>
              </div>

              <RadioGroup value={referralSource} onValueChange={setReferralSource} className="space-y-3">
                {referralSources.map((source) => (
                  <div
                    key={source}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      referralSource === source
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-primary/50"
                    }`}
                    onClick={() => setReferralSource(source)}
                  >
                    <RadioGroupItem value={source} id={source} />
                    <Label htmlFor={source} className="text-base font-medium cursor-pointer flex-1">
                      {source}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          {currentStep > 1 && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={currentStep === 2 && (!businessType || !teamSize || !country)}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  Finish
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {currentStep > 1 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              You can change these later in Settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
