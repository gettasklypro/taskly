import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, ExternalLink } from "lucide-react";

interface CustomDomainInstructionsProps {
  domain: string;
}

export default function CustomDomainInstructions({ domain }: CustomDomainInstructionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Domain Setup Instructions</CardTitle>
        <CardDescription>
          Follow these steps to connect your custom domain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Alert className="py-2">
          <Info className="h-3 w-3" />
          <AlertDescription className="text-xs">
            You'll need access to your domain registrar's DNS settings.
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-[250px] pr-3">
          <div className="space-y-3">
          <div>
            <h3 className="font-semibold mb-1 text-xs">Step 1: Add DNS Records</h3>
            <p className="text-[11px] text-muted-foreground mb-2">
              Add these DNS records at your domain registrar:
            </p>
            
            <div className="space-y-2">
              <div className="bg-muted p-2 rounded text-[11px]">
                <div className="font-semibold mb-1.5">Root ({domain}):</div>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Type:</span>
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono">A</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Name:</span>
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono">@</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Value:</span>
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono">76.76.21.21</code>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-2 rounded text-[11px]">
                <div className="font-semibold mb-1.5">WWW (www.{domain}):</div>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Type:</span>
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono">CNAME</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Name:</span>
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono">www</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Value:</span>
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono">cname.vercel-dns.com</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <div>
              <h3 className="font-semibold mb-1 text-xs">Step 2: Wait for DNS Propagation</h3>
              <p className="text-[11px] text-muted-foreground">
                DNS changes can take 24-48 hours. Check at{" "}
                <a 
                  href="https://dnschecker.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  DNSChecker.org
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-xs">Step 3: SSL Certificate</h3>
              <p className="text-[11px] text-muted-foreground">
                SSL certificate will be automatically provisioned.
              </p>
            </div>

            <Alert className="py-2">
              <Info className="h-3 w-3" />
              <AlertDescription className="text-[11px] space-y-1">
                <p className="font-semibold">Important:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Remove existing A/CNAME records first</li>
                  <li>Allow Let's Encrypt in CAA records</li>
                  <li>One domain per website</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
