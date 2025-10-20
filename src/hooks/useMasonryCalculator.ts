import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Material } from "./useQuoteCalculations";
import { supabase } from "@/integrations/supabase/client";
import { REBAR_PROPERTIES, RebarSize } from "./useRebarCalculator";
import { useMaterialPrices } from "./useMaterialPrices";

type PriceMap = Record<RebarSize, number>;
export interface Door {
  sizeType: string;
  standardSize: string;
  price?: string;
  custom: {
    height: string;
    width: string;
    price?: string;
  };
  type: string;
  count: number;
  frame: {
    type: string;
    price?: string;
    sizeType: string; // "standard" | "custom"
    standardSize: string;
    height: string;
    width: string;
    custom: {
      height: string;
      width: string;
      price?: string;
    };
  };
}

export interface Window {
  sizeType: string;
  standardSize: string;
  price?: string;
  custom: {
    height: string;
    width: string;
    price?: string;
  };
  type: string;
  count: number;
  frame: {
    type: string;
    price?: string;
    sizeType: string; // "standard" | "custom"
    standardSize: string;
    height: string;
    width: string;
    custom: {
      height: string;
      width: string;
      price?: string;
    };
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
  plaster: string;
  doors: Door[];
  windows: Window[];
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

// Add the new interfaces for professional elements
export interface Lintel {
  length: number;
  width: number;
  depth: number;
  reinforcement: number; // kg of rebar
  concrete: number; // m³
}

export interface Reinforcement {
  bedJoint: {
    length: number; // meters
    spacing: number; // courses
  };
  verticalReinforcement: {
    bars: number;
    length: number; // meters per bar
  };
}

export interface DPC {
  length: number; // meters
  width: number; // meters
  material: string;
}

export interface MovementJoint {
  length: number;
  material: string;
  sealant: number; // liters
}

export interface Scaffolding {
  area: number; // m²
  duration: number; // days;
}

export interface WasteRemoval {
  volume: number; // m³
  skipHire: number;
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

  // New professional settings
  includesLintels: boolean;
  includesReinforcement: boolean;
  includesDPC: boolean;
  includesScaffolding: boolean;
  includesMovementJoints: boolean;
  includesWasteRemoval: boolean;
  lintelDepth: number; // meters
  lintelWidth: number; // meters
  reinforcementSpacing: number; // courses between bed joint reinforcement
  verticalReinforcementSpacing: number; // meters between vertical bars
  DPCWidth: number; // meters
  movementJointSpacing: number; // meters between joints
  scaffoldingDailyRate: number;
  wasteRemovalRate: number; // per m³

  concreteMixRatio: string; // e.g., "1:2:4"
  concreteWaterCementRatio: number;
  lintelRebarSize: RebarSize;
  verticalRebarSize: RebarSize;
  bedJointRebarSize: RebarSize;
}
export const REBAR_WEIGHTS: Record<RebarSize, number> = {
  Y8: 0.395,
  Y10: 0.617,
  Y12: 0.888,
  Y16: 1.579,
  Y20: 2.466,
  Y25: 3.855,
};

interface CalculationTotals {
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
  netConcrete: number;
  grossConcrete: number;
  netConcreteCement: number;
  grossConcreteCement: number;
  netConcreteSand: number;
  grossConcreteSand: number;
  netReinforcementKg: number;
  netReinforcementBars: number;
  grossReinforcementKg: number;
  grossReinforcementBars: number;
  netConcreteBallast: number;
  netDPC: number;
  grossDPC: number;
  netSealantLiters: number;
  grossSealantLiters: number;
  grossConcreteBallast: number;
  netConcreteWater: number;
  grossConcreteWater: number;
  breakdown: any[];
  netLintelsCost: number;
  grossLintelsCost: number;
  netLintelRebar: number;
  grossLintelRebar: number;
  netLintelRebarCost: number;
  grossLintelRebarCost: number;
  netWallRebar: number;
  grossWallRebar: number;
  netWallRebarCost: number;
  grossWallRebarCost: number;
  netDPCArea: number;
  grossDPCArea: number;
  netDPCCost: number;
  grossDPCCost: number;
  netMovementJoints: number;
  grossMovementJoints: number;
  netMovementJointsCost: number;
  grossMovementJointsCost: number;
  netScaffoldingArea: number;
  grossScaffoldingArea: number;
  netScaffoldingCost: number;
  grossScaffoldingCost: number;
  netWasteVolume: number;
  grossWasteVolume: number;
  netWasteRemovalCost: number;
  grossWasteRemovalCost: number;
  professionalElementsTotalCost: number;
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
    netReinforcementKg: 0,
    netReinforcementBars: 0,
    grossReinforcementKg: 0,
    grossReinforcementBars: 0,
    netDPC: 0,
    grossDPC: 0,
    netSealantLiters: 0,
    grossSealantLiters: 0,
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
    netConcrete: 0,
    grossConcrete: 0,
    netConcreteCement: 0,
    grossConcreteCement: 0,
    netConcreteSand: 0,
    grossConcreteSand: 0,
    netConcreteBallast: 0,
    grossConcreteBallast: 0,
    netConcreteWater: 0,
    grossConcreteWater: 0,
    breakdown: [],
    netLintelsCost: 0,
    grossLintelsCost: 0,
    netLintelRebar: 0,
    grossLintelRebar: 0,
    netLintelRebarCost: 0,
    grossLintelRebarCost: 0,
    netWallRebar: 0,
    grossWallRebar: 0,
    netWallRebarCost: 0,
    grossWallRebarCost: 0,
    netDPCArea: 0,
    grossDPCArea: 0,
    netDPCCost: 0,
    grossDPCCost: 0,
    netMovementJoints: 0,
    grossMovementJoints: 0,
    netMovementJointsCost: 0,
    grossMovementJointsCost: 0,
    netScaffoldingArea: 0,
    grossScaffoldingArea: 0,
    netScaffoldingCost: 0,
    grossScaffoldingCost: 0,
    netWasteVolume: 0,
    grossWasteVolume: 0,
    netWasteRemovalCost: 0,
    grossWasteRemovalCost: 0,
    professionalElementsTotalCost: 0,
  });

