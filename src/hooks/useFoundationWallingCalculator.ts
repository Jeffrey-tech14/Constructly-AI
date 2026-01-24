// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback } from "react";
import { MasonryQSSettings } from "./useMasonryCalculatorNew";

export interface FoundationWall {
  id: string;
  type: "external" | "internal"; // Wall type
  blockType: string; // e.g., "Concrete block"
  blockDimensions: string; // e.g., "0.4x0.2x0.2" (length x height x thickness)
  blockThickness: string; // mm - can differ for internal/external
  wallHeight: string; // meters
  wallLength: string; // meters (perimeter or individual length)
  numberOfWalls: string; // Number of walls of this type
  volume?: number; // Calculated volume (m³)
  blocks?: number; // Calculated block count
  blocksFeet?: number; // Linear feet of blocks
  mortarCement?: number; // Cement bags for mortar
  mortarSand?: number; // Sand volume (m³) for mortar
  totalCost?: number; // Total cost for blocks
}

export interface FoundationWallingRow {
  id: string;
  type: "external" | "internal";
  blockType: string;
  blockDimensions: string;
  blockThickness: string;
  wallHeight: string;
  wallLength: string;
  numberOfWalls: string;
  mortarRatio: string; // e.g., "1:4"
}

const MORTAR_RATIO_MAP = {
  "1:3": { cement: 1, sand: 3 },
  "1:4": { cement: 1, sand: 4 },
  "1:5": { cement: 1, sand: 5 },
  "1:6": { cement: 1, sand: 6 },
};

const MORTAR_DRY_VOLUME_FACTOR = 1.33;
const JOINT_THICKNESS_M = 0.01; // 10mm standard joint

/**
 * Parse masonry block dimensions from string format "L x H x T"
 * Returns dimensions in meters
 */
const parseBlockDimensions = (
  dimensionsStr: string,
): { length: number; height: number; thickness: number } => {
  const parts = dimensionsStr.split("x").map((p) => parseFloat(p.trim()));
  return {
    length: parts[0] || 0.4,
    height: parts[1] || 0.2,
    thickness: parts[2] || 0.2,
  };
};

/**
 * Calculate masonry wall quantities using CENTERLINE METHOD
 * Centerline method measures along the middle of the wall thickness
 * This is the standard method for foundation walls
 */
export const calculateFoundationWallingQuantities = (
  wallLength: number, // meters (outer perimeter)
  wallHeight: number, // meters
  wallThickness: number, // meters (individual block thickness)
  blockDimensions: string, // "L x H x T" format
  mortarRatio: string, // "1:3", "1:4", etc.
): {
  blocks: number;
  blocksFeet: number;
  mortarVolume: number;
  mortarCement: number;
  mortarSand: number;
} => {
  if (wallLength <= 0 || wallHeight <= 0 || wallThickness <= 0) {
    return {
      blocks: 0,
      blocksFeet: 0,
      mortarVolume: 0,
      mortarCement: 0,
      mortarSand: 0,
    };
  }

  const blockDims = parseBlockDimensions(blockDimensions);
  const ratio =
    MORTAR_RATIO_MAP[mortarRatio as keyof typeof MORTAR_RATIO_MAP] ||
    MORTAR_RATIO_MAP["1:4"];

  // CENTERLINE METHOD: Calculate centerline length
  // For a rectangular foundation, centerline = outer perimeter - 2 × wall thickness
  // This accounts for the corner reductions
  const centerlineLength = wallLength - 2 * wallThickness;

  // Calculate blocksFeet along centerline (linear footage)
  const METERS_TO_FEET = 3.28084;
  const blockLengthFeet = blockDims.length * METERS_TO_FEET;
  const blockHeightFeet = blockDims.height * METERS_TO_FEET;
  const centerlineLengthFeet = centerlineLength * METERS_TO_FEET;

  // Number of blocks lengthwise along centerline (with joint thickness)
  const blocksLengthwise = Math.ceil(
    centerlineLength / (blockDims.length + JOINT_THICKNESS_M),
  );

  // Number of blocks heightwise
  const blocksHeightwise = Math.ceil(
    wallHeight / (blockDims.height + JOINT_THICKNESS_M),
  );

  // Total number of blocks
  const numberOfBlocks = blocksLengthwise * blocksHeightwise;

  // BlocksFeet represents linear feet of blocks along centerline × height
  const blocksFeet = centerlineLengthFeet * (wallHeight * METERS_TO_FEET);

  // Calculate mortar volume using centerline length
  // Mortar joints: horizontal and vertical
  const horizontalJointVolume =
    centerlineLength * wallHeight * JOINT_THICKNESS_M;
  const verticalJointVolume = centerlineLength * wallHeight * JOINT_THICKNESS_M;
  const totalMortarJointVolume = horizontalJointVolume + verticalJointVolume;

  // Dry mortar volume (considering consolidation)
  const dryMortarVolume = totalMortarJointVolume * MORTAR_DRY_VOLUME_FACTOR;

  // Calculate cement and sand based on ratio
  const totalRatioParts = ratio.cement + ratio.sand;
  const cementVolume = (dryMortarVolume * ratio.cement) / totalRatioParts;
  const sandVolume = (dryMortarVolume * ratio.sand) / totalRatioParts;

  // Convert cement volume to bags (1 bag ≈ 0.035 m³)
  const cementBags = Math.ceil(cementVolume / 0.035);

  return {
    blocks: numberOfBlocks,
    blocksFeet,
    mortarVolume: dryMortarVolume,
    mortarCement: cementBags,
    mortarSand: sandVolume,
  };
};

