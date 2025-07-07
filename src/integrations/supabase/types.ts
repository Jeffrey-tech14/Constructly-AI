export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          phone?: string | null
          quotes_used?: number
          tier?: string
          total_projects?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          addons: Json | null
          addons_cost: number
          client_email: string | null
          client_name: string
          created_at: string
          custom_specs: string | null
          id: string
          labor: Json | null
          labor_cost: number
          location: string
          materials: Json | null
          materials_cost: number
          project_type: string
          region: string
          status: string
          title: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          addons?: Json | null
          addons_cost?: number
          client_email?: string | null
          client_name: string
          created_at?: string
          custom_specs?: string | null
          id?: string
          labor?: Json | null
          labor_cost?: number
          location: string
          materials?: Json | null
          materials_cost?: number
          project_type: string
          region: string
          status?: string
          title: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          addons?: Json | null
          addons_cost?: number
          client_email?: string | null
          client_name?: string
          created_at?: string
          custom_specs?: string | null
          id?: string
          labor?: Json | null
          labor_cost?: number
          location?: string
          materials?: Json | null
          materials_cost?: number
          project_type?: string
          region?: string
          status?: string
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