  const { user, profile } = useAuth();
  const MORTAR_PER_SQM = 0.003;
  const PLASTER_THICKNESS = 0.015;
  const CEMENT_PER_M3_MORTAR = 300;
  const SAND_PER_M3_MORTAR = 1.2;
  const CEMENT_PER_M3_PLASTER = 600;
  const SAND_PER_M3_PLASTER = 1.8;
  const CEMENT_DENSITY = 1440;
  const SAND_DENSITY = 1600;
  const CEMENT_BAG_KG = 50;
  const qsSettings = quote?.qsSettings;
  const blockTypes = [
    {
      id: 1,
      name: "Standard Block",
      size: { length: 0.4, height: 0.2, thickness: 0.2 },
      volume: 0.016,
    },
    {
      id: 2,
      name: "Half Block",
      size: { length: 0.4, height: 0.2, thickness: 0.1 },
      volume: 0.008,
    },
    {
      id: 3,
      name: "Brick",
      size: { length: 0.225, height: 0.075, thickness: 0.1125 },
      volume: 0.0019,
    },
    { id: 4, name: "Custom", size: null, volume: 0 },
  ];
  const rooms = quote?.rooms ?? [];
  const [rebarPrices, setRebarPrices] = useState<PriceMap>({} as PriceMap);
  const [priceMap, setPriceMap] = useState<PriceMap>({} as PriceMap);
  const [bindingWirePrice, setBindingWirePrice] = useState<number>(0);
  const [materials, setMaterials] = useState<Material[]>([]);

