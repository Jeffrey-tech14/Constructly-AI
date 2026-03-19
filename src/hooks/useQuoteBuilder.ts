import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import {
  useQuoteCalculations,
  CalculationResult,
} from "@/hooks/useQuoteCalculations";
import { useUserSettings, UserTransportRate } from "@/hooks/useUserSettings";
import { useQuotes } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "../contexts/PlanContext";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { supabase } from "@/integrations/supabase/client";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculatorNew";
import { PlumbingSystem } from "@/hooks/usePlumbingCalculator";
import {
  CableType,
  ElectricalSystem,
  InstallationMethod,
} from "@/hooks/useElectricalCalculator";
import { RoofStructure } from "@/hooks/useRoofingCalculator";
import { FinishElement } from "@/hooks/useUniversalFinishesCalculator";
import { EarthworkItem } from "@/components/EarthWorksForm";
import { WardrobeItem } from "@/components/KitchenAndWardrobesCalculator";
import { BOQSection, PrelimSection } from "@/types/boq";
import { QuoteGeometry, DEFAULT_GEOMETRY } from "@/types/geometry";
import {
  calculateInternalWallArea,
  calculateExternalWallArea,
  extractSlabFootprintArea,
  mapWallDimensionsToGeometry,
  calculateFlooringAreas,
  syncRoofingFromSlab,
} from "@/utils/geometryCalculations";
import { Material } from "@/hooks/useQuoteCalculations";
import { RebarSize } from "./useRebarCalculator";

// Helper functions to enrich doors/windows (originally inside component)
const enrichDoorWithDefaults = (door: any, wallThickness: number = 0.2) => ({
  sizeType: door.sizeType || "standard",
  standardSize: door.standardSize || "0.9 × 2.1 m",
  price: door.price || 0,
  custom: {
    height: door.custom?.height || "2.1",
    width: door.custom?.width || "0.9",
    price: door.custom?.price || 0,
  },
  type: door.type || "Panel",
  count: door.count || 1,
  wallThickness: door.wallThickness || wallThickness,
  frame: {
    type: door.frame?.type || "Wood",
    price: door.frame?.price || 0,
    sizeType: door.frame?.sizeType || "standard",
    standardSize: door.frame?.standardSize || "0.9 × 2.1 m",
    height: door.frame?.height || "2.1",
    width: door.frame?.width || "0.9",
    custom: {
      height: door.frame?.custom?.height || "2.1",
      width: door.frame?.custom?.width || "0.9",
      price: door.frame?.custom?.price || 0,
    },
  },
  architrave: door.architrave || {
    selected: { type: "", size: "" },
    quantity: 0,
    price: 0,
  },
  quarterRound: door.quarterRound || {
    selected: { type: "", size: "" },
    quantity: 0,
    price: 0,
  },
  ironmongery: door.ironmongery || {
    hinges: {
      selected: { type: "", size: "" },
      quantity: 0,
      price: 0,
    },
    locks: {
      selected: { type: "", size: "" },
      quantity: 0,
      price: 0,
    },
    handles: {
      selected: { type: "", size: "" },
      quantity: 0,
      price: 0,
    },
    bolts: {
      selected: { type: "", size: "" },
      quantity: 0,
      price: 0,
    },
    closers: {
      selected: { type: "", size: "" },
      quantity: 0,
      price: 0,
    },
  },
  transom: door.transom || {
    enabled: false,
    height: "",
    width: "",
    quantity: 0,
    price: 0,
    glazing: {
      included: false,
      glassAreaM2: 0,
      puttyLengthM: 0,
      glassPricePerM2: 0,
      puttyPricePerM: 0,
    },
  },
});

const enrichWindowWithDefaults = (
  window: any,
  wallThickness: number = 0.2,
) => ({
  sizeType: window.sizeType || "standard",
  standardSize: window.standardSize || "1.2 × 1.2 m",
  price: window.price || 0,
  custom: {
    height: window.custom?.height || "1.2",
    width: window.custom?.width || "1.2",
    price: window.custom?.price || 0,
  },
  type: window.type || "Clear",
  count: window.count || 1,
  wallThickness: window.wallThickness || wallThickness,
  frame: {
    type: window.frame?.type || "Steel",
    price: window.frame?.price || 0,
    sizeType: window.frame?.sizeType || "standard",
    standardSize: window.frame?.standardSize || "1.2 × 1.2 m",
    height: window.frame?.height || "1.2",
    width: window.frame?.width || "1.2",
    custom: {
      height: window.frame?.custom?.height || "1.2",
      width: window.frame?.custom?.width || "1.2",
      price: window.frame?.custom?.price || 0,
    },
  },
  architrave: window.architrave || {
    selected: { type: "timber-architrave", size: "40x20mm" },
    quantity: 0,
    price: 0,
  },
  quarterRound: window.quarterRound || {
    selected: { type: "timber-quarter-round", size: "20mm" },
    quantity: 0,
    price: 0,
  },
  ironmongery: window.ironmongery || {
    hinges: {
      selected: { type: "butt-hinge", size: "100mm" },
      quantity: 3,
      price: 0,
    },
    locks: {
      selected: { type: "mortice-lock", size: "3-lever" },
      quantity: 1,
      price: 0,
    },
    handles: {
      selected: { type: "lever-handle", size: "standard" },
      quantity: 1,
      price: 0,
    },
    bolts: {
      selected: { type: "tower-bolt", size: "150mm" },
      quantity: 1,
      price: 0,
    },
    closers: {
      selected: { type: "", size: "" },
      quantity: 0,
      price: 0,
    },
  },
  glassType: window.glassType || "Clear",
  glassThickness: window.glassThickness || 3,
  span: window.span || 1.2,
  isGlassUnderSized: window.isGlassUnderSized || false,
  recommendedGlassThickness: window.recommendedGlassThickness || 3,
  glazing: window.glazing || {
    glass: {
      type: "Clear",
      thickness: 3,
      quantity: 1,
      pricePerM2: 0,
    },
    putty: {
      quantity: 0,
      unit: "m",
      price: 0,
    },
  },
});

