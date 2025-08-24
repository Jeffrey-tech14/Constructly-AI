export type UUID = string;

export type Unit =
  | "No"
  | "m"
  | "m²"
  | "m³"
  | "kg"
  | "bag"
  | "lot"
  | "pc"
  | "day"
  | "week"
  | "sum";

export interface BOQSubItem {
  id: string;
  description: string;
  unit: Unit;
  quantity: number;
  rate: number;
  total: number;
}

export interface BOQItem {
  id: string;
  description: string;
  unit: Unit;
  quantity: number;
  rate: number;
  total: number;
  is_custom?: boolean;
  subItems: BOQSubItem[];
}

export interface PrelimItem {
  id: string;
  code: string; // e.g., GP/1, PP/3
  title: string;
  description: string;
  amount: number;
}

export interface QuoteTotals {
  element_a_total: number;
  element_b_total: number;
  element_c_total: number;
  element_d_total: number;
  element_e_total: number;
  element_f_total: number;
  element_g_total: number;
  element_h_total: number;
  element_j_total: number;
  pc_and_provisional_total: number;
  general_prelim_total: number;
  particular_prelim_total: number;
  professional_fees: number;
  total_amount: number;
}

export interface QuoteModel extends QuoteTotals {
  id?: UUID;
  user_id: UUID;
  created_at?: string;
  updated_at?: string;
  title: string;
  client_name: string;
  client_email: string;
  location: string;
  region: string;
  project_type: string;
  house_type: string;
  floors: number;
  custom_specs: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "archived";
  contract_type: "full_contract" | "labor_only" | "" | null;
  show_profit_to_client: boolean;

  element_a: BOQItem[];
  element_b: BOQItem[];
  element_c: BOQItem[];
  element_d: BOQItem[];
  element_e: BOQItem[];
  element_f: BOQItem[];
  element_g: BOQItem[];
  element_h: BOQItem[];
  element_j: BOQItem[];
  pc_sums: BOQItem[];
  provisional_sums: BOQItem[];

  general_preliminaries: PrelimItem[];
  particular_preliminaries: PrelimItem[];
  site_visit_required?: boolean;
  defects_liability_months?: number;
  contract_conditions?: string;

  metadata: Record<string, any>;
}
