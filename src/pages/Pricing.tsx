import { Check } from "lucide-react";
import UpgradeButton from "@/components/UpgradeButton";

export const Pricing = () => {
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
            planId: "pri_01kajn4vpt4ekb0vaydrwncsn5",
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
            planId: "pri_01kajn5yaxtef1ysmhz7hyqa40",
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
            planId: "pri_01kajn6jypbvk8g5g6r0qywwaj",
            popular: false
        }
    ];

    return (
        <div className="py-10 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Upgrade your plan
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your business needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-lg border ${plan.popular
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

                            <UpgradeButton planId={plan.planId} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
