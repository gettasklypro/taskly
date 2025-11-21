import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Wind, Wrench, Building2, Zap, Hammer, Trees, Droplet, Leaf, PaintBucket, Home, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import tasklyLogo from "@/assets/taskly-logo.png";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FeatureShowcaseSection } from "@/components/landing/FeatureShowcaseSection";
import { RefundPolicySection } from "@/components/landing/RefundPolicySection";
import { useEffect } from "react";

export const Landing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for Paddle transaction ID and redirect to success page
  useEffect(() => {
    const transactionId = searchParams.get('_ptxn');
    if (transactionId) {
      navigate(`/checkout/success?_ptxn=${transactionId}`);
    }
  }, [searchParams, navigate]);

  const industries = [
    { name: "Arborists", icon: Trees },
    { name: "Commercial Cleaning", icon: Sparkles },
    { name: "Construction & Contractors", icon: Building2 },
    { name: "Electrical Contractor", icon: Zap },
    { name: "HVAC", icon: Wind },
    { name: "Handyman", icon: Hammer },
    { name: "Landscaping", icon: Trees },
    { name: "Lawn Care", icon: Leaf },
    { name: "Painting", icon: PaintBucket },
    { name: "Plumbing", icon: Droplet },
    { name: "Residential Cleaning", icon: Sparkles },
    { name: "Roofing", icon: Home },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src={tasklyLogo} alt="TASKLY" className="h-8 w-auto object-contain dark:invert-0 invert" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#guarantee" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Guarantee
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="text-sm font-medium">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">New: AI job scheduling</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              The all-in-one platform for home-service pros.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl">
              Quote faster, schedule smarter, and get paid sooner—everything you need in one simple platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="text-base px-8">
                  Start free for 14 days
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8">
                <Play className="mr-2 h-5 w-5" />
                Watch 2-min demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Proud partner to home services in over{" "}
            <span className="text-primary underline decoration-2 underline-offset-4">
              50 industries
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {industries.map((industry) => {
              const Icon = industry.icon;
              return (
                <div
                  key={industry.name}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{industry.name}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button variant="link" className="text-primary">
              See all industries
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* New Sections */}
      <FeatureShowcaseSection />
      <BenefitsSection />
      <PricingSection />
      <RefundPolicySection />
      <TestimonialsSection />
      <FAQSection />

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
                <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 TASKLY (Einstein Design Ltd.) All rights reserved.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-3">
              <p className="text-sm font-medium">Get the app</p>
              <div className="flex gap-2">
                <PWAInstallButton platform="ios" />
                <PWAInstallButton platform="android" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
