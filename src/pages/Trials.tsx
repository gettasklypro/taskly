// Trials page (renamed from AdminCRM)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Trials = () => {
  const [search, setSearch] = useState("");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["trials-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Trial users: trial_end_date in the future
  const now = new Date();
  const trialUsers = profiles.filter((p: any) => p.trial_end_date && new Date(p.trial_end_date) > now);

  // Bulk accounts detection: prefer explicit referral_source flag, otherwise fallback to email+ pattern
  const bulkAccounts = profiles.filter((p: any) => {
    const referral = (p.referral_source || "").toString().toLowerCase();
    const email = (p.email || "").toString();
    return referral.includes("bulk") || email.includes("+");
  });

  const filteredTrialUsers = trialUsers.filter((u: any) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBulkAccounts = bulkAccounts.filter((u: any) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (u.business_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Trials</h1>
        <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trial Users ({filteredTrialUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : filteredTrialUsers.length === 0 ? (
              <div className="text-center">No trial users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Trial Ends</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrialUsers.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.full_name || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.trial_end_date ? new Date(u.trial_end_date).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Accounts ({filteredBulkAccounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : filteredBulkAccounts.length === 0 ? (
              <div className="text-center">No bulk accounts found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBulkAccounts.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.full_name || "—"}</TableCell>
                      <TableCell>{b.email}</TableCell>
                      <TableCell>{b.business_name || "—"}</TableCell>
                      <TableCell>{b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Trials;
