export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      additional_services: {
        Row: {
          category: string | null
          created_at: string
          default_price: number
          description: string | null
          id: string
          name: string
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          default_price: number
          description?: string | null
          id?: string
          name: string
          unit?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
      addons: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reviews: {
        Row: {
          client_email: string
          client_name: string
          created_at: string | null
          id: string
          project_completion_date: string | null
          quote_id: string | null
          rating: number | null
          review_text: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          created_at?: string | null
          id?: string
          project_completion_date?: string | null
          quote_id?: string | null
          rating?: number | null
          review_text?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          created_at?: string | null
          id?: string
          project_completion_date?: string | null
          quote_id?: string | null
          rating?: number | null
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_reviews_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_types: {
        Row: {
          created_at: string
          daily_rate: number
          description: string | null
          id: string
          name: string
          unit: string
        }
        Insert: {
          created_at?: string
          daily_rate: number
          description?: string | null
          id?: string
          name: string
          unit?: string
        }
        Update: {
          created_at?: string
          daily_rate?: number
          description?: string | null
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
      labor_types: {
        Row: {
          created_at: string
          daily_rate: number
          id: string
          name: string
          unit: string
        }
        Insert: {
          created_at?: string
          daily_rate: number
          id?: string
          name: string
          unit?: string
        }
        Update: {
          created_at?: string
          daily_rate?: number
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
      material_base_prices: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          unit?: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          base_price: number
          created_at: string
          id: string
          name: string
          unit: string
        }
        Insert: {
          base_price: number
          created_at?: string
          id?: string
          name: string
          unit: string
        }
        Update: {
          base_price?: number
          created_at?: string
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          completed_projects: number
          created_at: string
          email: string
          id: string
          is_admin: boolean
          location: string | null
          name: string
          overall_profit_margin: number | null
          phone: string | null
          quotes_used: number
          tier: string
          total_projects: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          company?: string | null
          completed_projects?: number
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          location?: string | null
          name: string
          overall_profit_margin?: number | null
          phone?: string | null
          quotes_used?: number
          tier?: string
          total_projects?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          company?: string | null
          completed_projects?: number
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          location?: string | null
          name?: string
          overall_profit_margin?: number | null
          phone?: string | null
          quotes_used?: number
          tier?: string
          total_projects?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_progress: {
        Row: {
          created_at: string
          id: string
          milestone_date: string | null
          notes: string | null
          progress_percentage: number | null
          quote_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_date?: string | null
          notes?: string | null
          progress_percentage?: number | null
          quote_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_date?: string | null
          notes?: string | null
          progress_percentage?: number | null
          quote_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progress_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: true
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          additional_services_cost: number | null
          addons: Json | null
          addons_cost: number
          client_email: string | null
          client_name: string
          created_at: string
          custom_specs: string | null
          distance_km: number | null
          equipment_costs: number | null
          id: string
          labor: Json | null
          labor_cost: number
          location: string
          materials: Json | null
          materials_cost: number
          overall_profit_amount: number | null
          project_type: string
          region: string
          selected_equipment: Json | null
          selected_services: Json | null
          status: string
          title: string
          total_amount: number
          transport_costs: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_services_cost?: number | null
          addons?: Json | null
          addons_cost?: number
          client_email?: string | null
          client_name: string
          created_at?: string
          custom_specs?: string | null
          distance_km?: number | null
          equipment_costs?: number | null
          id?: string
          labor?: Json | null
          labor_cost?: number
          location: string
          materials?: Json | null
          materials_cost?: number
          overall_profit_amount?: number | null
          project_type: string
          region: string
          selected_equipment?: Json | null
          selected_services?: Json | null
          status?: string
          title: string
          total_amount?: number
          transport_costs?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_services_cost?: number | null
          addons?: Json | null
          addons_cost?: number
          client_email?: string | null
          client_name?: string
          created_at?: string
          custom_specs?: string | null
          distance_km?: number | null
          equipment_costs?: number | null
          id?: string
          labor?: Json | null
          labor_cost?: number
          location?: string
          materials?: Json | null
          materials_cost?: number
          overall_profit_amount?: number | null
          project_type?: string
          region?: string
          selected_equipment?: Json | null
          selected_services?: Json | null
          status?: string
          title?: string
          total_amount?: number
          transport_costs?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regional_multipliers: {
        Row: {
          created_at: string | null
          id: string
          multiplier: number
          region: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          multiplier?: number
          region: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          multiplier?: number
          region?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_equipment_rates: {
        Row: {
          created_at: string
          daily_rate: number
          equipment_type_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_rate: number
          equipment_type_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_rate?: number
          equipment_type_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipment_rates_equipment_type_id_fkey"
            columns: ["equipment_type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_equipment_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_service_rates: {
        Row: {
          created_at: string
          id: string
          price: number
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_service_rates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "additional_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_service_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_transport_rates: {
        Row: {
          base_cost: number
          cost_per_km: number
          created_at: string
          id: string
          region: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_cost?: number
          cost_per_km: number
          created_at?: string
          id?: string
          region: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_cost?: number
          cost_per_km?: number
          created_at?: string
          id?: string
          region?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_transport_rates_user_id_fkey"
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
      jwt_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      send_review_email: {
        Args: {
          p_quote_id: string
          p_client_email: string
          p_client_name: string
        }
        Returns: undefined
      }
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
