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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bot_activities: {
        Row: {
          action: string
          action_type: string
          bot_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          result: string | null
          target: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          action_type: string
          bot_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          result?: string | null
          target?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string
          bot_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          result?: string | null
          target?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_activities_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_activities_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "bot_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_commands: {
        Row: {
          command: string
          command_type: string
          completed_at: string | null
          created_at: string
          id: string
          result: Json | null
          status: string
          target_ids: string[] | null
          user_id: string | null
        }
        Insert: {
          command: string
          command_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          result?: Json | null
          status?: string
          target_ids?: string[] | null
          user_id?: string | null
        }
        Update: {
          command?: string
          command_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          result?: Json | null
          status?: string
          target_ids?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      bot_teams: {
        Row: {
          assigned_platform: string | null
          assigned_product: string | null
          created_at: string
          engagement_rate: number | null
          id: string
          name: string
          performance_score: number | null
          posts_created: number | null
          revenue_generated: number | null
          status: string
          strategy: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_platform?: string | null
          assigned_product?: string | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          name: string
          performance_score?: number | null
          posts_created?: number | null
          revenue_generated?: number | null
          status?: string
          strategy?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_platform?: string | null
          assigned_product?: string | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          name?: string
          performance_score?: number | null
          posts_created?: number | null
          revenue_generated?: number | null
          status?: string
          strategy?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bots: {
        Row: {
          created_at: string
          current_task: string | null
          efficiency_score: number | null
          id: string
          name: string
          role: string
          status: string
          tasks_completed: number | null
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_task?: string | null
          efficiency_score?: number | null
          id?: string
          name: string
          role: string
          status?: string
          tasks_completed?: number | null
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_task?: string | null
          efficiency_score?: number | null
          id?: string
          name?: string
          role?: string
          status?: string
          tasks_completed?: number | null
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_bots_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "bot_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cj_connections: {
        Row: {
          api_key: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          updated_at: string
          user_identifier: string
        }
        Insert: {
          api_key: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string
          user_identifier?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string
          user_identifier?: string
        }
        Relationships: []
      }
      cj_inventory_logs: {
        Row: {
          change_type: string | null
          cj_product_id: string
          created_at: string
          id: string
          new_count: number | null
          previous_count: number | null
        }
        Insert: {
          change_type?: string | null
          cj_product_id: string
          created_at?: string
          id?: string
          new_count?: number | null
          previous_count?: number | null
        }
        Update: {
          change_type?: string | null
          cj_product_id?: string
          created_at?: string
          id?: string
          new_count?: number | null
          previous_count?: number | null
        }
        Relationships: []
      }
      cj_orders: {
        Row: {
          carrier: string | null
          cj_cost: number | null
          cj_order_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          error_message: string | null
          fulfillment_status: string | null
          id: string
          order_items: Json | null
          profit: number | null
          shipping_address: Json | null
          shopify_order_id: string
          shopify_order_number: string | null
          status: string | null
          total_amount: number | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          cj_cost?: number | null
          cj_order_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          error_message?: string | null
          fulfillment_status?: string | null
          id?: string
          order_items?: Json | null
          profit?: number | null
          shipping_address?: Json | null
          shopify_order_id: string
          shopify_order_number?: string | null
          status?: string | null
          total_amount?: number | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          cj_cost?: number | null
          cj_order_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          error_message?: string | null
          fulfillment_status?: string | null
          id?: string
          order_items?: Json | null
          profit?: number | null
          shipping_address?: Json | null
          shopify_order_id?: string
          shopify_order_number?: string | null
          status?: string | null
          total_amount?: number | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cj_products: {
        Row: {
          category: string | null
          cj_price: number | null
          cj_product_id: string
          created_at: string
          id: string
          image_url: string | null
          inventory_count: number | null
          is_synced: boolean | null
          last_inventory_update: string | null
          product_name: string
          product_sku: string | null
          sell_price: number | null
          shipping_time: string | null
          shopify_product_id: string | null
          shopify_variant_id: string | null
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cj_price?: number | null
          cj_product_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_synced?: boolean | null
          last_inventory_update?: string | null
          product_name: string
          product_sku?: string | null
          sell_price?: number | null
          shipping_time?: string | null
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cj_price?: number | null
          cj_product_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          is_synced?: boolean | null
          last_inventory_update?: string | null
          product_name?: string
          product_sku?: string | null
          sell_price?: number | null
          shipping_time?: string | null
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      competitor_analysis: {
        Row: {
          analyzed_by: string | null
          competitor_name: string
          content_type: string | null
          content_url: string | null
          created_at: string
          engagement_count: number | null
          hashtags: string[] | null
          hooks: string[] | null
          id: string
          our_version_created: boolean | null
          platform: string
          stolen_elements: Json | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          analyzed_by?: string | null
          competitor_name: string
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          engagement_count?: number | null
          hashtags?: string[] | null
          hooks?: string[] | null
          id?: string
          our_version_created?: boolean | null
          platform: string
          stolen_elements?: Json | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          analyzed_by?: string | null
          competitor_name?: string
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          engagement_count?: number | null
          hashtags?: string[] | null
          hooks?: string[] | null
          id?: string
          our_version_created?: boolean | null
          platform?: string
          stolen_elements?: Json | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_analyzed_by_fkey"
            columns: ["analyzed_by"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          bounces: number | null
          campaign_type: string | null
          clicks: number | null
          conversions: number | null
          created_at: string
          id: string
          list_id: string | null
          name: string
          opens: number | null
          preview_text: string | null
          recipients_count: number | null
          revenue: number | null
          scheduled_at: string | null
          segment_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          unsubscribes: number | null
          updated_at: string
        }
        Insert: {
          bounces?: number | null
          campaign_type?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          list_id?: string | null
          name: string
          opens?: number | null
          preview_text?: string | null
          recipients_count?: number | null
          revenue?: number | null
          scheduled_at?: string | null
          segment_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          unsubscribes?: number | null
          updated_at?: string
        }
        Update: {
          bounces?: number | null
          campaign_type?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          list_id?: string | null
          name?: string
          opens?: number | null
          preview_text?: string | null
          recipients_count?: number | null
          revenue?: number | null
          scheduled_at?: string | null
          segment_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          unsubscribes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      email_flows: {
        Row: {
          created_at: string
          flow_steps: Json | null
          id: string
          is_active: boolean | null
          name: string
          revenue_generated: number | null
          total_completed: number | null
          total_triggered: number | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          flow_steps?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          revenue_generated?: number | null
          total_completed?: number | null
          total_triggered?: number | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          flow_steps?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          revenue_generated?: number | null
          total_completed?: number | null
          total_triggered?: number | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          custom_properties: Json | null
          email: string
          first_name: string | null
          id: string
          is_subscribed: boolean | null
          last_name: string | null
          phone: string | null
          source: string | null
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_properties?: Json | null
          email: string
          first_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          last_name?: string | null
          phone?: string | null
          source?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_properties?: Json | null
          email?: string
          first_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          last_name?: string | null
          phone?: string | null
          source?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string
          html_content: string | null
          id: string
          is_active: boolean | null
          json_content: Json | null
          name: string
          preview_image_url: string | null
          subject: string | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          json_content?: Json | null
          name: string
          preview_image_url?: string | null
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          json_content?: Json | null
          name?: string
          preview_image_url?: string | null
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      klaviyo_connections: {
        Row: {
          account_id: string | null
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          private_key: string | null
          public_key: string | null
          updated_at: string
          user_identifier: string
        }
        Insert: {
          account_id?: string | null
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          private_key?: string | null
          public_key?: string | null
          updated_at?: string
          user_identifier?: string
        }
        Update: {
          account_id?: string | null
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          private_key?: string | null
          public_key?: string | null
          updated_at?: string
          user_identifier?: string
        }
        Relationships: []
      }
      pinterest_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          pinterest_user_id: string | null
          pinterest_username: string | null
          refresh_token: string | null
          scopes: string[] | null
          token_type: string | null
          updated_at: string
          user_identifier: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pinterest_user_id?: string | null
          pinterest_username?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_identifier?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pinterest_user_id?: string | null
          pinterest_username?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_identifier?: string
        }
        Relationships: []
      }
      pinterest_pins: {
        Row: {
          board_id: string | null
          clicks: number | null
          created_at: string
          description: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          impressions: number | null
          link: string | null
          pin_id: string | null
          posted_at: string | null
          product_id: string | null
          saves: number | null
          status: string | null
          title: string
        }
        Insert: {
          board_id?: string | null
          clicks?: number | null
          created_at?: string
          description?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          link?: string | null
          pin_id?: string | null
          posted_at?: string | null
          product_id?: string | null
          saves?: number | null
          status?: string | null
          title: string
        }
        Update: {
          board_id?: string | null
          clicks?: number | null
          created_at?: string
          description?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          link?: string | null
          pin_id?: string | null
          posted_at?: string | null
          product_id?: string | null
          saves?: number | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          brand_logo_url: string | null
          brand_name: string | null
          brand_primary_color: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          last_seen_at: string | null
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_primary_color?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          last_seen_at?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_primary_color?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_seen_at?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      store_connections: {
        Row: {
          admin_token_encrypted: string | null
          created_at: string
          id: string
          is_active: boolean | null
          store_domain: string
          store_name: string | null
          storefront_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_token_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          store_domain: string
          store_name?: string | null
          storefront_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_token_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          store_domain?: string
          store_name?: string | null
          storefront_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          bot_limit: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_limit?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_limit?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_decisions: {
        Row: {
          consensus_reached: boolean | null
          created_at: string
          decision: string
          decision_type: string
          executed: boolean | null
          id: string
          outcome: string | null
          reasoning: string | null
          team_id: string | null
          user_id: string | null
          votes: Json | null
        }
        Insert: {
          consensus_reached?: boolean | null
          created_at?: string
          decision: string
          decision_type: string
          executed?: boolean | null
          id?: string
          outcome?: string | null
          reasoning?: string | null
          team_id?: string | null
          user_id?: string | null
          votes?: Json | null
        }
        Update: {
          consensus_reached?: boolean | null
          created_at?: string
          decision?: string
          decision_type?: string
          executed?: boolean | null
          id?: string
          outcome?: string | null
          reasoning?: string | null
          team_id?: string | null
          user_id?: string | null
          votes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "team_decisions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "bot_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_analytics: {
        Row: {
          auto_replies_sent: number | null
          connection_id: string | null
          conversations_started: number | null
          conversions: number | null
          created_at: string
          date: string
          id: string
          messages_delivered: number | null
          messages_read: number | null
          messages_received: number | null
          messages_sent: number | null
          revenue_attributed: number | null
        }
        Insert: {
          auto_replies_sent?: number | null
          connection_id?: string | null
          conversations_started?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          messages_delivered?: number | null
          messages_read?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          revenue_attributed?: number | null
        }
        Update: {
          auto_replies_sent?: number | null
          connection_id?: string | null
          conversations_started?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          messages_delivered?: number | null
          messages_read?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          revenue_attributed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_analytics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_auto_replies: {
        Row: {
          connection_id: string | null
          created_at: string
          id: string
          include_discount_code: string | null
          include_products: boolean | null
          is_active: boolean | null
          priority: number | null
          product_ids: string[] | null
          reply_content: string
          trigger_keywords: string[]
          trigger_type: string | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          id?: string
          include_discount_code?: string | null
          include_products?: boolean | null
          is_active?: boolean | null
          priority?: number | null
          product_ids?: string[] | null
          reply_content: string
          trigger_keywords: string[]
          trigger_type?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          id?: string
          include_discount_code?: string | null
          include_products?: boolean | null
          is_active?: boolean | null
          priority?: number | null
          product_ids?: string[] | null
          reply_content?: string
          trigger_keywords?: string[]
          trigger_type?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_auto_replies_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          access_token: string
          business_account_id: string | null
          connected_at: string
          display_phone_number: string | null
          id: string
          is_active: boolean | null
          messaging_limit: string | null
          phone_number_id: string | null
          platform_type: string | null
          quality_rating: string | null
          token_type: string | null
          updated_at: string
          user_identifier: string
          verified_name: string | null
          webhook_verify_token: string | null
        }
        Insert: {
          access_token: string
          business_account_id?: string | null
          connected_at?: string
          display_phone_number?: string | null
          id?: string
          is_active?: boolean | null
          messaging_limit?: string | null
          phone_number_id?: string | null
          platform_type?: string | null
          quality_rating?: string | null
          token_type?: string | null
          updated_at?: string
          user_identifier?: string
          verified_name?: string | null
          webhook_verify_token?: string | null
        }
        Update: {
          access_token?: string
          business_account_id?: string | null
          connected_at?: string
          display_phone_number?: string | null
          id?: string
          is_active?: boolean | null
          messaging_limit?: string | null
          phone_number_id?: string | null
          platform_type?: string | null
          quality_rating?: string | null
          token_type?: string | null
          updated_at?: string
          user_identifier?: string
          verified_name?: string | null
          webhook_verify_token?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          connection_id: string | null
          content: string
          created_at: string
          customer_name: string | null
          customer_profile_pic: string | null
          delivered_at: string | null
          direction: string
          from_number: string | null
          id: string
          is_bot_response: boolean | null
          message_id: string | null
          message_type: string | null
          metadata: Json | null
          read_at: string | null
          status: string | null
          to_number: string | null
        }
        Insert: {
          connection_id?: string | null
          content: string
          created_at?: string
          customer_name?: string | null
          customer_profile_pic?: string | null
          delivered_at?: string | null
          direction: string
          from_number?: string | null
          id?: string
          is_bot_response?: boolean | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          status?: string | null
          to_number?: string | null
        }
        Update: {
          connection_id?: string | null
          content?: string
          created_at?: string
          customer_name?: string | null
          customer_profile_pic?: string | null
          delivered_at?: string | null
          direction?: string
          from_number?: string | null
          id?: string
          is_bot_response?: boolean | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          status?: string | null
          to_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_scheduled_messages: {
        Row: {
          connection_id: string | null
          content: string
          created_at: string
          error_message: string | null
          id: string
          message_type: string | null
          scheduled_at: string
          sent_at: string | null
          status: string | null
          template_name: string | null
          template_params: Json | null
          to_number: string
        }
        Insert: {
          connection_id?: string | null
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_type?: string | null
          scheduled_at: string
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          template_params?: Json | null
          to_number: string
        }
        Update: {
          connection_id?: string | null
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_type?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          template_params?: Json | null
          to_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_scheduled_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      x_analytics: {
        Row: {
          connection_id: string | null
          created_at: string
          date: string
          id: string
          link_clicks: number | null
          new_followers: number | null
          profile_visits: number | null
          total_engagements: number | null
          total_impressions: number | null
          total_likes: number | null
          total_replies: number | null
          total_retweets: number | null
          tweets_posted: number | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          date?: string
          id?: string
          link_clicks?: number | null
          new_followers?: number | null
          profile_visits?: number | null
          total_engagements?: number | null
          total_impressions?: number | null
          total_likes?: number | null
          total_replies?: number | null
          total_retweets?: number | null
          tweets_posted?: number | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          date?: string
          id?: string
          link_clicks?: number | null
          new_followers?: number | null
          profile_visits?: number | null
          total_engagements?: number | null
          total_impressions?: number | null
          total_likes?: number | null
          total_replies?: number | null
          total_retweets?: number | null
          tweets_posted?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "x_analytics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "x_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      x_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_active: boolean | null
          refresh_token: string | null
          scopes: string[] | null
          token_type: string | null
          tweet_count: number | null
          updated_at: string
          user_identifier: string
          x_name: string | null
          x_profile_image: string | null
          x_user_id: string | null
          x_username: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          tweet_count?: number | null
          updated_at?: string
          user_identifier?: string
          x_name?: string | null
          x_profile_image?: string | null
          x_user_id?: string | null
          x_username?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          tweet_count?: number | null
          updated_at?: string
          user_identifier?: string
          x_name?: string | null
          x_profile_image?: string | null
          x_user_id?: string | null
          x_username?: string | null
        }
        Relationships: []
      }
      x_tweets: {
        Row: {
          clicks: number | null
          connection_id: string | null
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          impressions: number | null
          is_thread_parent: boolean | null
          likes: number | null
          media_urls: string[] | null
          posted_at: string | null
          product_id: string | null
          quotes: number | null
          replies: number | null
          retweets: number | null
          scheduled_at: string | null
          status: string | null
          thread_id: string | null
          tweet_id: string | null
        }
        Insert: {
          clicks?: number | null
          connection_id?: string | null
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          is_thread_parent?: boolean | null
          likes?: number | null
          media_urls?: string[] | null
          posted_at?: string | null
          product_id?: string | null
          quotes?: number | null
          replies?: number | null
          retweets?: number | null
          scheduled_at?: string | null
          status?: string | null
          thread_id?: string | null
          tweet_id?: string | null
        }
        Update: {
          clicks?: number | null
          connection_id?: string | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          is_thread_parent?: boolean | null
          likes?: number | null
          media_urls?: string[] | null
          posted_at?: string | null
          product_id?: string | null
          quotes?: number | null
          replies?: number | null
          retweets?: number | null
          scheduled_at?: string | null
          status?: string | null
          thread_id?: string | null
          tweet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "x_tweets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "x_connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
