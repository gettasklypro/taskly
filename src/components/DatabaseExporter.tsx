import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileJson, Sheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DatabaseExporter = () => {
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (data: any[], tableName: string): string => {
    if (!data || data.length === 0) {
      return `# ${tableName} - No data\n`;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle objects/arrays
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        // Handle strings with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const exportAsCSV = async () => {
    setIsExporting(true);
    toast.info("Exporting database as CSV...");

    try {
      const tables = [
        "profiles", "contacts", "websites", "pages", "leads", "jobs",
        "quotes", "invoices", "tasks", "expenses", "timesheets",
        "conversations", "messages", "service_requests", "campaigns",
        "user_roles", "promo_codes", "templates", "contact_activities",
        "contact_persons", "contact_relationships", "contact_custom_fields",
        "contact_communication_settings", "attachments", "team_assignments",
        "job_service_items", "job_payment_schedules", "invoice_line_items",
        "quote_line_items", "app_settings", "password_reset_tokens"
      ];

      let allCSV = `Database Export - ${new Date().toISOString()}\n\n`;
      let summary = `EXPORT SUMMARY\n=============\n\n`;

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select("*");

          const recordCount = data?.length || 0;
          summary += `${table}: ${recordCount} records${error ? ' (ERROR)' : ''}\n`;

          allCSV += `\n\n${'='.repeat(80)}\n`;
          allCSV += `TABLE: ${table.toUpperCase()}\n`;
          allCSV += `Records: ${recordCount}\n`;
          allCSV += `${'='.repeat(80)}\n\n`;

          if (error) {
            allCSV += `ERROR: ${error.message}\n`;
          } else {
            allCSV += convertToCSV(data || [], table);
          }
        } catch (err) {
          summary += `${table}: ERROR - ${String(err)}\n`;
          allCSV += `\n\nERROR fetching ${table}: ${String(err)}\n`;
        }
      }

      // Create combined CSV file
      const csvContent = summary + '\n\n' + allCSV;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `database-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Database exported as CSV!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export database");
    } finally {
      setIsExporting(false);
    }
  };

  const exportDatabase = async () => {
    setIsExporting(true);
    toast.info("Exporting database...");

    try {
      // Fetch data from all tables
      const tables = [
        "profiles",
        "contacts",
        "websites",
        "pages",
        "leads",
        "jobs",
        "quotes",
        "invoices",
        "tasks",
        "expenses",
        "timesheets",
        "conversations",
        "messages",
        "service_requests",
        "campaigns",
        "user_roles",
        "promo_codes",
        "templates",
        "contact_activities",
        "contact_persons",
        "contact_relationships",
        "contact_custom_fields",
        "contact_communication_settings",
        "attachments",
        "team_assignments",
        "job_service_items",
        "job_payment_schedules",
        "invoice_line_items",
        "quote_line_items",
        "app_settings",
        "password_reset_tokens"
      ];

      const exportData: Record<string, any> = {
        export_metadata: {
          timestamp: new Date().toISOString(),
          total_tables: tables.length,
        },
        tables: {}
      };

      // Fetch data for each table
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select("*");

          if (error) {
            console.error(`Error fetching ${table}:`, error);
            exportData.tables[table] = {
              error: error.message,
              count: 0,
              data: []
            };
          } else {
            exportData.tables[table] = {
              count: data?.length || 0,
              data: data || []
            };
          }
        } catch (err) {
          console.error(`Exception fetching ${table}:`, err);
          exportData.tables[table] = {
            error: String(err),
            count: 0,
            data: []
          };
        }
      }

      // Calculate summary
      const tableEntries = Object.entries(exportData.tables);
      const summary = {
        tables_with_data: tableEntries.filter(
          ([_, value]: [string, any]) => value.count > 0
        ).length,
        empty_tables: tableEntries.filter(
          ([_, value]: [string, any]) => value.count === 0
        ).length,
        total_records: tableEntries.reduce(
          (sum: number, [_, table]: [string, any]) => sum + (table.count || 0),
          0
        ),
        table_details: tableEntries.map(
          ([name, value]: [string, any]) => ({
            table: name,
            records: value.count,
            has_data: value.count > 0,
            has_error: !!value.error
          })
        ).sort((a, b) => b.records - a.records)
      };

      exportData.export_metadata.summary = summary;

      // Create and download JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `database-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Database exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export database");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={exportAsCSV}
        disabled={isExporting}
        className="gap-2"
        variant="default"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Sheet className="h-4 w-4" />
            Export as CSV
          </>
        )}
      </Button>

      <Button
        onClick={exportDatabase}
        disabled={isExporting}
        className="gap-2"
        variant="outline"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileJson className="h-4 w-4" />
            Export as JSON
          </>
        )}
      </Button>
    </div>
  );
};
