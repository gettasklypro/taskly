import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Check, Star } from "lucide-react";

export const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.onboarding_completed) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.onboarding_completed) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Marketing Content */}
          <div className="bg-card rounded-3xl p-8 lg:p-12 shadow-lg border border-border">
            <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              Free for 14 days • No credit card required
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Quote, schedule & get paid — all in one place
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals using Taskly to run their business from first enquiry to final invoice.
            </p>

            <div className="space-y-4 mb-12">
              {[
                "Generate & manage customer enquiries",
                "Track every job from quote to invoice",
                "Estimate & quote jobs quickly & accurately",
                "Invoice easier and get paid faster",
                "Live updates between the office & field",
                "Unlimited support",
                "Integrates with Xero, QuickBooks & more"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-2xl p-6 border border-border">
                <div className="text-sm text-muted-foreground mb-2">TrustScore</div>
                <div className="text-3xl font-bold mb-2">4.8</div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">193 reviews on Trustpilot</div>
              </div>

              <div className="bg-background rounded-2xl p-6 border border-border">
                <div className="text-sm text-muted-foreground mb-2">Loved by teams across</div>
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-sm font-medium mb-2">countries</div>
                <div className="text-xs text-muted-foreground">Real-time sync between field & office</div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="bg-card rounded-3xl p-8 lg:p-12 shadow-lg border border-border">
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Start your free trial
              </h2>
              <p className="text-sm text-muted-foreground">
                No credit card required. Cancel anytime.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-primary">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-primary">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-primary">
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Doe Electrical"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-primary">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Start free trial →"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By continuing you agree to the{" "}
                <Link to="/terms-and-conditions" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium"
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 p-4 bg-accent/5 rounded-xl border border-accent/20">
              <Check className="h-5 w-5 text-accent" />
              <span className="text-sm text-foreground">
                14-day free trial • No credit card required • Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
