import { useCallback, useEffect, useState } from "react";

// hooks/useConcreteCalculator.ts
export type ElementType = "slab" | "beam" | "column" | "foundation";
export type Category = "substructure" | "superstructure";

export interface ConcreteRow {
  id: string;
  name: string;
  element: ElementType;
  length: string; // meters
  width: string; // meters
  height: string; // meters (for slab this is thickness)
  mix: string; // e.g. "1:2:4"
  formwork?: string;
  category: Category;
  number: string;
  hasConcreteBed?: boolean; // New field
  bedDepth?: string;
  hasAggregateBed?: boolean; // New field for aggregate bed
  aggregateDepth?: string; // New field for aggregate depth
}

export interface ConcreteResult {
  id: string;
  name: string;
  element: ElementType;
  volumeM3: number;
  cementBags: number;
  sandM3: number;
  stoneM3: number;
  number: string;
  totalVolume: number;
  formworkM2: number;
  bedVolume?: number;
  bedArea?: number;
  aggregateVolume?: number; // New field for aggregate volume
  aggregateArea?: number;
  unitRate: number;
  totalConcreteCost: number;
}

const CEMENT_DENSITY = 1440; // kg/m3
const SAND_DENSITY = 1600; // kg/m3
const STONE_DENSITY = 1500; // kg/m3
const CEMENT_BAG_KG = 50; // 1 bag = 50kg

export function parseMix(mix?: string): [number, number, number] {
  if (!mix) return [1, 2, 4]; // fallback if undefined or empty

  const parts = mix.split(":").map((p) => parseFloat(p));
  if (parts.length !== 3 || parts.some(isNaN)) return [1, 2, 4]; // fallback
  return [parts[0], parts[1], parts[2]];
}

export function calculateConcrete(row: ConcreteRow): ConcreteResult {
  const {
    length,
    width,
    height,
    mix,
    id,
    name,
    element,
    formwork,
    number,
    hasConcreteBed,
    bedDepth,
    hasAggregateBed,
    aggregateDepth,
  } = row;

  // Parse numeric values
  const len = parseFloat(length) || 0;
  const wid = parseFloat(width) || 0;
  const hei = parseFloat(height) || 0;
  const num = parseInt(number) || 1;
  const bedDepthNum = parseFloat(bedDepth) || 0;
  const aggregateDepthNum = parseFloat(aggregateDepth) || 0;

  // Main volume calculation
  const volume = len * wid * hei;
  const mainVolume = volume * num;

  // Mix ratio
  const [c, s, st] = parseMix(mix);
  const totalParts = c + s + st;

  // Calculate bed volume if applicable
  let bedVolume = 0;
  let bedArea = 0;
  let aggregateVolume = 0;
  let aggregateArea = 0;

  if (element === "foundation") {
    const baseArea = len * wid * num;

    if (hasConcreteBed && bedDepthNum > 0) {
      bedArea = baseArea;
      bedVolume = bedArea * bedDepthNum;
    }

    if (hasAggregateBed && aggregateDepthNum > 0) {
      aggregateArea = baseArea;
      aggregateVolume = aggregateArea * aggregateDepthNum;
    }
  }

  const totalConcreteVolume = mainVolume + bedVolume;
  const totalMass = 2400 * totalConcreteVolume;

  // Calculate materials for total concrete volume (main + bed)
  const cementMass = (c / totalParts) * totalMass;
  const cementBags = cementMass / CEMENT_BAG_KG;

  const sandMass = (s / totalParts) * totalMass;
  const sandM3 = sandMass / SAND_DENSITY;

  const stoneMass = (st / totalParts) * totalMass;
  const stoneM3 = stoneMass / STONE_DENSITY;

  // Formwork calculation
  let formworkM2 = 0;

  if (formwork && !isNaN(parseFloat(formwork))) {
    formworkM2 = parseFloat(formwork);
  } else {
    if (element === "slab") {
      formworkM2 = num * len * wid;
    } else if (element === "beam") {
      formworkM2 = num * (2 * hei * len + wid * len);
    } else if (element === "column") {
      formworkM2 = num * 2 * (wid + len) * hei;
    } else if (element === "foundation") {
      formworkM2 = num * (2 * hei * len + wid * len);
    }
  }

  return {
    id,
    name,
    element,
    number,
    volumeM3: volume,
    totalVolume: totalConcreteVolume,
    cementBags,
    sandM3,
    stoneM3,
    formworkM2,
    bedVolume,
    bedArea,
    aggregateVolume,
    aggregateArea,
    unitRate: 0,
    totalConcreteCost: 0,
  };
}

// NEW: Function to calculate concrete rate based on material prices
export function calculateConcreteRate(
  mix: string,
  cementPrice: number,
  sandPrice: number,
  stonePrice: number
): number {
  const [c, s, st] = parseMix(mix);
  const totalParts = c + s + st;

  // Calculate cost per cubic meter of concrete
  const cementPerM3 = ((c / totalParts) * 2400) / CEMENT_BAG_KG;
  const sandPerM3 = ((s / totalParts) * 2400) / SAND_DENSITY;
  const stonePerM3 = ((st / totalParts) * 2400) / STONE_DENSITY;

  const rate =
    cementPerM3 * cementPrice + sandPerM3 * sandPrice + stonePerM3 * stonePrice;

  return Math.round(rate);
}

export function getConcreteUnitBreakdown(mix: string, cementBagVolume = 0.035) {
  // mix like "1:2:4"
  const parts = mix.split(":").map(Number);
  const totalParts = parts.reduce((a, b) => a + b, 0);

  const cementPart = parts[0];
  const sandPart = parts[1];
  const stonePart = parts[2];

  // Per 1 m³ of concrete
  const cementM3 = cementPart / totalParts;
  const sandM3 = sandPart / totalParts;
  const stoneM3 = stonePart / totalParts;

  return {
    cementBags: cementM3 / cementBagVolume, // convert m³ cement → bags
    sandM3,
    stoneM3,
  };
}
