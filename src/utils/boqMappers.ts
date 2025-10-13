import { BOQItem } from "@/types/boq";
import { generateItemNumber } from "@/types/boq";
import { MaterialConfigurations } from "@/config/materialConfig";

interface MasonryRoom {
  thickness: number;
  blockType?: string;
  plaster?: string;
  blocks?: number;
  blockCost?: number;
  room_name?: string;
}

export const validateMasonryRoom = (room: any): MasonryRoom => {
  if (!room) throw new Error("Room data is required");

  const validRoom: MasonryRoom = {
    thickness: parseFloat(room.thickness) || 0.2, // Default to 200mm
    blockType: room.blockType || "Standard Block",
    plaster: room.plaster || "Both Sides",
    blocks: parseFloat(room.blocks) || 0,
    blockCost: parseFloat(room.blockCost) || 0,
    room_name: room.room_name || "Unnamed Room",
  };

  if (validRoom.thickness <= 0) {
    throw new Error(`Invalid wall thickness: ${validRoom.thickness}m`);
  }
  if (validRoom.blocks < 0) {
    throw new Error(`Invalid block count: ${validRoom.blocks}`);
  }
  if (validRoom.blockCost < 0) {
    throw new Error(`Invalid block cost: ${validRoom.blockCost}`);
  }

  return validRoom;
};