export const useQuoteBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const quote = location.state?.quote;

  const {
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    updateMaterialPrice,
    getEffectiveMaterialPrice,
    getEffectiveMaterialPriceSingle,
    updateMaterialPriceSingle,
  } = useDynamicPricing();

  const {
    updateRegion,
    equipmentRates,
    services,
    calculateQuote,
    loading: calculationLoading,
  } = useQuoteCalculations();

  const { extractedPlan } = usePlan();
  const {
    customEquipment,
    customMaterials,
    loading: settingsLoading,
  } = useUserSettings();

  const { createQuote, updateQuote } = useQuotes();
  const { profile, user } = useAuth();

  // ---------- State ----------
  const [currentStep, setCurrentStep] = useState(1);
  const [substructureTab, setSubstructureTab] = useState("earthworks");
  const [superstructureTab, setSuperstructureTab] = useState("doors-windows");
  const [finishesTab, setFinishesTab] = useState("flooring");
  const [extrasTab, setExtrasTab] = useState("equipment");
  const [countertopsTab, setCountertopsTab] = useState("kitchen");
  const [wallingFinishesTab, setWallingFinishesTab] =
    useState("internalFinishes");
  const [otherFinishesTab, setOtherFinishesTab] = useState("kitchen-wardrobes");

  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null,
  );
  const [subContractors, setSubContractors] = useState<any[]>([]);
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [boqData, setBoqData] = useState<BOQSection[]>([]);
  const [preliminaries, setPreliminaries] = useState<PrelimSection[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [plumbingSystems, setPlumbingSystems] = useState<PlumbingSystem[]>([]);
  const [earthwork, setEarthWorks] = useState<EarthworkItem[]>([]);
  const [roofStructure, setRoofStructure] = useState<RoofStructure[]>([]);
  const [electricalSystems, setElectricalSystems] = useState<
    ElectricalSystem[]
  >([]);
  const [finishes, setFinishes] = useState<FinishElement[]>([]);
  const [wardrobes, setWardrobes] = useState<WardrobeItem[]>([]);
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);

  // Main quote data (large object)
  const [quoteData, setQuoteData] = useState({
    wallDimensions: {
      externalWallPerimiter: 0,
      internalWallPerimiter: 0,
      externalWallHeight: 0,
      internalWallHeight: 0,
      length: 0,
      width: 0,
    },
    plan_file_url: "",
    wallSections: [],
    rebar_calculation_method: "NORMAL_REBAR_MODE",
    bbs_file_url: "",
    wallProperties: {
      blockType: "Standard Block",
      thickness: 0.2,
      plaster: "Both Sides" as "None" | "One Side" | "Both Sides",
    },
    total_area: 0,
    client_name: "",
    client_email: "",
    title: "",
    location: "",
    bar_schedule: [],
    earthwork_items: [],
    earthwork_total: [],
    id: uuidv4(),
    qsSettings: [] as MasonryQSSettings[],
    boq_data: [],
    foundationDetails: [],
    foundationWalls: [],
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
    contract_type: "full_contract" as "full_contract" | "labor_only",
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
    electrical_calculations: [],
    plumbing_calculations: [],
    finishes_calculations: {
      flooring: [],
      ceiling: [],
      "wall-finishes": [],
      joinery: [],
      external: [],
    },
    roofing_calculations: [],
    electrical_systems: [],
    plumbing_systems: [],
    wardrobes_cabinets: [],
    doorWindowPaints: [],
    finishes: [],
    countertops: [],
    roof_structures: [],
    geometry: DEFAULT_GEOMETRY,
    preliminaries: [],
    preliminaryOptions: [],
    earthwork: [],
    labor_percentages: 0,
    overhead_percentages: 0,
    profit_percentages: 0,
    contingency_percentages: 0,
    permit_cost: 0,
    paintings_specifications: [],
    paintings_totals: null,
  });

  const [direction, setDirection] = useState<"left" | "right">("right");

  // ---------- Effects: Data fetching ----------
  const fetchRates = useCallback(async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from("subcontractor_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_subcontractor_rates")
      .select("service_id, price")
      .eq("user_id", profile?.id);
    if (baseError) console.error("Base rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = (baseServices || []).map((service) => {
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
    setSubContractors(merged);
  }, [profile?.id]);

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;
    const { data: baseMaterials, error: baseError } = await supabase
      .from("material_base_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);
    const { data: customMaterials, error: customError } = await supabase
      .from("user_materials")
      .select("*")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base materials error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    if (customError) console.error("Custom materials error:", customError);

    const userRegion = quoteData.region || "Nairobi";
    const multiplier =
      regionalMultipliers.find((r) => r.region === userRegion)?.multiplier || 1;

    const merged = (baseMaterials || []).map((material) => {
      const userRate = overrides?.find(
        (o) => o.material_id === material.id && o.region === userRegion,
      );
      const price = userRate ? userRate.price : (material.price ?? 0);
      const result = price * multiplier;
      return {
        ...material,
        result,
        source: userRate ? "user" : material.price != null ? "base" : "none",
        region: userRegion,
      };
    });

    const customItems = (customMaterials || []).map((custom) => ({
      id: custom.id,
      name: custom.material_name,
      unit: custom.unit,
      region: userRegion,
      price: custom.price_per_unit,
      result: custom.price_per_unit * multiplier,
      category: custom.category || "Custom",
      description: custom.description,
      source: "custom",
      type: custom.type || "[]",
    }));

    setMaterials([...merged, ...customItems]);
  }, [profile?.id, quoteData.region, regionalMultipliers]);

  const fetchTransportRates = useCallback(async () => {
    if (!profile?.id) return;
    const { data: baseRates, error: baseError } = await supabase
      .from("transport_rates")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_transport_rates")
      .select("region, cost_per_km, base_cost")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base transport rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const allRegions = [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Nakuru",
      "Eldoret",
      "Thika",
      "Machakos",
    ];
    const merged = allRegions.map((region) => {
      const base = baseRates?.find(
        (r) => r.region.toLowerCase() === region.toLowerCase(),
      );
      const userRate = overrides?.find(
        (o) => o.region.toLowerCase() === region.toLowerCase(),
      );
      return {
        id: profile.id,
        region,
        cost_per_km: userRate?.cost_per_km ?? base?.cost_per_km ?? 50,
        base_cost: userRate?.base_cost ?? base?.base_cost ?? 500,
        source: userRate ? "user" : base ? "base" : "default",
      };
    });
    setTransportRates(merged);
  }, [profile?.id]);

  // Load initial data on mount
  useEffect(() => {
    if (user && profile) {
      fetchRates();
      fetchMaterials();
      fetchTransportRates();
    }
  }, [user, profile, fetchRates, fetchMaterials, fetchTransportRates]);

  // Load quote from location state
  useEffect(() => {
    if (quote) {
      setQuoteData((prev) => ({
        ...prev,
        ...quote,
        wallDimensions: quote.wallDimensions || prev.wallDimensions,
        wallSections: quote.wallSections || [],
        wallProperties: quote.wallProperties || prev.wallProperties,
        selected_equipment: quote.selected_equipment || [],
        selected_services: quote.selected_services || [],
      }));
    }
  }, [quote]);

  // Update region in calculation hook
  useEffect(() => {
    if (quoteData.region) {
      updateRegion(quoteData.region);
    }
  }, [quoteData.region, updateRegion]);

  // ---------- Geometry calculations ----------
  useEffect(() => {
    const wallDims = quoteData.wallDimensions;
    const newGeometry = {
      ...quoteData.geometry,
      ...mapWallDimensionsToGeometry(wallDims),
      internalWallAreaM2: calculateInternalWallArea(
        wallDims.internalWallPerimiter,
        wallDims.internalWallHeight,
      ),
      externalWallAreaM2: calculateExternalWallArea(
        wallDims.externalWallPerimiter,
        wallDims.externalWallHeight,
      ),
    };
    setQuoteData((prev) => ({ ...prev, geometry: newGeometry }));
  }, [
    quoteData.wallDimensions.externalWallPerimiter,
    quoteData.wallDimensions.internalWallPerimiter,
    quoteData.wallDimensions.externalWallHeight,
    quoteData.wallDimensions.internalWallHeight,
    quoteData.wallDimensions.length,
    quoteData.wallDimensions.width,
  ]);

  useEffect(() => {
    const slabArea = extractSlabFootprintArea(quoteData.concrete_rows);
    const externalPerimeter = quoteData.wallDimensions.externalWallPerimiter;

    const roofingSync = syncRoofingFromSlab(slabArea, externalPerimeter);
    const flooringAreas = calculateFlooringAreas(
      slabArea,
      externalPerimeter,
      quoteData.wallDimensions.externalWallHeight,
    );

    const newGeometry = {
      ...quoteData.geometry,
      slabFootprintAreaM2: slabArea,
      externalSlabPerimeterM: externalPerimeter,
      roofingAreaM2: roofingSync.roofingAreaM2,
      roofingPerimeterM: roofingSync.roofingPerimeterM,
      roofingSyncedFromSlab: roofingSync.roofingSyncedFromSlab,
      internalFlooringAreaM2: flooringAreas.internalFlooringAreaM2,
      externalFlooringAreaM2: flooringAreas.externalFlooringAreaM2,
    };

    setQuoteData((prev) => ({ ...prev, geometry: newGeometry }));
  }, [
    quoteData.concrete_rows,
    quoteData.wallDimensions.externalWallPerimiter,
    quoteData.wallDimensions.externalWallHeight,
  ]);

  // ---------- Transport cost ----------
  const transportCost = useMemo(() => {
    const region = quoteData.region?.toString().trim() || "";
    const rateForRegion = transportRates.find(
      (r) =>
        r.region.toString().toLowerCase().trim() ===
        region.toLowerCase().trim(),
    );
    const defaultRate = { cost_per_km: 50, base_cost: 500 };
    const rate = rateForRegion || defaultRate;
    return quoteData.distance_km * rate.cost_per_km + rate.base_cost;
  }, [quoteData.region, quoteData.distance_km, transportRates]);

  useEffect(() => {
    setQuoteData((prev) => ({ ...prev, transport_costs: transportCost }));
  }, [transportCost]);

  // ---------- Sync from extracted plan ----------
  useEffect(() => {
    if (!extractedPlan) return;

    setQuoteData((prev) => ({
      ...prev,
      floors: extractedPlan.floors || prev.floors,
      house_type: extractedPlan.houseType || prev.house_type,
      project_type: extractedPlan.projectType || "",
      location: extractedPlan.projectLocation || "",
      title: extractedPlan.projectName || "",
      client_name: extractedPlan.clientName || "",
      total_area: extractedPlan.projectInfo.totalArea,
      plan_file_url: extractedPlan.file_url || "",
      bbs_file_url: extractedPlan.bbs_file_url || "",

      // Wall dimensions and properties (new structure)
      wallDimensions: extractedPlan.wallDimensions || {
        externalWallPerimiter: 0,
        internalWallPerimiter: 0,
        externalWallHeight: 0,
        internalWallHeight: 0,
        length: 0,
        width: 0,
      },
      wallSections:
        extractedPlan.wallSections?.map((section: any) => ({
          type: section.type || "external",
          blockType: section.blockType,
          thickness: section.thickness,
          plaster: section.plaster,
          doors: (section.doors || []).map((door: any) =>
            enrichDoorWithDefaults(door, section.thickness || 0.2),
          ),
          windows: (section.windows || []).map((window: any) =>
            enrichWindowWithDefaults(window, section.thickness || 0.2),
          ),
        })) || [],

      // Foundation Details
      foundationDetails:
        extractedPlan.foundationDetails?.map(
          (foundation: any, index: number) => ({
            id: foundation.id || `foundation-${index}`,
            type: foundation.foundationType || "strip-footing",
            width: foundation.width || "0.4",
            height: foundation.height || "0.6",
            length: foundation.length || "0",
            wallThickness: foundation.wallThickness || "0.2",
            wallHeight: foundation.wallHeight || "1.0",
            groundFloorElevation: foundation.groundFloorElevation || "0",
            masonryType: foundation.masonryType || "Standard Block",
          }),
        ) || prev.foundationDetails,

      // Foundation Walling
      foundationWalls:
        extractedPlan.foundationWalling?.map((wall: any, index: number) => {
          const externalPerimeter =
            extractedPlan.wallDimensions?.externalWallPerimiter || 0;
          const internalPerimeter =
            extractedPlan.wallDimensions?.internalWallPerimiter || 0;
          const wallLength =
            wall.type === "external" ? externalPerimeter : internalPerimeter;

          return {
            id: wall.id || `fwall-${index}`,
            type: wall.type || "external",
            blockDimensions: wall.blockDimensions || "0.2x0.2x0.2",
            blockThickness: wall.blockThickness || "200",
            wallLength:
              wall.wallLength ||
              (wallLength > 0 ? wallLength.toFixed(2).toString() : "0"),
            wallHeight: wall.wallHeight || "1.0",
            numberOfWalls: wall.numberOfWalls || 1,
            mortarRatio: wall.mortarRatio || "1:4",
          };
        }) || prev.foundationWalls,

      // Concrete structures
      concrete_rows:
        extractedPlan.concreteStructures?.flatMap(
          (structure: any, index: number) => {
            const baseRow = {
              id: structure.id || `concrete-${index}`,
              name: structure.name,
              element: structure.element,
              mix: structure.mix || "C25",
              verandahArea: structure.verandahArea || 0,
              slabArea: extractedPlan.projectInfo.totalArea || 0,
              formwork: structure.formwork,
              category: structure.category || "substructure",
              number: structure.number || "1",
              hasConcreteBed: structure.hasConcreteBed || false,
              bedDepth: structure.bedDepth || "0.1",
              hasAggregateBed: structure.hasAggregateBed || false,
              aggregateDepth: structure.aggregateDepth || "0.15",
              foundationType: structure.foundationType,
              clientProvidesWater: structure.clientProvidesWater || false,
              cementWaterRatio: structure.cementWaterRatio || "0.5",
              reinforcement: structure.reinforcement || {
                mainBarSize: "D12",
                mainBarSpacing: "0.2",
              },
              staircaseDetails: structure.staircaseDetails,
              tankDetails: structure.tankDetails,
            };

            // If element is strip-footing, create two items (external and internal)
            if (structure.element === "strip-footing") {
              // Get external wall thickness from blockType
              const externalSection = extractedPlan.wallSections?.find(
                (s: any) => s.type === "external",
              );
              const blockDimensionsMap: { [key: string]: string } = {
                "Large Block": "0.2x0.2x0.2",
                "Standard Block": "0.15x0.2x0.15",
                "Small Block": "0.1x0.2x0.1",
              };
              const externalBlockType =
                externalSection?.blockType || "Standard Block";
              const externalBlockDimensions =
                blockDimensionsMap[externalBlockType] || "0.15x0.2x0.15";
              const externalDims = externalBlockDimensions
                .split("x")
                .map((d: string) => parseFloat(d.trim()));
              const externalThickness =
                externalDims.length >= 3 ? externalDims[2] : 0.15;

              // Get internal wall thickness from blockType
              const internalSection = extractedPlan.wallSections?.find(
                (s: any) => s.type === "internal",
              );
              const internalBlockType =
                internalSection?.blockType || "Standard Block";
              const internalBlockDimensions =
                blockDimensionsMap[internalBlockType] || "0.15x0.2x0.15";
              const internalDims = internalBlockDimensions
                .split("x")
                .map((d: string) => parseFloat(d.trim()));
              const internalThickness =
                internalDims.length >= 3 ? internalDims[2] : 0.15;

              // Use calculated build area for ground floor slab area
              const groundFloorSlabArea =
                extractedPlan.projectInfo?.totalArea || 0;

              return [
                {
                  ...baseRow,
                  id: `${structure.id || `concrete-${index}`}-external`,
                  name: `${structure.name} (External)`,
                  length:
                    extractedPlan.wallDimensions.externalWallPerimiter || 0,
                  width: externalThickness * 3,
                  height: externalThickness,
                },
                {
                  ...baseRow,
                  id: `${structure.id || `concrete-${index}`}-internal`,
                  name: `${structure.name} (Internal)`,
                  length:
                    extractedPlan.wallDimensions.internalWallPerimiter || 0,
                  width: internalThickness * 3,
                  height: internalThickness,
                },
              ];
            }

            // For non-strip-footing elements, return as single item
            return [
              {
                ...baseRow,
                length: structure.length,
                width: structure.width,
                height: structure.height,
              },
            ];
          },
        ) || prev.concrete_rows,

      equipment:
        extractedPlan.equipment?.equipmentData?.standardEquipment?.map(
          (item: any, index: number) => ({
            id: item.id || `equipment-${index}`,
            name: item.name || "Unnamed Equipment",
            description: item.description || "",
            usage_unit: item.usage_unit || "day",
            category: item.category || "other",
            total_cost: 0,
            equipment_type_id: item.id,
            rate_per_unit:
              equipmentRates.find((eq) => eq.id === item.id)?.rate_per_unit ||
              0,
            usage_quantity: item.usage_quantity || 1,
          }),
        ) || prev.equipment,

      // Ring Beams - Merge into QS Settings (map over array)
      qsSettings: Array.isArray(prev?.qsSettings)
        ? prev.qsSettings.map((settings: MasonryQSSettings) => ({
            ...settings,
            includesRingBeams:
              (extractedPlan.ringBeams && extractedPlan.ringBeams.length > 0) ||
              settings.includesRingBeams ||
              false,
            ringBeamWidth: extractedPlan.ringBeams?.[0]?.width
              ? parseFloat(extractedPlan.ringBeams[0].width)
              : (settings.ringBeamWidth ?? 0.2),
            ringBeamDepth: extractedPlan.ringBeams?.[0]?.depth
              ? parseFloat(extractedPlan.ringBeams[0].depth)
              : (settings.ringBeamDepth ?? 0.15),
            ringBeamRebarSize:
              (extractedPlan.ringBeams?.[0]?.mainBarSize as RebarSize) ||
              settings.ringBeamRebarSize ||
              ("D12" as RebarSize),
            ringBeamMainBarsCount: extractedPlan.ringBeams?.[0]?.mainBarsCount
              ? parseInt(extractedPlan.ringBeams[0].mainBarsCount)
              : (settings.ringBeamMainBarsCount ?? 8),
            ringBeamStirrupSize:
              (extractedPlan.ringBeams?.[0]?.stirrupSize as RebarSize) ||
              settings.ringBeamStirrupSize ||
              ("D8" as RebarSize),
            ringBeamStirrupSpacing: extractedPlan.ringBeams?.[0]?.stirrupSpacing
              ? parseInt(extractedPlan.ringBeams[0].stirrupSpacing)
              : (settings.ringBeamStirrupSpacing ?? 200),
          }))
        : prev.qsSettings || [],

      bar_schedule:
        extractedPlan.bar_schedule?.map((item) => ({
          bar_type: item.bar_type,
          bar_length: item.bar_length, // in meters
          quantity: item.quantity, // total quantity for this bar type and length
          weight_per_meter: item.weight_per_meter, // optional: estimated weight per meter in kg
          total_weight: item.total_weight, // optional: total weight for this bar type and length in kg
        })) || prev.bar_schedule,

      rebar_calculation_method: "bbs",

      // Reinforcement - Only add if BBS file is NOT available
      // If BBS file exists, skip reinforcement items and use bar_schedule instead
      rebar_rows: extractedPlan.bbs_file_url
        ? []
        : extractedPlan.reinforcement?.flatMap((rebar: any, index: number) => {
            const baseRebar = {
              id: rebar.id || `rebar-${index}`,
              element: rebar.element,
              name: rebar.name,
              columnHeight: rebar.columnHeight || "",
              mainBarSpacing: rebar.mainBarSpacing || "200",
              distributionBarSpacing: rebar.distributionBarSpacing || "200",
              mainBarsCount: rebar.mainBarsCount || "",
              distributionBarsCount: rebar.distributionBarsCount || "",
              slabLayers: rebar.slabLayers || "1",
              mainBarSize: rebar.mainBarSize || "D12",
              distributionBarSize: rebar.distributionBarSize || "D12",
              stirrupSize: rebar.stirrupSize || "D8",
              tieSize: rebar.tieSize || "D8",
              stirrupSpacing: rebar.stirrupSpacing || "200",
              tieSpacing: rebar.tieSpacing || "250",
              category: rebar.category || "superstructure",
              number: rebar.number || "1",
              rebarCalculationMode:
                rebar.rebarCalculationMode || "NORMAL_REBAR_MODE",

              // Reinforcement type and mesh fields
              reinforcementType: rebar.reinforcementType || "individual_bars",
              meshGrade: rebar.meshGrade || "A142",
              meshSheetWidth: rebar.meshSheetWidth || "2.4",
              meshSheetLength: rebar.meshSheetLength || "4.8",
              meshLapLength: rebar.meshLapLength / 1000 || "0.3",

              // Footing-specific fields
              footingType: rebar.footingType || "strip",
              longitudinalBars: rebar.longitudinalBars || "",
              transverseBars: rebar.transverseBars || "",
              topReinforcement: rebar.topReinforcement || "",
              bottomReinforcement: rebar.bottomReinforcement || "",

              // Tank-specific fields
              tankType: rebar.tankType || "septic",
              tankShape: rebar.tankShape || "rectangular",
              wallThickness: rebar.wallThickness || "0.2",
              baseThickness: rebar.baseThickness || "0.15",
              coverThickness: rebar.coverThickness || "0.125",
              includeCover: rebar.includeCover ?? true,

              // Wall reinforcement
              wallVerticalBarSize: rebar.wallVerticalBarSize || "D10",
              wallHorizontalBarSize: rebar.wallHorizontalBarSize || "D10",
              wallVerticalSpacing: rebar.wallVerticalSpacing || "150",
              wallHorizontalSpacing: rebar.wallHorizontalSpacing || "150",

              // Base reinforcement
              baseMainBarSize: rebar.baseMainBarSize || "D10",
              baseDistributionBarSize: rebar.baseDistributionBarSize || "D10",
              baseMainSpacing: rebar.baseMainSpacing || "150",
              baseDistributionSpacing: rebar.baseDistributionSpacing || "150",

              // Cover reinforcement
              coverMainBarSize: rebar.coverMainBarSize || "D10",
              coverDistributionBarSize: rebar.coverDistributionBarSize || "D10",
              coverMainSpacing: rebar.coverMainSpacing || "150",
              coverDistributionSpacing: rebar.coverDistributionSpacing || "150",

              retainingWallType: rebar.retainingWallType || "cantilever",
              heelLength: rebar.heelLength || "0.5",
              toeLength: rebar.toeLength || "0.5",
              stemVerticalBarSize: rebar.stemVerticalBarSize || "D10",
              stemHorizontalBarSize: rebar.stemHorizontalBarSize || "D10",
              stemVerticalSpacing: rebar.stemVerticalSpacing || "150",
              stemHorizontalSpacing: rebar.stemHorizontalSpacing || "200",
            };

            // If element is strip-footing, create two items (external and internal)
            if (rebar.element === "strip-footing") {
              const blockDimensionsMap: { [key: string]: string } = {
                "Large Block": "0.2x0.2x0.2",
                "Standard Block": "0.15x0.2x0.15",
                "Small Block": "0.1x0.2x0.1",
              };

              // External footing
              const externalSection = extractedPlan.wallSections?.find(
                (s: any) => s.type === "external",
              );
              const externalBlockType =
                externalSection?.blockType || "Standard Block";
              const externalBlockDimensions =
                blockDimensionsMap[externalBlockType] || "0.15x0.2x0.15";
              const externalDims = externalBlockDimensions
                .split("x")
                .map((d: string) => parseFloat(d.trim()));
              const externalThickness =
                externalDims.length >= 3 ? externalDims[2] : 0.15;

              // Internal footing
              const internalSection = extractedPlan.wallSections?.find(
                (s: any) => s.type === "internal",
              );
              const internalBlockType =
                internalSection?.blockType || "Standard Block";
              const internalBlockDimensions =
                blockDimensionsMap[internalBlockType] || "0.15x0.2x0.15";
              const internalDims = internalBlockDimensions
                .split("x")
                .map((d: string) => parseFloat(d.trim()));
              const internalThickness =
                internalDims.length >= 3 ? internalDims[2] : 0.15;

              return [
                {
                  ...baseRebar,
                  id: `${rebar.id || `rebar-${index}`}-external`,
                  name: `${rebar.name} (External)`,
                  length:
                    extractedPlan.wallDimensions.externalWallPerimiter || 0,
                  width: externalThickness,
                  depth:
                    extractedPlan.foundationDetails?.find(
                      (f: any) => f.foundationType === "strip-footing",
                    )?.wallHeight ||
                    rebar.depth ||
                    0,
                },
                {
                  ...baseRebar,
                  id: `${rebar.id || `rebar-${index}`}-internal`,
                  name: `${rebar.name} (Internal)`,
                  length:
                    extractedPlan.wallDimensions.internalWallPerimiter || 0,
                  width: internalThickness,
                  depth:
                    extractedPlan.foundationDetails?.find(
                      (f: any) => f.foundationType === "strip-footing",
                    )?.wallHeight ||
                    rebar.depth ||
                    0,
                },
              ];
            }

            // For slab elements with mesh reinforcement and ground floor in name, use area-based calculation
            const isGroundFloorSlab =
              rebar.element === "slab" &&
              rebar.name?.toLowerCase().includes("ground") &&
              rebar.reinforcementType === "mesh";

            if (isGroundFloorSlab) {
              return [
                {
                  ...baseRebar,
                  rebarCalculationMode: "NORMAL_REBAR_MODE",
                  areaSelectionMode: "DIRECT_AREA",
                  // Use area as the primary calculation input
                  area: extractedPlan.projectInfo.totalArea,
                },
              ];
            }

            // For non-strip-footing and non-ground-floor-mesh elements, return as single item
            return [
              {
                ...baseRebar,
                length: rebar.length,
                width: rebar.width,
                depth: rebar.depth,
              },
            ];
          }) || prev.rebar_rows,

      // Masonry
      masonry_materials:
        extractedPlan.masonry?.map((masonry: any, index: number) => ({
          id: masonry.id || `masonry-${index}`,
          type: masonry.type,
          blockType: masonry.blockType,
          length: masonry.length,
          height: masonry.height,
          thickness: masonry.thickness,
          area: masonry.area,
        })) || prev.masonry_materials,

      // Roof Structures - store extracted roofing inputs for deterministic calculator
      roof_structures: extractedPlan.roofing
        ? {
            footprintAreaM2:
              extractedPlan.roofing.footprintAreaM2 ||
              extractedPlan.projectInfo?.totalArea ||
              0,
            externalPerimeterM:
              extractedPlan.roofing.externalPerimeterM ||
              extractedPlan.wallDimensions?.externalWallPerimiter ||
              0,
            internalPerimeterM:
              extractedPlan.roofing.internalPerimeterM ||
              extractedPlan.wallDimensions?.internalWallPerimiter ||
              0,
            buildingLengthM:
              extractedPlan.roofing.buildingLengthM ||
              parseFloat(extractedPlan.wallDimensions?.length as any) ||
              0,
            buildingWidthM:
              extractedPlan.roofing.buildingWidthM ||
              parseFloat(extractedPlan.wallDimensions?.width as any) ||
              0,
            roofTrussTypeKingPost:
              extractedPlan.roofing.roofTrussTypeKingPost ?? true,
            purlinSpacingM: extractedPlan.roofing.purlinSpacingM || 1.5,
            roofingSheetEffectiveCoverWidthM:
              extractedPlan.roofing.roofingSheetEffectiveCoverWidthM || 1.0,
            roofingSheetLengthM:
              extractedPlan.roofing.roofingSheetLengthM || 3.0,
            roofType: extractedPlan.roofing.roofType || "gable",
            pitchDegrees: extractedPlan.roofing.pitchDegrees || 25,
            eaveWidthM: extractedPlan.roofing.eaveWidthM || 0.8,
            rasterSpacingMm: extractedPlan.roofing.rasterSpacingMm || 600,
            trussSpacingMm: extractedPlan.roofing.trussSpacingMm || 600,
          }
        : (prev as any).roof_structures || {
            footprintAreaM2: 0,
            externalPerimeterM: 0,
            internalPerimeterM: 0,
            buildingLengthM: 0,
            buildingWidthM: 0,
            roofTrussTypeKingPost: true,
            purlinSpacingM: 1.5,
            roofingSheetEffectiveCoverWidthM: 1.0,
            roofingSheetLengthM: 3.0,
            roofType: "gable" as const,
            pitchDegrees: 25,
            eaveWidthM: 0.8,
            rasterSpacingMm: 600,
            trussSpacingMm: 600,
          },

      // Plumbing Systems
      plumbing_systems:
        extractedPlan.plumbing?.map((system: any, index: number) => ({
          id: system.id || `plumbing-${index}`,
          name: system.name || `Plumbing System ${index + 1}`,
          systemType: system.system || "water-supply",
          pipes:
            system.pipes?.map((pipe: any, pipeIndex: number) => ({
              id: pipe.id || `pipe-${index}-${pipeIndex}`,
              material: pipe.material || "PVC-u",
              diameter: parseFloat(pipe.diameter) || 25,
              length: parseFloat(pipe.length) || 0,
              quantity: 1,
              pressureRating: pipe.pressureRating,
              insulation: pipe.insulation,
              trenchDetails: pipe.trenchDetails,
            })) || [],
          fixtures:
            system.fixtures?.map((fixture: any, fixtureIndex: number) => ({
              id: fixture.id || `fixture-${index}-${fixtureIndex}`,
              type: fixture.type?.toLowerCase() || "water-closet",
              count: fixture.count || 1,
              location: fixture.location || "Unknown",
              quality: "standard" as const,
              waterConsumption: fixture.waterConsumption,
              connections: {
                waterSupply: true,
                drainage: true,
                vent: true,
              },
            })) || [],
          tanks: system.tanks || [],
          pumps: system.pumps || [],
          fittings: system.fittings || [],
          isLumpsum: false,
        })) || prev.plumbing_systems,

      // Electrical Systems
      electrical_systems:
        extractedPlan.electrical?.map((system: any, index: number) => ({
          id: system.id || `electrical-${index}`,
          name: system.name || `Electrical System ${index + 1}`,
          systemType: system.system || "power",
          cables:
            system.cables?.map((cable: any, cableIndex: number) => ({
              id: cable.id || `cable-${index}-${cableIndex}`,
              type: (cable.type as CableType) || "NYM-J",
              size: parseFloat(cable.size) || 2.5,
              length: parseFloat(cable.length) || 0,
              quantity: 1,
              circuit: cable.circuit || "Circuit 1",
              protection: cable.protection,
              installationMethod:
                (cable.installationMethod as InstallationMethod) || "concealed",
            })) || [],
          outlets:
            system.outlets?.map((outlet: any, outletIndex: number) => ({
              id: outlet.id || `outlet-${index}-${outletIndex}`,
              type: outlet.type || "power-socket",
              count: outlet.count || 1,
              location: outlet.location || "Unknown",
              circuit: outlet.circuit || "Circuit 1",
              rating: parseFloat(outlet.rating) || 16,
              gang: outlet.gang || 1,
              mounting: outlet.mounting || "flush",
            })) || [],
          lighting:
            system.lighting?.map((light: any, lightIndex: number) => ({
              id: light.id || `light-${index}-${lightIndex}`,
              type: light.type || "led-downlight",
              count: light.count || 1,
              location: light.location || "Unknown",
              circuit: light.circuit || "Lighting Circuit",
              wattage: parseFloat(light.wattage) || 12,
              controlType: light.controlType || "switch",
              emergency: light.emergency || false,
            })) || [],
          distributionBoards:
            system.panels?.map((panel: any, panelIndex: number) => ({
              id: panel.id || `db-${index}-${panelIndex}`,
              type:
                panel.type === "main-distribution"
                  ? ("main" as const)
                  : ("sub" as const),
              circuits: panel.circuits || 12,
              rating: parseFloat(panel.rating) || 100,
              mounting: "flush" as const,
              accessories: panel.accessories || [],
            })) || [],
          protectionDevices: system.protectionDevices || [],
          voltage: parseFloat(system.voltage) || 230,
          isLumpsum: false,
        })) || prev.electrical_systems,
    }));
  }, [extractedPlan]);

  // ---------- Update handlers ----------
  const handleFinishesUpdate = useCallback(
    (updatedFinishes: FinishElement[]) => {
      const category =
        updatedFinishes.length > 0 ? updatedFinishes[0]?.category : null;
      if (category) {
        setFinishes((prev) => {
          const otherCategories = prev.filter((f) => f.category !== category);
          return [...otherCategories, ...updatedFinishes];
        });
        setQuoteData((prev: any) => ({
          ...prev,
          finishes_calculations: {
            ...prev.finishes_calculations,
            [category]:
              category === "ceiling"
                ? {
                    type: prev.finishes_calculations?.ceiling?.type || "gypsum",
                    items: updatedFinishes,
                  }
                : category === "internal-walling"
                  ? {
                      type:
                        prev.finishes_calculations?.internal_walls?.type ||
                        "painting",
                      items: updatedFinishes,
                    }
                  : category === "external-walling"
                    ? {
                        type:
                          prev.finishes_calculations?.external_walls?.type ||
                          "keying",
                        items: updatedFinishes,
                      }
                    : updatedFinishes,
          },
        }));
      }
    },
    [],
  );

  const handleCeilingTypeChange = useCallback(
    (ceilingType: "gypsum" | "painting" | "other") => {
      setQuoteData((prev: any) => ({
        ...prev,
        finishes_calculations: {
          ...prev.finishes_calculations,
          ceiling: {
            type: ceilingType,
            items: prev.finishes_calculations?.ceiling?.items || [],
          },
        },
      }));
    },
    [],
  );

  const handleInternalWallTypeChange = useCallback(
    (type: "painting" | "otherFinishes") => {
      setQuoteData((prev: any) => ({
        ...prev,
        finishes_calculations: {
          ...prev.finishes_calculations,
          internal_walls: {
            type,
            items: prev.finishes_calculations?.internal_walls?.items || [],
          },
        },
      }));
    },
    [],
  );

  const handleExternalWallTypeChange = useCallback(
    (type: "keying" | "plaster") => {
      setQuoteData((prev: any) => ({
        ...prev,
        finishes_calculations: {
          ...prev.finishes_calculations,
          external_walls: {
            type,
            items: prev.finishes_calculations?.external_walls?.items || [],
          },
        },
      }));
    },
    [],
  );

  const updatePercentageField = useCallback(
    (field: keyof any, value: number | string) => {
      setQuoteData((prev) => {
        const updatedPercentages =
          prev.percentages.length > 0
            ? prev.percentages.map((p, i) =>
                i === 0 ? { ...p, [field]: value } : p,
              )
            : [
                {
                  labour: 0,
                  overhead: 0,
                  profit: 0,
                  contingency: 0,
                  labourMode: "percent",
                  overheadMode: "percent",
                  profitMode: "percent",
                  contingencyMode: "percent",
                  unknownMode: "percent",
                  [field]: value,
                },
              ];

        const updates: Record<string, any> = {
          percentages: updatedPercentages,
        };
        // Keep backwards compatibility
        if (field === "labour" && typeof value === "number")
          updates.labor_percentages = value;
        if (field === "overhead" && typeof value === "number")
          updates.overhead_percentages = value;
        if (field === "profit" && typeof value === "number")
          updates.profit_percentages = value;
        if (field === "contingency" && typeof value === "number")
          updates.contingency_percentages = value;

        return { ...prev, ...updates };
      });
    },
    [],
  );

  // ---------- Navigation and calculation ----------
  const nextStep = useCallback(() => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Input invalid",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (currentStep < 10) {
      setDirection("right");
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === 10) {
        handleCalculate();
      }
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection("left");
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

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
      default:
        return true;
    }
  };

  const handleCalculate = useCallback(async () => {
    try {
      const result = await calculateQuote({
        user_id: quoteData.user_id,
        id: quoteData.id,
        title: quoteData.title,
        client_name: quoteData.client_name,
        client_email: quoteData.client_email,
        location: quoteData.location,
        status: quoteData.status,
        custom_specs: quoteData.custom_specs,
        qsSettings: quoteData.qsSettings,
        boq_data: quoteData.boq_data,
        foundationDetails: quoteData.foundationDetails,
        foundationWalls: quoteData.foundationWalls,
        floors: quoteData.floors,
        mortar_ratio: quoteData.mortar_ratio,
        concrete_mix_ratio: quoteData.concrete_mix_ratio,
        subcontractors: quoteData.subcontractors,
        percentages: quoteData.percentages,
        boqData,
        plaster_thickness:
          parseFloat(quoteData.plaster_thickness.toString()) || 0.012,
        include_wastage: quoteData.include_wastage,
        equipment: quoteData.equipment,
        electrical_systems: electricalSystems,
        plumbing_systems: plumbingSystems,
        finishes,
        roof_structures: roofStructure,
        earthwork,
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
        project_type: quoteData.project_type,
        equipment_costs: quoteData.equipment_costs,
        transport_costs: transportCost,
        earthwork_items: quoteData.earthwork_items,
        earthwork_total: quoteData.earthwork_total,
        additional_services_cost: quoteData.additional_services_cost,
        electrical_calculations: quoteData.electrical_calculations,
        roofing_calculations: quoteData.roofing_calculations,
        plumbing_calculations: quoteData.plumbing_calculations,
        finishes_calculations: quoteData.finishes_calculations,
        show_profit_to_client: quoteData.show_profit_to_client,
        house_type: quoteData.house_type,
        preliminaries,
        labor_percentages:
          parseFloat(quoteData.percentages[0]?.labour?.toString()) || 0,
        overhead_percentages:
          parseFloat(quoteData.percentages[0]?.overhead?.toString()) || 0,
        profit_percentages:
          parseFloat(quoteData.percentages[0]?.profit?.toString()) || 0,
        contingency_percentages:
          parseFloat(quoteData.percentages[0]?.contingency?.toString()) || 0,
        unknown_contingency_percentages:
          parseFloat(
            quoteData.percentages[0]?.unknown_contingency?.toString(),
          ) || 0,
        permit_cost: parseFloat(quoteData.permit_cost.toString()) || 0,
      } as any);
      setCalculation(result);
      toast({
        title: "Calculation Complete",
        description: "Quote has been calculated successfully",
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Failed to calculate quote - " + error,
        variant: "destructive",
      });
      console.error("Calculation error:", error);
    }
  }, [
    quoteData,
    electricalSystems,
    plumbingSystems,
    finishes,
    roofStructure,
    earthwork,
    boqData,
    preliminaries,
    transportCost,
    calculateQuote,
    toast,
  ]);

  const handleSaveQuote = useCallback(async () => {
    if (!calculation) {
      console.error("calculation is empty " + calculation);
      return;
    }
    try {
      if (quoteData.id) {
        await updateQuote(quoteData.id, {
          id: quoteData.id,
          title: quoteData.title,
          client_name: quoteData.client_name,
          client_email: quoteData.client_email || null,
          location: quoteData.location,
          region: quoteData.region,
          wallDimensions: quoteData.wallDimensions,
          wallSections: quoteData.wallSections,
          wallProperties: quoteData.wallProperties,
          foundationWalls: quoteData.foundationWalls,
          bar_schedule: quoteData.bar_schedule,
          foundationDetails: quoteData.foundationDetails,
          project_type: quoteData.project_type,
          custom_specs: quoteData.custom_specs || null,
          status: quoteData.status,
          preliminaries,
          house_type: quoteData.house_type,
          transport_costs: calculation.transport_cost,
          distance_km: calculation.distance_km,
          concrete_rows: quoteData.concrete_rows,
          materials_cost: Math.round(calculation.materials_cost),
          rebar_rows: quoteData.rebar_rows,
          boq_data: boqData,
          qsSettings: calculation.qsSettings,
          plan_file_url: quoteData.plan_file_url,
          total_area: quoteData.total_area,
          rebar_calculations: quoteData.rebar_calculations,
          labor_cost: Math.round(calculation.labor_cost),
          electrical_systems: quoteData.electrical_systems,
          plumbing_systems: quoteData.plumbing_systems,
          finishes: quoteData.finishes,
          roof_structures: quoteData.roof_structures,
          electrical_calculations: quoteData.electrical_calculations,
          roofing_calculations: quoteData.roofing_calculations,
          plumbing_calculations: quoteData.plumbing_calculations,
          bbs_file_url: quoteData.bbs_file_url,
          finishes_calculations: quoteData.finishes_calculations,
          additional_services_cost: Math.round(
            calculation.selected_services_cost,
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
          rebar_calculation_method: quoteData.rebar_calculation_method,
          plaster_thickness: quoteData.plaster_thickness,
          profit_amount: calculation.profit_amount,
          subcontractors: quoteData.subcontractors,
          earthwork_items: quoteData.earthwork_items,
          earthwork_total: quoteData.earthwork_total,
          unknown_contingency_amount: calculation.unknown_contingency_amount,
          percentages: calculation.percentages,
          materialPrices: materials,
          paintings_specifications: quoteData.paintings_specifications || [],
          paintings_totals: quoteData.paintings_totals || null,
        } as any);
        toast({
          title: "Quote Updated",
          description: "Quote has been updated successfully",
        });
        navigate("/dashboard");
      } else {
        const newQuote = await createQuote({
          title: quoteData.title,
          id: quoteData.id,
          client_name: quoteData.client_name,
          client_email: quoteData.client_email || null,
          location: quoteData.location,
          region: quoteData.region,
          project_type: quoteData.project_type,
          custom_specs: quoteData.custom_specs || null,
          status: "draft",
          wallDimensions: quoteData.wallDimensions,
          wallSections: quoteData.wallSections,
          wallProperties: quoteData.wallProperties,
          foundationWalls: quoteData.foundationWalls,
          bar_schedule: quoteData.bar_schedule,
          house_type: quoteData.house_type,
          transport_costs: calculation.transport_cost,
          total_area: quoteData.total_area,
          plan_file_url: quoteData.plan_file_url,
          boq_data: boqData,
          rebar_calculation_method: quoteData.rebar_calculation_method,
          preliminaries,
          electrical_calculations: quoteData.electrical_calculations,
          roofing_calculations: quoteData.roofing_calculations,
          plumbing_calculations: quoteData.plumbing_calculations,
          finishes_calculations: quoteData.finishes_calculations,
          distance_km: calculation.distance_km,
          materials_cost: Math.round(calculation.materials_cost),
          concrete_rows: quoteData.concrete_rows,
          unknown_contingency_amount: calculation.unknown_contingency_amount,
          rebar_rows: quoteData.rebar_rows,
          labor_cost: Math.round(calculation.labor_cost),
          qsSettings: calculation.qsSettings,
          electrical_systems: electricalSystems,
          bbs_file_url: quoteData.bbs_file_url,
          plumbing_systems: plumbingSystems,
          finishes,
          roof_structures: roofStructure,
          earthwork,
          additional_services_cost: Math.round(
            calculation.selected_services_cost,
          ),
          equipment_costs: Math.round(calculation.equipment_cost),
          total_amount: Math.round(calculation.total_amount),
          floors: quoteData.floors,
          concrete_materials: quoteData.concrete_materials,
          labor: calculation.labor,
          services: calculation.services,
          equipment: calculation.equipment,
          masonry_materials: quoteData.masonry_materials,
          earthwork_items: quoteData.earthwork_items,
          earthwork_total: quoteData.earthwork_total,
          rebar_calculations: quoteData.rebar_calculations,
          overhead_amount: calculation.overhead_amount,
          contingency_amount: calculation.contingency_amount,
          permit_cost: calculation.permit_cost,
          concrete_mix_ratio: quoteData.concrete_mix_ratio,
          plaster_thickness: quoteData.plaster_thickness,
          profit_amount: calculation.profit_amount,
          subcontractors: calculation.subcontractors,
          percentages: calculation.percentages,
          materialPrices: materials,
          paintings_specifications: quoteData.paintings_specifications || [],
          paintings_totals: quoteData.paintings_totals || null,
        } as any);

        // Create payment record
        if (newQuote && profile?.id) {
          try {
            const { quotePaymentService } =
              await import("@/services/quotePaymentService");
            await quotePaymentService.createQuotePayment(
              newQuote.id,
              profile.id,
              1000,
            );
          } catch (paymentError) {
            console.error("Error creating payment record:", paymentError);
          }
        }

        toast({
          title: "Quote Saved",
          description:
            "Quote saved! You can pay 1000 KSH to access it anytime.",
        });
        navigate("/quotes/all");
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Save Error",
        description: "Failed to save quote",
        variant: "destructive",
      });
    }
  }, [
    calculation,
    quoteData,
    electricalSystems,
    plumbingSystems,
    finishes,
    roofStructure,
    earthwork,
    boqData,
    preliminaries,
    materials,
    profile,
    updateQuote,
    createQuote,
    navigate,
    toast,
  ]);

  // ---------- Return all state and handlers ----------
  return {
    // Steps
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    substructureTab,
    setSubstructureTab,
    superstructureTab,
    setSuperstructureTab,
    finishesTab,
    setFinishesTab,
    extrasTab,
    setExtrasTab,
    countertopsTab,
    setCountertopsTab,
    wallingFinishesTab,
    setWallingFinishesTab,
    otherFinishesTab,
    setOtherFinishesTab,

    // Data
    quoteData,
    setQuoteData,
    materials,
    plumbingSystems,
    setPlumbingSystems,
    electricalSystems,
    setElectricalSystems,
    finishes,
    roofStructure,
    setRoofStructure,
    earthwork,
    setEarthWorks,
    wardrobes,
    setWardrobes,
    calculation,
    boqData,
    setBoqData,
    preliminaries,
    setPreliminaries,
    subContractors,
    transportRates,
    transportCost,
    calculationLoading,
    settingsLoading,
    equipmentRates,
    services,
    customEquipment,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    getEffectiveMaterialPrice,
    getEffectiveMaterialPriceSingle,

    // Handlers
    handleFinishesUpdate,
    handleCeilingTypeChange,
    handleInternalWallTypeChange,
    handleExternalWallTypeChange,
    updatePercentageField,
    nextStep,
    prevStep,
    handleCalculate,
    handleSaveQuote,
    validateStep,
  };
};
