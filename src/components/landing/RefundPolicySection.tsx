import { CheckCircle2 } from "lucide-react";

export const RefundPolicySection = () => {
  return (
    <section id="guarantee" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            14-Day Money-Back Guarantee
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're confident you'll love TASKLY. If you're not completely satisfied within the first 14 days, we'll refund your money—no questions asked.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Full refund within 14 days</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">No questions asked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
