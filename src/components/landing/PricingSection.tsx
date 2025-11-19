import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for solo pros just getting started",
      features: [
        "Up to 100 jobs per month",
        "Unlimited clients",
        "Quote & invoice creation",
        "Payment processing",
        "Mobile app access",
        "Email support"
      ],
      cta: "Start free trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "For growing businesses with a team",
      features: [
        "Unlimited jobs",
        "Unlimited clients",
        "Everything in Starter, plus:",
        "Advanced scheduling",
        "Analytics & reporting",
        "Priority support",
        "Custom branding"
      ],
      cta: "Start free trial",
      popular: true
    },
    {
      name: "Scale",
      price: "$149",
      period: "/month",
      description: "For growing teams with AI-powered automation",
      features: [
        "Everything in Professional, plus:",
        "Up to 10 team members",
        "AI job assistant – auto-generate quotes, invoices & follow-ups",
        "AI scheduling – smart route & time optimization",
        "AI insights dashboard – predicts workload & top clients",
        "Automated workflows (email, SMS, reminders)",
        "Advanced client portal with 2-way messaging",
        "Multi-location management",
        "Custom reports & KPIs",
        "Phone & chat support",
        "Early access to new AI tools"
      ],
      cta: "Start free trial",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with 14 days free. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-lg border ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-2">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="w-full">
                <Button
                  className={`w-full ${
                    plan.popular ? "" : "variant-outline"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include 14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};
