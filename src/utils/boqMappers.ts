import { BOQItem } from "@/types/boq";
import { generateItemNumber } from "@/types/boq";

export const mapMasonryToBOQ = (roomResults: any[]): BOQItem[] => {
  // Group rooms by plastering (internal/external) + blockType
  const grouped: Record<string, any[]> = {};

  roomResults.forEach((room) => {
    const thickness = room.thickness || 200;
    const blockType = room.blockType || "Standard Block";

    // Decide plastering description
    let plasterGroup: string;
    if (room.plaster === "Both sides") {
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
    const totalNetArea = rooms.reduce((sum, r) => sum + (r.netArea || 0), 0);
    const totalRate = rooms.reduce((sum, r) => sum + (r.rate || 0), 0);

    return {
      itemNo: generateItemNumber("MAS", index + 1),
      description: `${plasterGroup} (${blockType})`,
      unit: "m²",
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
    };
  });
};

export const mapConcreteToBOQ = (
  concreteResults: any[],
  concreteMaterials: any[]
): BOQItem[] => {
  return concreteResults.flatMap((result, index) => {
    const rowId = result.name?.split(" ")[1];
    const totalItem = concreteMaterials.find(
      (item) => item.name === "Total items" && item.rowId === rowId
    );

    return {
      itemNo: generateItemNumber("CON", index + 1),
      description: `Vibrated reinforced concrete class ${
        result.mix || "20"
      } to ${result.name || "Element"}`,
      unit: "m³",
      quantity: totalItem?.quantity || 0,
      rate: totalItem?.total_price / totalItem?.quantity || 0,
      amount: totalItem?.total_price || 0,
      category: result.category,
      element: "Concrete",
      isHeader: false,
      calculatedFrom: result.name || "Unknown element",
    };
  });
};

// Map rebar calculator results
export const mapRebarToBOQ = (rebarResults: any[]): BOQItem[] => {
  return rebarResults.flatMap((result, index) => ({
    itemNo: generateItemNumber("REB", index + 1),
    description: `Ribbed bar High Yield steel reinforcement to ${
      result.primaryBarSize || "Y12"
    }`,
    unit: "kg",
    quantity: result.totalWeightKg || 0,
    rate: result.rate || 0,
    amount: result.totalPrice || 0,
    category: result.category,
    element: "Reinforcement",
    isHeader: false,
    calculatedFrom: result.element || "Unknown element",
  }));
};

export const mapDoorsToBOQ = (roomResults: any[]): BOQItem[] => {
  let index = 0;
  return roomResults.flatMap((room) =>
    (room.doors || []).map((door: any) => {
      index++;
      return {
        itemNo: generateItemNumber("DOOR", index),
        description: `${door.type} Door (${door.standardSize || "custom"}) `,
        unit: "No.",
        quantity: Number(door.count) || 0,
        rate: door.price || 0,
        amount: Math.round((door.price || 0) * (Number(door.count) || 1)),
        category: "openings",
        element: "Door",
        calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
      };
    })
  );
};

export const mapDoorFramesToBOQ = (roomResults: any[]): BOQItem[] => {
  let index = 0;
  return roomResults.flatMap((room) =>
    (room.doors || []).map((door: any) => {
      index++;
      return {
        itemNo: generateItemNumber("FRAME", index),
        description: `${door.frame.type} Door Frame (${
          door.standardSize || "custom"
        })`, // 🖼️ only the frame
        unit: "No.",
        quantity: Number(door.count) || 0,
        rate: door.frame.price || 0,
        amount: Math.round((door.frame.price || 0) * (Number(door.count) || 1)),
        category: "openings",
        element: "Door Frame",
        calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
      };
    })
  );
};

export const mapWindowsToBOQ = (roomResults: any[]): BOQItem[] => {
  let index = 0;
  return roomResults.flatMap((room) =>
    (room.windows || []).map((window: any) => {
      index++;
      return {
        itemNo: generateItemNumber("WIN", index),
        description: `${window.glass} Glass Window (${
          window.standardSize || "custom"
        })`,
        unit: "No.",
        quantity: Number(window.count) || 0,
        rate: window.price || 0,
        amount: Math.round((window.price || 0) * (Number(window.count) || 1)),
        category: "openings",
        element: "Window",
        calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
      };
    })
  );
};

export const mapWindowFramesToBOQ = (roomResults: any[]): BOQItem[] => {
  let index = 0;
  return roomResults.flatMap((room) =>
    (room.windows || []).map((window: any) => {
      index++;
      return {
        itemNo: generateItemNumber("WFRM", index),
        description: `${window.frame.type} Window Frame (${
          window.standardSize || "custom"
        })`, // 🖼️ only frame
        unit: "No.",
        quantity: Number(window.count) || 0,
        rate: window.frame.price || 0,
        amount: Math.round(
          (window.frame.price || 0) * (Number(window.count) || 1)
        ),
        category: "openings",
        element: "Window Frame",
        calculatedFrom: `Room: ${room.room_name || "Unnamed"}`,
      };
    })
  );
};
