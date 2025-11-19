import { Check, X } from "lucide-react";

export const ComparisonSection = () => {
  const comparisons = [
    { feature: "Quick setup (under 5 minutes)", taskly: true, others: false },
    { feature: "All-in-one platform", taskly: true, others: false },
    { feature: "No hidden fees", taskly: true, others: false },
    { feature: "Unlimited users", taskly: true, others: false },
    { feature: "Mobile app included", taskly: true, others: true },
    { feature: "AI scheduling", taskly: true, others: false },
    { feature: "24/7 support", taskly: true, others: false },
    { feature: "Free updates", taskly: true, others: false },
    { feature: "Cancel anytime", taskly: true, others: false },
  ];

  return (
    <section id="comparison" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See how TASKLY stacks up
          </h2>
          <p className="text-xl text-muted-foreground">
            We built TASKLY to be better than the rest
          </p>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-6 border-b bg-muted/50 font-semibold">
            <div>Feature</div>
            <div className="text-center">TASKLY</div>
            <div className="text-center">Others</div>
          </div>

          {comparisons.map((item, index) => (
            <div
              key={item.feature}
              className={`grid grid-cols-3 gap-4 p-6 items-center ${
                index !== comparisons.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="text-sm md:text-base">{item.feature}</div>
              <div className="flex justify-center">
                {item.taskly ? (
                  <Check className="h-6 w-6 text-primary" />
                ) : (
                  <X className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex justify-center">
                {item.others ? (
                  <Check className="h-6 w-6 text-primary" />
                ) : (
                  <X className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
