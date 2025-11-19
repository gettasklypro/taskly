import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import tasklyLogo from "@/assets/taskly-logo.png";

export const TermsAndConditions = () => {
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
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: 31/10/2025</p>
          
          <p className="mb-8">This website is operated by Einstein Design Ltd., registered in the United Kingdom.</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using Taskly's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>Taskly provides a productivity and task management platform that helps users organize, track, and complete their work efficiently. Our services include task tracking, reminders, project organization, and related features.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>To use our services, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account with accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental/guardian consent</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit any malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Scrape or harvest data from the service without permission</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payment</h2>
            <p>Our premium plan is available on a subscription basis. By subscribing, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay all applicable fees as described on our pricing page</li>
              <li>Provide accurate billing information</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>No refunds except as described in our 14-day money-back guarantee</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. 14-Day Money-Back Guarantee</h2>
            <p>We offer a 14-day money-back guarantee for new premium subscriptions. If you're not satisfied within the first 14 days, contact us for a full refund. This guarantee applies only to your first subscription.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>All content, features, and functionality of Taskly are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. User Content</h2>
            <p>You retain ownership of any content you submit to Taskly. By submitting content, you grant us a license to use, store, and display that content as necessary to provide our services.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
            <p>We strive to provide reliable service but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the service at any time with or without notice.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. You may cancel your subscription at any time from your account settings.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
            <p>Taskly is provided "as is" and "as available" without warranties of any kind. We do not warrant that the service will be error-free or that defects will be corrected.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Taskly shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes. Continued use of the service after changes constitutes acceptance of the modified Terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p>For questions about these Terms, please contact us.</p>
          </section>
        </div>
      </main>
    </div>
  );
};
