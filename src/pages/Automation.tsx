import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, Pause, Download, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExcelRow {
  lead_id: string;
  contact_name: string;
  business_name: string;
  contact_tel: string;
  taskly_login_email: string;
  website_url: string;
  we_built: string;
  notes: string;
}

export const Automation = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedWebsites, setGeneratedWebsites] = useState<Array<{ businessName: string; subdomain: string }>>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        
        const parsedRows: ExcelRow[] = jsonData.map((row: any) => ({
          lead_id: row["Lead ID"] || "",
          contact_name: row["Contact Name"] || "",
          business_name: row["Business Name"] || "",
          contact_tel: row["Contact Tel"] || "",
          taskly_login_email: row["Taskly Login Email"] || "",
          website_url: row["Website URL"] || "",
          we_built: row["We Built"] || "",
          notes: row["Notes"] || ""
        }));

        setRows(parsedRows);
        addLog(`Loaded ${parsedRows.length} rows from Excel`);
        toast({
          title: "File uploaded",
          description: `${parsedRows.length} businesses loaded`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse Excel file",
          variant: "destructive"
        });
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const generateEmail = (leadId: string): string => {
    return `gettaskly+${leadId}@hotmail.com`;
  };

  const startBatchGeneration = async () => {
    if (rows.length === 0) {
      toast({
        title: "No data",
        description: "Please upload an Excel file first",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setPaused(false);
    addLog("Starting batch generation...");

    for (let i = 0; i < rows.length; i++) {
      if (paused) {
        addLog("Paused by user");
        break;
      }

      const row = rows[i];
      
      // Skip if already built
      if (row.we_built) {
        addLog(`Skipping ${row.business_name} - already built`);
        continue;
      }

      setCurrentRow(i + 1);
      setProgress(((i + 1) / rows.length) * 100);

      try {
        // Auto-generate email if missing
        const email = row.taskly_login_email || generateEmail(row.lead_id);
        
        addLog(`Processing ${row.business_name}...`);

        // Call batch processing endpoint
        const { data, error } = await supabase.functions.invoke('process-website-batch', {
          body: {
            email,
            business_name: row.business_name,
            mode: row.website_url ? "url" : "describe",
            website_url: row.website_url || null,
            auto_publish: true
          }
        });

        if (error) throw error;

        // Update row with results
        rows[i].taskly_login_email = email;
        rows[i].we_built = data.subdomain;
        rows[i].notes = "Published successfully";
        setRows([...rows]);

        addLog(`✓ ${row.business_name} published: ${data.subdomain}`);
        
        // Add to generated websites list
        setGeneratedWebsites(prev => [...prev, {
          businessName: row.business_name,
          subdomain: data.subdomain
        }]);

        // Delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error: any) {
        rows[i].notes = `Error: ${error.message}`;
        setRows([...rows]);
        addLog(`✗ ${row.business_name} failed: ${error.message}`);
      }
    }

    setProcessing(false);
    addLog("Batch generation completed!");
    toast({
      title: "Batch complete",
      description: "All websites have been processed"
    });
  };

  const downloadResults = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map(row => ({
        "Lead ID": row.lead_id,
        "Contact Name": row.contact_name,
        "Business Name": row.business_name,
        "Contact Tel": row.contact_tel,
        "Taskly Login Email": row.taskly_login_email,
        "Website URL": row.website_url,
        "We Built": row.we_built,
        "Notes": row.notes
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "taskly-automation-results.xlsx");

    toast({
      title: "Downloaded",
      description: "Results exported to Excel"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Website Automation"
        description="Batch generate and publish websites from Excel"
      />
      
      <div className="p-6 space-y-6">
        {generatedWebsites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Websites ({generatedWebsites.length})</CardTitle>
              <CardDescription>Click any link to view the published website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedWebsites.map((website, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{website.businessName}</span>
                    <a
                      href={website.subdomain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      {website.subdomain}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
            <CardDescription>
              Upload a file with columns: Lead ID, Contact Name, Business Name, Contact Tel, 
              Taskly Login Email, Website URL, We Built, Notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={processing}
              />
              <Button
                onClick={startBatchGeneration}
                disabled={processing || rows.length === 0}
                className="gap-2"
              >
                {processing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {processing ? "Processing..." : "Start Generation"}
              </Button>
              {processing && (
                <Button
                  variant="outline"
                  onClick={() => setPaused(true)}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              {rows.length > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadResults}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
              )}
            </div>

            {rows.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Loaded {rows.length} businesses. {rows.filter(r => r.we_built).length} already built.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {processing && (
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>
                Processing {currentRow} of {rows.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="w-full" />
            </CardContent>
          </Card>
        )}

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
