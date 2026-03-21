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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      additional_services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          unit?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string
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
          description: string | null
          id: string
          name: string
          rate_per_unit: number | null
          total_cost: number
          usage_quantity: number | null
          usage_unit: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          rate_per_unit?: number | null
          total_cost: number
          usage_quantity?: number | null
          usage_unit?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          rate_per_unit?: number | null
          total_cost?: number
          usage_quantity?: number | null
          usage_unit?: string
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
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          type: Json | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          type?: Json | null
          unit?: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          type?: Json | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
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
          total_projects: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
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
          total_projects?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
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
          total_projects?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: []
      }
      quote_payments: {
        Row: {
          amount_ksh: number
          completed_at: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          quote_id: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_ksh?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          quote_id: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_ksh?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          quote_id?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_payments_quote_id_fkey"
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
          bar_schedule: Json | null
          bbs_file_url: string | null
          boq_data: Json | null
          client_email: string | null
          client_name: string
          concrete_materials: Json | null
          concrete_mix_ratio: string | null
          concrete_rows: Json | null
          contingency_amount: number | null
          contract_type: string | null
          created_at: string
          custom_specs: string | null
          distance_km: number | null
          earthwork_items: Json | null
          earthwork_total: Json | null
          electrical_calculations: Json | null
          electrical_systems: Json | null
          equipment: Json | null
          equipment_costs: number | null
          finishes: Json | null
          finishes_calculations: Json | null
          flooring_screening_skirting: Json | null
          floors: number | null
          foundation_walling: Json | null
          foundationDetails: Json | null
          foundationWalls: Json | null
          hoop_iron: Json | null
          house_type: string | null
          id: string
          labor: Json | null
          labor_cost: number
          location: string
          masonry_materials: Json | null
          materialPrices: Json | null
          materials_cost: number
          milestone_date: string | null
          overhead_amount: number | null
          paintings_specifications: Json | null
          paintings_totals: Json | null
          payment_status: string | null
          percentages: Json | null
          permit_cost: number | null
          plan_file_url: string | null
          plaster_thickness: string | null
          plumbing_calculations: Json | null
          plumbing_systems: Json | null
          preliminaries: Json | null
          profit_amount: number | null
          progress_notes: string | null
          progress_percentage: number | null
          project_type: string
          qsSettings: Json | null
          rebar_calculation_method: string | null
          rebar_calculations: Json | null
          rebar_rows: Json | null
          region: string
          roof_structures: Json | null
          roofing_calculations: Json | null
          roofingInputs: Json | null
          services: Json | null
          status: string
          subcontractors: Json | null
          title: string
          total_amount: number
          total_area: string | null
          total_volume: number | null
          transport_costs: number | null
          unknown_contingency_amount: number | null
          updated_at: string
          user_id: string
          wallDimensions: Json | null
          wallProperties: Json | null
          wallSections: Json | null
          wardrobes_cabinets: Json | null
        }
        Insert: {
          additional_services_cost?: number | null
          addons?: Json | null
          addons_cost?: number
          bar_schedule?: Json | null
          bbs_file_url?: string | null
          boq_data?: Json | null
          client_email?: string | null
          client_name: string
          concrete_materials?: Json | null
          concrete_mix_ratio?: string | null
          concrete_rows?: Json | null
          contingency_amount?: number | null
          contract_type?: string | null
          created_at?: string
          custom_specs?: string | null
          distance_km?: number | null
          earthwork_items?: Json | null
          earthwork_total?: Json | null
          electrical_calculations?: Json | null
          electrical_systems?: Json | null
          equipment?: Json | null
          equipment_costs?: number | null
          finishes?: Json | null
          finishes_calculations?: Json | null
          flooring_screening_skirting?: Json | null
          floors?: number | null
          foundation_walling?: Json | null
          foundationDetails?: Json | null
          foundationWalls?: Json | null
          hoop_iron?: Json | null
          house_type?: string | null
          id: string
          labor?: Json | null
          labor_cost?: number
          location: string
          masonry_materials?: Json | null
          materialPrices?: Json | null
          materials_cost?: number
          milestone_date?: string | null
          overhead_amount?: number | null
          paintings_specifications?: Json | null
          paintings_totals?: Json | null
          payment_status?: string | null
          percentages?: Json | null
          permit_cost?: number | null
          plan_file_url?: string | null
          plaster_thickness?: string | null
          plumbing_calculations?: Json | null
          plumbing_systems?: Json | null
          preliminaries?: Json | null
          profit_amount?: number | null
          progress_notes?: string | null
          progress_percentage?: number | null
          project_type: string
          qsSettings?: Json | null
          rebar_calculation_method?: string | null
          rebar_calculations?: Json | null
          rebar_rows?: Json | null
          region: string
          roof_structures?: Json | null
          roofing_calculations?: Json | null
          roofingInputs?: Json | null
          services?: Json | null
          status?: string
          subcontractors?: Json | null
          title: string
          total_amount?: number
          total_area?: string | null
          total_volume?: number | null
          transport_costs?: number | null
          unknown_contingency_amount?: number | null
          updated_at?: string
          user_id: string
          wallDimensions?: Json | null
          wallProperties?: Json | null
          wallSections?: Json | null
          wardrobes_cabinets?: Json | null
        }
        Update: {
          additional_services_cost?: number | null
          addons?: Json | null
          addons_cost?: number
          bar_schedule?: Json | null
          bbs_file_url?: string | null
          boq_data?: Json | null
          client_email?: string | null
          client_name?: string
          concrete_materials?: Json | null
          concrete_mix_ratio?: string | null
          concrete_rows?: Json | null
          contingency_amount?: number | null
          contract_type?: string | null
          created_at?: string
          custom_specs?: string | null
          distance_km?: number | null
          earthwork_items?: Json | null
          earthwork_total?: Json | null
          electrical_calculations?: Json | null
          electrical_systems?: Json | null
          equipment?: Json | null
          equipment_costs?: number | null
          finishes?: Json | null
          finishes_calculations?: Json | null
          flooring_screening_skirting?: Json | null
          floors?: number | null
          foundation_walling?: Json | null
          foundationDetails?: Json | null
          foundationWalls?: Json | null
          hoop_iron?: Json | null
          house_type?: string | null
          id?: string
          labor?: Json | null
          labor_cost?: number
          location?: string
          masonry_materials?: Json | null
          materialPrices?: Json | null
          materials_cost?: number
          milestone_date?: string | null
          overhead_amount?: number | null
          paintings_specifications?: Json | null
          paintings_totals?: Json | null
          payment_status?: string | null
          percentages?: Json | null
          permit_cost?: number | null
          plan_file_url?: string | null
          plaster_thickness?: string | null
          plumbing_calculations?: Json | null
          plumbing_systems?: Json | null
          preliminaries?: Json | null
          profit_amount?: number | null
          progress_notes?: string | null
          progress_percentage?: number | null
          project_type?: string
          qsSettings?: Json | null
          rebar_calculation_method?: string | null
          rebar_calculations?: Json | null
          rebar_rows?: Json | null
          region?: string
          roof_structures?: Json | null
          roofing_calculations?: Json | null
          roofingInputs?: Json | null
          services?: Json | null
          status?: string
          subcontractors?: Json | null
          title?: string
          total_amount?: number
          total_area?: string | null
          total_volume?: number | null
          transport_costs?: number | null
          unknown_contingency_amount?: number | null
          updated_at?: string
          user_id?: string
          wallDimensions?: Json | null
          wallProperties?: Json | null
          wallSections?: Json | null
          wardrobes_cabinets?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quotes_contractor"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quotes_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      subcontractor_prices: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price: number
          unit: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string
        }
        Relationships: []
      }
      transport_rates: {
        Row: {
          base_cost: number
          cost_per_km: number
          created_at: string
          id: string
          region: string
          updated_at: string
        }
        Insert: {
          base_cost?: number
          cost_per_km: number
          created_at?: string
          id?: string
          region: string
          updated_at?: string
        }
        Update: {
          base_cost?: number
          cost_per_km?: number
          created_at?: string
          id?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_equipment: {
        Row: {
          created_at: string | null
          daily_rate: number
          description: string | null
          equipment_name: string
          hourly_rate: number
          id: string
          updated_at: string | null
          usage_unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          equipment_name: string
          hourly_rate?: number
          id?: string
          updated_at?: string | null
          usage_unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          equipment_name?: string
          hourly_rate?: number
          id?: string
          updated_at?: string | null
          usage_unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_equipment_overrides: {
        Row: {
          created_at: string | null
          custom_rate: number
          equipment_id: string | null
          id: string
          region: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_rate: number
          equipment_id?: string | null
          id?: string
          region: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_rate?: number
          equipment_id?: string | null
          id?: string
          region?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_equipment_overrides_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_equipment_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipment_rates: {
        Row: {
          created_at: string
          equipment_type_id: string
          id: string
          rate_per_unit: number | null
          total_cost: number | null
          updated_at: string
          usage_quantity: number | null
          usage_unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment_type_id: string
          id?: string
          rate_per_unit?: number | null
          total_cost?: number | null
          updated_at?: string
          usage_quantity?: number | null
          usage_unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          equipment_type_id?: string
          id?: string
          rate_per_unit?: number | null
          total_cost?: number | null
          updated_at?: string
          usage_quantity?: number | null
          usage_unit?: string | null
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
      user_labor_overrides: {
        Row: {
          created_at: string | null
          custom_rate: number
          id: string
          labor_type_id: string | null
          region: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_rate: number
          id?: string
          labor_type_id?: string | null
          region: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_rate?: number
          id?: string
          labor_type_id?: string | null
          region?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_labor_overrides_labor_type_id_fkey"
            columns: ["labor_type_id"]
            isOneToOne: false
            referencedRelation: "labor_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_labor_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_material_overrides: {
        Row: {
          custom_price: number
          id: string
          material_id: string
          region: string
          updated_at: string
          user_id: string
        }
        Insert: {
          custom_price: number
          id?: string
          material_id: string
          region: string
          updated_at?: string
          user_id: string
        }
        Update: {
          custom_price?: number
          id?: string
          material_id?: string
          region?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_material_overrides_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_base_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_material_prices: {
        Row: {
          id: string
          material_id: string
          name: string | null
          price: number
          region: string
          type: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          material_id: string
          name?: string | null
          price: number
          region: string
          type?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          material_id?: string
          name?: string | null
          price?: number
          region?: string
          type?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_material_prices_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material_base_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_materials: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          material_name: string
          price_per_unit: number
          type: Json | null
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          material_name: string
          price_per_unit?: number
          type?: Json | null
          unit?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          material_name?: string
          price_per_unit?: number
          type?: Json | null
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_service_overrides: {
        Row: {
          created_at: string | null
          id: string
          price: number
          region: string
          service_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          region: string
          service_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          region?: string
          service_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_service_overrides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "additional_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_service_overrides_user_id_fkey"
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
          id: number
          price: number | null
          service_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          price?: number | null
          service_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          price?: number | null
          service_id?: string | null
          user_id?: string | null
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
            foreignKeyName: "user_service_rates_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subcontractor_overrides: {
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
            foreignKeyName: "user_subcontractor_overrides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "subcontractor_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subcontractor_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subcontractor_rates: {
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
            foreignKeyName: "user_service_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subcontractor_rates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "subcontractor_prices"
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
      bytea_to_text: { Args: { data: string }; Returns: string }
      check_expired_subscriptions_cron: { Args: never; Returns: undefined }
      check_subscription_expiry: { Args: never; Returns: undefined }
      create_contractor_price_table_if_not_exists: {
        Args: never
        Returns: undefined
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      jwt_claims: { Args: never; Returns: Json }
      send_review_email: {
        Args: {
          p_client_email: string
          p_client_name: string
          p_quote_id: string
        }
        Returns: undefined
      }
      text_to_bytea: { Args: { data: string }; Returns: string }
      update_user_material_price:
        | {
            Args: {
              p_custom_price: number
              p_material_id: string
              p_user_id: string
            }
            Returns: undefined
          }
        | {
            Args: { m_id: string; price: number; reg: string; u_id: string }
            Returns: {
              custom_price: number
              id: string
              material_id: string
              region: string
              updated_at: string
              user_id: string
            }[]
          }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
