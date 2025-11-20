// Trials page (renamed from AdminCRM)
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Trials = () => {
  const [trialUsers, setTrialUsers] = useState([]);
  const [bulkAccounts, setBulkAccounts] = useState([]);

  useEffect(() => {
    const fetchTrials = async () => {
      // Fetch trial users
      const { data: profiles } = await supabase.from("profiles").select("*");
      const now = new Date();
      setTrialUsers((profiles || []).filter(
        (profile) => profile.trial_end_date && new Date(profile.trial_end_date) > now
      ));
      // Fetch bulk accounts
      const { data: leads } = await supabase.from("leads").select("*");
      setBulkAccounts(leads || []);
    };
    fetchTrials();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Trials</h1>
      {/* Render trial users and bulk accounts here */}
      <div>
        <h2>Trial Users</h2>
        <ul>
          {trialUsers.map((user) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
        <h2>Bulk Accounts</h2>
        <ul>
          {bulkAccounts.map((account) => (
            <li key={account.id}>{account.business_name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Trials;
