import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const Support = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="Get help when you need it"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Learn how to use all features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Docs
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Get help from our team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Email Support
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};