export const mapMasonryToBOQ = (roomResults: any[]): BOQItem[] => {
  if (!Array.isArray(roomResults)) {
    throw new Error("Room results must be an array");
  }

  // Get masonry configuration
  const masonryConfig = MaterialConfigurations.masonry;
  if (!masonryConfig) {
    throw new Error("Masonry configuration not found");
  }

  // Validate and transform input data
  const validatedRooms = roomResults.map((room, index) => {
    try {
      return validateMasonryRoom(room);
    } catch (error) {
      throw new Error(`Error in room ${index + 1}: ${error.message}`);
    }
  });

  // Group rooms by plastering (internal/external) + blockType
  const grouped: Record<string, MasonryRoom[]> = {};

  roomResults.forEach((room) => {
    const thickness = room.thickness * 1000 || 200;
    const blockType = room.blockType || "Standard Block";

    // Decide plastering description
    let plasterGroup: string;
    if (room.plaster === "One Side") {
      plasterGroup = `${thickness}mm Thick Internal walling`;
    } else {
      plasterGroup = `${thickness}mm Thick External walling`;
    }

    const key = `${plasterGroup}_${blockType}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(room);
  });

  // Flatten back into BOQ items
  return Object.entries(grouped).flatMap(([key, rooms], index) => {
    const [plasterGroup, blockType] = key.split("_");

    // Calculate totals per group
    const totalNetArea = rooms.reduce((sum, r) => sum + (r.blocks || 0), 0);
    const totalRate = rooms.reduce((sum, r) => sum + (r.blockCost || 0), 0);

    // Generate material breakdown from configuration with types and quantities
    const materialBreakdown = Object.entries(masonryConfig.ratios).map(
      ([material, ratio]) => {
        const baseQuantity = Math.ceil(totalNetArea);
        return {
          material,
          unit:
            material === "stones"
              ? "No"
              : material === "cement"
              ? "Bags"
              : "Tonnes",
          ratio,
          quantity: baseQuantity * ratio,
          category: "Masonry",
          element: material === "stones" ? "Wall Stones" : "Mortar",
          materialType: (material === "stones" ? "primary" : "binding") as
            | "primary"
            | "binding",
          requirements: [
            material === "stones"
              ? "Must meet standard size requirements"
              : "Must meet strength requirements",
          ],
          preparationSteps: [
            material === "stones"
              ? "Clean and wet before use"
              : "Mix according to specifications",
          ],
        };
      }
    );

    return {
      itemNo: generateItemNumber("MAS", index + 1),
      description: `${plasterGroup} (${blockType})`,
      unit: "SM",
      quantity: Math.ceil(totalNetArea),
      isHeader: false,
      rate:
        totalNetArea > 0 ? Math.ceil(totalRate / Math.round(totalNetArea)) : 0,
      amount: Math.ceil(totalRate),
      category: "superstructure",
      element: "Masonry",
      calculatedFrom: rooms
        .map((r) => `Room: ${r.room_name || "Unnamed"}`)
        .join(", "),
      materialType: "masonry" as const,
      materialBreakdown,
      workType: "Walling",
    };
  });
};

interface ConcreteResult {
  name?: string;
  mix?: string;
  element?: string;
  category?: string;
}

interface ConcreteMaterial {
  name: string;
  rowId: string;
  quantity?: number;
  rate?: number;
  total_price?: number;
}

const validateConcreteResult = (result: any): ConcreteResult => {
  if (!result) throw new Error("Concrete result data is required");

  return {
    name: result.name || "Unknown",
    mix: result.mix || "20",
    element: result.element || "Element",
    category: result.category || "Structure",
  };
};

const validateConcreteMaterial = (material: any): ConcreteMaterial => {
  if (!material) throw new Error("Concrete material data is required");

  const validMaterial: ConcreteMaterial = {
    name: material.name || "",
    rowId: material.rowId || "",
    quantity: parseFloat(material.quantity) || 0,
    rate: parseFloat(material.rate) || 0,
    total_price: parseFloat(material.total_price) || 0,
  };

  if (validMaterial.quantity < 0) {
    throw new Error(`Invalid quantity: ${validMaterial.quantity}`);
  }
  if (validMaterial.rate < 0) {
    throw new Error(`Invalid rate: ${validMaterial.rate}`);
  }

  return validMaterial;
};

// In your boqMappers.ts file, update the mapConcreteToBOQ function:

export const mapConcreteToBOQ = (
  concreteResults: any[],
  concreteMaterials: any[]
): BOQItem[] => {
  if (!Array.isArray(concreteResults)) {
    throw new Error("Concrete results must be an array");
  }
  if (!Array.isArray(concreteMaterials)) {
    throw new Error("Concrete materials must be an array");
  }

  // Get concrete configuration
  const concreteConfig = MaterialConfigurations.concrete;
  if (!concreteConfig) {
    throw new Error("Concrete configuration not found");
  }

  return concreteResults.flatMap((result, index) => {
    try {
      const validResult = validateConcreteResult(result);
      const rowId = validResult.name?.split(" ")[1];
      const totalItem = concreteMaterials.find(
        (item) => item.name === "Concrete Total" && item.rowId === rowId
      );

      if (!totalItem) {
        console.warn(`No total item found for concrete row ${rowId}`);
      }

      const validTotalItem = validateConcreteMaterial(totalItem || {});

      // Generate material breakdown from configuration with proper types
      const baseQuantity = validTotalItem.quantity || 0;
      const materialBreakdown = Object.entries(concreteConfig.ratios).map(
        ([material, ratio]) => ({
          material,
          unit:
            material === "cement"
              ? "Bags"
              : material === "water"
              ? "Litres"
              : "Tonnes",
          ratio,
          quantity: baseQuantity * ratio,
          category: "Concrete",
          element:
            material === "cement"
              ? "Binder"
              : material === "ballast"
              ? "Coarse Aggregate"
              : material === "sand"
              ? "Fine Aggregate"
              : "Other",
          materialType: (material === "cement"
            ? "binding"
            : material === "ballast" || material === "sand"
            ? "primary"
            : "auxiliary") as "binding" | "primary" | "auxiliary",
          requirements: [
            material === "cement"
              ? "Must meet strength grade requirements"
              : material === "water"
              ? "Clean, potable water required"
              : "Must meet grading requirements",
          ],
          preparationSteps: [
            material === "cement"
              ? "Store in dry conditions"
              : material === "water"
              ? "Test for impurities if needed"
              : "Screen for proper size gradation",
          ],
        })
      );

      // NEW: Check if this is foundation walling based on element name and category
      const isFoundationWalling =
        validResult.element?.toLowerCase().includes("foundation_walling") ||
        (validResult.category === "substructure" &&
          validResult.element?.toLowerCase().includes("walling"));

      // NEW: Create appropriate description based on element type
      let description: string;
      if (isFoundationWalling) {
        description = `Vibrated reinforced concrete class ${validResult.mix} to foundation walling`;
      } else if (validResult.element?.toLowerCase().includes("foundation")) {
        description = `Vibrated reinforced concrete class ${validResult.mix} to ${validResult.element}`;
      } else {
        description = `Vibrated reinforced concrete class ${validResult.mix} to ${validResult.element}`;
      }

      return {
        itemNo: generateItemNumber("CON", index + 1),
        description,
        unit: "m³",
        quantity: Math.ceil(validTotalItem.quantity) || 0,
        rate: Math.ceil(validTotalItem.rate) || 0,
        amount: Math.ceil(validTotalItem.total_price) || 0,
        category: validResult.category,
        element: isFoundationWalling
          ? "Foundation Walling"
          : validResult.element,
        isHeader: false,
        calculatedFrom: validResult.name,
        materialType: "concrete" as const,
        materialBreakdown,
        workType: "Cast in-situ",
      };
    } catch (error) {
      console.error(`Error processing concrete item ${index + 1}:`, error);
      throw error;
    }
  });
};

// Add this new mapper function to your boqMappers.ts file:

interface FoundationWallingData {
  masonryBlockType?: string;
  masonryWallThickness?: number;
  masonryWallHeight?: number;
  totalBlocks?: number;
  masonryMortarCementBags?: number;
  masonryMortarSandM3?: number;
  room_name?: string;
  unitPrice?: number;
  totalPrice: number;
}

const validateFoundationWalling = (data: any): FoundationWallingData => {
  if (!data) throw new Error("Foundation walling data is required");

  const validData: FoundationWallingData = {
    masonryBlockType: data.materials[0].masonryBlockType,
    masonryWallThickness:
      parseFloat(data.materials[0].masonryWallThickness) || 0,
    masonryWallHeight: parseFloat(data.materials[0].masonryWallHeight) || 0,
    totalBlocks: Math.ceil(data.quantity) || 0,
    masonryMortarCementBags:
      parseFloat(data.materials[0].masonryMortarCementBags) || 0,
    masonryMortarSandM3: parseFloat(data.materials[0].masonryMortarSandM3) || 0,
    room_name: data.materials[0].element || "Unnamed",
    unitPrice: data.unit_price,
    totalPrice: Math.round(data.total_price),
  };

  if (validData.totalBlocks < 0) {
    throw new Error(`Invalid block count: ${validData.totalBlocks}`);
  }
  if (validData.masonryWallThickness <= 0) {
    throw new Error(
      `Invalid wall thickness: ${validData.masonryWallThickness}`
    );
  }

  return validData;
};

export const mapFoundationWallingToBOQ = (
  concreteResults: any[],
  concreteCalc: any[]
): BOQItem[] => {
  if (!Array.isArray(concreteResults)) {
    throw new Error("Concrete results must be an array");
  }
  const concreteData = concreteCalc.map((calc) => {
    const relatedResults = concreteResults.filter(
      (res) => res.rowId === calc.id
    );

    const results = relatedResults.filter(
      (res) => res.element === "foundation"
    );

    return {
      ...calc,
      materials: results, // all items for that element
      totals: relatedResults
        .filter((r) => r.name.includes("Total"))
        .map(({ name, total_price }) => ({ name, total_price })),
    };
  });

  // Get masonry configuration
  const masonryConfig = MaterialConfigurations.concrete;
  if (!masonryConfig) {
    throw new Error("Masonry configuration not found");
  }

  // Filter only foundation elements with masonry walls
  const foundationWallingData = concreteData.filter((result) => {
    const hasFoundationWall = result.materials.filter(
      (m) => m.element === "foundation" && m.hasMasonryWall
    );

    return (
      result.name?.includes("Total") &&
      result.name?.includes("Block") &&
      hasFoundationWall
    );
  });

  return foundationWallingData.flatMap((result, index) => {
    try {
      const validData = validateFoundationWalling(result);
      const thickness = validData.masonryWallThickness * 1000; // Convert to mm

      return {
        itemNo: generateItemNumber("FWL", index + 1),
        description: `${thickness}mm Thick ${validData.masonryBlockType} foundation walling`,
        unit: "pcs",
        quantity: Math.round(validData.totalBlocks),
        rate: validData.unitPrice,
        amount: Math.round(validData.totalPrice),
        category: "substructure",
        element: "Foundation Walling",
        isHeader: false,
        calculatedFrom: `Room: ${validData.room_name || "Unnamed"}`,
        materialType: "masonry" as const,
        workType: "Walling",
      };
    } catch (error) {
      console.error(
        `Error processing foundation walling item ${index + 1}:`,
        error
      );
      throw error;
    }
  });
};
// Map rebar calculator results
interface RebarResult {
  id?: string;
  primaryBarSize?: string;
  totalWeightKg?: number;
  rate?: number;
  totalPrice?: number;
  category?: string;
}

interface RebarRow {
  id: string;
  element: string;
}

const validateRebarResult = (result: any): RebarResult => {
  if (!result) throw new Error("Rebar result data is required");

  const validResult: RebarResult = {
    id: result.id || "",
    primaryBarSize: result.primaryBarSize || "Y12",
    totalWeightKg: parseFloat(result.totalWeightKg) || 0,
    rate: parseFloat(result.rate) || 0,
    totalPrice: parseFloat(result.totalPrice) || 0,
    category: result.category || "Structure",
  };

  if (validResult.totalWeightKg < 0) {
    throw new Error(`Invalid weight: ${validResult.totalWeightKg}kg`);
  }
  if (validResult.rate < 0) {
    throw new Error(`Invalid rate: ${validResult.rate}`);
  }

  return validResult;
};

export const mapRebarToBOQ = (
  rebarResults: any[],
  rebarRows: any[]
): BOQItem[] => {
  if (!Array.isArray(rebarResults)) {
    throw new Error("Rebar results must be an array");
  }
  if (!Array.isArray(rebarRows)) {
    throw new Error("Rebar rows must be an array");
  }

  // Get steel configuration
  const steelConfig = MaterialConfigurations.steel;
  if (!steelConfig) {
    throw new Error("Steel configuration not found");
  }

  // Create a map of element names from rebar rows
  const elementMap = new Map(rebarRows.map((row) => [row.id, row.element]));

  return rebarResults.flatMap((result, index) => {
    try {
      const validResult = validateRebarResult(result);
      const baseQuantity = validResult.totalWeightKg || 0;

      // Generate material breakdown from configuration with proper types
      const materialBreakdown = [
        {
          material: "Reinforcement bars",
          unit: "kg",
          ratio: 1,
          quantity: baseQuantity,
          category: "Steel",
          element: "Reinforcement",
          materialType: "primary" as const,
          requirements: ["Must meet yield strength requirements"],
          preparationSteps: [
            "Clean from rust and debris",
            "Cut and bend to specifications",
          ],
        },
        {
          material: "Binding wire",
          unit: "kg",
          ratio: 0.02, // 20g of binding wire per kg of rebar
          quantity: baseQuantity * 0.02,
          category: "Steel",
          element: "Accessories",
          materialType: "auxiliary" as const,
          requirements: ["Must be galvanized"],
          preparationSteps: ["Cut to required lengths"],
        },
        {
          material: "Spacer blocks",
          unit: "No",
          ratio: 4, // 4 spacers per kg of rebar (approximate)
          quantity: baseQuantity * 4,
          category: "Steel",
          element: "Accessories",
          materialType: "auxiliary" as const,
          requirements: ["Must meet cover requirements"],
          preparationSteps: ["Check size matches required cover"],
        },
      ];

      return {
        itemNo: generateItemNumber("REB", index + 1),
        description: `Ribbed bar High Yield steel reinforcement to ${validResult.primaryBarSize}`,
        unit: "kg",
        quantity: validResult.totalWeightKg || 0,
        rate: validResult.rate || 0,
        amount: validResult.totalPrice || 0,
        category: validResult.category,
        element: "Reinforcement",
        isHeader: false,
        calculatedFrom: elementMap.get(validResult.id) || "Unknown element",
        materialType: "steel" as const,
        workType: "Installation",
      };
    } catch (error) {
      console.error(`Error processing rebar item ${index + 1}:`, error);
      throw error;
    }
  });
};

interface Door {
  type: string;
  standardSize?: string;
  count: number;
  price: number;
  frame: {
    type: string;
    price: number;
  };
}

interface Room {
  room_name?: string;
  doors?: Door[];
}

const validateDoor = (door: any): Door => {
  if (!door) throw new Error("Door data is required");

  const validDoor: Door = {
    type: door.type || "Standard",
    standardSize: door.standardSize,
    count: parseInt(door.count, 10) || 0,
    price: parseFloat(door.price) || 0,
    frame: {
      type: door.frame?.type || "Standard",
      price: parseFloat(door.frame?.price) || 0,
    },
  };

  if (validDoor.count < 0) {
    throw new Error(`Invalid door count: ${validDoor.count}`);
  }
  if (validDoor.price < 0) {
    throw new Error(`Invalid door price: ${validDoor.price}`);
  }
  if (validDoor.frame.price < 0) {
    throw new Error(`Invalid frame price: ${validDoor.frame.price}`);
  }

  return validDoor;
};

export const mapDoorsToBOQ = (roomResults: any[]): BOQItem[] => {
  if (!Array.isArray(roomResults)) {
    throw new Error("Room results must be an array");
  }

  let index = 0;
  return roomResults.flatMap((room) =>
    (room.doors || []).map((doorData: any) => {
      index++;
      try {
        const door = validateDoor(doorData);
        const baseQuantity = door.count || 0;

        // Generate material breakdown for doors with quantities
        const materialBreakdown = [
          {
            material: "Door leaf",
            unit: "No.",
            ratio: 1,
            quantity: baseQuantity,
            category: "Openings",
            element: "Door",
            materialType: "primary" as const,
            requirements: [
              "Must meet specified dimensions",
              "Must match specified finish",
            ],
            preparationSteps: ["Inspect for damage", "Check operation"],
          },
          {
            material: "Hinges",
            unit: "Sets",
            ratio: 1.5, // Usually 3 hinges per door
            quantity: baseQuantity * 1.5,
            category: "Openings",
            element: "Hardware",
            materialType: "auxiliary" as const,
            requirements: [
              "Must be rust resistant",
              "Must match door weight rating",
            ],
            preparationSteps: ["Pre-drill mounting holes", "Apply lubricant"],
          },
          {
            material: "Lock set",
            unit: "No.",
            ratio: 1,
            quantity: baseQuantity,
            category: "Openings",
            element: "Hardware",
            materialType: "auxiliary" as const,
            requirements: [
              "Must match door thickness",
              "Must meet security requirements",
            ],
            preparationSteps: ["Test operation", "Install strike plate"],
          },
        ];

        return {
          itemNo: generateItemNumber("DOOR", index),
          description: `${door.type} Door (${door.standardSize || "custom"})`,
          unit: "No.",
          quantity: door.count,
          rate: door.price,
          amount: Math.round(door.price * door.count),
          category: "openings",
          element: "Door",
          isHeader: false,
          calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
          materialType: "other" as const,
          workType: "Installation",
        };
      } catch (error) {
        console.error(`Error processing door ${index}:`, error);
        throw error;
      }
    })
  );
};

export const mapDoorFramesToBOQ = (roomResults: any[]): BOQItem[] => {
  if (!Array.isArray(roomResults)) {
    throw new Error("Room results must be an array");
  }

  let index = 0;
  return roomResults.flatMap((room) =>
    (room.doors || []).map((doorData: any) => {
      index++;
      try {
        const door = validateDoor(doorData);
        const baseQuantity = door.count;

        // Generate material breakdown for door frames with quantities
        const materialBreakdown = [
          {
            material: "Door frame",
            unit: "No.",
            ratio: 1,
            quantity: baseQuantity,
            category: "Openings",
            element: "Door Frame",
            materialType: "primary" as const,
            requirements: [
              "Must match door dimensions",
              "Must be level and plumb",
            ],
            preparationSteps: [
              "Check wall opening",
              "Install anchors at proper spacing",
            ],
          },
          {
            material: "Frame anchors",
            unit: "Sets",
            ratio: 3, // Usually 6 anchors per frame
            quantity: baseQuantity * 3,
            category: "Openings",
            element: "Hardware",
            materialType: "auxiliary" as const,
            requirements: ["Must match frame type", "Must be properly spaced"],
            preparationSteps: ["Mark anchor points", "Pre-drill if needed"],
          },
        ];

        return {
          itemNo: generateItemNumber("FRAME", index),
          description: `${door.frame.type} Door Frame (${
            door.standardSize || "custom"
          })`,
          unit: "No.",
          quantity: door.count,
          rate: door.frame.price,
          amount: Math.round(door.frame.price * door.count),
          category: "openings",
          element: "Door Frame",
          isHeader: false,
          calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
          materialType: "other" as const,
          workType: "Installation",
        };
      } catch (error) {
        console.error(`Error processing door frame ${index}:`, error);
        throw error;
      }
    })
  );
};

interface WindowOpening {
  glass: string;
  standardSize?: string;
  count: number;
  price: number;
  frame: {
    type: string;
    price: number;
  };
}

const validateWindow = (windowData: any): WindowOpening => {
  if (!windowData) throw new Error("Window data is required");

  const validWindow: WindowOpening = {
    glass: windowData.glass || "Clear",
    standardSize: windowData.standardSize,
    count: parseInt(windowData.count, 10) || 0,
    price: parseFloat(windowData.price) || 0,
    frame: {
      type: windowData.frame?.type || "Standard",
      price: parseFloat(windowData.frame?.price) || 0,
    },
  };

  if (validWindow.count < 0) {
    throw new Error(`Invalid window count: ${validWindow.count}`);
  }
  if (validWindow.price < 0) {
    throw new Error(`Invalid window price: ${validWindow.price}`);
  }
  if (validWindow.frame.price < 0) {
    throw new Error(`Invalid frame price: ${validWindow.frame.price}`);
  }

  return validWindow;
};

export const mapWindowsToBOQ = (roomResults: any[]): BOQItem[] => {
  if (!Array.isArray(roomResults)) {
    throw new Error("Room results must be an array");
  }

  let index = 0;
  const items: BOQItem[] = [];

  for (const room of roomResults) {
    if (!room.windows || !Array.isArray(room.windows)) continue;

    for (const windowData of room.windows) {
      index++;
      try {
        const validWindow = validateWindow(windowData);
        const baseQuantity = validWindow.count;

        // Generate material breakdown for windows with quantities
        const materialBreakdown = [
          {
            material: "Glass pane",
            unit: "No.",
            ratio: 1,
            quantity: baseQuantity,
            category: "Openings",
            element: "Window",
            materialType: "primary" as const,
            requirements: [
              "Must meet glazing requirements",
              "Must be properly sealed",
            ],
            preparationSteps: ["Clean thoroughly", "Check for cracks"],
          },
          {
            material: "Glazing beads",
            unit: "Sets",
            ratio: 1,
            quantity: baseQuantity,
            category: "Openings",
            element: "Hardware",
            materialType: "auxiliary" as const,
            requirements: [
              "Must match frame type",
              "Must be weather resistant",
            ],
            preparationSteps: ["Cut to size", "Pre-drill if needed"],
          },
          {
            material: "Window hardware",
            unit: "Sets",
            ratio: 1,
            quantity: baseQuantity,
            category: "Openings",
            element: "Hardware",
            materialType: "auxiliary" as const,
            requirements: [
              "Must be corrosion resistant",
              "Must match window type",
            ],
            preparationSteps: ["Test operation", "Lubricate moving parts"],
          },
        ];

        items.push({
          itemNo: generateItemNumber("WIN", index),
          description: `${validWindow.glass} Glass Window (${
            validWindow.standardSize || "custom"
          })`,
          unit: "No.",
          quantity: validWindow.count,
          rate: validWindow.price,
          amount: Math.round(validWindow.price * validWindow.count),
          category: "openings",
          element: "Window",
          isHeader: false,
          calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
          materialType: "other" as const,
          workType: "Installation",
        });
      } catch (error) {
        console.error(`Error processing window ${index}:`, error);
        throw error;
      }
    }
  }

  return items;
};

export const mapWindowFramesToBOQ = (roomResults: any[]): BOQItem[] => {
  if (!Array.isArray(roomResults)) {
    throw new Error("Room results must be an array");
  }

  let index = 0;
  const items: BOQItem[] = [];

  for (const room of roomResults) {
    if (!room.windows || !Array.isArray(room.windows)) continue;

    for (const windowData of room.windows) {
      index++;
      try {
        const validWindow = validateWindow(windowData);
        const baseQuantity = validWindow.count;

        items.push({
          itemNo: generateItemNumber("WFRM", index),
          description: `${validWindow.frame.type} Window Frame (${
            validWindow.standardSize || "custom"
          })`,
          unit: "No.",
          quantity: validWindow.count,
          rate: validWindow.frame.price,
          amount: Math.round(validWindow.frame.price * validWindow.count),
          category: "openings",
          element: "Window Frame",
          isHeader: false,
          calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
          materialType: "other" as const,
          workType: "Installation",
        });
      } catch (error) {
        console.error(`Error processing window frame ${index}:`, error);
        throw error;
      }
    }
  }

  return items;
};
