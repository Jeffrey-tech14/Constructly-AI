import { ElementType, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { BOQSection, PrelimItem, PrelimSection } from "@/types/boq";
import { useToast } from "@/hooks/use-toast";
import {
  useQuoteCalculations,
  CalculationResult,
  QuoteCalculation,
  Percentage,
} from "@/hooks/useQuoteCalculations";
import { RoomType, useUserSettings } from "@/hooks/useUserSettings";
import { useQuotes } from "@/hooks/useQuotes";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  FileText,
  Wrench,
  Calculator,
  Building,
  CreditCard,
  Shell,
  Crown,
  Shield,
  Star,
  BuildingIcon,
  FileSpreadsheet,
  Zap,
  Trash,
  House,
  CopyrightIcon,
  UploadCloud,
  Target,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  ClipboardList,
  Truck,
  HardHat,
  Eye,
} from "lucide-react";
import { usePlan } from "../contexts/PlanContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ElementTypes } from "@/hooks/useRebarCalculator";
import RebarCalculatorForm from "./RebarCalculationForm";
import MasonryCalculatorForm from "./MasonryCalculatorForm";
import useMasonryCalculator from "@/hooks/useMasonryCalculator";
import ConcreteCalculatorForm from "./ConcreteCalculatorForm";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import BOQBuilder from "./BOQBuilder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import PreliminariesBuilder from "./PreliminariesBuilder";
// RISA Color Palette
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

interface Room {
  room_name: string;
  length: string;
  width: string;
  height: string;
  doors: any[];
  windows: any[];
  blockType: string;
  thickness: string;
  customBlock: {
    price: string;
    height: string;
    length: string;
    thickness: string;
  };
  roomArea: number;
  plasterArea: number;
  openings: number;
  netArea: number;
  blocks: number;
  mortar: number;
  plaster: string;
  blockCost: number;
  mortarCost: number;
  plasterCost: number;
  openingsCost: number;
  cementBags: number;
  cementCost: number;
  sandVolume: number;
  sandCost: number;
  stoneVolume: number;
  totalCost: number;
}

