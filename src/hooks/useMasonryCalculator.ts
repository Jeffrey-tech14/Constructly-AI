import { useState, useEffect, useCallback } from "react";
import { Material, useQuoteCalculations } from "./useQuoteCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RegionalMultiplier } from "./useMaterialPrices";
import { useLocation } from "react-router-dom";

export interface Door {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string };
  type: string; // Panel | Flush | Metal
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Window {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string };
  glass: string; // Clear | Frosted | Tinted
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

interface Wall {
  roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string; // Hollow, Solid, etc
  length: string;
  height: string;
  customBlock: { length: string; height: string; thickness: string };
  plaster: string; // "None" | "One Side" | "Both Sides"
  doors: Door[];
  windows: Window[];
}

interface Quote {
  walls: Wall[];
  rooms: any[];
  total_wall_area: number;
  total_plaster_volume: number;
  materials_cost: number;
  percentages: any[];
}

export default function useMasonryCalculator({ setQuote, quote }) {
  const { user, profile } = useAuth();
  const [results, setResults] = useState<any>({});
  const location = useLocation();
  const [regionalMultipliers] = useState<RegionalMultiplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Use walls from quote instead of local state
  const walls = quote.walls || [];

  // Constants for calculation
  const BLOCK_AREA = 0.225 * 0.075;
  const BRICKS_PER_SQM = 50;
  const CEMENT_PER_SQM = 0.03;
  const SAND_PER_SQM = 0.07;
  const MORTAR_PER_SQM = 0.02;

  const parseSize = useCallback((str: string) => {
    if (!str) return 0;
    const [w, h] = str.split("x").map((s) => Number(s.trim()));
    return w * h;
  }, []);

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;

    const { data: baseMaterials, error: baseError } = await supabase
      .from('material_base_prices')
      .select('*');
  
    const { data: overrides, error: overrideError } = await supabase
      .from('user_material_prices')
      .select('material_id, region, price, type')
      .eq('user_id', profile.id);
  
    if (baseError) console.error('Base materials error:', baseError);
    if (overrideError) console.error('Overrides error:', overrideError);
  
    const merged = baseMaterials?.map((material) => {
      const userRegion = profile?.location || 'Nairobi'; 
      const userRate = overrides?.find(
        o => o.material_id === material.id && o.region === userRegion
      );
      const multiplier = regionalMultipliers.find(r => r.region === userRegion)?.multiplier || 1;
      const materialP = material.price * multiplier;
      const price = userRate ? userRate.price : materialP ?? 0;
      
      return {
        ...material,
        price,
        source: userRate ? 'user' : (material.price != null ? 'base' : 'none')
      };
    }) || [];
  
    setMaterials(merged);
  }, [profile, regionalMultipliers]);

  useEffect(() => {
    if (user && profile) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  const removeEntry = (
    wallIndex: number,
    type: "doors" | "windows",
    entryIndex: number
  ) => {
    setQuote(prev => {
      const updatedWalls = [...(prev.walls || [])];
      if (type === "doors") {
        updatedWalls[wallIndex].doors = updatedWalls[wallIndex].doors.filter(
          (_, i) => i !== entryIndex
        );
      } else {
        updatedWalls[wallIndex].windows = updatedWalls[wallIndex].windows.filter(
          (_, i) => i !== entryIndex
        );
      }
      return { ...prev, walls: updatedWalls };
    });
  };

  const addWall = () => {
    setQuote(prev => ({
      ...prev,
      walls: [
        ...(prev.walls || []),
        {
          room_name: "",
          roomType: "",
          blockType: "",
          length: "",
          height: "",
          width: "",
          thickness: "",
          customBlock: { length: "", height: "", thickness: "" },
          plaster: "",
          doors: [],
          windows: [],
        }
      ]
    }));
  };

  const removeWall = (i: number) => {
    setQuote(prev => ({
      ...prev,
      walls: (prev.walls || []).filter((_, index) => index !== i)
    }));
  };

  const handleWallChange = (i: number, field: keyof Wall, value: any) => {
    setQuote(prev => {
      const updatedWalls = [...(prev.walls || [])];
      (updatedWalls[i][field] as any) = value;
      return { ...prev, walls: updatedWalls };
    });
  };

  const handleNestedChange = (
    i: number,
    field: "doors" | "windows",
    idx: number,
    key: string,
    value: any
  ) => {
    setQuote(prev => {
      const updatedWalls = [...(prev.walls || [])];
      (updatedWalls[i][field][idx] as any)[key] = value;
      return { ...prev, walls: updatedWalls };
    });
  };

  const addDoor = (i: number) => {
    setQuote(prev => {
      const updatedWalls = [...(prev.walls || [])];
      updatedWalls[i].doors.push({
        sizeType: "",
        standardSize: "",
        custom: { height: "", width: "" },
        type: "",
        frame: "",
        count: 1,
      });
      return { ...prev, walls: updatedWalls };
    });
  };

  const addWindow = (i: number) => {
    setQuote(prev => {
      const updatedWalls = [...(prev.walls || [])];
      updatedWalls[i].windows.push({
        sizeType: "",
        standardSize: "",
        custom: { height: "", width: "" },
        glass: "",
        frame: "",
        count: 1,
      });
      return { ...prev, walls: updatedWalls };
    });
  };

  const removeNested = (i: number, field: "doors" | "windows", idx: number) => {
    setQuote(prev => {
      const updatedWalls = [...(prev.walls || [])];
      updatedWalls[i][field].splice(idx, 1);
      return { ...prev, walls: updatedWalls };
    });
  };

  const getMaterialPrice = useCallback((materialName: string): number => {
    if (!materials || materials.length === 0) return 0;
    
    const material = materials.find(m => 
      m.name && m.name.toLowerCase().includes(materialName.toLowerCase())
    );
    
    return material ? material.price : 0;
  }, [materials]);

  const calculateMasonry = useCallback(() => {
    if (!walls.length) return;

    let totals = {
      wallArea: 0,
      openingsArea: 0,
      netArea: 0,
      blocks: 0,
      mortar: 0,
      plaster: 0,
      cost: 0,
      breakdown: [] as any[],
    };

    const updatedRooms = walls.map((wall, index) => {
      const blockPrice = getMaterialPrice(wall.blockType);
      const plasterPrice = getMaterialPrice("Plaster");
      const cementPrice = getMaterialPrice("Cement");
      const sandPrice = getMaterialPrice("Sand");
      
      const wallArea = Number(wall.length) * Number(wall.height);
      let openings = 0;
      let openingsCost = 0;

      // Calculate door openings and costs
      wall.doors.forEach((door) => {
        const area = door.sizeType === "standard"
          ? parseSize(door.standardSize)
          : Number(door.custom.height) * Number(door.custom.width);

        const totalArea = area * door.count;
        openings += totalArea;

        const doorLeafPrice = getMaterialPrice(`${door.type} Door`);
        const doorFramePrice = getMaterialPrice(`${door.frame} Frame`);
        openingsCost += door.count * (doorLeafPrice + doorFramePrice);
      });

      // Calculate window openings and costs
      wall.windows.forEach((window) => {
        const area = window.sizeType === "standard"
          ? parseSize(window.standardSize)
          : Number(window.custom.height) * Number(window.custom.width);

        const totalArea = area * window.count;
        openings += totalArea;

        const windowFramePrice = getMaterialPrice(`${window.frame} Frame`);
        const glassPrice = getMaterialPrice(`${window.glass} Glass`);
        openingsCost += window.count * (windowFramePrice + glassPrice);
      });

      const netArea = wallArea - openings;
      const blocks = netArea / BLOCK_AREA;
      const mortar = netArea * MORTAR_PER_SQM;
      
      let plasterArea = 0;
      if (wall.plaster === "One Side") {
        plasterArea = netArea;
      } else if (wall.plaster === "Both Sides") {
        plasterArea = netArea * 2;
      }
      
      const plasterCement = plasterArea * CEMENT_PER_SQM;
      const plasterSand = plasterArea * SAND_PER_SQM;
      
      const blockCost = blocks * blockPrice;
      const mortarCost = mortar * (cementPrice * 0.4 + sandPrice * 0.6);
      const plasterCost = plasterArea > 0 
        ? plasterCement * cementPrice + plasterSand * sandPrice
        : 0;

      const wallTotalCost = blockCost + mortarCost + plasterCost + openingsCost;

      // Update totals
      totals.wallArea += wallArea;
      totals.openingsArea += openings;
      totals.netArea += netArea;
      totals.blocks += blocks;
      totals.mortar += mortar;
      totals.plaster += plasterArea;
      totals.cost += wallTotalCost;

      // Add to breakdown
      totals.breakdown.push({
        wallIndex: index + 1,
        roomType: wall.roomType,
        blockType: wall.blockType,
        height: wall.height,
        width: wall.width,
        length: wall.length,
        wallArea,
        openings,
        netArea,
        blocks,
        mortar,
        plaster: plasterArea,
        blockCost,
        mortarCost,
        plasterCost,
        openingsCost,
        totalCost: wallTotalCost,
      });

      // Return complete room data with calculations
      return {
        room_name: wall.room_name,
        roomType: wall.roomType,
        blockType: wall.blockType,
        length: wall.length,
        width: wall.width,
        height: wall.height,
        thickness: wall.thickness,
        customBlock: wall.customBlock,
        plaster: wall.plaster,
        doors: wall.doors,
        windows: wall.windows,
        // Calculations
        wallArea,
        openings,
        netArea,
        blocks,
        mortar,
        plasterArea,
        blockCost,
        mortarCost,
        plasterCost,
        openingsCost,
        totalCost: wallTotalCost * (quote.percentages?.[0]?.profit || 1),
        // Material costs
        cementCost: plasterCement * cementPrice,
        sandCost: plasterSand * sandPrice,
        // Quantities
        cementBags: plasterCement,
        sandVolume: plasterSand,
        stoneVolume: 0, // Add if you calculate stone for concrete
      };
    });

    console.log("Updated Rooms:", JSON.stringify(updatedRooms, null, 2));
    console.log("Totals:", JSON.stringify(totals, null, 2));

    // Update quote with all calculations
    setQuote(prev => ({
      ...prev,
      total_wall_area: totals.wallArea,
      total_plaster_volume: totals.plaster,
      materials_cost: totals.cost,
      masonry_materials: totals,
      rooms: updatedRooms
    }));

    setResults(totals);
  }, [walls, materials, getMaterialPrice, parseSize, BLOCK_AREA, MORTAR_PER_SQM, CEMENT_PER_SQM, SAND_PER_SQM, quote.percentages, setQuote]);

  // Auto-calculate when walls change
  useEffect(() => {
    calculateMasonry();
  }, [walls, calculateMasonry]);

  return {
    walls,
    addWall,
    removeWall,
    handleWallChange,
    handleNestedChange,
    addDoor,
    addWindow,
    removeNested,
    removeEntry,
    results,
    calculateMasonry,
    materials
  };
}