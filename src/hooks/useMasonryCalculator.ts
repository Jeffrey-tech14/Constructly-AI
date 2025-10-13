import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Material } from "./useQuoteCalculations";
import { supabase } from "@/integrations/supabase/client";

export interface Door {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  type: string; // Panel | Flush | Metal
  count: number;
  frame: {
    type: string; // Wood | Steel | Aluminum
    price?: string;
  };
}

export interface Window {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  price?: string;
  custom: { height: string; width: string; price?: string };
  type: string; // Clear | Frosted | Tinted
  count: number;
  frame: {
    type: string; // Wood | Steel | Aluminum
    price?: string;
  };
}

export interface Room {
  roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string;
  length: string;
  height: string;
  customBlock: {
    length: string;
    height: string;
    thickness: string;
    price: string;
  };
  plaster: string; // "None" | "One Side" | "Both Sides"
  doors: Door[];
  windows: Window[];
  // Calculated values
  netArea?: number;
  netBlocks?: number;
  grossBlocks?: number;
  netMortar?: number;
  grossMortar?: number;
  netPlaster?: number;
  grossPlaster?: number;
  netCement?: number;
  grossCement?: number;
  netSand?: number;
  grossSand?: number;
  netWater?: number;
  grossWater?: number;
  totalCost?: number;
}

export interface MasonryQSSettings {
  wastageBlocksPercent: number;
  wastageCementPercent: number;
  wastageSandPercent: number;
  wastageWaterPercent: number;
  wastageStonePercent: number;
  clientProvidesWater: boolean;
  cementWaterRatio: string;
  sandMoistureContentPercent: number;
  otherSiteWaterAllowanceLM3: number;
  aggregateMoistureContentPercent: number;
  aggregateAbsorptionPercent: number;
  curingWaterRateLM2PerDay: number;
  curingDays: number;
  mortarJointThicknessM: number;
}

interface CalculationTotals {
  // Net Quantities (actual usage)
  netArea: number;
  netBlocks: number;
  netMortar: number;
  netPlaster: number;
  netCement: number;
  netSand: number;
  netWater: number;
  netDoors: number;
  netWindows: number;
  netDoorFrames: number;
  netWindowFrames: number;

  // Gross Quantities (with wastage)
  grossArea: number;
  grossBlocks: number;
  grossMortar: number;
  grossPlaster: number;
  grossCement: number;
  grossSand: number;
  grossWater: number;
  grossDoors: number;
  grossWindows: number;
  grossDoorFrames: number;
  grossWindowFrames: number;

  // Costs
  netBlocksCost: number;
  netMortarCost: number;
  netPlasterCost: number;
  netWaterCost: number;
  netDoorsCost: number;
  netWindowsCost: number;
  netDoorFramesCost: number;
  netWindowFramesCost: number;
  netOpeningsCost: number;
  netTotalCost: number;

  grossBlocksCost: number;
  grossMortarCost: number;
  grossPlasterCost: number;
  grossWaterCost: number;
  grossDoorsCost: number;
  grossWindowsCost: number;
  grossDoorFramesCost: number;
  grossWindowFramesCost: number;
  grossOpeningsCost: number;
  grossTotalCost: number;

  waterPrice: number;
  breakdown: any[];
}

