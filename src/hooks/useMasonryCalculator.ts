import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Material } from "./useQuoteCalculations";
import { supabase } from "@/integrations/supabase/client";
import { log } from "console";

export interface Door {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  type: string; // Panel | Flush | Metal
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Window {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  glass: string; // Clear | Frosted | Tinted
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Room {
  roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string; // Hollow, Solid, etc
  length: string;
  height: string;
  customBlock: { length: string; height: string; thickness: string; price: string };
  plaster: string; // "None" | "One Side" | "Both Sides"
  doors: Door[];
  windows: Window[];
}

export default function useMasonryCalculator({
  setQuote,
  quote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice
}) {
  const [results, setResults] = useState<any>({});
    const [materials, setMaterials] = useState<Material[]>([]);
    const { user, profile } = useAuth();
  const blockTypes = [
    { id: 1, name: "Standard Block", size: { length: 0.4, height: 0.2, thickness: 0.2 } },
    { id: 2, name: "Half Block", size: { length: 0.4, height: 0.2, thickness: 0.1 } },
    { id: 3, name: "Brick", size: { length: 0.225, height: 0.075, thickness: 0.1125 } },
    { id: 4, name: "Custom", size: null },
    ];

  // Use rooms from quote instead of local state
  const rooms = quote?.rooms ?? [];

  // Constants for calculation
  const JOINT_THICKNESS = 0.01; // 10mm mortar joint
  const CEMENT_PER_SQM_PLASTER = 0.03;
  const SAND_PER_SQM_PLASTER = 0.07;
  const MORTAR_PER_SQM = 0.02;
  const PAINT_PER_SQM = 0.15;
  const CEILING_PER_SQM = 1;
  const FLOORING_PER_SQM = 1;

  const parseSize = useCallback((str: string): number => {
    if (!str) return 0;
    // Normalize string: replace Unicode × with x, remove "m" or units
    const cleaned = str.replace(/[×x]/g, "x").replace(/[^\d.x]/g, "");
    const [w, h] = cleaned.split("x").map(s => parseFloat(s.trim()));
    if (isNaN(w) || isNaN(h)) return 0;
    return w * h;
  }, []);

  const getBlockArea = (room: Room): number => {
    if (room.blockType === "Custom" && room.customBlock?.length && room.customBlock?.height) {
      const l = Number(room.customBlock.length) || 0;
      const h = Number(room.customBlock.height) || 0;
      return l * h;
    }

    // find the selected block in blockTypes
    const blockDef = blockTypes.find(b => b.name === room.blockType);
    if (blockDef && blockDef.size) {
      return blockDef.size.length * blockDef.size.height;
    }

    // fallback default (standard brick face)
    return 0.225 * 0.075;
  };

  const removeEntry = (
    roomIndex: number,
    type: "doors" | "windows",
    entryIndex: number
  ) => {
    setQuote(prev => {
      const updatedRooms = [...(prev.rooms || [])];
      if (type === "doors") {
        updatedRooms[roomIndex].doors = updatedRooms[roomIndex].doors.filter(
          (_, i) => i !== entryIndex
        );
      } else {
        updatedRooms[roomIndex].windows = updatedRooms[roomIndex].windows.filter(
          (_, i) => i !== entryIndex
        );
      }
      return { ...prev, rooms: updatedRooms };
    });
  };

  const addRoom = () => {
    setQuote(prev => ({
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
        }
      ]
    }));
  };

  const removeRoom = (i: number) => {
    setQuote(prev => ({
      ...prev,
      rooms: (prev.rooms || []).filter((_, index) => index !== i)
    }));
  };

