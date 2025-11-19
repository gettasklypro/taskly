import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkAccountRequest {
  fullName: string;
  role?: string;
  jobRole?: string;
  count: number;
  baseEmail: string;
  defaultPassword: string;
  trialDays?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, role, jobRole, count, baseEmail, defaultPassword, trialDays = 14 }: BulkAccountRequest = await req.json();

    console.log("Creating bulk accounts:", { fullName, role, jobRole, count, baseEmail, trialDays });

    // Validate inputs
    if (!fullName || !count || !baseEmail || !defaultPassword) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (count < 1 || count > 100) {
      return new Response(
        JSON.stringify({ error: "Count must be between 1 and 100" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse base email
    const emailParts = baseEmail.split("@");
    if (emailParts.length !== 2) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [localPart, domain] = emailParts;
    const createdAccounts = [];
    const errors = [];

    // Create accounts
    for (let i = 0; i < count; i++) {
      const email = i === 0 ? baseEmail : `${localPart}+${i}@${domain}`;
      
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

        if (authError) {
          console.error(`Error creating user ${email}:`, authError);
          errors.push({ email, error: authError.message });
          continue;
        }

        console.log(`Created auth user: ${email}`);

        // Calculate trial end date
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);

        // Update profile with job_role and trial_end_date
        const profileUpdates: any = {
          trial_end_date: trialEndDate.toISOString()
        };
        
        if (jobRole) {
          profileUpdates.job_role = jobRole;
        }

        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("id", authData.user.id);

        if (profileError) {
          console.error(`Error updating profile for ${email}:`, profileError);
          errors.push({
            email,
            error: `Profile update failed: ${profileError.message}`
          });
          continue;
        }

        // Assign role if specified
        if (role && role !== 'user') {
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({
              user_id: authData.user.id,
              role: role,
            });

          if (roleError) {
            console.error(`Error assigning role to ${email}:`, roleError);
            errors.push({ email, error: `Created but failed to assign role: ${roleError.message}` });
          }
        }

        createdAccounts.push({
          email,
          name: fullName,
          role: role || 'user',
          id: authData.user.id,
        });

      } catch (error: any) {
        console.error(`Exception creating user ${email}:`, error);
        errors.push({ email, error: error.message });
      }
    }

    console.log(`Successfully created ${createdAccounts.length} accounts`);
    if (errors.length > 0) {
      console.log(`Failed to create ${errors.length} accounts:`, errors);
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: createdAccounts,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully created ${createdAccounts.length} out of ${count} accounts`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in create-bulk-accounts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
