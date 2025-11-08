import {
  Door,
  Window,
  Room,
  Wall,
  deduplicateWallsFunction,
} from "@/hooks/useMasonryCalculator";
import React, { createContext, useContext, useState } from "react";
export interface EquipmentSection {
  equipmentData: {
    standardEquipment: EquipmentItem[];
    customEquipment: EquipmentItem[];
    usageUnits: string[];
    categories: string[];
  };
}

export interface EquipmentItem {
  id?: string;
  name: string;
  description?: string;
  usage_unit?: string;
  rate_per_unit?: number;
  category?: string;
}
export interface ExtractedPlan {
  projectInfo?: {
    projectType: string;
    floors: number;
    totalArea: number;
    description: string;
  };

  rooms: {
    roomType: string;
    room_name: string;
    width: string;
    thickness: string;
    blockType: string;
    length: string;
    height: string;
    customBlock: {
      length: string;
      height: string;
      thickness: string;
      price: string;
    };
    plaster: string;
    doors: Door[];
    windows: Window[];
    generatedWalls?: Wall[]; // Temporary walls before deduplication
    wallRefs?: string[];
  }[];

  walls?: Array<{
    id: string;
    start: [number, number];
    end: [number, number];
    thickness: string;
    height: string;
    blockType: string;
    connectedRooms: string[]; // e.g. ["room1", "room2"]
    material?: string;
    area?: string;
  }>;
  floors: number;

  foundationDetails?: {
    foundationType: string;
    totalPerimeter: number;
    masonryType: string;
    wallThickness: string;
    wallHeight: string;
    blockDimensions?: string;
    length: string;
    width: string;
    height: string;
  };

  // New structural elements
  earthworks?: Array<{
    id: string;
    type: string;
    length: string;
    width: string;
    depth: string;
    volume: string;
    material: string;
  }>;

  equipment?: EquipmentSection;

  concreteStructures?: Array<{
    id: string;
    name: string;
    element: string;
    length: string;
    width: string;
    height: string;
    volume?: string;
    mix: string;
    formwork?: string;
    category: string;
    number: string;
    hasConcreteBed?: boolean;
    bedDepth?: string;
    hasAggregateBed?: boolean;
    aggregateDepth?: string;
    hasMasonryWall?: boolean;
    masonryBlockType?: string;
    masonryBlockDimensions?: string;
    masonryWallThickness?: string;
    masonryWallHeight?: string;
    masonryWallPerimeter?: number;
    foundationType?: string;
    clientProvidesWater?: boolean;
    cementWaterRatio?: string;
    reinforcement?: {
      mainBarSize?: string;
      mainBarSpacing?: string;
      distributionBarSize?: string;
      distributionBarSpacing?: string;
    };
    staircaseDetails?: {
      riserHeight?: string;
      treadWidth?: string;
      numberOfSteps?: number;
    };
    tankDetails?: {
      capacity?: string;
      wallThickness?: string;
      coverType?: string;
    };
  }>;

  reinforcement?: Array<{
    id: string;
    element: string;
    name: string;
    length: string;
    width: string;
    depth: string;
    mainBarSize: string;
    mainBarSpacing: string;
    distributionBarSize?: string;
    distributionBarSpacing?: string;
  }>;

  masonry?: Array<{
    id: string;
    type: string;
    blockType: string;
    length: string;
    height: string;
    thickness: string;
    area: string;
  }>;

  // Roofing systems
  roofing?: Array<{
    id: string;
    name: string;
    type: string;
    material: string;
    area: string;
    pitch: string;
    length?: string;
    width?: string;
    structure?: string;
    span?: string;
    perimeter?: string;
    ridgeLength?: string;
    flashingLength?: string;
    valleyLength?: string;
    thickness?: string;
    underlayment?: string;
    insulation?: {
      type: string;
      thickness: string;
    };
  }>;

