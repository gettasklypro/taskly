import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import tasklyLogo from "@/assets/taskly-logo.png";

export const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={tasklyLogo} alt="TASKLY" className="h-8 w-auto object-contain dark:invert-0 invert" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">14-Day Money-Back Guarantee</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're confident you'll love TASKLY. If you're not completely satisfied within the first 14 days, we'll refund your money—no questions asked.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 py-8">
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Full refund within 14 days</h3>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">No questions asked</h3>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Cancel anytime</h3>
            </div>
          </div>

          {/* Detailed Policy */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p>
                Our 14-day money-back guarantee is designed to give you peace of mind when trying TASKLY. Here's how it works:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Start your subscription to TASKLY</li>
                <li>Use all features and explore the platform for up to 14 days</li>
                <li>If you're not satisfied, request a refund within the 14-day period</li>
                <li>We'll process your refund immediately—no questions asked</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
              <p>
                The 14-day money-back guarantee applies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>New customers subscribing to any TASKLY plan</li>
                <li>First-time purchases only (one refund per customer)</li>
                <li>Refund requests made within 14 days of initial purchase</li>
              </ul>
              <p className="mt-4">
                Please note: The guarantee does not apply to renewal payments or subscriptions that have been active for more than 14 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Request a Refund</h2>
              <p>
                Requesting a refund is simple:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-4">
                <li>Contact our support team via email or through your account dashboard</li>
                <li>Provide your account email and reason for the refund (optional)</li>
                <li>We'll process your refund within 3-5 business days</li>
                <li>You'll receive confirmation once the refund has been issued</li>
              </ol>
              <p className="mt-4">
                Refunds are issued to the original payment method used during purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Processing Time</h2>
              <p>
                Once we receive your refund request:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Refunds are processed within 3-5 business days</li>
                <li>Depending on your bank or payment provider, it may take an additional 5-10 business days for the funds to appear in your account</li>
                <li>You'll receive an email confirmation once the refund has been processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cancellation Policy</h2>
              <p>
                You can cancel your TASKLY subscription at any time:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Cancel from your account settings dashboard</li>
                <li>Your subscription will remain active until the end of your current billing period</li>
                <li>No charges will be made after cancellation</li>
                <li>You can reactivate your subscription at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
              <p>
                If you have any questions about our refund policy or need assistance with a refund request, please don't hesitate to contact our support team. We're here to help and committed to ensuring you have a positive experience with TASKLY.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