  const handleRoomChange = (i: number, field: keyof Room, value: any) => {
  setQuote(prev => {
    const updatedRooms = [...(prev.rooms || [])];
    if (!updatedRooms[i]) return prev; // safeguard

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
  setQuote(prev => {
    const updatedRooms = [...(prev.rooms || [])];
    const roomCopy = { ...updatedRooms[i], [field]: [...updatedRooms[i][field]] };
    const nestedItem = { ...roomCopy[field][idx], [key]: value };

    roomCopy[field][idx] = nestedItem;
    updatedRooms[i] = roomCopy;

    return { ...prev, rooms: updatedRooms };
  });
};

  const addDoor = (i: number) => {
  setQuote(prev => {
    const updatedRooms = [...(prev.rooms || [])];
    const roomCopy = {
      ...updatedRooms[i],
      doors: [...updatedRooms[i].doors],
      windows: [...updatedRooms[i].windows], // keep windows intact
    };

    roomCopy.doors.push({
      sizeType: "",
      standardSize: "",
      custom: { height: "", width: "", price: "" },
      type: "",
      frame: "",
      count: 1,
    });

    updatedRooms[i] = roomCopy;
    return { ...prev, rooms: updatedRooms };
  });
};

const addWindow = (i: number) => {
  setQuote(prev => {
    const updatedRooms = [...(prev.rooms || [])];
    const roomCopy = {
      ...updatedRooms[i],
      doors: [...updatedRooms[i].doors],
      windows: [...updatedRooms[i].windows],
    };

    roomCopy.windows.push({
      sizeType: "",
      standardSize: "",
      custom: { height: "", width: "", price: "" },
      glass: "",
      frame: "",
      count: 1,
    });

    updatedRooms[i] = roomCopy;
    return { ...prev, rooms: updatedRooms };
  });
};

  const removeNested = (i: number, field: "doors" | "windows", idx: number) => {
    setQuote(prev => {
      const updatedRooms = [...(prev.rooms || [])];
      updatedRooms[i][field].splice(idx, 1);
      return { ...prev, rooms: updatedRooms };
    });
  };

  const getMaterialPrice = useCallback((materialName: string, specificType?: string): number => {
  if (!materialBasePrices || materialBasePrices.length === 0) return 0;

  // Find the base material
  const material = materialBasePrices.find(m =>
    m.name && m.name.toLowerCase().includes(materialName.toLowerCase()) 
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

  else if (effectiveMaterial.name === "Bricks" ) {
    // For blocks/bricks, return the price of the first type or a specific type
    if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
      const blockType = specificType 
        ? effectiveMaterial.type.find(t => t.name === specificType) || 10
        : effectiveMaterial.type[0];
             
      return blockType?.price_kes || 10;
    }
  }
  else if (effectiveMaterial.name === "Doors") {
    // For doors, return the price of the first type and first size
    if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
      const doorType = specificType 
        ? effectiveMaterial.type.find(t => t.type === specificType)
        : effectiveMaterial.type[0];
      
      if (doorType && doorType.price_kes) {
        return doorType?.price_kes || 0
        // Return the first price in the price_kes object
      }
      else{
        return Object.values(doorType.price_kes)[0] as number || 0;
      }
    }
  }
  else if (effectiveMaterial.name === "Windows") {
    // For windows, return the price of the first type and first size
    if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
      const windowType = specificType 
        ? effectiveMaterial.type.find(t => t.glass_type === specificType)
        : effectiveMaterial.type[0];
      
      if (windowType && windowType.price_kes) {
        // Return the first price in the price_kes object
        return windowType?.price_kes || 0
      }
      else{
        return Object.values(windowType.price_kes)[0] as number || 0;
      }
    }
  }
  else {
    // For other materials with simple pricing
    return effectiveMaterial.price_kes || 0;
  }

  return 0;
}, [materialBasePrices, userRegion, userMaterialPrices, regionalMultipliers, getEffectiveMaterialPrice]);

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
            regionalMultipliers.find((r) => r.region === userRegion)?.multiplier || 1;
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