  // Plumbing systems
  plumbing?: Array<{
    id: string;
    name: string;
    system: string;
    pipes?: Array<{
      id: string;
      material: string;
      diameter: string;
      length: string;
      pressureRating?: string;
      insulation?: {
        type: string;
        thickness: number;
      };
      trenchDetails?: {
        width: number;
        depth: number;
        length: number;
      };
    }>;
    fixtures?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      waterConsumption?: number;
    }>;
    tanks?: any[];
    pumps?: any[];
    fittings?: any[];
  }>;

  // Electrical systems
  electrical?: Array<{
    id: string;
    name: string;
    system: string;
    panels?: Array<{
      id: string;
      type: string;
      circuits: number;
      rating: string;
      accessories?: string[];
    }>;
    outlets?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      rating: string;
      gang?: number;
      mounting?: string;
    }>;
    lighting?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      wattage: string;
      controlType: string;
      emergency: boolean;
    }>;
    cables?: Array<{
      id: string;
      type: string;
      size: string;
      length: string;
      circuit: string;
      protection?: string;
      installationMethod?: string;
    }>;
    protectionDevices?: any[];
    voltage?: number;
  }>;

  // Finishes
  finishes?: Array<{
    id: string;
    type: string;
    material: string;
    area: string;
    length?: string;
    width?: string;
    height?: string;
    room?: string;
    specifications?: any;
  }>;

  // External works
  externalWorks?: Array<{
    id: string;
    type: string;
    material: string;
    area: string;
    length?: string;
    width?: string;
  }>;

  file_url?: string;
  file_name?: string;
  uploaded_at?: string;
  houseType?: string;
  projectType?: string;
  projectName?: string;
  projectLocation?: string;
}
interface PlanContextType {
  extractedPlan: ExtractedPlan | null;
  setExtractedPlan: (plan: ExtractedPlan) => void;
  deduplicateWalls: (plan: ExtractedPlan) => ExtractedPlan;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(
    null
  );

  const deduplicateWalls = (plan: ExtractedPlan): ExtractedPlan => {
    if (!plan.rooms || plan.rooms.length === 0) return plan;

    // Generate walls for each room if they don't exist
    const roomsWithGeneratedWalls = plan.rooms.map((room) => {
      if (!room.generatedWalls) {
        // Generate walls based on room dimensions
        room.generatedWalls = generateWallsFromRoom(room);
      }
      return room;
    });

    const { rooms, walls } = deduplicateWallsFunction(roomsWithGeneratedWalls);

    return {
      ...plan,
      rooms,
      masonry: walls.map((wall) => ({
        id: wall.id,
        type: "wall",
        blockType: wall.blockType,
        length: Math.sqrt(
          Math.pow(wall.end[0] - wall.start[0], 2) +
            Math.pow(wall.end[1] - wall.start[1], 2)
        ).toFixed(2),
        height: wall.height,
        thickness: wall.thickness,
        area: wall.area || calculateWallArea(wall).toFixed(2),
      })),
    };
  };

  // Helper function to generate walls from room dimensions
  const generateWallsFromRoom = (room: Room): Wall[] => {
    const length = parseFloat(room.length) || 0;
    const width = parseFloat(room.width) || 0;
    const height = parseFloat(room.height) || 0;

    const walls: Wall[] = [
      {
        id: `wall_${room.room_name}_1`,
        start: [0, 0],
        end: [length, 0],
        thickness: room.thickness,
        height: room.height,
        blockType: room.blockType,
        connectedRooms: [room.room_name],
        area: (length * height).toFixed(2),
      },
      {
        id: `wall_${room.room_name}_2`,
        start: [length, 0],
        end: [length, width],
        thickness: room.thickness,
        height: room.height,
        blockType: room.blockType,
        connectedRooms: [room.room_name],
        area: (width * height).toFixed(2),
      },
      {
        id: `wall_${room.room_name}_3`,
        start: [length, width],
        end: [0, width],
        thickness: room.thickness,
        height: room.height,
        blockType: room.blockType,
        connectedRooms: [room.room_name],
        area: (length * height).toFixed(2),
      },
      {
        id: `wall_${room.room_name}_4`,
        start: [0, width],
        end: [0, 0],
        thickness: room.thickness,
        height: room.height,
        blockType: room.blockType,
        connectedRooms: [room.room_name],
        area: (width * height).toFixed(2),
      },
    ];

    return walls;
  };

  const calculateWallArea = (wall: Wall): number => {
    const length = Math.sqrt(
      Math.pow(wall.end[0] - wall.start[0], 2) +
        Math.pow(wall.end[1] - wall.start[1], 2)
    );
    const height = parseFloat(wall.height) || 0;
    return length * height;
  };

  const contextValue: PlanContextType = {
    extractedPlan,
    setExtractedPlan: (plan: ExtractedPlan) => {
      // Auto-deduplicate walls when setting a new plan
      const planWithDeduplicatedWalls = deduplicateWalls(plan);
      setExtractedPlan(planWithDeduplicatedWalls);
    },
    deduplicateWalls,
  };

  return (
    <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>
  );
};
export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within a PlanProvider");
  return context;
};
