import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import tasklyLogo from "@/assets/taskly-logo.png";

export const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: 31/10/2025</p>
          
          <p className="mb-8">This website is operated by Einstein Design Ltd., registered in the United Kingdom.</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>Welcome to Taskly ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our productivity platform.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Task and project data you add to the platform</li>
              <li>Subscription and billing information (processed securely through third-party providers)</li>
              <li>Usage data and analytics on how you interact with our service</li>
              <li>Communications or feedback you send to us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your questions and feedback</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Detect, prevent, and address technical or security issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share it only:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With trusted service providers who support our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud or abuse</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>We use appropriate technical and organizational measures to protect your data against unauthorized access or disclosure. However, please note that no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p>Under data protection laws, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct or update your personal information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to understand how you use Taskly and improve your experience. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised "Last updated" date.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
          </section>
        </div>
      </main>
    </div>
  );
};
