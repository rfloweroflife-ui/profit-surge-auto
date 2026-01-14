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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
