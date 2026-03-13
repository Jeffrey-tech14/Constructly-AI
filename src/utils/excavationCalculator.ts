// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Excavation calculator utilities for foundation types
 * Supports strip footing, raft foundation, and pad foundation calculations
 */

export interface ExcavationDimensions {
  length: number;
  width: number;
  depth: number;
  volume: number;
}

/**
 * Calculate strip footing width based on stone/block size
 * Width = 3 × stone size
 * - 600mm for 200*200 (9×9) blocks
 * - 450mm for 150*200 (6×9) blocks
 * - 300mm for 100*200 (4×9) blocks
 */
export function calculateStripFootingWidth(blockSize: string): number {
  const sizes: Record<string, number> = {
    "200*200/9*9": 0.6, // 600mm
    "150*200/6*9": 0.45, // 450mm
    "100*200/4*9": 0.3, // 300mm
  };
  return sizes[blockSize] || 0.3; // default 300mm
}

/**
 * Calculate strip footing concrete depth based on stone/block size
 * Depth = stone size
 * - 200mm for 200*200 (9×9) blocks
 * - 150mm for 150*200 (6×9) blocks
 * - 100mm for 100*200 (4×9) blocks
 */
export function calculateStripFootingDepth(blockSize: string): number {
  const sizes: Record<string, number> = {
    "200*200/9*9": 0.2, // 200mm
    "150*200/6*9": 0.15, // 150mm
    "100*200/4*9": 0.1, // 100mm
  };
  return sizes[blockSize] || 0.15; // default 150mm
}

/**
 * Calculate excavation dimensions for strip footing
 * Formula: length × width × depth
 * where:
 *   - length: total strip length
 *   - width: 3 × stone size (typically 0.45-0.6m)
 *   - depth: minimum 0.65m (can be stone size if larger)
 */
export function calculateStripFootingExcavation(
  stripLength: number,
  blockSize: string,
  minDepth: number = 0.65
): ExcavationDimensions {
  const width = calculateStripFootingWidth(blockSize);
  const concreteDepth = calculateStripFootingDepth(blockSize);
  const excavationDepth = Math.max(minDepth, concreteDepth);

  return {
    length: stripLength,
    width,
    depth: excavationDepth,
    volume: stripLength * width * excavationDepth,
  };
}

/**
 * Calculate excavation dimensions for raft foundation
 * Formula: area × depth
 * where:
 *   - area: raft length × raft width
 *   - depth: minimum 0.65m
 */
export function calculateRaftFoundationExcavation(
  raftLength: number,
  raftWidth: number,
  minDepth: number = 0.65
): ExcavationDimensions {
  const area = raftLength * raftWidth;
  const depth = Math.max(minDepth, 0.65); // Minimum 0.65m for raft

  return {
    length: raftLength,
    width: raftWidth,
    depth,
    volume: area * depth,
  };
}

/**
 * Calculate excavation dimensions for pad foundation
 * Formula: sum of (length × width × depth) for each pad
 * where:
 *   - number of pads = number of columns
 *   - depth: minimum 0.65m
 */
export function calculatePadFoundationExcavation(
  pads: Array<{
    length: number;
    width: number;
    depth: number;
    count: number;
  }>,
  minDepth: number = 0.65
): {
  totalVolume: number;
  padsBreakdown: Array<{
    length: number;
    width: number;
    depth: number;
    count: number;
    volume: number;
  }>;
} {
  const padsBreakdown = pads.map((pad) => ({
    ...pad,
    depth: Math.max(minDepth, parseFloat(String(pad.depth)) || 0.65),
    volume:
      pad.length *
      pad.width *
      Math.max(minDepth, parseFloat(String(pad.depth)) || 0.65) *
      pad.count,
  }));

  const totalVolume = padsBreakdown.reduce((sum, pad) => sum + pad.volume, 0);

  return { totalVolume, padsBreakdown };
}

/**
 * Get foundation excavation details based on type
 */
export function getFoundationExcavationDetails(
  foundationType: "strip" | "raft" | "pad",
  params: any
): {
  description: string;
  formula: string;
  volume: number;
  dimensions: ExcavationDimensions | any;
} {
  switch (foundationType) {
    case "strip": {
      const excavation = calculateStripFootingExcavation(
        params.stripLength,
        params.blockSize || "150*200/6*9",
        params.minDepth || 0.65
      );
      return {
        description: `Strip footing excavation for ${params.stripLength}m length`,
        formula: `Length × Width × Depth = ${params.stripLength} × ${excavation.width} × ${excavation.depth}`,
        volume: excavation.volume,
        dimensions: excavation,
      };
    }

    case "raft": {
      const excavation = calculateRaftFoundationExcavation(
        params.raftLength,
        params.raftWidth,
        params.minDepth || 0.65
      );
      return {
        description: `Raft foundation excavation ${params.raftLength}m × ${params.raftWidth}m`,
        formula: `Area × Depth = (${params.raftLength} × ${params.raftWidth}) × ${excavation.depth}`,
        volume: excavation.volume,
        dimensions: excavation,
      };
    }

    case "pad": {
      const result = calculatePadFoundationExcavation(
        params.pads || [],
        params.minDepth || 0.65
      );
      return {
        description: `Pad foundation excavation for ${
          params.numberOfColumns || 0
        } columns`,
        formula: `Sum of (Length × Width × Depth) for each pad size`,
        volume: result.totalVolume,
        dimensions: result,
      };
    }

    default:
      return {
        description: "Unknown foundation type",
        formula: "",
        volume: 0,
        dimensions: {},
      };
  }
}
