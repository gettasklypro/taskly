import { CheckCircle2, Clock, DollarSign, Users, TrendingUp, Shield } from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Save 10+ hours per week",
      description: "Automate scheduling, invoicing, and follow-ups so you can focus on growing your business."
    },
    {
      icon: DollarSign,
      title: "Get paid 3x faster",
      description: "Send professional invoices instantly and accept payments online with automated reminders."
    },
    {
      icon: Users,
      title: "Delight more customers",
      description: "Impress clients with fast quotes, real-time updates, and seamless communication."
    },
    {
      icon: TrendingUp,
      title: "Grow your revenue",
      description: "Book more jobs with optimized scheduling and never miss a follow-up opportunity."
    },
    {
      icon: Shield,
      title: "Stay organized",
      description: "Keep all your jobs, clients, and documents in one secure, easy-to-access place."
    },
    {
      icon: CheckCircle2,
      title: "Work smarter",
      description: "Make data-driven decisions with real-time insights and performance tracking."
    }
  ];

  return (
    <section id="benefits" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why thousands of pros choose TASKLY
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built by field service pros, for field service pros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex flex-col items-start gap-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