  const parseConcreteMixRatio = useCallback((ratio: string) => {
    const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { cement: 1, sand: 2, ballast: 4 }; // Default ratio
    }
    return { cement: parts[0], sand: parts[1], ballast: parts[2] };
  }, []);

  // Calculate concrete materials per m³
  const calculateConcreteMaterials = useCallback(
    (volume: number, mixRatio: string, waterCementRatio: number) => {
      const ratio = parseConcreteMixRatio(mixRatio);
      const totalParts = ratio.cement + ratio.sand + ratio.ballast;

      // Calculate volumes (m³)
      const cementVolume = (ratio.cement / totalParts) * volume;
      const sandVolume = (ratio.sand / totalParts) * volume;
      const ballastVolume = (ratio.ballast / totalParts) * volume;

      // Convert cement volume to bags (1 bag = 0.035 m³)
      const cementBags = cementVolume / 0.035;

      // Calculate water (liters) based on cement weight
      const cementWeight = cementBags * 50; // 50kg per bag
      const waterLiters = cementWeight * waterCementRatio;

      return {
        cementBags,
        sand: sandVolume,
        ballast: ballastVolume,
        water: waterLiters,
      };
    },
    [parseConcreteMixRatio]
  );

  // Get rebar weight based on size
  const getRebarWeight = useCallback(
    (length: number, size: RebarSize): number => {
      return length * REBAR_WEIGHTS[size];
    },
    []
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
      blockHeight = 0.075;
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
    ): {
      waterMixingL: number;
      waterOtherL: number;
      totalWaterL: number;
    } => {
      const ratio = parseCementWaterRatio(currentQsSettings.cementWaterRatio);
      const hydrationWater = cementQtyKg * ratio;
      const sandMassKg = sandQtyM3 * SAND_DENSITY;
      const existingWaterInSand =
        sandMassKg * (currentQsSettings.sandMoistureContentPercent / 100);
      const additionalWaterNeeded = Math.max(
        0,
        hydrationWater - existingWaterInSand
      );
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
      return (length * 2 + width * 2) * height;
    },
    [validateRoomDimensions]
  );
  const calculateOpeningsArea = useCallback(
    (room: Room): number => {
      let openingsArea = 0;
      room.doors.forEach((door) => {
        const area =
          door.sizeType === "standard"
            ? parseSize(door.standardSize)
            : Number(door.custom.height) * Number(door.custom.width);
        openingsArea += (area || 0) * door.count;
      });
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
      if (!materialBasePrices || materialBasePrices.length === 0) return 0;

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
      else if (effectiveMaterial.name === "Bricks") {
        // For blocks/bricks, return the price of the first type or a specific type
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const blockType = specificType
            ? effectiveMaterial.type.find((t) => t.name === specificType) || 10
            : effectiveMaterial.type[0];

          return blockType?.price_kes || 10;
        }
      } else if (effectiveMaterial.name === "Doors") {
        // For doors, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const doorType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (doorType && doorType.price_kes) {
            return doorType?.price_kes || 0;
            // Return the first price in the price_kes object
          } else {
            return 0;
          }
        }
      } else if (effectiveMaterial.name === "Door Frames") {
        // For doors, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const doorFrameType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (doorFrameType && doorFrameType.price_kes) {
            return doorFrameType?.price_kes || 10;
            // Return the first price in the price_kes object
          } else {
            return 0;
          }
        }
      } else if (effectiveMaterial.name === "Windows") {
        // For windows, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const windowType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (windowType && windowType.price_kes) {
            // Return the first price in the price_kes object
            return windowType?.price_kes || 0;
          } else {
            return 0;
          }
        }
      } else if (effectiveMaterial.name === "Window Frames") {
        // For windows, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const windowFrameType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (windowFrameType && windowFrameType.price_kes) {
            // Return the first price in the price_kes object
            return windowFrameType?.price_kes || 0;
          } else {
            return (
              (Object.values(windowFrameType?.price_kes)[0] as number) || 0
            );
          }
        }
      } else {
        // For other materials with simple pricing
        return effectiveMaterial.price_kes || 0;
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

  // Add the calculation functions for professional elements
  const calculateLintels = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings
    ): {
      concrete: number;
      reinforcement: number;
      totalLength: number;
      formwork: number;
      materials: any; // concrete materials breakdown
    } => {
      if (!currentQsSettings.includesLintels)
        return {
          concrete: 0,
          reinforcement: 0,
          totalLength: 0,
          formwork: 0,
          materials: { cementBags: 0, sand: 0, ballast: 0, water: 0 },
        };

      let totalLength = 0;
      let formworkArea = 0;

      // Calculate lintels for doors
      room.doors.forEach((door) => {
        const width =
          door.sizeType === "standard"
            ? parseFloat(door.standardSize.split("×")[0]?.trim() || "0.9")
            : parseFloat(door.custom.width) || 0.9;
        const lintelLength = width + 0.3; // width + 150mm bearing each side
        totalLength += lintelLength;
        formworkArea +=
          lintelLength *
          (currentQsSettings.lintelDepth * 2 + currentQsSettings.lintelWidth);
      });

      // Calculate lintels for windows
      room.windows.forEach((window) => {
        const width =
          window.sizeType === "standard"
            ? parseFloat(window.standardSize.split("×")[0]?.trim() || "1.2")
            : parseFloat(window.custom.width) || 1.2;
        const lintelLength = width + 0.3; // width + 150mm bearing each side
        totalLength += lintelLength;
        formworkArea +=
          lintelLength *
          (currentQsSettings.lintelDepth * 2 + currentQsSettings.lintelWidth);
      });

      const concreteVolume =
        totalLength *
        currentQsSettings.lintelWidth *
        currentQsSettings.lintelDepth;

      // Calculate concrete materials
      const concreteMaterials = calculateConcreteMaterials(
        concreteVolume,
        currentQsSettings.concreteMixRatio,
        currentQsSettings.concreteWaterCementRatio
      );

      // Calculate reinforcement weight
      const reinforcementWeight =
        getRebarWeight(totalLength, currentQsSettings.lintelRebarSize) * 4; // 4 bars per lintel

      return {
        concrete: concreteVolume,
        reinforcement: reinforcementWeight,
        totalLength,
        formwork: formworkArea,
        materials: concreteMaterials,
      };
    },
    [calculateConcreteMaterials, getRebarWeight]
  );

  const calculateReinforcement = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings
    ): {
      bedJoint: number;
      vertical: number;
      bedJointWeight: number;
      verticalWeight: number;
    } => {
      if (!currentQsSettings.includesReinforcement)
        return {
          bedJoint: 0,
          vertical: 0,
          bedJointWeight: 0,
          verticalWeight: 0,
        };

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;
      const height = Number(room.height) || 0;

      if (!length || !width || !height)
        return {
          bedJoint: 0,
          vertical: 0,
          bedJointWeight: 0,
          verticalWeight: 0,
        };

      const perimeter = 2 * (length + width);
      const courses = Math.ceil(height / 0.2); // assuming 200mm block height

      // Bed joint reinforcement
      const bedJointLength =
        perimeter * Math.ceil(courses / currentQsSettings.reinforcementSpacing);
      const bedJointWeight = getRebarWeight(
        bedJointLength,
        currentQsSettings.bedJointRebarSize
      );

      // Vertical reinforcement
      const verticalBars = Math.ceil(
        perimeter / currentQsSettings.verticalReinforcementSpacing
      );
      const verticalLength = verticalBars * height;
      const verticalWeight = getRebarWeight(
        verticalLength,
        currentQsSettings.verticalRebarSize
      );

      return {
        bedJoint: bedJointLength,
        vertical: verticalLength,
        bedJointWeight,
        verticalWeight,
      };
    },
    [getRebarWeight]
  );

  const calculateDPC = useCallback(
    (room: Room, currentQsSettings: MasonryQSSettings): number => {
      if (!currentQsSettings.includesDPC) return 0;

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;

      if (!length || !width) return 0;

      const perimeter = 2 * (length + width);
      return perimeter * currentQsSettings.DPCWidth;
    },
    []
  );

  const calculateMovementJoints = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings
    ): { length: number; sealant: number } => {
      if (!currentQsSettings.includesMovementJoints)
        return { length: 0, sealant: 0 };

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;

      if (!length || !width) return { length: 0, sealant: 0 };

      const perimeter = 2 * (length + width);
      const joints = Math.ceil(
        perimeter / currentQsSettings.movementJointSpacing
      );
      const sealantVolume = joints * 0.01; // 10mm wide × 10mm deep × 1m long = 0.1 liter per meter

      return {
        length: joints,
        sealant: sealantVolume,
      };
    },
    []
  );

  const calculateScaffolding = useCallback(
    (room: Room, currentQsSettings: MasonryQSSettings): number => {
      if (!currentQsSettings.includesScaffolding) return 0;

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;
      const height = Number(room.height) || 0;

      if (!length || !width || !height) return 0;

      const wallArea = 2 * (length + width) * height;
      // Assume scaffolding is required for 7 days per room
      const scaffoldingCost =
        (wallArea * currentQsSettings.scaffoldingDailyRate * 7) / 100; // per m² per day

      return scaffoldingCost;
    },
    []
  );

  const calculateWasteRemoval = useCallback(
    (room: Room, currentQsSettings: MasonryQSSettings): number => {
      if (!currentQsSettings.includesWasteRemoval) return 0;

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;
      const height = Number(room.height) || 0;

      if (!length || !width || !height) return 0;

      const wallArea = 2 * (length + width) * height;
      // Assume 5% of materials become waste
      const wasteVolume = wallArea * 0.05 * 0.2; // 5% of wall volume (assuming 200mm thick)
      const wasteCost = wasteVolume * currentQsSettings.wasteRemovalRate;

      return wasteCost;
    },
    []
  );

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

  const getRebarPrice = useCallback(
    async (size: RebarSize): Promise<number> => {
      try {
        if (!profile?.id) return 0;

        let basePrice = 0;

        // Get base rebar price from material_base_prices
        const { data: baseMaterial, error: baseError } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("name", "Rebar")
          .single();

        if (baseError) {
          console.error("Error fetching base rebar price:", baseError);
          return 0;
        }

        if (baseMaterial?.type) {
          const rebarType = baseMaterial.type.find((t: any) => t.size === size);
          if (rebarType?.price_kes_per_kg) {
            basePrice = rebarType.price_kes_per_kg;
          }
        }

        // Check for user override
        const { data: userOverride, error: overrideError } = await supabase
          .from("user_material_prices")
          .select("type")
          .eq("user_id", profile.id)
          .eq("region", userRegion)
          .maybeSingle();

        if (!overrideError && userOverride?.type) {
          const userRebarType = userOverride.type.find(
            (t: any) => t.size === size
          );
          if (userRebarType?.price_kes_per_kg) {
            basePrice = userRebarType.price_kes_per_kg;
          }
        }

        // Apply regional multiplier
        const regionalMultiplier =
          regionalMultipliers.find((r) => r.region === userRegion)
            ?.multiplier || 1;

        return basePrice * regionalMultiplier;
      } catch (error) {
        console.error("Error getting rebar price:", error);
        return 0;
      }
    },
    [profile?.id, userRegion, regionalMultipliers]
  );

  useEffect(() => {
    const fetchAllRebarPrices = async () => {
      if (!profile?.id) return;

      const prices: PriceMap = {} as PriceMap;
      const rebarSizes: RebarSize[] = ["Y8", "Y10", "Y12", "Y16", "Y20", "Y25"];

      for (const size of rebarSizes) {
        const price = await getRebarPrice(size);
        prices[size] = price;
      }

      setRebarPrices(prices);
    };

    fetchAllRebarPrices();
  }, [getRebarPrice, profile?.id]);

  const calculateMasonry = useCallback(() => {
    if (!rooms.length || !rooms.some(validateRoomDimensions)) return;
    const currentQsSettings = quote?.qsSettings || qsSettings;
    const waterPrice =
      materials.find((m) => m.name?.toLowerCase() === "water")?.price || 0;

    const lintelRebarPrice =
      rebarPrices[currentQsSettings.lintelRebarSize] || 0;
    const verticalRebarPrice =
      rebarPrices[currentQsSettings.verticalRebarSize] || 0;
    const bedJointRebarPrice =
      rebarPrices[currentQsSettings.bedJointRebarSize] || 0;
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
      netReinforcementKg: 0,
      netReinforcementBars: 0,
      netDPC: 0,
      netSealantLiters: 0,
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

      netConcrete: 0,
      grossConcrete: 0,
      netConcreteCement: 0,
      grossConcreteCement: 0,
      netConcreteSand: 0,
      grossConcreteSand: 0,
      netConcreteBallast: 0,
      grossConcreteBallast: 0,
      netConcreteWater: 0,
      grossConcreteWater: 0,

      grossReinforcementKg: 0,
      grossReinforcementBars: 0,
      grossDPC: 0,
      grossSealantLiters: 0,
      waterPrice,
      breakdown: [],

      netLintelsCost: 0,
      grossLintelsCost: 0,
      netLintelRebar: 0,
      grossLintelRebar: 0,
      netLintelRebarCost: 0,
      grossLintelRebarCost: 0,
      netWallRebar: 0,
      grossWallRebar: 0,
      netWallRebarCost: 0,
      grossWallRebarCost: 0,
      netDPCArea: 0,
      grossDPCArea: 0,
      netDPCCost: 0,
      grossDPCCost: 0,
      netMovementJoints: 0,
      grossMovementJoints: 0,
      netMovementJointsCost: 0,
      grossMovementJointsCost: 0,
      netScaffoldingArea: 0,
      grossScaffoldingArea: 0,
      netScaffoldingCost: 0,
      grossScaffoldingCost: 0,
      netWasteVolume: 0,
      grossWasteVolume: 0,
      netWasteRemovalCost: 0,
      grossWasteRemovalCost: 0,
      professionalElementsTotalCost: 0,
    };

    const updatedRooms = rooms.map((room, index) => {
      if (!validateRoomDimensions(room)) {
        return { ...room, totalCost: 0 };
      }
      const blockPrice = room.customBlock?.price
        ? Number(room.customBlock.price)
        : getMaterialPrice("Bricks", room.blockType);
      const cementPrice = materials.find(
        (m) => m.name?.toLowerCase() === "cement"
      )?.price;
      const sandPrice = materials.find(
        (m) => m.name?.toLowerCase() === "sand"
      )?.price;
      const ballastMat = materials.find(
        (m) => m.name?.toLowerCase() === "ballast"
      );
      const aggregateMat = materials.find(
        (m) => m.name?.toLowerCase() === "aggregate"
      );
      const formworkMat = materials.find(
        (m) => m.name?.toLowerCase() === "formwork"
      );
      const waterMat = materials.find((m) => m.name?.toLowerCase() === "water");
      const grossWallArea = calculateWallArea(room);
      const openingsArea = calculateOpeningsArea(room);
      const netWallArea = Math.max(0, grossWallArea - openingsArea);
      const blockAreaWithJoint = getBlockAreaWithJoint(room);
      const netBlocks = getBlockCount(room);
      const netMortarVolume = netWallArea * MORTAR_PER_SQM;
      const netMortarCementKg = netMortarVolume * CEMENT_PER_M3_MORTAR;
      const netMortarSandM3 = netMortarVolume * SAND_PER_M3_MORTAR;
      let netPlasterArea = 0;
      if (room.plaster === "One Side") netPlasterArea = netWallArea;
      else if (room.plaster === "Both Sides") netPlasterArea = netWallArea * 2;
      const netPlasterVolume = netPlasterArea * PLASTER_THICKNESS;
      const netPlasterCementKg = netPlasterVolume * CEMENT_PER_M3_PLASTER;
      const netPlasterSandM3 = netPlasterVolume * SAND_PER_M3_PLASTER;
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

        const doorLeafPrice = door.custom?.price
          ? Number(door.custom.price)
          : getMaterialPrice("Doors", door.type);

        const doorPrice = door.custom?.price
          ? Number(door.custom.price)
          : doorLeafPrice[door.standardSize];

        const frameLeafPrice =
          getMaterialPrice("Door Frames", door.frame?.type) || "Wood";

        const framePrice = door.frame?.custom?.price
          ? Number(door.frame?.custom?.price)
          : frameLeafPrice[door.frame.standardSize];

        if (door.frame?.custom?.price) {
          door.frame.custom.price = framePrice;
        } else {
          door.frame.price = framePrice;
        }
        if (door.custom?.price) {
          door.custom.price = doorPrice;
        } else {
          door.price = doorPrice;
        }
        netDoorsCost += doorPrice * door.count;
        netDoorFramesCost += framePrice * door.count;
        netDoorFrames += door.count;
      });
      room.windows.forEach((window) => {
        netWindows += window.count;

        const windowLeafPrice = window.custom?.price
          ? Number(window.custom.price)
          : getMaterialPrice("Windows", window.type);

        const windowPrice = window.custom?.price
          ? Number(window.custom.price)
          : windowLeafPrice[window.standardSize];

        const frameLeafPrice =
          getMaterialPrice("window Frames", window.frame?.type) || "Wood";

        const framePrice = window.frame?.custom?.price
          ? Number(window.frame?.custom?.price)
          : frameLeafPrice[window.frame.standardSize];

        if (window.frame?.custom?.price) {
          window.frame.custom.price = framePrice;
        } else {
          window.frame.price = framePrice;
        }
        if (window.custom?.price) {
          window.custom.price = windowPrice;
        } else {
          window.price = windowPrice;
        }
        netWindowsCost += windowPrice * window.count;
        netWindowFramesCost += framePrice * window.count;
        netWindowFrames += window.count;
      });
      const netOpeningsCost =
        netDoorsCost + netWindowsCost + netDoorFramesCost + netWindowFramesCost;
      const grossBlocks = Math.ceil(
        netBlocks * (1 + currentQsSettings.wastageBlocksPercent / 100)
      );
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
      const netBlocksCost = netBlocks * blockPrice;
      const netMortarCost =
        (netMortarCementKg / CEMENT_BAG_KG) * cementPrice +
        netMortarSandM3 * sandPrice;
      const netPlasterCost =
        (netPlasterCementKg / CEMENT_BAG_KG) * cementPrice +
        netPlasterSandM3 * sandPrice;
      // Calculate professional QS elements
      const lintels = calculateLintels(room, currentQsSettings);
      const reinforcement = calculateReinforcement(room, currentQsSettings);
      const dpcArea = calculateDPC(room, currentQsSettings);
      const movementJoints = calculateMovementJoints(room, currentQsSettings);
      const scaffoldingCost = calculateScaffolding(room, currentQsSettings);
      const wasteRemovalCost = calculateWasteRemoval(room, currentQsSettings);

      const dpcPrice = getMaterialPrice("DPC", "Polyethylene");
      const sealantPrice = getMaterialPrice("Sealant", "Polyurethane");

      // Calculate costs for lintels
      const lintelsConcreteCost =
        (lintels.materials.cementBags * cementPrice || 0) +
        (lintels.materials.sand * sandPrice || 0) +
        (lintels.materials.ballast * ballastMat?.price || 0) +
        ((lintels.materials.water / 1000) * waterPrice || 0); // Convert liters to m³

      const lintelsReinforcementCost = lintels.reinforcement * lintelRebarPrice;

      // Calculate costs for reinforcement
      const reinforcementCost =
        reinforcement.bedJointWeight * bedJointRebarPrice +
        reinforcement.verticalWeight * verticalRebarPrice;

      const dpcCost = dpcArea * dpcPrice;
      const movementJointsCost = movementJoints.sealant * sealantPrice;

      const totalNetWater =
        mortarWater.totalWaterL +
        plasterWater.totalWaterL +
        lintels.materials.water;
      const totalNetCementKg =
        netMortarCementKg + netPlasterCementKg + lintels.materials.cementBags;
      const totalNetSandM3 =
        netMortarSandM3 + netPlasterSandM3 + lintels.materials.sand;

      // Add to room totals
      const professionalElementsCost =
        lintelsConcreteCost +
        lintelsReinforcementCost +
        reinforcementCost +
        dpcCost +
        movementJointsCost +
        scaffoldingCost +
        wasteRemovalCost;

      const netWaterCost = currentQsSettings.clientProvidesWater
        ? 0
        : (totalNetWater / 1000) * waterPrice;

      const netRoomTotalCost =
        netBlocksCost +
        netMortarCost +
        netPlasterCost +
        netOpeningsCost +
        netWaterCost +
        professionalElementsCost;

      const grossCementKg =
        Math.ceil(
          totalNetCementKg * (1 + currentQsSettings.wastageCementPercent / 100)
        ) / CEMENT_BAG_KG;
      const grossSandM3 =
        totalNetSandM3 * (1 + currentQsSettings.wastageSandPercent / 100);
      const grossWater =
        totalNetWater * (1 + currentQsSettings.wastageWaterPercent / 100);

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
        grossWaterCost +
        professionalElementsCost;
      totals.netLintelsCost += lintelsConcreteCost;
      totals.grossLintelsCost += lintelsConcreteCost;

      totals.netLintelRebar += lintels.reinforcement;
      totals.grossLintelRebar += lintels.reinforcement;
      totals.netLintelRebarCost += lintelsReinforcementCost;
      totals.grossLintelRebarCost += lintelsReinforcementCost;

      totals.netWallRebar +=
        reinforcement.bedJointWeight + reinforcement.verticalWeight;
      totals.grossWallRebar +=
        reinforcement.bedJointWeight + reinforcement.verticalWeight;
      totals.netWallRebarCost += reinforcementCost;
      totals.grossWallRebarCost += reinforcementCost;

      totals.netDPCArea += dpcArea;
      totals.grossDPCArea += dpcArea;
      totals.netDPCCost += dpcCost;
      totals.grossDPCCost += dpcCost;

      totals.netMovementJoints += movementJoints.length;
      totals.grossMovementJoints += movementJoints.length;
      totals.netMovementJointsCost += movementJointsCost;
      totals.grossMovementJointsCost += movementJointsCost;

      // For scaffolding, calculate area (you might want to track this differently)
      const scaffoldingArea =
        2 * (Number(room.length) + Number(room.width)) * Number(room.height);
      totals.netScaffoldingArea += scaffoldingArea;
      totals.grossScaffoldingArea += scaffoldingArea;
      totals.netScaffoldingCost += scaffoldingCost;
      totals.grossScaffoldingCost += scaffoldingCost;

      // For waste, calculate volume
      const wasteVolume = scaffoldingArea * 0.05 * 0.2; // Same calculation as in calculateWasteRemoval
      totals.netWasteVolume += wasteVolume;
      totals.grossWasteVolume += wasteVolume;
      totals.netWasteRemovalCost += wasteRemovalCost;
      totals.grossWasteRemovalCost += wasteRemovalCost;

      // Total professional elements cost
      const roomProfessionalElementsCost = professionalElementsCost;
      totals.professionalElementsTotalCost += roomProfessionalElementsCost;
      totals.netArea += netWallArea;
      totals.netBlocks += netBlocks;
      totals.netMortar += netMortarVolume;
      totals.netPlaster += netPlasterArea;
      totals.netCement += totalNetCementKg;
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
        professionalElements: {
          lintels: {
            concreteVolume: lintels.concrete,
            cementBags: lintels.materials.cementBags,
            sandM3: lintels.materials.sand,
            ballastM3: lintels.materials.ballast,
            waterL: lintels.materials.water,
            reinforcementKg: lintels.reinforcement,
            cost: lintelsConcreteCost + lintelsReinforcementCost,
          },
          reinforcement: {
            bedJointKg: reinforcement.bedJointWeight,
            verticalKg: reinforcement.verticalWeight,
            cost: reinforcementCost,
          },
          dpc: { areaM2: dpcArea, cost: dpcCost },
          sealant: { liters: movementJoints.sealant, cost: movementJointsCost },
          scaffolding: { cost: scaffoldingCost },
          wasteRemoval: { cost: wasteRemovalCost },
        },
      });
      return {
        ...room,
        netArea: netWallArea,
        netBlocks,
        grossBlocks,
        blockCost: grossBlocksCost,
        blockRate: blockPrice,
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
            unit: "m\u00B3",
          },
          {
            type: "plaster",
            netQuantity: totals.netPlaster,
            grossQuantity: totals.grossPlaster,
            netCost: totals.netPlasterCost,
            grossCost: totals.grossPlasterCost,
            unit: "m\u00B2",
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
          {
            type: "door_frames",
            netQuantity: totals.netDoorFrames,
            grossQuantity: totals.grossDoorFrames,
            netCost: totals.netDoorFramesCost,
            grossCost: totals.grossDoorFramesCost,
            unit: "pcs",
          },
          {
            type: "window_frames",
            netQuantity: totals.netWindowFrames,
            grossQuantity: totals.grossWindowFrames,
            netCost: totals.netWindowFramesCost,
            grossCost: totals.grossWindowFramesCost,
            unit: "pcs",
          },
          // New professional elements
          {
            type: "concrete_lintels",
            netQuantity: totals.netConcrete,
            grossQuantity: totals.grossConcrete,
            netCost: totals.netLintelsCost || 0,
            grossCost: totals.grossLintelsCost || 0,
            unit: "m\u00B3",
          },
          {
            type: "lintel_reinforcement",
            netQuantity: totals.netLintelRebar || 0,
            grossQuantity: totals.grossLintelRebar || 0,
            netCost: totals.netLintelRebarCost || 0,
            grossCost: totals.grossLintelRebarCost || 0,
            unit: "kg",
          },
          {
            type: "wall_reinforcement",
            netQuantity: totals.netWallRebar || 0,
            grossQuantity: totals.grossWallRebar || 0,
            netCost: totals.netWallRebarCost || 0,
            grossCost: totals.grossWallRebarCost || 0,
            unit: "kg",
          },
          {
            type: "dpc",
            netQuantity: totals.netDPCArea || 0,
            grossQuantity: totals.grossDPCArea || 0,
            netCost: totals.netDPCCost || 0,
            grossCost: totals.grossDPCCost || 0,
            unit: "m\u00B2",
          },
          {
            type: "movement_joints",
            netQuantity: totals.netMovementJoints || 0,
            grossQuantity: totals.grossMovementJoints || 0,
            netCost: totals.netMovementJointsCost || 0,
            grossCost: totals.grossMovementJointsCost || 0,
            unit: "m",
          },
          {
            type: "scaffolding",
            netQuantity: totals.netScaffoldingArea || 0,
            grossQuantity: totals.grossScaffoldingArea || 0,
            netCost: totals.netScaffoldingCost || 0,
            grossCost: totals.grossScaffoldingCost || 0,
            unit: "m\u00B2\u00B7days",
          },
          {
            type: "waste_removal",
            netQuantity: totals.netWasteVolume || 0,
            grossQuantity: totals.grossWasteVolume || 0,
            netCost: totals.netWasteRemovalCost || 0,
            grossCost: totals.grossWasteRemovalCost || 0,
            unit: "m\u00B3",
          },
          ...(!currentQsSettings.clientProvidesWater
            ? [
                {
                  type: "water",
                  netQuantity: totals.netWater,
                  grossQuantity: totals.grossWater,
                  netCost: totals.netWaterCost,
                  grossCost: totals.grossWaterCost,
                  unit: "liters",
                },
              ]
            : []),
        ],
        clientProvidesWater: currentQsSettings.clientProvidesWater,
        cementWaterRatio: currentQsSettings.cementWaterRatio,
        waterPrice,
        professionalElements: {
          includesLintels: currentQsSettings.includesLintels,
          includesReinforcement: currentQsSettings.includesReinforcement,
          includesDPC: currentQsSettings.includesDPC,
          includesScaffolding: currentQsSettings.includesScaffolding,
          includesMovementJoints: currentQsSettings.includesMovementJoints,
          includesWasteRemoval: currentQsSettings.includesWasteRemoval,
          totalCost: totals.professionalElementsTotalCost || 0,
        },
        summary: {
          netTotalCost: totals.netTotalCost,
          grossTotalCost: totals.grossTotalCost,
          totalWastageCost: totals.grossTotalCost - totals.netTotalCost,
          wastagePercentage:
            ((totals.grossTotalCost - totals.netTotalCost) /
              totals.netTotalCost) *
              100 || 0,
          professionalElementsBreakdown: {
            lintels: totals.netLintelsCost || 0,
            reinforcement:
              (totals.netLintelRebarCost || 0) + (totals.netWallRebarCost || 0),
            dpc: totals.netDPCCost || 0,
            movementJoints: totals.netMovementJointsCost || 0,
            scaffolding: totals.netScaffoldingCost || 0,
            wasteRemoval: totals.netWasteRemovalCost || 0,
          },
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
    calculateLintels,
    getRebarPrice,
    calculateReinforcement,
    calculateDPC,
    calculateMovementJoints,
    calculateScaffolding,
    calculateWasteRemoval,
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
    waterPrice: results.waterPrice,
  };
}