    const parseMortarRatio = (ratio: string) => {
      if (!ratio) return { cementPart: 1, sandPart: 3 };
      const [c, s] = ratio.split(":").map(Number);
      return {
        cementPart: isNaN(c) ? 1 : c,
        sandPart: isNaN(s) ? 3 : s,
      };
    };

    const getBlockAreaWithJoint = (room: Room): number => {
      const joint = quote?.jointThickness || JOINT_THICKNESS; // default 10mm

      if (room.blockType === "Custom" && room.customBlock?.length && room.customBlock?.height) {
        const l = Number(room.customBlock.length) + joint;
        const h = Number(room.customBlock.height) + joint;
        return l * h;
      }

      const blockDef = blockTypes.find((b) => b.name === room.blockType);
      if (blockDef && blockDef.size) {
        return (blockDef.size.length + joint) * (blockDef.size.height + joint);
      }

      return (0.225 + joint) * (0.075 + joint); // brick default
    };

  const calculateMasonry = useCallback(() => {
    if (!rooms.length) return;
    const { cementPart, sandPart } = parseMortarRatio(quote?.mortarRatio || "1:3");

    let totals = {
      roomArea: 0,
      openingsArea: 0,
      netArea: 0,
      blocks: 0,
      mortar: 0,
      plaster: 0,
      cost: 0,
      breakdown: [] as any[],
    };    

    const updatedRooms = rooms.map((room, index) => {
      const blockPrice = room.customBlock?.price
      ? Number(room.customBlock.price)
      : getMaterialPrice("Bricks", room.blockType);

      const cementPrice = materials.find((m) => m.name?.toLowerCase() === "cement")?.price;
      const sandPrice = materials.find((m) => m.name?.toLowerCase() === "sand")?.price;
      const paintPrice = materials.find((m) => m.name?.toLowerCase().includes("paint"))?.price || 0;
      const ceilingPrice =
        materials.find((m) => m.name?.toLowerCase().includes("ceiling"))?.price || 0;
      const flooringPrice =
        materials.find((m) => m.name?.toLowerCase().includes("floor"))?.price || 0;

      const roomArea = (Number(room.length) * Number(room.height) * 2) + (Number(room.width) * Number(room.height) * 2);
      let openings = 0;
      let openingsCost = 0;

      // Calculate door openings and costs
      room.doors.forEach((door) => {
        const area = door.sizeType === "standard"
          ? parseSize(door.standardSize)
          : Number(door.custom.height) * Number(door.custom.width);

        const totalArea = area * door.count;
        openings += totalArea;

        // Door leaf price
        const doorLeafPrice = door.custom?.price
        ? Number(door.custom.price)
        : getMaterialPrice(`Door`, door.type);

        const doorPrice = door.custom?.price
        ? Number(door.custom.price)
        : doorLeafPrice[door.standardSize]
        // Frame price
        const doorFramePrice = getMaterialPrice(`Door`, door.frame_options);
        door.price = door.count * (doorPrice + doorPrice);

        openingsCost += door.count * (doorPrice + doorPrice);
      });

      // Calculate window openings and costs
      room.windows.forEach((window) => {
        const area = window.sizeType === "standard"
          ? parseSize(window.standardSize)
          : Number(window.custom.height) * Number(window.custom.width);

        const totalArea = area * window.count;
        openings += totalArea;

        const glassPrice = window.custom?.price
        ? Number(window.custom.price)
        : getMaterialPrice(`Windows`, window.glass_type);
        
        const windowPrice = window.custom?.price
        ? Number(window.custom.price)
        : glassPrice[window.standardSize]
        // Frame price
        const windowFramePrice = windowPrice

        window.price = window.count * (windowPrice + windowFramePrice);

        openingsCost += window.count * (windowPrice + windowFramePrice);
      });

      const netArea = roomArea - openings;
      const blocks = Math.ceil(netArea / getBlockAreaWithJoint(room));
      const mortar = Math.round(netArea * MORTAR_PER_SQM);
      const totalParts = cementPart + sandPart;
      const cementQty = mortar * (cementPart / totalParts);
      const sandQty = mortar * (sandPart / totalParts);

      const mortarCost = cementQty * cementPrice + sandQty * sandPrice;

      let plasterArea = 1;
      if (room.plaster === "One Side") {
        plasterArea = netArea;
      } else if (room.plaster === "Both Sides") {
        plasterArea = netArea * 2;
      }

      const plasterCement = plasterArea * CEMENT_PER_SQM_PLASTER;
      const plasterSand = plasterArea * SAND_PER_SQM_PLASTER;

      const blockCost = Math.round(blocks * blockPrice);
      const plasterCost = plasterArea > 0
        ? Math.round((plasterCement * cementPrice) + (plasterSand * sandPrice))
        : 1;

      const floorArea = Number(room.length) * Number(room.width);
      const paintArea = netArea + plasterArea;
      const ceilingArea = floorArea;

      const paintCost = paintArea * PAINT_PER_SQM * paintPrice;
      const ceilingCost = ceilingArea * CEILING_PER_SQM * ceilingPrice;
      const flooringCost = floorArea * FLOORING_PER_SQM * flooringPrice;

      const roomTotalCost = Math.round(blockCost + mortarCost + plasterCost + openingsCost + Math.round((plasterCement * cementPrice) + Math.round((plasterSand * sandPrice))));

      // Update totals
      totals.roomArea += roomArea;
      totals.openingsArea += openings;
      totals.netArea += netArea;
      totals.blocks += blocks;
      totals.mortar += mortar;
      totals.plaster += plasterArea;
      totals.cost += roomTotalCost;

      // Add to breakdown
      totals.breakdown.push({
        roomIndex: index + 1,
        roomType: room.roomType,
        blockType: room.blockType,
        height: room.height,
        width: room.width,
        length: room.length,
        roomArea,
        openings,
        netArea,
        blocks,
        mortar,
        plaster: plasterArea,
        blockCost,
        mortarCost,
        plasterCost,
        openingsCost,
        totalCost: roomTotalCost,
      });

      // Return complete room data with calculations
      return {
        room_name: room.room_name || "Unnamed",
        roomType: room.roomType,
        blockType: room.blockType,
        length: room.length,
        width: room.width,
        height: room.height,
        thickness: room.thickness,
        customBlock: room.customBlock,
        plaster: room.plaster,
        doors: room.doors,
        rate: plasterCost + blockCost,
        windows: room.windows,
        // Calculations
        roomArea,
        openings,
        netArea,
        blocks,
        mortar,
        plasterArea,
        blockCost,
        mortarCost,
        plasterCost,
        openingsCost,
        totalCost: Math.round(roomTotalCost),
        // Material costs
        cementCost: Math.round((plasterCement * cementPrice) + (cementQty * cementPrice)),
        sandCost: Math.round((plasterSand * sandPrice) + (sandQty * sandPrice)),
        // Quantities
        cementBags: (plasterCement + cementQty).toFixed(2),
        sandVolume: (plasterSand + sandQty).toFixed(2),
        stoneVolume: 0, // Add if you calculate stone for concrete
      };
    });

    // Update quote with all calculations
    setQuote(prev => ({
      ...prev,
      masonry_materials: totals,
      rooms: updatedRooms
    }));

    setResults(totals);
  }, [rooms, getMaterialPrice, parseSize, MORTAR_PER_SQM, CEMENT_PER_SQM_PLASTER, SAND_PER_SQM_PLASTER, quote.percentages, setQuote]);

  // Auto-calculate when rooms change
  useEffect(() => {
  // Run calc only when user edits values, not after calc sets results
  if (quote?.rooms && quote.rooms.length > 0) {
    calculateMasonry();
  }
}, [quote.rooms]); // notice no calculateMasonry in deps

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
    results,
    calculateMasonry,
    materialBasePrices
  };
}