const EnhancedQuoteBuilder = ({ quote }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    equipmentRates,
    services,
    calculateQuote,
    loading: calculationLoading,
  } = useQuoteCalculations();
  const {
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    updateMaterialPrice,
    getEffectiveMaterialPrice,
    getEffectiveMaterialPriceSingle,
    updateMaterialPriceSingle,
  } = useDynamicPricing();
  const { extractedPlan } = usePlan();
  const { loading: settingsLoading } = useUserSettings();
  const { createQuote, updateQuote } = useQuotes();
  const { roomTypes } = useUserSettings();
  const { profile, user } = useAuth();
  const [direction, setDirection] = useState<"left" | "right">("right");
  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -300 : 300,
      opacity: 0,
    }),
  };
  const regions = [
    { value: "Nairobi", label: "Nairobi" },
    { value: "Mombasa", label: "Mombasa" },
    { value: "Kisumu", label: "Kisumu" },
    { value: "Nakuru", label: "Nakuru" },
    { value: "Eldoret", label: "Eldoret" },
    { value: "Thika", label: "Thika" },
    { value: "Machakos", label: "Machakos" },
  ];
  const projects = [
    { value: "construction", label: "Construction" },
    { value: "renovation", label: "Renovation" },
  ];
  const houseTypes = [
    { value: "Bungalow", label: "Bungalow" },
    { value: "Maisonette", label: "Maisonette" },
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Mansion", label: "Mansion" },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [subContractors, setServices] = useState<any[]>([]);
  const location = useLocation();
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [boqData, setBoqData] = useState<BOQSection[]>([]);
  const [preliminaries, setPreliminaries] = useState<PrelimSection[]>([]);
  
  const fetchLimit = async () => {
    if (!profile?.tier) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tiers")
      .select("quotes_limit")
      .eq("name", profile.tier)
      .single();
    if (error) {
      console.error("Error fetching tier limit:", error);
      setLimit(0);
    } else {
      setLimit(data?.quotes_limit || 0);
    }
    setLoading(false);
  };

  const fetchRates = async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from("subcontractor_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_subcontractor_rates")
      .select("service_id, price")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = baseServices.map((service) => {
      const userRate = overrides?.find((o) => o.service_id === service.id);
      const rate = userRate
        ? Number(userRate.price)
        : service.price != null
        ? Number(service.price)
        : 0;
      return {
        ...service,
        price: rate,
        unit: service.unit ?? "unit",
        source: userRate ? "user" : service.price != null ? "base" : "none",
      };
    });
    setServices(merged);
  };

  const [quoteData, setQuoteData] = useState<QuoteCalculation>({
    rooms: [] as Room[],
    client_name: "",
    client_email: "",
    title: "",
    location: "",
    id: uuidv4(),
    subcontractors: [],
    concrete_rows: [],
    rebar_rows: [],
    user_id: "",
    floors: 1,
    custom_specs: "",
    status: "draft",
    mortar_ratio: "1:6",
    concrete_mix_ratio: "1:2:4",
    plaster_thickness: 0.012,
    include_wastage: true,
    equipment: [],
    services: [],
    percentages: [],
    distance_km: 0,
    contract_type: "full_contract",
    region: "",
    show_profit_to_client: false,
    equipment_costs: 0,
    transport_costs: 0,
    additional_services_cost: 0,
    house_type: "",
    project_type: "",
    materials_cost: 0,
    masonry_materials: [],
    concrete_materials: [],
    rebar_calculations: [],
    total_wall_area: 0,
    total_concrete_volume: 0,
    total_formwork_area: 0,
    total_rebar_weight: 0,
    total_plaster_volume: 0,
    boqData: [],
    preliminaries: [],
    labor_percentages: 0,
    overhead_percentages: 0,
    profit_percentages: 0,
    contingency_percentages: 0,
    permit_cost: 0,
  });

  useEffect(() => {
    if (quote) {
      setQuoteData((prev) => ({
        ...prev,
        ...quote,
        rooms: quote.rooms || [],
        selected_equipment: quote.selected_equipment || [],
        selected_services: quote.selected_services || [],
      }));
    }
  }, [quote]);

  useEffect(() => {
    fetchRates();
    fetchLimit();
  }, [user, location.key]);

  useEffect(() => {
    if (extractedPlan && extractedPlan.rooms?.length) {
      setQuoteData((prev) => ({
        ...prev,
        floors: extractedPlan.floors || prev.floors,
        rooms: extractedPlan.rooms.map((room) => ({
          room_name: room.room_name,
          length: room.length,
          width: room.width,
          height: room.height || "2.7",
          doors: room.doors || [],
          windows: room.windows || [],
          blockType: room.blockType || "Standard Block (400×200×200mm)",
          thickness: room.thickness || "0.2",
          customBlock: room.customBlock || {
            price: "",
            height: "",
            length: "",
            thickness: "",
          },
          roomArea: 0,
          plasterArea: 0,
          openings: 0,
          netArea: 0,
          blocks: 0,
          mortar: 0,
          plaster: room.plaster || "Both Sides",
          blockCost: 0,
          mortarCost: 0,
          plasterCost: 0,
          openingsCost: 0,
          cementBags: 0,
          cementCost: 0,
          sandVolume: 0,
          sandCost: 0,
          stoneVolume: 0,
          totalCost: 0,
        })),
      }));
    }
  }, [extractedPlan]);

  const steps = [
    { id: 1, name: "Project Details", icon: <FileText className="w-5 h-5" /> },
    { id: 2, name: "Concrete and Rebar", icon: <Building className="w-5 h-5" /> },
    { id: 3, name: "House and Materials", icon: <House className="w-5 h-5" /> },
    { id: 4, name: "Equipment Usage", icon: <Wrench className="w-5 h-5" /> },
    { id: 5, name: "Services and Extras", icon: <Plus className="w-5 h-5" /> },
    { id: 6, name: "Subcontractor Rates", icon: <Zap className="w-5 h-5" /> },
    { id: 7, name: "BOQ Builder", icon: <FileText className="w-5 h-5" /> },
    { id: 8, name: "Preliminaries and Legal", icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 9, name: "Review & Export", icon: <Calculator className="w-5 h-5" /> },
  ];

  const updatePercentageField = (field: keyof Percentage, value: number) => {
    setQuoteData((prev) => ({
      ...prev,
      ...(field === "labour" && { labor_percentages: value }),
      ...(field === "overhead" && { overhead_percentages: value }),
      ...(field === "profit" && { profit_percentages: value }),
      ...(field === "contingency" && { contingency_percentages: value }),
      percentages:
        prev.percentages.length > 0
          ? prev.percentages.map((p, i) =>
              i === 0 ? { ...p, [field]: value } : p
            )
          : [
              {
                labour: 0,
                overhead: 0,
                profit: 0,
                contingency: 0,
                [field]: value,
              },
            ],
    }));
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Input invalid",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (currentStep < steps.length) {
      setDirection("right");
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === 9) {
        handleCalculate();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection("left");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculate = async () => {
    try {
      const result = await calculateQuote({
        user_id: quoteData.user_id,
        id: quoteData.id,
        rooms: quoteData.rooms,
        title: quoteData.title,
        client_name: quoteData.client_name,
        client_email: quoteData.client_email,
        location: quoteData.location,
        status: quoteData.status,
        custom_specs: quoteData.custom_specs,
        floors: quoteData.floors,
        mortar_ratio: quoteData.mortar_ratio,
        concrete_mix_ratio: quoteData.concrete_mix_ratio,
        subcontractors: quoteData.subcontractors,
        percentages: quoteData.percentages,
        boqData: boqData,
        plaster_thickness:
          parseFloat(quoteData.plaster_thickness.toString()) || 0.012,
        include_wastage: quoteData.include_wastage,
        equipment: quoteData.equipment,
        services: quoteData.services,
        distance_km: parseFloat(quoteData.distance_km.toString()) || 0,
        contract_type: quoteData.contract_type,
        region: quoteData.region,
        concrete_rows: quoteData.concrete_rows,
        rebar_rows: quoteData.rebar_rows,
        materials_cost: Math.round(quoteData.materials_cost),
        rebar_calculations: quoteData.rebar_calculations,
        masonry_materials: quoteData.masonry_materials,
        concrete_materials: quoteData.concrete_materials,
        total_concrete_volume: Math.round(quoteData.total_concrete_volume),
        total_formwork_area: Math.round(quoteData.total_formwork_area),
        total_plaster_volume: Math.round(quoteData.total_plaster_volume),
        total_rebar_weight: Math.round(quoteData.total_rebar_weight),
        total_wall_area: Math.round(quoteData.total_rebar_weight),
        project_type: quoteData.project_type,
        equipment_costs: quoteData.equipment_costs,
        transport_costs: quoteData.transport_costs,
        additional_services_cost: quoteData.additional_services_cost,
        show_profit_to_client: quoteData.show_profit_to_client,
        house_type: quoteData.house_type,
        preliminaries: preliminaries,
        labor_percentages:
          parseFloat(quoteData.percentages[0].labour.toString()) || 0,
        overhead_percentages:
          parseFloat(quoteData.percentages[0].overhead.toString()) || 0,
        profit_percentages:
          parseFloat(quoteData.percentages[0].profit.toString()) || 0,
        contingency_percentages:
          parseFloat(quoteData.percentages[0].contingency.toString()) || 0,
        permit_cost: parseFloat(quoteData.permit_cost.toString()) || 0,
      });
      setCalculation(result);
      toast({
        title: "Calculation Complete",
        description: "Quote has been calculated successfully",
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Failed to calculate quote -  " + error,
        variant: "destructive",
      });
    }
  };

  const handleSaveQuote = async () => {
    if (!calculation) {
      console.error("calculation is empty " + calculation);
      return;
    }
    if (quoteData.id) {
      try {
        await updateQuote(quoteData.id, {
          id: quoteData.id,
          title: quoteData.title,
          client_name: quoteData.client_name,
          client_email: quoteData.client_email || null,
          location: quoteData.location,
          rooms: quoteData.rooms,
          region: quoteData.region,
          project_type: quoteData.project_type,
          custom_specs: quoteData.custom_specs || null,
          status: quoteData.status,
          preliminaries: preliminaries,
          house_type: quoteData.house_type,
          transport_costs: calculation.transport_cost,
          distance_km: calculation.distance_km,
          concrete_rows: quoteData.concrete_rows,
          materials_cost: Math.round(calculation.materials_cost),
          rebar_rows: quoteData.rebar_rows,
          boq_data: boqData,
          rebar_calculations: quoteData.rebar_calculations,
          labor_cost: Math.round(calculation.labor_cost),
          additional_services_cost: Math.round(
            calculation.selected_services_cost
          ),
          total_amount: Math.round(calculation.total_amount),
          masonry_materials: quoteData.masonry_materials,
          concrete_materials: quoteData.concrete_materials,
          labor: calculation.labor,
          floors: quoteData.floors,
          equipment_costs: Math.round(calculation.equipment_cost),
          services: calculation.services,
          equipment: calculation.equipment,
          overhead_amount: calculation.overhead_amount,
          contingency_amount: calculation.contingency_amount,
          permit_cost: calculation.permit_cost,
          concrete_mix_ratio: quoteData.concrete_mix_ratio,
          plaster_thickness: quoteData.plaster_thickness,
          profit_amount: calculation.profit_amount,
          subcontractors: quoteData.subcontractors,
          percentages: calculation.percentages,
          materialPrices: calculation.materialPrices,
        });
        toast({
          title: "Quote Updated",
          description: "Quote has been updated successfully",
        });
        navigate("/dashboard");
      } catch (error) {
        console.error("Error updating quote:", error);
        toast({
          title: "Update Error",
          description: "Failed to update quote",
          variant: "destructive",
        });
      }
    } else {
      try {
        await createQuote({
          title: quoteData.title,
          id: quoteData.id,
          client_name: quoteData.client_name,
          client_email: quoteData.client_email || null,
          location: quoteData.location,
          rooms: quoteData.rooms,
          region: quoteData.region,
          project_type: quoteData.project_type,
          custom_specs: quoteData.custom_specs || null,
          status: "draft",
          house_type: quoteData.house_type,
          transport_costs: calculation.transport_cost,
          boq_data: boqData,
          preliminaries: preliminaries,
          distance_km: calculation.distance_km,
          materials_cost: Math.round(calculation.materials_cost),
          concrete_rows: quoteData.concrete_rows,
          rebar_rows: quoteData.rebar_rows,
          labor_cost: Math.round(calculation.labor_cost),
          additional_services_cost: Math.round(
            calculation.selected_services_cost
          ),
          equipment_costs: Math.round(calculation.equipment_cost),
          total_amount: Math.round(calculation.total_amount),
          floors: quoteData.floors,
          concrete_materials: quoteData.concrete_materials,
          labor: calculation.labor,
          services: calculation.services,
          equipment: calculation.equipment,
          masonry_materials: quoteData.masonry_materials,
          rebar_calculations: quoteData.rebar_calculations,
          overhead_amount: calculation.overhead_amount,
          contingency_amount: calculation.contingency_amount,
          permit_cost: calculation.permit_cost,
          concrete_mix_ratio: quoteData.concrete_mix_ratio,
          plaster_thickness: quoteData.plaster_thickness,
          profit_amount: calculation.profit_amount,
          subcontractors: calculation.subcontractors,
          percentages: calculation.percentages,
          materialPrices: calculation.materialPrices,
        });
        toast({
          title: "Quote Saved",
          description: "Quote has been saved successfully",
        });
        navigate("/quotes/all");
      } catch (error) {
        console.error("Error saving quote:", error);
        toast({
          title: "Save Error",
          description: "Failed to save quote",
          variant: "destructive",
        });
      }
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          !!quoteData.title &&
          !!quoteData.client_name &&
          !!quoteData.client_email &&
          !!quoteData.location &&
          !!quoteData.project_type &&
          !!quoteData.region &&
          !!quoteData.contract_type
        );
      case 2:
        return !!quoteData.house_type;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                    <Target className="w-4 h-4" style={{ color: RISA_BLUE }} />
                    Project Name *
                  </Label>
                  <Input
                    id="projectName"
                    required
                    placeholder="Enter project name"
                    value={quoteData.title}
                    onChange={(e) =>
                      setQuoteData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="clientName" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                      <Users className="w-4 h-4" style={{ color: RISA_BLUE }} />
                      Client Name *
                    </Label>
                    <Input
                      id="clientName"
                      required
                      placeholder="Enter client name"
                      value={quoteData.client_name}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          client_name: e.target.value,
                        }))
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                      <Users className="w-4 h-4" style={{ color: RISA_BLUE }} />
                      Client Email *
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      placeholder="client@example.com"
                      value={quoteData.client_email}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          client_email: e.target.value,
                        }))
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="projectType" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                    <Building className="w-4 h-4" style={{ color: RISA_BLUE }} />
                    Project Type *
                  </Label>
                  <Select
                    value={quoteData.project_type}
                    required
                    onValueChange={(value) =>
                      setQuoteData((prev) => ({ ...prev, project_type: value }))
                    }
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                    <MapPin className="w-4 h-4" style={{ color: RISA_BLUE }} />
                    Project Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter specific location or address"
                    required
                    value={quoteData.location}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="region" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                    <MapPin className="w-4 h-4" style={{ color: RISA_BLUE }} />
                    Region *
                  </Label>
                  <Select
                    value={quoteData.region}
                    required
                    onValueChange={(value) =>
                      setQuoteData((prev) => ({ ...prev, region: value }))
                    }
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select region for pricing" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                    <ClipboardList className="w-4 h-4" style={{ color: RISA_BLUE }} />
                    Contract Type *
                  </Label>
                  <Select
                    value={quoteData.contract_type || ""}
                    required
                    onValueChange={(value: "full_contract" | "labor_only") =>
                      setQuoteData((prev) => ({ ...prev, contract_type: value }))
                    }
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_contract">
                        Full Contract (Materials + Labor)
                      </SelectItem>
                      <SelectItem value="labor_only">
                        Labor Only (Client Provides Materials)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {quoteData.contract_type === "full_contract"
                      ? "You provide all materials and labor"
                      : "Client provides materials, you provide labor only"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="distanceKm" className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                    <Truck className="w-4 h-4" style={{ color: RISA_BLUE }} />
                    Distance from site location (KM)
                  </Label>
                  <Input
                    id="distanceKm"
                    type="number"
                    min="0"
                    required
                    placeholder="Distance in kilometers"
                    value={quoteData.distance_km}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        distance_km: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Used to calculate transport costs
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Plan Button at Bottom */}
            {profile.tier !== "Free" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <CardContent className="p-6 text-center">
                    <UploadCloud className="w-12 h-12 mx-auto mb-4" style={{ color: RISA_BLUE }} />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Upload Construction Plans
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Upload your construction plans for automatic room detection and measurements
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={() =>
                          navigate("/upload/plan", { state: { quoteData } })
                        }
                        className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: RISA_BLUE,
                          color: RISA_WHITE,
                          padding: "0.75rem 2rem",
                        }}
                      >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Upload Plan
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Building className="w-5 h-5" style={{ color: RISA_BLUE }} />
                    House Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="houseType" className="text-gray-900 dark:text-white">House Type *</Label>
                    <Select
                      required
                      value={quoteData.house_type}
                      onValueChange={(value) =>
                        setQuoteData((prev) => ({ ...prev, house_type: value }))
                      }
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select house type" />
                      </SelectTrigger>
                      <SelectContent>
                        {houseTypes.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="floors" className="text-gray-900 dark:text-white">Floors *</Label>
                    <Input
                      id="floors"
                      placeholder="Number of floors"
                      type="number"
                      min="0"
                      value={quoteData.floors}
                      required
                      onChange={(e) => {
                        setQuoteData((prev) => ({
                          ...prev,
                          floors: parseFloat(e.target.value),
                        }));
                      }}
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <DollarSign className="w-5 h-5" style={{ color: RISA_BLUE }} />
                    Financial Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="laborPercentage" className="text-xs text-gray-600 dark:text-gray-300">Labor %</Label>
                      <Input
                        id="laborPercentage"
                        type="number"
                        min="0"
                        required
                        placeholder="10"
                        value={quoteData.percentages[0]?.labour ?? ""}
                        onChange={(e) =>
                          updatePercentageField(
                            "labour",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="overheadPercentage" className="text-xs text-gray-600 dark:text-gray-300">Overhead %</Label>
                      <Input
                        id="overheadPercentage"
                        type="number"
                        min="0"
                        required
                        placeholder="10"
                        value={quoteData.percentages[0]?.overhead ?? ""}
                        onChange={(e) =>
                          updatePercentageField(
                            "overhead",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profitPercentage" className="text-xs text-gray-600 dark:text-gray-300">Profit %</Label>
                      <Input
                        id="profitPercentage"
                        type="number"
                        min="0"
                        required
                        placeholder="5"
                        value={quoteData.percentages[0]?.profit ?? ""}
                        onChange={(e) =>
                          updatePercentageField(
                            "profit",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contingencyPercentage" className="text-xs text-gray-600 dark:text-gray-300">Contingency %</Label>
                      <Input
                        id="contingencyPercentage"
                        type="number"
                        min="0"
                        required
                        placeholder="5"
                        value={quoteData.percentages[0]?.contingency ?? ""}
                        onChange={(e) =>
                          updatePercentageField(
                            "contingency",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="permitCost" className="text-gray-900 dark:text-white">Permit Cost (KSh)</Label>
                    <Input
                      id="permitCost"
                      type="number"
                      min="0"
                      required
                      placeholder="50000"
                      value={quoteData.permit_cost}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          permit_cost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <ConcreteCalculatorForm
              quote={quoteData}
              setQuote={setQuoteData}
              materialBasePrices={materialBasePrices}
              userMaterialPrices={userMaterialPrices}
              getEffectiveMaterialPrice={getEffectiveMaterialPrice}
            />
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <HardHat className="w-5 h-5" style={{ color: RISA_BLUE }} />
                  Rebar Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RebarCalculatorForm
                  quote={quoteData}
                  setQuote={setQuoteData}
                  onExport={(json) => console.log("Exported JSON:", json)}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <House className="w-5 h-5" style={{ color: RISA_BLUE }} />
                  Room Details *
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Configure room specifications and material requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MasonryCalculatorForm
                  quote={quoteData}
                  setQuote={setQuoteData}
                  materialBasePrices={materialBasePrices}
                  userMaterialPrices={userMaterialPrices}
                  regionalMultipliers={regionalMultipliers}
                  userRegion={profile.location}
                  getEffectiveMaterialPrice={getEffectiveMaterialPrice}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Wrench className="w-5 h-5" style={{ color: RISA_BLUE }} />
                Select Required Equipment
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {equipmentRates
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((equipment) => {
                    const isChecked = quoteData.equipment.some(
                      (eq) => eq.equipment_type_id === equipment.id
                    );
                    const equipmentItem = quoteData.equipment.find(
                      (eq) => eq.equipment_type_id === equipment.id
                    );
                    return (
                      <Card key={equipment.id} className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="items-center justify-between">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setQuoteData((prev) => ({
                                      ...prev,
                                      equipment: [
                                        ...prev.equipment,
                                        {
                                          equipment_type_id: equipment.id,
                                          name: equipment.name,
                                          desc: equipment.description,
                                          usage_quantity: 1,
                                          usage_unit: "day",
                                          rate_per_unit:
                                            equipment.rate_per_unit || 0,
                                          total_cost:
                                            equipment.rate_per_unit || 0,
                                        },
                                      ],
                                    }));
                                  } else {
                                    setQuoteData((prev) => ({
                                      ...prev,
                                      equipment: prev.equipment.filter(
                                        (eq) =>
                                          eq.equipment_type_id !== equipment.id
                                      ),
                                    }));
                                  }
                                }}
                              />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {equipment.name}
                                </h4>
                                {equipment.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {equipment.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isChecked && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor={`quantity-${equipment.id}`} className="text-gray-900 dark:text-white">
                                      Quantity
                                    </Label>
                                    <Input
                                      id={`quantity-${equipment.id}`}
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={equipmentItem?.usage_quantity || 1}
                                      onChange={(e) => {
                                        const quantity =
                                          parseFloat(e.target.value) || 0;
                                        const rate =
                                          equipmentItem?.rate_per_unit || 0;
                                        setQuoteData((prev) => ({
                                          ...prev,
                                          equipment: prev.equipment.map((eq) =>
                                            eq.equipment_type_id ===
                                            equipment.id
                                              ? {
                                                  ...eq,
                                                  usage_quantity: quantity,
                                                  total_cost: quantity * rate,
                                                }
                                              : eq
                                          ),
                                        }));
                                      }}
                                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`unit-${equipment.id}`} className="text-gray-900 dark:text-white">
                                      Unit
                                    </Label>
                                    <div id={`unit-${equipment.id}`}>
                                      <Select
                                        value={
                                          equipmentItem?.usage_unit || "day"
                                        }
                                        onValueChange={(value) => {
                                          setQuoteData((prev) => ({
                                            ...prev,
                                            equipment: prev.equipment.map(
                                              (eq) =>
                                                eq.equipment_type_id ===
                                                equipment.id
                                                  ? {
                                                      ...eq,
                                                      usage_unit: value,
                                                    }
                                                  : eq
                                            ),
                                          }));
                                        }}
                                      >
                                        <SelectTrigger className="h-10 w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                          <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="hour">
                                            Hour
                                          </SelectItem>
                                          <SelectItem value="day">
                                            Day
                                          </SelectItem>
                                          <SelectItem value="week">
                                            Week
                                          </SelectItem>
                                          <SelectItem value="month">
                                            Month
                                          </SelectItem>
                                          <SelectItem value="unit">
                                            Unit
                                          </SelectItem>
                                          <SelectItem value="trip">
                                            Trip
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`rate-${equipment.id}`} className="text-gray-900 dark:text-white">
                                    Rate per{" "}
                                    {equipmentItem?.usage_unit || "unit"}
                                  </Label>
                                  <Input
                                    id={`rate-${equipment.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={equipmentItem?.rate_per_unit || 0}
                                    onChange={(e) => {
                                      const rate =
                                        parseFloat(e.target.value) || 0;
                                      const quantity =
                                        equipmentItem?.usage_quantity || 1;
                                      setQuoteData((prev) => ({
                                        ...prev,
                                        equipment: prev.equipment.map((eq) =>
                                          eq.equipment_type_id === equipment.id
                                            ? {
                                                ...eq,
                                                rate_per_unit: rate,
                                                total_cost: quantity * rate,
                                              }
                                            : eq
                                        ),
                                      }));
                                    }}
                                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`total-${equipment.id}`} className="text-gray-900 dark:text-white">
                                    Total Cost
                                  </Label>
                                  <Input
                                    id={`total-${equipment.id}`}
                                    type="text"
                                    readOnly
                                    value={`KES ${(
                                      equipmentItem?.total_cost || 0
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}`}
                                    className="bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white"
                                  />
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {equipmentItem?.usage_quantity || 0}{" "}
                                    {equipmentItem?.usage_unit || "unit"} × KES
                                    {(
                                      equipmentItem?.rate_per_unit || 0
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                    /{equipmentItem?.usage_unit || "unit"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                {quoteData.equipment
                  .filter(
                    (eq) =>
                      !equipmentRates.some((e) => e.id === eq.equipment_type_id)
                  )
                  .map((eq) => {
                    const totalCost =
                      (eq.usage_quantity || 0) * (eq.rate_per_unit || 0);
                    return (
                      <Card key={eq.equipment_type_id} className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <Label
                                htmlFor={`name-${eq.equipment_type_id}`}
                                className="whitespace-nowrap text-gray-900 dark:text-white"
                              >
                                Equipment Name
                              </Label>
                              <Input
                                id={`name-${eq.equipment_type_id}`}
                                type="text"
                                value={eq.name}
                                onChange={(e) =>
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    equipment: prev.equipment.map((item) =>
                                      item.equipment_type_id ===
                                      eq.equipment_type_id
                                        ? { ...item, name: e.target.value }
                                        : item
                                    ),
                                  }))
                                }
                                placeholder="e.g., Specialized Crane"
                                className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                setQuoteData((prev) => ({
                                  ...prev,
                                  equipment: prev.equipment.filter(
                                    (item) =>
                                      item.equipment_type_id !==
                                      eq.equipment_type_id
                                  ),
                                }))
                              }
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label
                                htmlFor={`custom-quantity-${eq.equipment_type_id}`}
                                className="text-gray-900 dark:text-white"
                              >
                                Quantity
                              </Label>
                              <Input
                                id={`custom-quantity-${eq.equipment_type_id}`}
                                type="number"
                                min="0"
                                step="0.1"
                                value={eq.usage_quantity || 1}
                                onChange={(e) => {
                                  const quantity =
                                    parseFloat(e.target.value) || 0;
                                  const rate = eq.rate_per_unit || 0;
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    equipment: prev.equipment.map((item) =>
                                      item.equipment_type_id ===
                                      eq.equipment_type_id
                                        ? {
                                            ...item,
                                            usage_quantity: quantity,
                                            total_cost: quantity * rate,
                                          }
                                        : item
                                    ),
                                  }));
                                }}
                                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`custom-unit-${eq.equipment_type_id}`}
                                className="text-gray-900 dark:text-white"
                              >
                                Unit
                              </Label>
                              <select
                                id={`custom-unit-${eq.equipment_type_id}`}
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={eq.usage_unit || "day"}
                                onChange={(e) => {
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    equipment: prev.equipment.map((item) =>
                                      item.equipment_type_id ===
                                      eq.equipment_type_id
                                        ? {
                                            ...item,
                                            usage_unit: e.target.value,
                                          }
                                        : item
                                    ),
                                  }));
                                }}
                              >
                                <option value="hour">Hour</option>
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="unit">Unit</option>
                                <option value="trip">Trip</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor={`custom-rate-${eq.equipment_type_id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Rate per {eq.usage_unit || "unit"}
                            </Label>
                            <Input
                              id={`custom-rate-${eq.equipment_type_id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={eq.rate_per_unit || 0}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                const quantity = eq.usage_quantity || 1;
                                setQuoteData((prev) => ({
                                  ...prev,
                                  equipment: prev.equipment.map((item) =>
                                    item.equipment_type_id ===
                                    eq.equipment_type_id
                                      ? {
                                          ...item,
                                          rate_per_unit: rate,
                                          total_cost: quantity * rate,
                                        }
                                      : item
                                  ),
                                }));
                              }}
                              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`custom-total-${eq.equipment_type_id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Total Cost
                            </Label>
                            <Input
                              id={`custom-total-${eq.equipment_type_id}`}
                              type="text"
                              readOnly
                              value={`KES ${totalCost.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                              className="bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {eq.usage_quantity || 0} {eq.usage_unit || "unit"}{" "}
                              × KES
                              {(eq.rate_per_unit || 0).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                              /{eq.usage_unit || "unit"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
                  <Button
                    onClick={() => {
                      const customId = uuidv4();
                      setQuoteData((prev) => ({
                        ...prev,
                        equipment: [
                          ...prev.equipment,
                          {
                            equipment_type_id: customId,
                            name: "",
                            usage_quantity: 1,
                            usage_unit: "day",
                            rate_per_unit: 0,
                            total_cost: 0,
                          },
                        ],
                      }));
                    }}
                    className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: RISA_BLUE,
                      color: RISA_WHITE,
                      padding: "0.75rem 2rem",
                    }}
                  >
                    + Add Custom Equipment
                  </Button>
                </Card>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Plus className="w-5 h-5" style={{ color: RISA_BLUE }} />
                Additional Services
              </h3>
              <div className="space-y-4 grid w-full md:grid-cols-2">
                {services
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((service) => {
                    const checked = quoteData.services.some(
                      (s) => s.id === service.id
                    );
                    return (
                      <Card key={service.id} className="p-4 m-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    services: [...prev.services, service],
                                  }));
                                } else {
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    services: prev.services.filter(
                                      (s) => s.id !== service.id
                                    ),
                                  }));
                                }
                              }}
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                              {service.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="text-black bg-blue-100 dark:bg-blue-900/20" variant="secondary">
                              KSh {service.price.toLocaleString()}
                            </Badge>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {service.category}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                {quoteData.services
                  .filter((s) => !services.some((srv) => srv.id === s.id))
                  .map((service) => (
                    <Card key={service.id} className="p-4 m-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-2 items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={true}
                            onCheckedChange={() =>
                              setQuoteData((prev) => ({
                                ...prev,
                                services: prev.services.filter(
                                  (s) => s.id !== service.id
                                ),
                              }))
                            }
                          />
                          <div className="space-y-2">
                            <Input
                              type="text"
                              value={service.name}
                              onChange={(e) =>
                                setQuoteData((prev) => ({
                                  ...prev,
                                  services: prev.services.map((s) =>
                                    s.id === service.id
                                      ? { ...s, name: e.target.value }
                                      : s
                                  ),
                                }))
                              }
                              placeholder="Custom Service Name"
                              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <Input
                              type="text"
                              value={service.category}
                              onChange={(e) =>
                                setQuoteData((prev) => ({
                                  ...prev,
                                  services: prev.services.map((s) =>
                                    s.id === service.id
                                      ? { ...s, category: e.target.value }
                                      : s
                                  ),
                                }))
                              }
                              placeholder="Category"
                              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Input
                            type="number"
                            min="0"
                            value={service.price}
                            onChange={(e) => {
                              const newPrice = parseInt(e.target.value) || 0;
                              setQuoteData((prev) => ({
                                ...prev,
                                services: prev.services.map((s) =>
                                  s.id === service.id
                                    ? { ...s, price: newPrice }
                                    : s
                                ),
                              }));
                            }}
                            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <Button
                            variant="destructive"
                            onClick={() =>
                              setQuoteData((prev) => ({
                                ...prev,
                                services: prev.services.filter(
                                  (s) => s.id !== service.id
                                ),
                              }))
                            }
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                <Card className="p-4 m-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
                  <Button
                    onClick={() => {
                      const customId = uuidv4();
                      setQuoteData((prev) => ({
                        ...prev,
                        services: [
                          ...prev.services,
                          {
                            id: customId,
                            name: "",
                            description: "",
                            category: "",
                            price: 0,
                          },
                        ],
                      }));
                    }}
                    className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: RISA_BLUE,
                      color: RISA_WHITE,
                      padding: "0.75rem 2rem",
                    }}
                  >
                    + Add Custom Service
                  </Button>
                </Card>
              </div>
            </div>
            <div>
              <Label htmlFor="customSpecs" className="text-gray-900 dark:text-white">Additional Specifications</Label>
              <Textarea
                id="customSpecs"
                placeholder="Any additional requirements or specifications..."
                rows={4}
                value={quoteData.custom_specs}
                onChange={(e) =>
                  setQuoteData((prev) => ({
                    ...prev,
                    custom_specs: e.target.value,
                  }))
                }
                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Zap className="w-5 h-5" style={{ color: RISA_BLUE }} />
                Subcontractor Charges
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {subContractors
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((service) => {
                    const isChecked = quoteData.subcontractors.some(
                      (s) => s.id === service.id
                    );
                    return (
                      <Card key={service.id} className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="grid grid-cols-2">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    subcontractors: [
                                      ...prev.subcontractors,
                                      {
                                        ...service,
                                        subcontractor_payment_plan: "full",
                                        total: service.price,
                                      },
                                    ],
                                  }));
                                } else {
                                  setQuoteData((prev) => ({
                                    ...prev,
                                    subcontractors: prev.subcontractors.filter(
                                      (s) => s.id !== service.id
                                    ),
                                  }));
                                }
                              }}
                            />
                            <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                          </div>
                          <div className="text-right">
                            <Badge className="text-black bg-blue-100 dark:bg-blue-900/20" variant="secondary">
                              KSh {service.price.toLocaleString()}/
                              {service.unit}
                            </Badge>
                          </div>
                        </div>
                        {isChecked && (
                          <div className="mt-3 animate-fade-in">
                            <Label className="text-gray-900 dark:text-white">Payment Plan *</Label>
                            <Select
                              value={
                                quoteData.subcontractors.find(
                                  (s) => s.id === service.id
                                )?.subcontractor_payment_plan || "full"
                              }
                              onValueChange={(value: "daily" | "full") =>
                                setQuoteData((prev) => ({
                                  ...prev,
                                  subcontractors: prev.subcontractors.map(
                                    (sub) =>
                                      sub.id === service.id
                                        ? {
                                            ...sub,
                                            subcontractor_payment_plan: value,
                                            total:
                                              value === "full"
                                                ? sub.price
                                                : sub.total,
                                            price:
                                              value === "daily"
                                                ? sub.price
                                                : sub.total || sub.price,
                                          }
                                        : sub
                                  ),
                                }))
                              }
                            >
                              <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Select Payment Plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">
                                  Full Amount
                                </SelectItem>
                                <SelectItem value="daily">
                                  Daily Payments
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Label htmlFor={`contractorCost-${service.id}`} className="text-gray-900 dark:text-white">
                              Contractor Cost
                            </Label>
                            <Input
                              id={`contractorCost-${service.id}`}
                              type="number"
                              min="0"
                              value={
                                quoteData.subcontractors.find(
                                  (s) => s.id === service.id
                                )?.subcontractor_payment_plan === "full"
                                  ? quoteData.subcontractors.find(
                                      (s) => s.id === service.id
                                    )?.total || service.price
                                  : quoteData.subcontractors.find(
                                      (s) => s.id === service.id
                                    )?.price || service.price
                              }
                              placeholder={
                                quoteData.subcontractors.find(
                                  (s) => s.id === service.id
                                )?.subcontractor_payment_plan === "full"
                                  ? "Total cost"
                                  : "Daily rate"
                              }
                              onChange={(e) =>
                                setQuoteData((prev) => ({
                                  ...prev,
                                  subcontractors: prev.subcontractors.map(
                                    (sub) =>
                                      sub.id === service.id
                                        ? {
                                            ...sub,
                                            total:
                                              sub.subcontractor_payment_plan ===
                                              "full"
                                                ? parseFloat(e.target.value) ||
                                                  0
                                                : sub.total,
                                            price:
                                              sub.subcontractor_payment_plan ===
                                              "daily"
                                                ? parseFloat(e.target.value) ||
                                                  0
                                                : sub.price,
                                          }
                                        : sub
                                  ),
                                }))
                              }
                              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            {quoteData.subcontractors.find(
                              (s) => s.id === service.id
                            )?.subcontractor_payment_plan === "daily" && (
                              <>
                                <Label htmlFor={`days-${service.id}`} className="text-gray-900 dark:text-white">
                                  Number of Days
                                </Label>
                                <Input
                                  id={`days-${service.id}`}
                                  type="number"
                                  min="1"
                                  value={
                                    quoteData.subcontractors.find(
                                      (s) => s.id === service.id
                                    )?.days || ""
                                  }
                                  placeholder="e.g., 5"
                                  onChange={(e) =>
                                    setQuoteData((prev) => ({
                                      ...prev,
                                      subcontractors: prev.subcontractors.map(
                                        (sub) =>
                                          sub.id === service.id
                                            ? {
                                                ...sub,
                                                days:
                                                  parseInt(e.target.value) || 0,
                                              }
                                            : sub
                                      ),
                                    }))
                                  }
                                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                {quoteData.subcontractors
                  .filter((s) => !subContractors.some((srv) => srv.id === s.id))
                  .map((sub) => (
                    <Card key={sub.id} className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Input
                            type="text"
                            value={sub.name}
                            placeholder="Subcontractor name"
                            onChange={(e) =>
                              setQuoteData((prev) => ({
                                ...prev,
                                subcontractors: prev.subcontractors.map((s) =>
                                  s.id === sub.id
                                    ? { ...s, name: e.target.value }
                                    : s
                                ),
                              }))
                            }
                            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Select
                            value={sub.subcontractor_payment_plan || "full"}
                            onValueChange={(value: "daily" | "full") =>
                              setQuoteData((prev) => ({
                                ...prev,
                                subcontractors: prev.subcontractors.map((s) =>
                                  s.id === sub.id
                                    ? {
                                        ...s,
                                        subcontractor_payment_plan: value,
                                        total:
                                          value === "full"
                                            ? s.total || s.price
                                            : s.total,
                                        price:
                                          value === "daily"
                                            ? s.price || s.total
                                            : s.price,
                                      }
                                    : s
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <SelectValue placeholder="Payment Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Amount</SelectItem>
                              <SelectItem value="daily">
                                Daily Payments
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            placeholder={
                              sub.subcontractor_payment_plan === "full"
                                ? "Total cost"
                                : "Daily rate"
                            }
                            value={
                              sub.subcontractor_payment_plan === "full"
                                ? sub.total || ""
                                : sub.price || ""
                            }
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setQuoteData((prev) => ({
                                ...prev,
                                subcontractors: prev.subcontractors.map((s) =>
                                  s.id === sub.id
                                    ? {
                                        ...s,
                                        total:
                                          s.subcontractor_payment_plan ===
                                          "full"
                                            ? val
                                            : s.total,
                                        price:
                                          s.subcontractor_payment_plan ===
                                          "daily"
                                            ? val
                                            : s.price,
                                      }
                                    : s
                                ),
                              }));
                            }}
                            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          {sub.subcontractor_payment_plan === "daily" && (
                            <Input
                              type="number"
                              min="1"
                              placeholder="Days"
                              value={sub.days || ""}
                              onChange={(e) =>
                                setQuoteData((prev) => ({
                                  ...prev,
                                  subcontractors: prev.subcontractors.map((s) =>
                                    s.id === sub.id
                                      ? {
                                          ...s,
                                          days: parseInt(e.target.value) || 0,
                                        }
                                      : s
                                  ),
                                }))
                              }
                              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setQuoteData((prev) => ({
                                ...prev,
                                subcontractors: prev.subcontractors.filter(
                                  (s) => s.id !== sub.id
                                ),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
                  <Button
                    onClick={() => {
                      const newId = `custom-${Date.now()}`;
                      setQuoteData((prev) => ({
                        ...prev,
                        subcontractors: [
                          ...prev.subcontractors,
                          {
                            id: newId,
                            name: "",
                            unit: "day",
                            price: 0,
                            total: 0,
                            days: 1,
                            subcontractor_payment_plan: "daily",
                          },
                        ],
                      }));
                    }}
                    className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: RISA_BLUE,
                      color: RISA_WHITE,
                      padding: "0.75rem 2rem",
                    }}
                  >
                    + Add Custom Subcontractor
                  </Button>
                </Card>
              </div>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <BOQBuilder quoteData={quoteData} onBOQUpdate={setBoqData} />
          </motion.div>
        );
      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <PreliminariesBuilder
              quoteData={quoteData}
              onPreliminariesUpdate={setPreliminaries}
              onSaveToQuote={(sections) => {
                setQuoteData((prev: any) => ({
                  ...prev,
                  preliminaries: sections,
                }));
              }}
            />
          </motion.div>
        );
      case 9:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {calculation ? (
              <>
                {boqData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Bill of Quantities
                    </h3>
                    {boqData.map((section, index) => (
                      <Card key={index} className="mb-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <CardHeader>
                          <CardTitle className="text-gray-900 dark:text-white">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-gray-900 dark:text-white">Item</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Description</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Element</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Unit</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Qty</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Rate</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Amount</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Source</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {section.items && section.items.length > 0 ? (
                                section.items.map((item, idx) => {
                                  const isHeader =
                                    item.element?.toLowerCase() === "header";
                                  return (
                                    <TableRow key={idx}>
                                      {isHeader ? (
                                        <>
                                          <TableCell
                                            colSpan={8}
                                            className="font-bold text-base text-gray-900 dark:text-white"
                                          >
                                            {item.description || "-"}
                                          </TableCell>
                                        </>
                                      ) : (
                                        <>
                                          <TableCell className="text-gray-900 dark:text-white">
                                            {item.itemNo || "-"}
                                          </TableCell>
                                          <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {item.description || "-"}
                                          </TableCell>
                                          <TableCell className="text-gray-900 dark:text-white">
                                            {item.element || "-"}
                                          </TableCell>
                                          <TableCell className="text-gray-900 dark:text-white">
                                            {item.unit || "-"}
                                          </TableCell>
                                          <TableCell className="text-gray-900 dark:text-white">
                                            {item.quantity ?? "-"}
                                          </TableCell>
                                          <TableCell className="text-gray-900 dark:text-white">
                                            {item.rate
                                              ? item.rate.toLocaleString()
                                              : "-"}
                                          </TableCell>
                                          <TableCell className="text-gray-900 dark:text-white">
                                            {item.amount
                                              ? item.amount.toLocaleString()
                                              : "-"}
                                          </TableCell>
                                          <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.calculatedFrom || "-"}
                                          </TableCell>
                                        </>
                                      )}
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={8}
                                    className="text-center text-gray-400"
                                  >
                                    No items in this section
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                          {section.items.length > 0 && (
                            <div className="mt-4 text-right font-bold text-gray-900 dark:text-white">
                              Total: KSh{" "}
                              {section.items
                                .reduce((sum, i) => sum + (i.amount || 0), 0)
                                .toLocaleString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Labour and Total</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-900 dark:text-white">
                        <p>Labour</p>
                        <p>KSh {calculation?.labor_cost?.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between text-gray-900 dark:text-white">
                        <p>Profit</p>
                        <p>
                          KSh {calculation?.profit_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between text-gray-900 dark:text-white">
                        <p>Materials</p>
                        <p>
                          KSh {calculation?.materials_cost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between text-gray-900 dark:text-white">
                        <p>Preliminaries</p>
                        <p>
                          KSh {calculation?.preliminariesCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span>KSh {calculation.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={handleSaveQuote}
                    className="flex-1 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: RISA_BLUE,
                      color: RISA_WHITE,
                      padding: "0.75rem 2rem",
                    }}
                  >
                    Save Quote
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-gray-500 dark:text-gray-400">
                No calculation done. Click on calculate to generate quotation
              </div>
            )}
            <div className="flex space-x-4">
              <Button
                onClick={handleCalculate}
                disabled={calculationLoading}
                className="flex-1 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: RISA_BLUE,
                  color: RISA_WHITE,
                  padding: "0.75rem 2rem",
                }}
              >
                {calculationLoading ? "Calculating..." : "Recalculate"}
              </Button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: RISA_BLUE }}></div>
          <p className="text-gray-600 dark:text-gray-300" style={{ color: RISA_BLUE }}>Loading quote builder...</p>
        </motion.div>
      </div>
    );
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Free":
        return (
          <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
            <Shell className="w-3 h-3 mr-1" />
            Free
          </Badge>
        );
      case "Intermediate":
        return (
          <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
            <Crown className="w-3 h-3 mr-1" />
            Intermediate
          </Badge>
        );
      case "Professional":
        return (
          <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">
            <Shield className="w-3 h-3 mr-1" />
            Professional
          </Badge>
        );
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  if (limit !== null && profile?.quotes_used >= limit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-w-md w-full rounded-xl">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Quote Limit Reached
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please upgrade your plan to access more quote allocations.
            </p>
            <div className="mb-6">{getTierBadge(profile.tier)}</div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/payment")}
                className="w-full rounded-full font-semibold"
                style={{
                  backgroundColor: RISA_BLUE,
                  color: RISA_WHITE,
                  padding: "0.75rem 2rem",
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Badge className="mb-3 text-xs bg-blue-600 text-white dark:bg-blue-700">
            <BuildingIcon className="w-3 h-3 mr-1" /> Quote Builder
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: RISA_BLUE }}>
            Enhanced Quote Builder
          </h1>
          <p className="text-gray-600 mt-2 dark:text-gray-300 text-sm">
            Create accurate construction quotes with advanced calculations and professional estimates
          </p>
        </motion.div>
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-md dark:bg-blue-700 dark:border-blue-700"
                        : "border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                    }`}
                  >
                    {step.icon}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full transition-all duration-500 ${
                          currentStep > step.id ? "bg-blue-600 dark:bg-blue-700" : "bg-transparent"
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="absolute mt-12 -ml-4 hidden lg:block">
                  <p
                    className={`text-xs font-medium whitespace-nowrap ${
                      currentStep >= step.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                    {steps[currentStep - 1].icon}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{steps[currentStep - 1].name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-normal">
                      Step {currentStep} of {steps.length}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {renderStepContent()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="rounded-full px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          </motion.div>
          {currentStep < 9 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={nextStep}
                className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: RISA_BLUE,
                  color: RISA_WHITE,
                  padding: "0.75rem 2rem",
                }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedQuoteBuilder;
