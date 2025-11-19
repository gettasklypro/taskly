export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          company_name: string | null
          id: string
          support_email: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          id?: string
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          id?: string
          support_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          clicked_count: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          opened_count: number | null
          scheduled_date: string | null
          sent_count: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clicked_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          opened_count?: number | null
          scheduled_date?: string | null
          sent_count?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clicked_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          opened_count?: number | null
          scheduled_date?: string | null
          sent_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_activities: {
        Row: {
          activity_date: string
          activity_type: string
          contact_id: string
          created_at: string
          created_by_name: string | null
          description: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          outcome: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          contact_id: string
          created_at?: string
          created_by_name?: string | null
          description?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          outcome?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          contact_id?: string
          created_at?: string
          created_by_name?: string | null
          description?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          outcome?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_communication_settings: {
        Row: {
          contact_frequency: string | null
          contact_id: string
          created_at: string
          do_not_contact: boolean | null
          email_enabled: boolean | null
          id: string
          marketing_emails: boolean | null
          preferred_contact_method: string | null
          sms_enabled: boolean | null
          transactional_emails: boolean | null
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean | null
        }
        Insert: {
          contact_frequency?: string | null
          contact_id: string
          created_at?: string
          do_not_contact?: boolean | null
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          preferred_contact_method?: string | null
          sms_enabled?: boolean | null
          transactional_emails?: boolean | null
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean | null
        }
        Update: {
          contact_frequency?: string | null
          contact_id?: string
          created_at?: string
          do_not_contact?: boolean | null
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          preferred_contact_method?: string | null
          sms_enabled?: boolean | null
          transactional_emails?: boolean | null
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_communication_settings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_custom_fields: {
        Row: {
          contact_id: string
          created_at: string
          field_name: string
          field_type: string | null
          field_value: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          field_name: string
          field_type?: string | null
          field_value?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          field_name?: string
          field_type?: string | null
          field_value?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_custom_fields_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_persons: {
        Row: {
          contact_id: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          phone: string | null
          role: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_persons_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_relationships: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          notes: string | null
          related_contact_id: string
          relationship_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          notes?: string | null
          related_contact_id: string
          relationship_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          related_contact_id?: string
          relationship_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_relationships_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_relationships_related_contact_id_fkey"
            columns: ["related_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          assigned_to: string | null
          auth_user_id: string | null
          billing_address: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_date: string | null
          lead_source: string | null
          lifetime_value: number | null
          name: string
          next_follow_up_date: string | null
          payment_terms: string | null
          phone: string | null
          social_media_links: Json | null
          status: Database["public"]["Enums"]["contact_status"]
          tags: string[] | null
          tax_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          auth_user_id?: string | null
          billing_address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          lead_source?: string | null
          lifetime_value?: number | null
          name: string
          next_follow_up_date?: string | null
          payment_terms?: string | null
          phone?: string | null
          social_media_links?: Json | null
          status?: Database["public"]["Enums"]["contact_status"]
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          auth_user_id?: string | null
          billing_address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          lead_source?: string | null
          lifetime_value?: number | null
          name?: string
          next_follow_up_date?: string | null
          payment_terms?: string | null
          phone?: string | null
          social_media_links?: Json | null
          status?: Database["public"]["Enums"]["contact_status"]
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          last_message: string | null
          status: string
          unread_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          status?: string
          unread_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          status?: string
          unread_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          job_id: string | null
          receipt_url: string | null
          reimburse_to: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          job_id?: string | null
          receipt_url?: string | null
          reimburse_to?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          job_id?: string | null
          receipt_url?: string | null
          reimburse_to?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          name: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          name: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          name?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_message: string | null
          contact_id: string | null
          contract_disclaimer: string | null
          created_at: string
          deposits: number | null
          discount: number | null
          due_date: string | null
          id: string
          internal_notes: string | null
          invoice_number: string
          issued_date: string | null
          job_id: string | null
          paid_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subject: string | null
          tax: number | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_message?: string | null
          contact_id?: string | null
          contract_disclaimer?: string | null
          created_at?: string
          deposits?: number | null
          discount?: number | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number: string
          issued_date?: string | null
          job_id?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subject?: string | null
          tax?: number | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_message?: string | null
          contact_id?: string | null
          contract_disclaimer?: string | null
          created_at?: string
          deposits?: number | null
          discount?: number | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string
          issued_date?: string | null
          job_id?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subject?: string | null
          tax?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_payment_schedules: {
        Row: {
          balance: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          job_id: string
          percentage: number | null
          status: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id: string
          percentage?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string
          percentage?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_payment_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_service_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          job_id: string
          name: string
          quantity: number
          unit_cost: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          job_id: string
          name: string
          quantity?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          job_id?: string
          name?: string
          quantity?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_service_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          anytime: boolean | null
          calculated_end_date: string | null
          calculated_total_visits: number | null
          completion_date: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          email_team: boolean | null
          end_time: string | null
          ends_after_unit: string | null
          ends_after_value: string | null
          ends_on_date: string | null
          ends_type: string | null
          id: string
          internal_notes: string | null
          job_number: string | null
          job_type: string | null
          recurring_repeat: string | null
          remind_to_invoice: boolean | null
          repeat: string | null
          salesperson: string | null
          schedule_later: boolean | null
          scheduled_date: string | null
          split_invoices: boolean | null
          start_time: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          total_amount: number | null
          total_visits: number | null
          updated_at: string
          user_id: string
          visit_instructions: string | null
        }
        Insert: {
          anytime?: boolean | null
          calculated_end_date?: string | null
          calculated_total_visits?: number | null
          completion_date?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          email_team?: boolean | null
          end_time?: string | null
          ends_after_unit?: string | null
          ends_after_value?: string | null
          ends_on_date?: string | null
          ends_type?: string | null
          id?: string
          internal_notes?: string | null
          job_number?: string | null
          job_type?: string | null
          recurring_repeat?: string | null
          remind_to_invoice?: boolean | null
          repeat?: string | null
          salesperson?: string | null
          schedule_later?: boolean | null
          scheduled_date?: string | null
          split_invoices?: boolean | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          total_amount?: number | null
          total_visits?: number | null
          updated_at?: string
          user_id: string
          visit_instructions?: string | null
        }
        Update: {
          anytime?: boolean | null
          calculated_end_date?: string | null
          calculated_total_visits?: number | null
          completion_date?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          email_team?: boolean | null
          end_time?: string | null
          ends_after_unit?: string | null
          ends_after_value?: string | null
          ends_on_date?: string | null
          ends_type?: string | null
          id?: string
          internal_notes?: string | null
          job_number?: string | null
          job_type?: string | null
          recurring_repeat?: string | null
          remind_to_invoice?: boolean | null
          repeat?: string | null
          salesperson?: string | null
          schedule_later?: boolean | null
          scheduled_date?: string | null
          split_invoices?: boolean | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          total_amount?: number | null
          total_visits?: number | null
          updated_at?: string
          user_id?: string
          visit_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_name: string
          business_type: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          trade: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          business_name: string
          business_type?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          trade?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
          sender_role: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_homepage: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
          website_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
          website_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used: boolean | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used?: boolean | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used?: boolean | null
          user_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          business_type: string | null
          country: string | null
          created_at: string
          currency: string | null
          email: string
          full_name: string | null
          id: string
          job_role: string | null
          main_goal: string | null
          onboarding_completed: boolean | null
          plan_type: string | null
          referral_source: string | null
          team_size: string | null
          trial_end_date: string | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email: string
          full_name?: string | null
          id: string
          job_role?: string | null
          main_goal?: string | null
          onboarding_completed?: boolean | null
          plan_type?: string | null
          referral_source?: string | null
          team_size?: string | null
          trial_end_date?: string | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          job_role?: string | null
          main_goal?: string | null
          onboarding_completed?: boolean | null
          plan_type?: string | null
          referral_source?: string | null
          team_size?: string | null
          trial_end_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_line_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number
          quote_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity?: number
          quote_id: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          quote_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_message: string | null
          contact_id: string | null
          contract_disclaimer: string | null
          created_at: string
          description: string | null
          discount: number | null
          id: string
          internal_notes: string | null
          link_to_invoices: boolean | null
          link_to_jobs: boolean | null
          quote_number: string
          rating: number | null
          salesperson: string | null
          status: Database["public"]["Enums"]["quote_status"]
          tax: number | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_message?: string | null
          contact_id?: string | null
          contract_disclaimer?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          internal_notes?: string | null
          link_to_invoices?: boolean | null
          link_to_jobs?: boolean | null
          quote_number: string
          rating?: number | null
          salesperson?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax?: number | null
          title: string
          total_amount?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_message?: string | null
          contact_id?: string | null
          contract_disclaimer?: string | null
          created_at?: string
          description?: string | null
          discount?: number | null
          id?: string
          internal_notes?: string | null
          link_to_invoices?: boolean | null
          link_to_jobs?: boolean | null
          quote_number?: string
          rating?: number | null
          salesperson?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          anytime: boolean | null
          assessment_instructions: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          email_team: boolean | null
          id: string
          notes: string | null
          on_site_assessment: boolean | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          schedule_later: boolean | null
          scheduled_end_date: string | null
          scheduled_end_time: string | null
          scheduled_start_date: string | null
          scheduled_start_time: string | null
          status: Database["public"]["Enums"]["request_status"]
          team_reminder: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anytime?: boolean | null
          assessment_instructions?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          email_team?: boolean | null
          id?: string
          notes?: string | null
          on_site_assessment?: boolean | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          schedule_later?: boolean | null
          scheduled_end_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_date?: string | null
          scheduled_start_time?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          team_reminder?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anytime?: boolean | null
          assessment_instructions?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          email_team?: boolean | null
          id?: string
          notes?: string | null
          on_site_assessment?: boolean | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          schedule_later?: boolean | null
          scheduled_end_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_date?: string | null
          scheduled_start_time?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          team_reminder?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          job_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      team_assignments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          team_member_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          team_member_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          team_member_name?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          preview_data: Json
          thumbnail_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["template_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          preview_data?: Json
          thumbnail_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          preview_data?: Json
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          hours: number | null
          id: string
          job_id: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          hours?: number | null
          id?: string
          job_id?: string | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          hours?: number | null
          id?: string
          job_id?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          category: Database["public"]["Enums"]["template_category"] | null
          created_at: string
          description: string | null
          domain: string | null
          favicon_url: string | null
          id: string
          name: string
          settings: Json | null
          site_title: string | null
          slug: string | null
          status: Database["public"]["Enums"]["website_status"] | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_category"] | null
          created_at?: string
          description?: string | null
          domain?: string | null
          favicon_url?: string | null
          id?: string
          name: string
          settings?: Json | null
          site_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["website_status"] | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"] | null
          created_at?: string
          description?: string | null
          domain?: string | null
          favicon_url?: string | null
          id?: string
          name?: string
          settings?: Json | null
          site_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["website_status"] | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_conversation_contact_name: {
        Args: { _contact_id: string }
        Returns: {
          email: string
          name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_linked_to_contact: {
        Args: { _contact_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      contact_status: "lead" | "customer"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      job_status:
        | "draft"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      quote_status: "draft" | "sent" | "approved" | "declined" | "expired"
      request_status: "new" | "contacted" | "quoted" | "converted" | "lost"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "completed" | "cancelled"
      template_category:
        | "fitness"
        | "coaching"
        | "creative"
        | "business"
        | "consulting"
        | "agency"
        | "other"
      website_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      contact_status: ["lead", "customer"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      job_status: [
        "draft",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      quote_status: ["draft", "sent", "approved", "declined", "expired"],
      request_status: ["new", "contacted", "quoted", "converted", "lost"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "completed", "cancelled"],
      template_category: [
        "fitness",
        "coaching",
        "creative",
        "business",
        "consulting",
        "agency",
        "other",
      ],
      website_status: ["draft", "published", "archived"],
    },
  },
} as const
