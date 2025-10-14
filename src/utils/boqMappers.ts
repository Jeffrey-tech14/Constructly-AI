import { BOQItem, BOQSection } from "@/types/boq";
import { generateItemNumber } from "@/types/boq";
import { MaterialConfigurations } from "@/config/materialConfig";
interface MasonryRoom {
    thickness: number;
    blockType?: string;
    plaster?: string;
    blocks?: number;
    blockCost?: number;
    blockRate?: number;
    room_name?: string;
    net_area: number;
}
export const validateMasonryRoom = (room: any): MasonryRoom => {
    if (!room)
        throw new Error("Room data is required");
    const validRoom: MasonryRoom = {
        thickness: parseFloat(room.thickness) || 0.2,
        blockType: room.blockType || "Standard Block",
        plaster: room.plaster || "Both Sides",
        blocks: room.grossBlocks || 10,
        blockCost: room.blockCost,
        room_name: room.room_name || "Unnamed Room",
        net_area: room.netArea,
        blockRate: Number(room.blockRate),
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
    const masonryConfig = MaterialConfigurations.masonry;
    if (!masonryConfig) {
        throw new Error("Masonry configuration not found");
    }
    const validatedRooms = roomResults.map((room, index) => {
        try {
            return validateMasonryRoom(room);
        }
        catch (error: any) {
            throw new Error(`Error in room ${index + 1}: ${error.message}`);
        }
    });
    const grouped: Record<string, MasonryRoom[]> = {};
    validatedRooms.forEach((room) => {
        const wallType = room.plaster?.toLowerCase().includes("one")
            ? "external"
            : "internal";
        const key = `${wallType}_${room.thickness}_${room.blockType}`;
        if (!grouped[key])
            grouped[key] = [];
        grouped[key].push(room);
    });
    return Object.entries(grouped).map(([key, rooms], index) => {
        const [wallType, thickness, blockType] = key.split("_");
        const totalArea = rooms.reduce((sum, room) => sum + (Number(room.blocks) || 0), 0);
        const totalCost = rooms.reduce((sum, room) => sum + (Number(room.blockCost) || 0), 0);
        const totalRate = totalArea > 0 ? totalCost / totalArea : Number(rooms[0]?.blockRate ?? 0);
        return {
            itemNo: generateItemNumber("MAS", index + 1),
            description: `${thickness}m Thick ${wallType === "external" ? "External" : "Internal"} Walling (${blockType})`,
            unit: "m\u00B2",
            quantity: Math.ceil(totalArea),
            rate: Number(totalRate.toFixed(2)),
            amount: Math.round(totalCost),
            category: "superstructure",
            element: "Masonry",
            isHeader: false,
            calculatedFrom: rooms
                .map((r) => `Room: ${r.room_name || "Unnamed"}`)
                .join(", "),
            materialType: "masonry" as const,
            workType: wallType === "external" ? "External Walling" : "Internal Walling",
        };
    });
};
interface ConcreteResult {
    name?: string;
    mix?: string;
    element?: string;
    category?: string;
}
export const mapConcreteToBOQ = (concreteResults: any[], concreteMaterials: any[]): BOQItem[] => {
    return concreteResults
        .map((result, index) => {
        const totalItem = concreteMaterials.find((item) => item.rowId === result.id &&
            (item.name.includes("Concrete Total") ||
                item.name.includes("Total items")));
        if (!totalItem) {
            console.warn(`No total found for concrete element: ${result.id}`);
            return null;
        }
        return {
            itemNo: generateItemNumber("CON", index + 1),
            description: `Vibrated reinforced concrete class ${result.mix} to ${result.element}`,
            unit: "m\u00B3",
            quantity: Math.ceil(totalItem.quantity || 0),
            rate: Math.ceil(totalItem.rate || 0),
            amount: Math.ceil(totalItem.total_price || 0),
            category: result.category,
            element: result.element,
            isHeader: false,
            calculatedFrom: result.name,
            materialType: "concrete" as const,
            workType: "Cast in-situ",
        };
    })
        .filter(Boolean);
};
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
    if (!data)
        throw new Error("Foundation walling data is required");
    const validData: FoundationWallingData = {
        masonryBlockType: data.materials[0].masonryBlockType,
        masonryWallThickness: parseFloat(data.materials[0].masonryWallThickness) || 0,
        masonryWallHeight: parseFloat(data.materials[0].masonryWallHeight) || 0,
        totalBlocks: Math.ceil(data.quantity) || 0,
        masonryMortarCementBags: parseFloat(data.materials[0].masonryMortarCementBags) || 0,
        masonryMortarSandM3: parseFloat(data.materials[0].masonryMortarSandM3) || 0,
        room_name: data.materials[0].element || "Unnamed",
        unitPrice: data.unit_price,
        totalPrice: Math.round(data.total_price),
    };
    if (validData.totalBlocks < 0) {
        throw new Error(`Invalid block count: ${validData.totalBlocks}`);
    }
    if (validData.masonryWallThickness <= 0) {
        throw new Error(`Invalid wall thickness: ${validData.masonryWallThickness}`);
    }
    return validData;
};
export const mapFoundationWallingToBOQ = (concreteResults: any[], concreteCalc: any[]): BOQItem[] => {
    if (!Array.isArray(concreteResults)) {
        throw new Error("Concrete results must be an array");
    }
    const concreteData = concreteCalc.map((calc) => {
        const relatedResults = concreteResults.filter((res) => res.rowId === calc.id);
        const results = relatedResults.filter((res) => res.element === "foundation");
        return {
            ...calc,
            materials: results,
            totals: relatedResults
                .filter((r) => r.name.includes("Total"))
                .map(({ name, total_price }) => ({ name, total_price })),
        };
    });
    const masonryConfig = MaterialConfigurations.concrete;
    if (!masonryConfig) {
        throw new Error("Masonry configuration not found");
    }
    const foundationWallingData = concreteData.filter((result) => {
        const hasFoundationWall = result.materials.filter((m) => m.element === "foundation" && m.hasMasonryWall);
        return (result.name?.includes("Total") &&
            result.name?.includes("Block") &&
            hasFoundationWall);
    });
    return foundationWallingData.flatMap((result, index) => {
        try {
            const validData = validateFoundationWalling(result);
            const thickness = validData.masonryWallThickness * 1000;
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
        }
        catch (error) {
            console.error(`Error processing foundation walling item ${index + 1}:`, error);
            throw error;
        }
    });
};
export const mapRebarToBOQ = (rebarResults: any[], rebarRows: any[]): BOQItem[] => {
    const elementMap = new Map(rebarRows.map((row) => [row.id.toString(), row.element]));
    return rebarResults.map((result, index) => {
        const elementName = elementMap.get(result.id?.toString()) || "Unknown";
        return {
            itemNo: generateItemNumber("REB", index + 1),
            description: `Ribbed bar High Yield steel reinforcement to ${result.primaryBarSize}`,
            unit: "kg",
            quantity: result.totalWeightKg || 0,
            rate: result.rate || 0,
            amount: result.totalPrice || 0,
            category: result.category,
            element: "Reinforcement",
            isHeader: false,
            calculatedFrom: elementName,
            materialType: "steel" as const,
            workType: "Installation",
        };
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
const validateDoor = (door: any): Door => {
    if (!door)
        throw new Error("Door data is required");
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
    return roomResults.flatMap((room) => (room.doors || []).map((doorData: any) => {
        index++;
        try {
            const door = validateDoor(doorData);
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
        }
        catch (error) {
            console.error(`Error processing door ${index}:`, error);
            throw error;
        }
    }));
};
export const mapDoorFramesToBOQ = (roomResults: any[]): BOQItem[] => {
    if (!Array.isArray(roomResults)) {
        throw new Error("Room results must be an array");
    }
    let index = 0;
    return roomResults.flatMap((room) => (room.doors || []).map((doorData: any) => {
        index++;
        try {
            const door = validateDoor(doorData);
            return {
                itemNo: generateItemNumber("FRAME", index),
                description: `${door.frame.type} Door Frame (${door.standardSize || "custom"})`,
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
        }
        catch (error) {
            console.error(`Error processing door frame ${index}:`, error);
            throw error;
        }
    }));
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
    if (!windowData)
        throw new Error("Window data is required");
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
        if (!room.windows || !Array.isArray(room.windows))
            continue;
        for (const windowData of room.windows) {
            index++;
            try {
                const validWindow = validateWindow(windowData);
                items.push({
                    itemNo: generateItemNumber("WIN", index),
                    description: `${validWindow.glass} Glass Window (${validWindow.standardSize || "custom"})`,
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
            }
            catch (error) {
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
        if (!room.windows || !Array.isArray(room.windows))
            continue;
        for (const windowData of room.windows) {
            index++;
            try {
                const validWindow = validateWindow(windowData);
                items.push({
                    itemNo: generateItemNumber("WFRM", index),
                    description: `${validWindow.frame.type} Window Frame (${validWindow.standardSize || "custom"})`,
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
            }
            catch (error) {
                console.error(`Error processing window frame ${index}:`, error);
                throw error;
            }
        }
    }
    return items;
};