export default function useMasonryCalculator({
  setQuote,
  quote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}) {
  const [results, setResults] = useState<CalculationTotals>({
    netArea: 0,
    netBlocks: 0,
    netMortar: 0,
    netPlaster: 0,
    netCement: 0,
    netSand: 0,
    netWater: 0,
    netDoors: 0,
    netWindows: 0,
    netDoorFrames: 0,
    netWindowFrames: 0,
    grossArea: 0,
    grossBlocks: 0,
    grossMortar: 0,
    grossPlaster: 0,
    grossCement: 0,
    grossSand: 0,
    grossWater: 0,
    grossDoors: 0,
    grossWindows: 0,
    grossDoorFrames: 0,
    grossWindowFrames: 0,
    netBlocksCost: 0,
    netMortarCost: 0,
    netPlasterCost: 0,
    netWaterCost: 0,
    netDoorsCost: 0,
    netWindowsCost: 0,
    netDoorFramesCost: 0,
    netWindowFramesCost: 0,
    netOpeningsCost: 0,
    netTotalCost: 0,
    grossBlocksCost: 0,
    grossMortarCost: 0,
    grossPlasterCost: 0,
    grossWaterCost: 0,
    grossDoorsCost: 0,
    grossWindowsCost: 0,
    grossDoorFramesCost: 0,
    grossWindowFramesCost: 0,
    grossOpeningsCost: 0,
    grossTotalCost: 0,
    waterPrice: 0,
    breakdown: [],
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const { user, profile } = useAuth();

  // Corrected constants with realistic values
  const MORTAR_PER_SQM = 0.003; // m³/m² of wall (3 liters/m²) - REALISTIC
  const PLASTER_THICKNESS = 0.015; // 15mm plaster thickness
  const CEMENT_PER_M3_MORTAR = 300; // kg/m³ of mortar (1:4 ratio)
  const SAND_PER_M3_MORTAR = 1.2; // m³/m³ of mortar (1:4 ratio)
  const CEMENT_PER_M3_PLASTER = 600; // kg/m³ of plaster
  const SAND_PER_M3_PLASTER = 1.8; // m³/m³ of plaster

  const CEMENT_DENSITY = 1440; // kg/m³
  const SAND_DENSITY = 1600; // kg/m³
  const CEMENT_BAG_KG = 50;

  const blockTypes = [
    {
      id: 1,
      name: "Standard Block",
      size: { length: 0.4, height: 0.2, thickness: 0.2 }, // 400x200x200mm
      volume: 0.016, // m³
    },
    {
      id: 2,
      name: "Half Block",
      size: { length: 0.4, height: 0.2, thickness: 0.1 }, // 400x200x100mm
      volume: 0.008, // m³
    },
    {
      id: 3,
      name: "Brick",
      size: { length: 0.225, height: 0.075, thickness: 0.1125 }, // 225x75x112.5mm
      volume: 0.0019, // m³
    },
    { id: 4, name: "Custom", size: null, volume: 0 },
  ];

  // Use rooms from quote
  const rooms = quote?.rooms ?? [];
  const qsSettings = quote?.qsSettings || {
    wastageBlocksPercent: 5,
    wastageCementPercent: 5,
    wastageSandPercent: 7,
    wastageWaterPercent: 10,
    wastageStonePercent: 5,
    clientProvidesWater: true,
    cementWaterRatio: "0.5",
    sandMoistureContentPercent: 4,
    otherSiteWaterAllowanceLM3: 5,
    aggregateMoistureContentPercent: 4,
    aggregateAbsorptionPercent: 1.5,
    curingWaterRateLM2PerDay: 5,
    curingDays: 3,
    mortarJointThicknessM: 0.01, // 10mm joint
  };

  const updateQsSettings = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuote((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuote]
  );

  const parseSize = useCallback((str: string): number => {
    if (!str) return 0;
    const cleaned = str.replace(/[×x]/g, "x").replace(/[^\d.x]/g, "");
    const [w, h] = cleaned.split("x").map((s) => parseFloat(s.trim()));
    if (isNaN(w) || isNaN(h)) return 0;
    return w * h;
  }, []);

  const parseCementWaterRatio = useCallback((ratio: string): number => {
    const parsed = parseFloat(ratio);
    return isNaN(parsed) || parsed <= 0 ? 0.5 : parsed;
  }, []);

  const validateRoomDimensions = useCallback((room: Room): boolean => {
    const length = Number(room.length);
    const width = Number(room.width);
    const height = Number(room.height);

    return [length, width, height].every(
      (dim) => !isNaN(dim) && dim > 0 && dim < 100
    );
  }, []);

  const getBlockCount = (room: Room): number => {
    const length = Number(room.length);
    const width = Number(room.width);
    const height = Number(room.height);
    const joint = qsSettings.mortarJointThicknessM;

    let blockLength = 0.225,
      blockHeight = 0.075; // default brick
    if (room.blockType !== "Custom") {
      const blockDef = blockTypes.find((b) => b.name === room.blockType);
      if (blockDef?.size) {
        blockLength = blockDef.size.length;
        blockHeight = blockDef.size.height;
      }
    } else {
      blockLength = Number(room.customBlock.length);
      blockHeight = Number(room.customBlock.height);
    }

    const effectiveBlockLength = blockLength + joint;
    const effectiveBlockHeight = blockHeight + joint;

    const perimeter = 2 * (length + width);
    const blocksPerCourse = Math.ceil(perimeter / effectiveBlockLength);
    const courses = Math.ceil(height / effectiveBlockHeight);

    return blocksPerCourse * courses;
  };

  const calculateWaterRequirements = useCallback(
    (
      cementQtyKg: number,
      sandQtyM3: number,
      currentQsSettings: MasonryQSSettings
    ): { waterMixingL: number; waterOtherL: number; totalWaterL: number } => {
      const ratio = parseCementWaterRatio(currentQsSettings.cementWaterRatio);

      // Water for cement hydration
      const hydrationWater = cementQtyKg * ratio;

      // Convert sand volume to mass for moisture calculation
      const sandMassKg = sandQtyM3 * SAND_DENSITY;
      const existingWaterInSand =
        sandMassKg * (currentQsSettings.sandMoistureContentPercent / 100);

      // Additional water needed (subtract water already in sand)
      const additionalWaterNeeded = Math.max(
        0,
        hydrationWater - existingWaterInSand
      );

      // Site water allowance
      const waterOtherL =
        (cementQtyKg / CEMENT_DENSITY) *
        currentQsSettings.otherSiteWaterAllowanceLM3 *
        1000;

      const totalWaterL = additionalWaterNeeded + waterOtherL;

      return {
        waterMixingL: additionalWaterNeeded,
        waterOtherL,
        totalWaterL,
      };
    },
    [parseCementWaterRatio]
  );

  const getBlockAreaWithJoint = useCallback(
    (room: Room): number => {
      const joint = qsSettings.mortarJointThicknessM;

      if (
        room.blockType === "Custom" &&
        room.customBlock?.length &&
        room.customBlock?.height
      ) {
        const l = Number(room.customBlock.length) + joint;
        const h = Number(room.customBlock.height) + joint;
        return l * h;
      }

      const blockDef = blockTypes.find((b) => b.name === room.blockType);
      if (blockDef?.size) {
        return (blockDef.size.length + joint) * (blockDef.size.height + joint);
      }

      // Default to brick size
      return (0.225 + joint) * (0.075 + joint);
    },
    [qsSettings.mortarJointThicknessM]
  );

  const calculateWallArea = useCallback(
    (room: Room): number => {
      if (!validateRoomDimensions(room)) return 0;

      const length = Number(room.length);
      const width = Number(room.width);
      const height = Number(room.height);

      // Calculate total wall area (excluding floor and ceiling)
      return (length * 2 + width * 2) * height;
    },
    [validateRoomDimensions]
  );

  const calculateOpeningsArea = useCallback(
    (room: Room): number => {
      let openingsArea = 0;

      // Doors area
      room.doors.forEach((door) => {
        const area =
          door.sizeType === "standard"
            ? parseSize(door.standardSize)
            : Number(door.custom.height) * Number(door.custom.width);
        openingsArea += (area || 0) * door.count;
      });

      // Windows area
      room.windows.forEach((window) => {
        const area =
          window.sizeType === "standard"
            ? parseSize(window.standardSize)
            : Number(window.custom.height) * Number(window.custom.width);
        openingsArea += (area || 0) * window.count;
      });

      return openingsArea;
    },
    [parseSize]
  );

  const getMaterialPrice = useCallback(
    (materialName: string, specificType?: string): number => {
      if (!materialBasePrices?.length) return 0;

      // Find the base material
      const material = materialBasePrices.find(
        (m) => m.name && m.name.toLowerCase() === materialName.toLowerCase()
      );

      if (!material) return 0;

      // Get user override if exists
      const userOverride = userMaterialPrices.find(
        (p) => p.material_id === material.id && p.region === userRegion
      );

      // Get effective material with applied regional multiplier
      const effectiveMaterial = getEffectiveMaterialPrice(
        material.id,
        userRegion,
        userOverride,
        materialBasePrices,
        regionalMultipliers
      );

      if (!effectiveMaterial) return 0;

      // Safe price extraction with validation
      try {
        if (effectiveMaterial.price_kes) {
          if (typeof effectiveMaterial.price_kes === "number") {
            return effectiveMaterial.price_kes;
          } else if (typeof effectiveMaterial.price_kes === "object") {
            const priceValues = Object.values(effectiveMaterial.price_kes);
            const price = priceValues[0] as number;
            return typeof price === "number" && !isNaN(price) ? price : 0;
          }
        }

        // Handle typed materials (blocks, doors, windows)
        if (effectiveMaterial.type?.length > 0) {
          const materialType = specificType
            ? effectiveMaterial.type.find(
                (t: any) => t.name === specificType || t.type === specificType
              )
            : effectiveMaterial.type[0];

          if (materialType?.price_kes) {
            if (typeof materialType.price_kes === "number") {
              return materialType.price_kes;
            } else if (typeof materialType.price_kes === "object") {
              const priceValues = Object.values(materialType.price_kes);
              const price = priceValues[0] as number;
              return typeof price === "number" && !isNaN(price) ? price : 0;
            }
          }
        }
      } catch (error) {
        console.error("Error extracting material price:", error);
      }

      return 0;
    },
    [
      materialBasePrices,
      userRegion,
      userMaterialPrices,
      regionalMultipliers,
      getEffectiveMaterialPrice,
    ]
  );

  // Room management functions
  const addRoom = () => {
    setQuote((prev) => ({
      ...prev,
      rooms: [
        ...(prev.rooms || []),
        {
          room_name: "",
          roomType: "",
          blockType: "",
          length: "",
          height: "",
          width: "",
          thickness: "",
          customBlock: { length: "", height: "", thickness: "", price: "" },
          plaster: "One Side",
          doors: [],
          windows: [],
        },
      ],
    }));
  };

  const removeRoom = (i: number) => {
    setQuote((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).filter((_, index) => index !== i),
    }));
  };

  const handleRoomChange = (i: number, field: keyof Room, value: any) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      if (!updatedRooms[i]) return prev;

      updatedRooms[i] = {
        ...updatedRooms[i],
        [field]: value,
      };

      return { ...prev, rooms: updatedRooms };
    });
  };

  const handleNestedChange = (
    i: number,
    field: "doors" | "windows",
    idx: number,
    key: string,
    value: any
  ) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      const roomCopy = {
        ...updatedRooms[i],
        [field]: [...updatedRooms[i][field]],
      };

      const nestedItem = { ...roomCopy[field][idx] };

      if (key.startsWith("frame.")) {
        const subKey = key.split(".")[1];
        nestedItem.frame = { ...nestedItem.frame, [subKey]: value };
      } else if (key === "frame") {
        nestedItem.frame = { ...nestedItem.frame, ...value };
      } else {
        nestedItem[key] = value;
      }

      roomCopy[field][idx] = nestedItem;
      updatedRooms[i] = roomCopy;

      return { ...prev, rooms: updatedRooms };
    });
  };

  const addDoor = (i: number) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      const roomCopy = { ...updatedRooms[i] };

      roomCopy.doors = [
        ...(roomCopy.doors || []),
        {
          sizeType: "",
          standardSize: "",
          custom: { height: "", width: "", price: "" },
          type: "",
          count: 1,
          frame: { type: "", price: "" },
        },
      ];

      updatedRooms[i] = roomCopy;
      return { ...prev, rooms: updatedRooms };
    });
  };

  const addWindow = (i: number) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      const roomCopy = { ...updatedRooms[i] };

      roomCopy.windows = [
        ...(roomCopy.windows || []),
        {
          sizeType: "",
          standardSize: "",
          custom: { height: "", width: "", price: "" },
          type: "",
          count: 1,
          frame: { type: "", price: "" },
        },
      ];

      updatedRooms[i] = roomCopy;
      return { ...prev, rooms: updatedRooms };
    });
  };

  const removeNested = (i: number, field: "doors" | "windows", idx: number) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      updatedRooms[i][field].splice(idx, 1);
      return { ...prev, rooms: updatedRooms };
    });
  };

  const removeEntry = (
    roomIndex: number,
    type: "doors" | "windows",
    entryIndex: number
  ) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      if (type === "doors") {
        updatedRooms[roomIndex].doors = updatedRooms[roomIndex].doors.filter(
          (_, i) => i !== entryIndex
        );
      } else {
        updatedRooms[roomIndex].windows = updatedRooms[
          roomIndex
        ].windows.filter((_, i) => i !== entryIndex);
      }
      return { ...prev, rooms: updatedRooms };
    });
  };

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;

    const { data: baseMaterials, error: baseError } = await supabase
      .from("material_base_prices")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base materials error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const merged =
      baseMaterials?.map((material) => {
        const userRegion = profile?.location || "Nairobi";
        const userRate = overrides?.find(
          (o) => o.material_id === material.id && o.region === userRegion
        );
        const multiplier =
          regionalMultipliers.find((r) => r.region === userRegion)
            ?.multiplier || 1;
        const materialP = (material.price || 0) * multiplier;
        const price = userRate ? userRate.price : materialP ?? 0;

        return {
          ...material,
          price,
          source: userRate ? "user" : material.price != null ? "base" : "none",
        };
      }) || [];

    setMaterials(merged);
  }, [profile, regionalMultipliers]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  const calculateMasonry = useCallback(() => {
    if (!rooms.length || !rooms.some(validateRoomDimensions)) return;

    const currentQsSettings = quote?.qsSettings || qsSettings;
    const waterPrice =
      materials.find((m) => m.name?.toLowerCase() === "water")?.price || 0;

    let totals: CalculationTotals = {
      netArea: 0,
      netBlocks: 0,
      netMortar: 0,
      netPlaster: 0,
      netCement: 0,
      netSand: 0,
      netWater: 0,
      netDoors: 0,
      netWindows: 0,
      netDoorFrames: 0,
      netWindowFrames: 0,
      grossArea: 0,
      grossBlocks: 0,
      grossMortar: 0,
      grossPlaster: 0,
      grossCement: 0,
      grossSand: 0,
      grossWater: 0,
      grossDoors: 0,
      grossWindows: 0,
      grossDoorFrames: 0,
      grossWindowFrames: 0,
      netBlocksCost: 0,
      netMortarCost: 0,
      netPlasterCost: 0,
      netWaterCost: 0,
      netDoorsCost: 0,
      netWindowsCost: 0,
      netDoorFramesCost: 0,
      netWindowFramesCost: 0,
      netOpeningsCost: 0,
      netTotalCost: 0,
      grossBlocksCost: 0,
      grossMortarCost: 0,
      grossPlasterCost: 0,
      grossWaterCost: 0,
      grossDoorsCost: 0,
      grossWindowsCost: 0,
      grossDoorFramesCost: 0,
      grossWindowFramesCost: 0,
      grossOpeningsCost: 0,
      grossTotalCost: 0,
      waterPrice,
      breakdown: [],
    };

    const updatedRooms = rooms.map((room, index) => {
      if (!validateRoomDimensions(room)) {
        return { ...room, totalCost: 0 };
      }

      const blockPrice = room.customBlock?.price
        ? Number(room.customBlock.price)
        : getMaterialPrice("Bricks", room.blockType);

      const cementPrice = getMaterialPrice("Cement") || 0;
      const sandPrice = getMaterialPrice("Sand") || 0;

      // Calculate areas
      const grossWallArea = calculateWallArea(room);
      const openingsArea = calculateOpeningsArea(room);
      const netWallArea = Math.max(0, grossWallArea - openingsArea);

      // Calculate blocks required
      const blockAreaWithJoint = getBlockAreaWithJoint(room);
      const netBlocks = getBlockCount(room);

      // Calculate mortar volume for blocks
      const netMortarVolume = netWallArea * MORTAR_PER_SQM;
      const netMortarCementKg = netMortarVolume * CEMENT_PER_M3_MORTAR;
      const netMortarSandM3 = netMortarVolume * SAND_PER_M3_MORTAR;

      // Calculate plaster
      let netPlasterArea = 0;
      if (room.plaster === "One Side") netPlasterArea = netWallArea;
      else if (room.plaster === "Both Sides") netPlasterArea = netWallArea * 2;

      const netPlasterVolume = netPlasterArea * PLASTER_THICKNESS;
      const netPlasterCementKg = netPlasterVolume * CEMENT_PER_M3_PLASTER;
      const netPlasterSandM3 = netPlasterVolume * SAND_PER_M3_PLASTER;

      // Total materials
      const totalNetCementKg = netMortarCementKg + netPlasterCementKg;
      const totalNetSandM3 = netMortarSandM3 + netPlasterSandM3;

      // Calculate water requirements
      const mortarWater = calculateWaterRequirements(
        netMortarCementKg,
        netMortarSandM3,
        currentQsSettings
      );
      const plasterWater = calculateWaterRequirements(
        netPlasterCementKg,
        netPlasterSandM3,
        currentQsSettings
      );
      const totalNetWater = mortarWater.totalWaterL + plasterWater.totalWaterL;

      // Calculate openings costs
      let netDoors = 0,
        netWindows = 0,
        netDoorFrames = 0,
        netWindowFrames = 0;
      let netDoorsCost = 0,
        netWindowsCost = 0,
        netDoorFramesCost = 0,
        netWindowFramesCost = 0;

      room.doors.forEach((door) => {
        netDoors += door.count;
        const doorPrice = door.custom?.price
          ? Number(door.custom.price)
          : getMaterialPrice("Doors", door.type);
        const framePrice = door.frame?.price
          ? Number(door.frame.price)
          : getMaterialPrice("Door Frames", door.frame.type);

        netDoorsCost += doorPrice * door.count;
        netDoorFramesCost += framePrice * door.count;
        netDoorFrames += door.count;
      });

      room.windows.forEach((window) => {
        netWindows += window.count;
        const windowPrice = window.custom?.price
          ? Number(window.custom.price)
          : getMaterialPrice("Windows", window.type);
        const framePrice = window.frame?.price
          ? Number(window.frame.price)
          : getMaterialPrice("Window Frames", window.frame.type);

        netWindowsCost += windowPrice * window.count;
        netWindowFramesCost += framePrice * window.count;
        netWindowFrames += window.count;
      });

      const netOpeningsCost =
        netDoorsCost + netWindowsCost + netDoorFramesCost + netWindowFramesCost;

      // Apply wastage for gross quantities
      const grossBlocks = Math.ceil(
        netBlocks * (1 + currentQsSettings.wastageBlocksPercent / 100)
      );
      const grossCementKg =
        Math.ceil(
          totalNetCementKg * (1 + currentQsSettings.wastageCementPercent / 100)
        ) / CEMENT_BAG_KG;
      const grossSandM3 =
        totalNetSandM3 * (1 + currentQsSettings.wastageSandPercent / 100);
      const grossWater =
        totalNetWater * (1 + currentQsSettings.wastageWaterPercent / 100);

      const openingsWastagePercent = 2;
      const grossDoors = Math.ceil(
        netDoors * (1 + openingsWastagePercent / 100)
      );
      const grossWindows = Math.ceil(
        netWindows * (1 + openingsWastagePercent / 100)
      );
      const grossDoorFrames = Math.ceil(
        netDoorFrames * (1 + openingsWastagePercent / 100)
      );
      const grossWindowFrames = Math.ceil(
        netWindowFrames * (1 + openingsWastagePercent / 100)
      );

      // Calculate costs
      const netBlocksCost = netBlocks * blockPrice;
      const netMortarCost =
        (netMortarCementKg / CEMENT_BAG_KG) * cementPrice +
        netMortarSandM3 * sandPrice;
      const netPlasterCost =
        (netPlasterCementKg / CEMENT_BAG_KG) * cementPrice +
        netPlasterSandM3 * sandPrice;
      const netWaterCost = currentQsSettings.clientProvidesWater
        ? 0
        : (totalNetWater / 1000) * waterPrice;
      const netRoomTotalCost =
        netBlocksCost +
        netMortarCost +
        netPlasterCost +
        netOpeningsCost +
        netWaterCost;

      const grossBlocksCost = grossBlocks * blockPrice;
      const grossMortarCost =
        (netMortarCementKg / CEMENT_BAG_KG) * cementPrice +
        netMortarSandM3 * sandPrice;
      const grossPlasterCost =
        (netPlasterCementKg / CEMENT_BAG_KG) * cementPrice +
        netPlasterSandM3 * sandPrice;
      const grossWaterCost = currentQsSettings.clientProvidesWater
        ? 0
        : (grossWater / 1000) * waterPrice;
      const grossDoorsCost =
        grossDoors * (netDoorsCost / Math.max(netDoors, 1));
      const grossWindowsCost =
        grossWindows * (netWindowsCost / Math.max(netWindows, 1));
      const grossDoorFramesCost =
        grossDoorFrames * (netDoorFramesCost / Math.max(netDoorFrames, 1));
      const grossWindowFramesCost =
        grossWindowFrames *
        (netWindowFramesCost / Math.max(netWindowFrames, 1));
      const grossOpeningsCost =
        grossDoorsCost +
        grossWindowsCost +
        grossDoorFramesCost +
        grossWindowFramesCost;
      const grossRoomTotalCost =
        grossBlocksCost +
        grossMortarCost +
        grossPlasterCost +
        grossOpeningsCost +
        grossWaterCost;

      // Update totals
      totals.netArea += netWallArea;
      totals.netBlocks += netBlocks;
      totals.netMortar += netMortarVolume;
      totals.netPlaster += netPlasterArea;
      totals.netCement += totalNetCementKg / CEMENT_BAG_KG;
      totals.netSand += totalNetSandM3;
      totals.netWater += totalNetWater;
      totals.netDoors += netDoors;
      totals.netWindows += netWindows;
      totals.netDoorFrames += netDoorFrames;
      totals.netWindowFrames += netWindowFrames;

      totals.grossArea += grossWallArea;
      totals.grossBlocks += grossBlocks;
      totals.grossMortar += netMortarVolume;
      totals.grossPlaster += netPlasterArea;
      totals.grossCement += grossCementKg;
      totals.grossSand += grossSandM3;
      totals.grossWater += grossWater;
      totals.grossDoors += grossDoors;
      totals.grossWindows += grossWindows;
      totals.grossDoorFrames += grossDoorFrames;
      totals.grossWindowFrames += grossWindowFrames;

      totals.netBlocksCost += netBlocksCost;
      totals.netMortarCost += netMortarCost;
      totals.netPlasterCost += netPlasterCost;
      totals.netWaterCost += netWaterCost;
      totals.netDoorsCost += netDoorsCost;
      totals.netWindowsCost += netWindowsCost;
      totals.netDoorFramesCost += netDoorFramesCost;
      totals.netWindowFramesCost += netWindowFramesCost;
      totals.netOpeningsCost += netOpeningsCost;
      totals.netTotalCost += netRoomTotalCost;

      totals.grossBlocksCost += grossBlocksCost;
      totals.grossMortarCost += grossMortarCost;
      totals.grossPlasterCost += grossPlasterCost;
      totals.grossWaterCost += grossWaterCost;
      totals.grossDoorsCost += grossDoorsCost;
      totals.grossWindowsCost += grossWindowsCost;
      totals.grossDoorFramesCost += grossDoorFramesCost;
      totals.grossWindowFramesCost += grossWindowFramesCost;
      totals.grossOpeningsCost += grossOpeningsCost;
      totals.grossTotalCost += grossRoomTotalCost;

      totals.breakdown.push({
        roomIndex: index + 1,
        roomType: room.roomType,
        room_name: room.room_name,
        grossWallArea,
        openingsArea,
        netPlasterArea,
        netWallArea,
        netBlocks,
        grossBlocks,
        totalCost: grossRoomTotalCost,
      });

      return {
        ...room,
        netArea: netWallArea,
        netBlocks,
        grossBlocks,
        netMortar: netMortarVolume,
        netPlaster: netPlasterArea,
        netCement: totalNetCementKg / CEMENT_BAG_KG,
        netSand: totalNetSandM3,
        netWater: totalNetWater,
        totalCost: grossRoomTotalCost,
      };
    });

    setQuote((prev) => ({
      ...prev,
      masonry_materials: {
        ...totals,
        materials: [
          {
            type: "blocks",
            netQuantity: totals.netBlocks,
            grossQuantity: totals.grossBlocks,
            netCost: totals.netBlocksCost,
            grossCost: totals.grossBlocksCost,
            unit: "pcs",
          },
          {
            type: "mortar",
            netQuantity: totals.netMortar,
            grossQuantity: totals.grossMortar,
            netCost: totals.netMortarCost,
            grossCost: totals.grossMortarCost,
            unit: "m³",
          },
          {
            type: "plaster",
            netQuantity: totals.netPlaster,
            grossQuantity: totals.grossPlaster,
            netCost: totals.netPlasterCost,
            grossCost: totals.grossPlasterCost,
            unit: "m²",
          },
          {
            type: "doors",
            netQuantity: totals.netDoors,
            grossQuantity: totals.grossDoors,
            netCost: totals.netDoorsCost,
            grossCost: totals.grossDoorsCost,
            unit: "pcs",
          },
          {
            type: "windows",
            netQuantity: totals.netWindows,
            grossQuantity: totals.grossWindows,
            netCost: totals.netWindowsCost,
            grossCost: totals.grossWindowsCost,
            unit: "pcs",
          },
          ...(!currentQsSettings.clientProvidesWater
            ? []
            : [
                {
                  type: "water",
                  netQuantity: totals.netWater,
                  grossQuantity: totals.grossWater,
                  netCost: totals.netWaterCost,
                  grossCost: totals.grossWaterCost,
                  unit: "liters",
                },
              ]),
        ],
        clientProvidesWater: currentQsSettings.clientProvidesWater,
        cementWaterRatio: currentQsSettings.cementWaterRatio,
        waterPrice,
        summary: {
          netTotalCost: totals.netTotalCost,
          grossTotalCost: totals.grossTotalCost,
          totalWastageCost: totals.grossTotalCost - totals.netTotalCost,
          wastagePercentage:
            ((totals.grossTotalCost - totals.netTotalCost) /
              totals.netTotalCost) *
              100 || 0,
        },
      },
      rooms: updatedRooms,
    }));

    setResults(totals);
  }, [
    rooms,
    quote?.qsSettings,
    materials,
    validateRoomDimensions,
    getMaterialPrice,
    calculateWallArea,
    calculateOpeningsArea,
    getBlockAreaWithJoint,
    calculateWaterRequirements,
    setQuote,
    qsSettings,
  ]);

  useEffect(() => {
    if (quote?.rooms && quote.rooms.length > 0) {
      calculateMasonry();
    }
  }, [quote?.rooms, calculateMasonry]);

  return {
    rooms,
    addRoom,
    removeRoom,
    handleRoomChange,
    handleNestedChange,
    addDoor,
    addWindow,
    removeNested,
    removeEntry,
    materials,
    results,
    calculateMasonry,
    getMaterialPrice,
    materialBasePrices,
    qsSettings,
    updateQsSettings,
    waterPrice: results.waterPrice,
  };
}