export const useFoundationWallingCalculator = (quote: any) => {
  const [walls, setWalls] = useState<FoundationWallingRow[]>(() => {
    // If foundationWalls exist in quote, use them; otherwise use defaults
    if (
      quote.foundationWalls &&
      Array.isArray(quote.foundationWalls) &&
      quote.foundationWalls.length > 0
    ) {
      console.log(quote.foundationWalls);
      return quote.foundationWalls.map((wall: any) => ({
        id: wall.id || `wall-${Date.now()}-${Math.random()}`,
        type: wall.type || "external",
        blockType: wall.blockType || "Standard Block",
        blockDimensions: wall.blockDimensions || "0.2x0.2x0.2",
        blockThickness: wall.blockThickness || "200",
        wallHeight: String(wall.wallHeight || "2.0"),
        wallLength: String(wall.wallLength || "0"),
        numberOfWalls: String(wall.numberOfWalls || "1"),
        mortarRatio: wall.mortarRatio || "1:4",
      }));
    }
    return [];
  });

  const addWall = useCallback((type: "external" | "internal") => {
    const newWall: FoundationWallingRow = {
      id: `${type}-wall-${Date.now()}`,
      type,
      blockType: "Standard Natural Block",
      blockDimensions: type === "external" ? "0.2x0.2x0.2" : "0.15x0.2x0.15",
      blockThickness: type === "external" ? "200" : "150",
      wallHeight: "2.0",
      wallLength: "0",
      numberOfWalls: "1",
      mortarRatio: "1:4",
    };
    setWalls((prev) => [...prev, newWall]);
  }, []);

  const updateWall = useCallback(
    (id: string, updates: Partial<FoundationWallingRow>) => {
      setWalls((prev) =>
        prev.map((wall) => (wall.id === id ? { ...wall, ...updates } : wall)),
      );
    },
    [],
  );

  const removeWall = useCallback((id: string) => {
    setWalls((prev) => prev.filter((wall) => wall.id !== id));
  }, []);

  const calculateWallQuantities = useCallback(
    (
      wall: FoundationWallingRow,
      blockPricePerFoot: number = 0,
    ): FoundationWall => {
      const wallHeightNum = parseFloat(wall.wallHeight) || 0;
      const wallLengthNum = parseFloat(wall.wallLength) || 0;
      const numberOfWallsNum = parseInt(wall.numberOfWalls) || 1;
      const thicknessM = (parseFloat(wall.blockThickness) || 200) / 1000;

      const totalLength = wallLengthNum * numberOfWallsNum;
      const totalHeight = wallHeightNum;

      const quantities = calculateFoundationWallingQuantities(
        totalLength,
        totalHeight,
        thicknessM,
        wall.blockDimensions,
        wall.mortarRatio,
      );

      const totalCost = quantities.blocksFeet * blockPricePerFoot;

      return {
        id: wall.id,
        type: wall.type,
        blockType: wall.blockType,
        blockDimensions: wall.blockDimensions,
        blockThickness: wall.blockThickness,
        wallHeight: wall.wallHeight,
        wallLength: wall.wallLength,
        numberOfWalls: wall.numberOfWalls,
        volume: totalLength * totalHeight * thicknessM,
        blocks: quantities.blocks,
        blocksFeet: quantities.blocksFeet,
        mortarCement: quantities.mortarCement,
        mortarSand: quantities.mortarSand,
        totalCost,
      };
    },
    [],
  );

  const getTotalQuantities = useCallback(
    (blockPricePerFoot: number = 0) => {
      const allCalculations = walls.map((wall) =>
        calculateWallQuantities(wall, blockPricePerFoot),
      );

      return {
        totalVolume: allCalculations.reduce(
          (sum, w) => sum + (w.volume || 0),
          0,
        ),
        totalBlocks: allCalculations.reduce(
          (sum, w) => sum + (w.blocks || 0),
          0,
        ),
        totalBlocksFeet: allCalculations.reduce(
          (sum, w) => sum + (w.blocksFeet || 0),
          0,
        ),
        totalMortarCement: allCalculations.reduce(
          (sum, w) => sum + (w.mortarCement || 0),
          0,
        ),
        totalMortarSand: allCalculations.reduce(
          (sum, w) => sum + (w.mortarSand || 0),
          0,
        ),
        totalCost: allCalculations.reduce(
          (sum, w) => sum + (w.totalCost || 0),
          0,
        ),
        externalTotal: allCalculations
          .filter((w) => w.type === "external")
          .reduce((sum, w) => sum + (w.volume || 0), 0),
        internalTotal: allCalculations
          .filter((w) => w.type === "internal")
          .reduce((sum, w) => sum + (w.volume || 0), 0),
        externalCost: allCalculations
          .filter((w) => w.type === "external")
          .reduce((sum, w) => sum + (w.totalCost || 0), 0),
        internalCost: allCalculations
          .filter((w) => w.type === "internal")
          .reduce((sum, w) => sum + (w.totalCost || 0), 0),
      };
    },
    [walls, calculateWallQuantities],
  );

  return {
    walls,
    setWalls,
    addWall,
    updateWall,
    removeWall,
    calculateWallQuantities,
    getTotalQuantities,
  };
};
