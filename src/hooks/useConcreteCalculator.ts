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
  const { length, width, height, mix, id, name, element, formwork, number } =
    row;

  // Volume
  const volume = parseFloat(length) * parseFloat(width) * parseFloat(height);
  const totalVolume =
    parseFloat(length) *
    parseFloat(width) *
    parseFloat(height) *
    parseInt(number);

  // Mix ratio
  const [c, s, st] = parseMix(mix);
  const totalParts = c + s + st;

  const totalMass = 2400 * volume;

  // Cement
  const cementMass = parseInt(number) * (c / totalParts) * totalMass;
  const cementBags = cementMass / CEMENT_BAG_KG;

  // Sand
  const sandMass = parseInt(number) * (s / totalParts) * totalMass;
  const sandM3 = sandMass / SAND_DENSITY;

  // Stone
  const stoneMass = parseInt(number) * (st / totalParts) * totalMass;
  const stoneM3 = stoneMass / STONE_DENSITY;

  // Formwork: either user-input, or approximate surface area
  let formworkM2 = 0;

  if (formwork && !isNaN(parseFloat(formwork))) {
    formworkM2 = parseFloat(formwork);
  } else {
    if (element === "slab") {
      formworkM2 = parseInt(number) * parseFloat(length) * parseFloat(width);
    } else if (element === "beam") {
      formworkM2 =
        parseInt(number) * 2 * parseFloat(height) * parseFloat(length) +
        parseFloat(width) * parseFloat(length);
    } else if (element === "column") {
      formworkM2 =
        parseInt(number) *
        2 *
        (parseFloat(width) + parseFloat(length)) *
        parseFloat(height);
    } else if (element === "foundation") {
      formworkM2 =
        parseInt(number) * 2 * parseFloat(height) * parseFloat(length) +
        parseFloat(width) * parseFloat(length);
    }
  }

  return {
    id,
    name,
    element,
    number,
    volumeM3: volume,
    totalVolume,
    cementBags,
    sandM3,
    stoneM3,
    formworkM2,
  };
}
