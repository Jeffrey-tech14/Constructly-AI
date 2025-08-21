import { useCallback, useEffect, useState } from "react";
import { Material } from "./useQuoteCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { RegionalMultiplier } from "./useDynamicPricing";
import { supabase } from "@/integrations/supabase/client";

// hooks/useConcreteCalculator.ts
export type ElementType = "slab" | "beam" | "column" | "foundation";

export interface ConcreteRow {
  id: string;
  name: string;
  element: ElementType;
  length: string; // meters
  width: string;  // meters
  height: string; // meters (for slab this is thickness)
  mix: string;    // e.g. "1:2:4"
}

export interface ConcreteResult {
  id: string;
  name: string;
  element: ElementType;
  volumeM3: number;
  cementBags: number;
  sandM3: number;
  stoneM3: number;
}

const CEMENT_DENSITY = 1440; // kg/m3
const SAND_DENSITY = 1600;   // kg/m3
const STONE_DENSITY = 1500;  // kg/m3
const CEMENT_BAG_KG = 50;    // 1 bag = 50kg

export function parseMix(mix: string): [number, number, number] {
  const parts = mix.split(":").map(p => parseFloat(p));
  if (parts.length !== 3 || parts.some(isNaN)) return [1, 2, 4]; // fallback
  return [parts[0], parts[1], parts[2]];
}

export function calculateConcrete(row: ConcreteRow): ConcreteResult {
  const { length, width, height, mix, id, name, element } = row;

  // Volume of element
  const volume = parseFloat(length) * parseFloat(width) * parseFloat(height); // m³

  // Mix ratio breakdown
  const [c, s, st] = parseMix(mix);
  const totalParts = c + s + st;

  // Assume 1 m³ concrete ~ 2400 kg (approx density of concrete)
  const totalMass = 2400 * volume;

  // Cement
  const cementMass = (c / totalParts) * totalMass;
  const cementBags = cementMass / CEMENT_BAG_KG;

  // Sand
  const sandMass = (s / totalParts) * totalMass;
  const sandM3 = sandMass / SAND_DENSITY;

  // Stone
  const stoneMass = (st / totalParts) * totalMass;
  const stoneM3 = stoneMass / STONE_DENSITY;

  return {
    id,
    name,
    element,
    volumeM3: volume,
    cementBags,
    sandM3,
    stoneM3,
  };
}
