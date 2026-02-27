import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  DoorOpen,
  LucideAppWindow,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Door,
  WallSection,
  Window,
  getRecommendedGlassThickness,
  isGlassThicknessSufficient,
} from "@/hooks/useMasonryCalculatorNew";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

// STEP 1: 5 Door specification types
export const DOOR_TYPES = [
  "Steel",
  "Solid flush",
  "Semi-solid flush",
  "Panel",
  "T&G",
  "Aluminium",
];
// STEP 2: 5 Glass types with 7 thickness options
export const WINDOW_GLASS_TYPES = ["Clear", "Tinted", "Frosted"];
export const FRAME_TYPES = ["Wood", "Steel", "Aluminum"];
export const STANDARD_DOOR_SIZES = [
  "0.9 × 2.1 m",
  "1.0 × 2.1 m",
  "1.2 × 2.4 m",
];
export const STANDARD_WINDOW_SIZES = [
  "1.2 × 1.2 m",
  "1.5 × 1.2 m",
  "2.0 × 1.5 m",
];

// STEP 2: Glass thickness options (7 options: 3-12mm)
export const GLASS_THICKNESS_OPTIONS = [3, 4, 5, 6, 8, 10, 12];
const DOOR_DEFAULT_HEIGHT_M = "2.1";
const DOOR_TRANSOM_HEIGHT_M = "0.3";
const DOOR_DEFAULT_WIDTH_M = "0.9";

const normalizeWallThicknessMm = (
  thickness?: number,
  type?: "external" | "internal",
) => {
  if (!thickness || Number.isNaN(thickness)) {
    return type === "external" ? 200 : 150;
  }
  const mm = thickness < 1 ? thickness * 1000 : thickness;
  return mm >= 175 ? 200 : 150;
};

const getBlockThicknessMmFromType = (blockType?: string): number => {
  const normalized = (blockType || "").toLowerCase();
  if (normalized.includes("large block")) return 200;
  if (normalized.includes("small block")) return 100;
  if (normalized.includes("standard")) return 150;
  return 150;
};

const parseFrameSizeLabel = (label: string) => {
  const matches = label.match(/(\d+(?:\.\d+)?)/g);
  if (!matches || matches.length < 2) return null;
  return { height: matches[0], width: matches[1] };
};

const parseStandardSize = (size: string) => {
  if (!size) return null;
  const cleaned = size.replace(/[×x]/g, "x").replace(/[^\d.x]/g, "");
  const [width, height] = cleaned.split("x").map((part) => parseFloat(part));
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { width, height };
};

const getTotalPrice = (
  quantity?: number,
  unitPrice?: number,
  count?: number,
) => {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  const multiplier = Number.isFinite(Number(count)) ? Number(count) : 1;
  return qty * price * multiplier;
};

const normalizeFastenerKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const resolveFastenerCategory = (
  fastenersType: Record<string, any> | undefined,
  category: string,
) => {
  if (!fastenersType) return null;
  const target = normalizeFastenerKey(category);
  const candidates = target.endsWith("s")
    ? [target, target.slice(0, -1)]
    : [target];
  const match = Object.keys(fastenersType).find((key) =>
    candidates.includes(normalizeFastenerKey(key)),
  );
  return match || null;
};

const getMaterialTypePrice = (
  materialData: any[] | undefined,
  materialName: string,
  typeName?: string,
) => {
  if (!Array.isArray(materialData)) return null;
  const material = materialData.find(
    (m: any) => (m.name || "").toLowerCase() === materialName.toLowerCase(),
  );
  if (!material) return null;
  const types = material.type;
  if (Array.isArray(types)) {
    const match = typeName
      ? types.find((t: any) => t.type === typeName || t.name === typeName)
      : types[0];
    return match?.price ?? match?.price_kes ?? match?.unit_price ?? null;
  }
  if (types && typeof types === "object" && typeName) {
    return types[typeName] ?? null;
  }
  return material.price ?? material.price_kes ?? material.unit_price ?? null;
};

interface DoorsWindowsEditorProps {
  wallSections: WallSection[];
  onUpdate: (sections: WallSection[]) => void;
  materialData?: any;
  readonly?: boolean;
}

const DoorsWindowsEditor = ({
  wallSections,
  onUpdate,
  materialData,
  readonly = false,
}: DoorsWindowsEditorProps) => {
  const [activeTab, setActiveTab] = React.useState<"external" | "internal">(
    "external",
  );

  const updateSections = (
    updater: (sections: WallSection[]) => WallSection[],
  ) => {
    onUpdate(updater([...(wallSections || [])]));
  };

  const addWallSection = (type: "external" | "internal") => {
    const thickness = type === "external" ? 0.2 : 0.15;
    updateSections((sections) => [
      ...sections,
      { type, thickness, doors: [], windows: [], plaster: "Both Sides" },
    ]);
  };

  const addDoor = (sectionIndex: number) => {
    const section = wallSections?.[sectionIndex];
    const blockThickness = getBlockThicknessMmFromType(section?.blockType);
    const wallThickness =
      blockThickness ||
      normalizeWallThicknessMm(section?.thickness, section?.type);
    const newDoor: Door = {
      sizeType: "standard",
      standardSize: STANDARD_DOOR_SIZES[0],
      custom: { height: DOOR_DEFAULT_HEIGHT_M, width: DOOR_DEFAULT_WIDTH_M },
      type: DOOR_TYPES[0],
      count: 1,
      wallThickness,
      frame: {
        type: FRAME_TYPES[0],
        price: 0,
        sizeType: "custom",
        standardSize: STANDARD_DOOR_SIZES[0],
        height: STANDARD_DOOR_SIZES[0].split("×")[1].trim(),
        width: STANDARD_DOOR_SIZES[0].split("×")[0].trim(),
        thickness:
          wallThickness >= 175 ? "200" : wallThickness >= 125 ? "150" : "100",
        custom: {
          height: STANDARD_DOOR_SIZES[0].split("×")[1].trim(),
          width: STANDARD_DOOR_SIZES[0].split("×")[0].trim(),
          price: 0,
        },
      },
      architrave: {
        selected: {
          type: "timber-architrave",
          size: "40x20mm",
        },
        quantity: 1,
        price: 0,
      },
      transom: {
        enabled: false,
        height: DOOR_TRANSOM_HEIGHT_M,
        width: DOOR_DEFAULT_WIDTH_M,
        quantity: 1,
        price: 0,
        glazing: {
          included: true,
          glassAreaM2: 0,
          glassPricePerM2: 0,
        },
      },
      quarterRound: {
        selected: {
          type: "timber-quarter-round",
          size: "20mm",
        },
        quantity: 1,
        price: 0,
      },
      ironmongery: {
        hinges: {
          selected: {
            type: "butt-hinge",
            size: "100mm",
          },
          quantity: 3,
          price: 0,
          enabled: true,
        },
        locks: {
          selected: {
            type: "mortice-lock",
            size: "3-lever",
          },
          quantity: 1,
          price: 0,
          enabled: true,
        },
        handles: {
          selected: {
            type: "lever-handle",
            size: "standard",
          },
          quantity: 1,
          price: 0,
          enabled: true,
        },
        bolts: {
          selected: {
            type: "tower-bolt",
            size: "150mm",
          },
          quantity: 0,
          price: 0,
          enabled: false,
        },
        closers: {
          selected: {
            type: "overhead-closer",
            size: "standard",
          },
          quantity: 0,
          price: 0,
          enabled: false,
        },
      },
    };

    updateSections((sections) => {
      const updated = [...sections];
      const doors = [...(updated[sectionIndex].doors || []), newDoor];
      updated[sectionIndex] = { ...updated[sectionIndex], doors };
      return updated;
    });
  };

  React.useEffect(() => {
    if (!wallSections || wallSections.length === 0) return;
    let updatedAny = false;
    const updatedSections = wallSections.map((section) => {
      const blockThickness = getBlockThicknessMmFromType(section?.blockType);
      const sectionThickness =
        blockThickness ||
        normalizeWallThicknessMm(section?.thickness, section?.type);
      const updatedDoors = (section.doors || []).map((door) => {
        if (door.wallThickness !== undefined && door.wallThickness !== null)
          return door;
        updatedAny = true;
        return {
          ...door,
          wallThickness: sectionThickness,
          frame: {
            ...door.frame,
          },
        };
      });
      const updatedWindows = (section.windows || []).map((window) => {
        if (window.wallThickness !== undefined && window.wallThickness !== null)
          return window;
        updatedAny = true;
        return {
          ...window,
          wallThickness: sectionThickness,
          frame: {
            ...window.frame,
          },
        };
      });
      if (!updatedAny) return section;
      return {
        ...section,
        doors: updatedDoors,
        windows: updatedWindows,
      };
    });
    if (updatedAny) {
      onUpdate(updatedSections);
    }
  }, [onUpdate, wallSections]);

  // Initialize frame thickness based on wall thickness
  React.useEffect(() => {
    if (!wallSections || wallSections.length === 0) return;
    let updatedAny = false;
    const updatedSections = wallSections.map((section) => {
      const blockThickness = getBlockThicknessMmFromType(section?.blockType);
      const sectionThickness =
        blockThickness ||
        normalizeWallThicknessMm(section?.thickness, section?.type);

      const updatedDoors = (section.doors || []).map((door) => {
        if (door.frame?.thickness) return door;
        updatedAny = true;
        const thickness =
          sectionThickness >= 175
            ? "200"
            : sectionThickness >= 125
              ? "150"
              : "100";
        return {
          ...door,
          frame: {
            ...door.frame,
            thickness,
          },
        };
      });

      const updatedWindows = (section.windows || []).map((window) => {
        if (window.frame?.thickness) return window;
        updatedAny = true;
        const thickness =
          sectionThickness >= 175
            ? "200"
            : sectionThickness >= 125
              ? "150"
              : "100";
        return {
          ...window,
          frame: {
            ...window.frame,
            thickness,
          },
        };
      });

      if (!updatedAny) return section;
      return {
        ...section,
        doors: updatedDoors,
        windows: updatedWindows,
      };
    });
    if (updatedAny) {
      onUpdate(updatedSections);
    }
  }, [onUpdate, wallSections]);

  const addWindow = (sectionIndex: number) => {
    const section = wallSections?.[sectionIndex];
    const blockThickness = getBlockThicknessMmFromType(section?.blockType);
    const wallThickness =
      blockThickness ||
      normalizeWallThicknessMm(section?.thickness, section?.type);
    const newWindow: Window = {
      sizeType: "standard",
      standardSize: STANDARD_WINDOW_SIZES[0],
      price: 0,
      custom: { height: "1.2", width: "1.2", price: 0 },
      type: "Clear",
      count: 1,
      wallThickness,
      frame: {
        type: FRAME_TYPES[0],
        price: 0,
        sizeType: "standard",
        standardSize: STANDARD_WINDOW_SIZES[0],
        height: STANDARD_WINDOW_SIZES[0].split("×")[1].trim(),
        width: STANDARD_WINDOW_SIZES[0].split("×")[0].trim(),
        thickness:
          wallThickness >= 175 ? "200" : wallThickness >= 125 ? "150" : "100",
        custom: {
          height: STANDARD_WINDOW_SIZES[0].split("×")[1].trim(),
          width: STANDARD_WINDOW_SIZES[0].split("×")[0].trim(),
          price: 0,
        },
      },
      ironmongery: {
        hinges: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        locks: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        handles: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        bolts: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        closers: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
      },
      glassType: "Clear",
      glassThickness: 3,
      span: 1.2,
      isGlassUnderSized: false,
      recommendedGlassThickness: 3,
      glazing: {
        glass: {
          type: "Clear",
          thickness: 3,
          quantity: 1,
          pricePerM2: 0,
        },
        putty: {
          size: "1 kg tin",
          quantity: 1,
          unit: "m",
          price: 0,
          lengthNeeded: 0,
          tinsNeeded: 1,
        },
      },
    };

    updateSections((sections) => {
      const updated = [...sections];
      const windows = [...(updated[sectionIndex].windows || []), newWindow];
      updated[sectionIndex] = { ...updated[sectionIndex], windows };
      return updated;
    });
  };

  const updateDoor = (
    sectionIndex: number,
    doorIndex: number,
    field: string,
    value: any,
  ) => {
    updateSections((sections) => {
      const updated = [...sections];
      const doors = [...(updated[sectionIndex].doors || [])];
      doors[doorIndex] = { ...doors[doorIndex], [field]: value };
      updated[sectionIndex] = { ...updated[sectionIndex], doors };
      return updated;
    });
  };

  const updateWindow = (
    sectionIndex: number,
    windowIndex: number,
    field: string,
    value: any,
  ) => {
    updateSections((sections) => {
      const updated = [...sections];
      const windows = [...(updated[sectionIndex].windows || [])];
      if (field === "__batch" && value && typeof value === "object") {
        windows[windowIndex] = { ...windows[windowIndex], ...value };
      } else {
        windows[windowIndex] = { ...windows[windowIndex], [field]: value };
      }
      updated[sectionIndex] = { ...updated[sectionIndex], windows };
      return updated;
    });
  };

  const removeDoor = (sectionIndex: number, doorIndex: number) => {
    updateSections((sections) => {
      const updated = [...sections];
      const doors = updated[sectionIndex].doors?.filter(
        (_, i) => i !== doorIndex,
      );
      updated[sectionIndex] = { ...updated[sectionIndex], doors };
      return updated;
    });
  };

  const removeWindow = (sectionIndex: number, windowIndex: number) => {
    updateSections((sections) => {
      const updated = [...sections];
      const windows = updated[sectionIndex].windows?.filter(
        (_, i) => i !== windowIndex,
      );
      updated[sectionIndex] = { ...updated[sectionIndex], windows };
      return updated;
    });
  };

  const getFastenerPrice = (
    fastenerCategory: string,
    selected?: { type?: string; size?: string },
  ) => {
    if (!selected?.type || !selected?.size) return 0;
    try {
      const fastenersMaterial = materialData?.find(
        (m: any) => m.name?.toLowerCase() === "fasteners",
      );
      const resolvedCategory = resolveFastenerCategory(
        fastenersMaterial?.type,
        fastenerCategory,
      );
      const categoryKey =
        resolvedCategory || fastenerCategory?.toLowerCase() || "";
      const options = Array.isArray(fastenersMaterial?.type?.[categoryKey])
        ? fastenersMaterial.type[categoryKey]
        : [];
      const fastener = options.find(
        (opt: any) => opt.type === selected.type && opt.size === selected.size,
      );
      return Number(fastener?.price) || 0;
    } catch (error) {
      console.warn(`Error getting fastener price:`, error);
      return 0;
    }
  };

  const getGlassUnitPrice = (glassType?: string) =>
    Number(
      getMaterialTypePrice(materialData, "Glazing", glassType || "Clear"),
    ) || 0;

  const getPuttyUnitPrice = () =>
    Number(
      getMaterialTypePrice(materialData, "Sealant", "Glazing Putty") ??
        getMaterialTypePrice(materialData, "Sealant", "Putty") ??
        getMaterialTypePrice(materialData, "Sealant", "Silicone"),
    ) || 0;

  const summaryTotals = React.useMemo(() => {
    const totals = {
      doorLeaves: 0,
      doorFrames: 0,
      windowLeaves: 0,
      windowFrames: 0,
      doorArchitrave: 0,
      windowArchitrave: 0,
      doorQuarterRound: 0,
      doorIronmongery: 0,
      doorTransom: 0,
      windowGlass: 0,
      windowPutty: 0,
      transomGlass: 0,
      transomPutty: 0,
    };

    (wallSections || []).forEach((section) => {
      (section.doors || []).forEach((door) => {
        const count = Number(door.count) || 0;
        const doorPrice = Number(door.custom?.price ?? door.price) || 0;
        const framePrice =
          Number(door.frame?.custom?.price ?? door.frame?.price) || 0;
        totals.doorLeaves += doorPrice * count;
        totals.doorFrames += framePrice * count;

        if (door.architrave?.quantity) {
          const unit =
            Number(door.architrave?.price) ||
            getFastenerPrice("Architraves", door.architrave?.selected);
          totals.doorArchitrave +=
            (Number(door.architrave.quantity) || 0) * unit * count;
        }

        if (door.quarterRound?.quantity) {
          const unit =
            Number(door.quarterRound?.price) ||
            getFastenerPrice("Quarter_Rounds", door.quarterRound?.selected);
          totals.doorQuarterRound +=
            (Number(door.quarterRound.quantity) || 0) * unit * count;
        }

        if (door.ironmongery) {
          const hinge = door.ironmongery.hinges;
          const lock = door.ironmongery.locks;
          const handle = door.ironmongery.handles;
          const bolt = door.ironmongery.bolts;
          const closer = door.ironmongery.closers;

          const hingeUnit =
            Number(hinge?.price) || getFastenerPrice("Hinges", hinge?.selected);
          const lockUnit =
            Number(lock?.price) || getFastenerPrice("Locks", lock?.selected);
          const handleUnit =
            Number(handle?.price) ||
            getFastenerPrice("Handles", handle?.selected);
          const boltUnit =
            Number(bolt?.price) || getFastenerPrice("Bolts", bolt?.selected);
          const closerUnit =
            Number(closer?.price) ||
            getFastenerPrice("Closers", closer?.selected);

          if (hinge?.enabled) {
            totals.doorIronmongery +=
              (Number(hinge?.quantity) || 0) * hingeUnit * count;
          }
          if (lock?.enabled) {
            totals.doorIronmongery +=
              (Number(lock?.quantity) || 0) * lockUnit * count;
          }
          if (handle?.enabled) {
            totals.doorIronmongery +=
              (Number(handle?.quantity) || 0) * handleUnit * count;
          }
          if (bolt?.enabled) {
            totals.doorIronmongery +=
              (Number(bolt?.quantity) || 0) * boltUnit * count;
          }
          if (closer?.enabled) {
            totals.doorIronmongery +=
              (Number(closer?.quantity) || 0) * closerUnit * count;
          }
        }

        if (door.transom?.quantity && door.transom?.price) {
          totals.doorTransom +=
            (Number(door.transom.quantity) || 0) *
            (Number(door.transom.price) || 0) *
            count;
        }

        if (door.transom?.glazing?.glassAreaM2) {
          const glassUnit =
            Number(door.transom.glazing?.glassPricePerM2) ||
            getGlassUnitPrice("Clear");
          totals.transomGlass +=
            (Number(door.transom.glazing.glassAreaM2) || 0) *
            glassUnit *
            (Number(door.transom?.quantity) || 1) *
            count;
        }
      });

      (section.windows || []).forEach((window) => {
        const count = Number(window.count) || 0;
        const windowPrice = Number(window.custom?.price ?? window.price) || 0;
        const framePrice =
          Number(window.frame?.custom?.price ?? window.frame?.price) || 0;
        totals.windowLeaves += windowPrice * count;
        totals.windowFrames += framePrice * count;

        const parsed =
          window.sizeType === "standard"
            ? parseStandardSize(window.standardSize)
            : {
                width: Number(window.custom?.width) || 0,
                height: Number(window.custom?.height) || 0,
              };
        const windowArea = (parsed?.width || 0) * (parsed?.height || 0);
        const panes = Number(window.glazing?.glass?.quantity) || 1;
        const glassUnit =
          Number(window.glazing?.glass?.pricePerM2) ||
          getGlassUnitPrice(window.glazing?.glass?.type || window.glassType);
        totals.windowGlass += windowArea * panes * glassUnit * count;

        const puttyUnit =
          Number(window.glazing?.putty?.price) || getPuttyUnitPrice();
        totals.windowPutty +=
          (Number(window.glazing?.putty?.quantity) || 0) * puttyUnit * count;
      });
    });

    return totals;
  }, [materialData, wallSections]);

  if (!wallSections || wallSections.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No wall sections found yet. Add wall sections to start adding doors
          and windows.
        </p>
        {!readonly && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addWallSection("external")}
            >
              Add External Wall Section
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addWallSection("internal")}
            >
              Add Internal Wall Section
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {!readonly && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addWallSection("external")}
            >
              Add External Wall Section
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addWallSection("internal")}
            >
              Add Internal Wall Section
            </Button>
          </>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "external" | "internal")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            External Walls
          </TabsTrigger>
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Internal Walls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="external" className="space-y-4 mt-4">
          {wallSections
            .filter((section) => section.type === "external")
            .map((section, sectionIdx) => {
              const actualIdx = wallSections.indexOf(section);
              return (
                <Card
                  key={`external-${actualIdx}`}
                  className={`p-4 rounded-3xl border`}
                >
                  <h5 className=" mb-3 capitalize flex items-center text-green-900 dark:text-green-100">
                    <Building className="w-4 h-4 mr-2" />
                    External Wall Section
                  </h5>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <DoorOpen className="w-3 h-3 mr-1" />
                        Doors ({section.doors?.length || 0})
                      </p>
                      {!readonly && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addDoor(actualIdx)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Door
                        </Button>
                      )}
                    </div>
                    {section.doors && section.doors.length > 0 ? (
                      <div className="space-y-2">
                        {section.doors.map((door, doorIdx) => (
                          <EditableDoorWindow
                            key={`door-${actualIdx}-${doorIdx}`}
                            type="door"
                            item={door}
                            onUpdate={(field, value) =>
                              updateDoor(actualIdx, doorIdx, field, value)
                            }
                            onRemove={() => removeDoor(actualIdx, doorIdx)}
                            standardSizes={STANDARD_DOOR_SIZES}
                            types={DOOR_TYPES}
                            frameTypes={FRAME_TYPES}
                            sectionWallThicknessMm={
                              getBlockThicknessMmFromType(section.blockType) ||
                              normalizeWallThicknessMm(
                                section.thickness,
                                section.type,
                              )
                            }
                            materialData={materialData}
                            readonly={readonly}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No doors added
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <LucideAppWindow className="w-3 h-3 mr-1" />
                        Windows ({section.windows?.length || 0})
                      </p>
                      {!readonly && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addWindow(actualIdx)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Window
                        </Button>
                      )}
                    </div>
                    {section.windows && section.windows.length > 0 ? (
                      <div className="space-y-2">
                        {section.windows.map((window, windowIdx) => (
                          <EditableDoorWindow
                            key={`window-${actualIdx}-${windowIdx}`}
                            type="window"
                            item={window}
                            onUpdate={(field, value) =>
                              updateWindow(actualIdx, windowIdx, field, value)
                            }
                            onRemove={() => removeWindow(actualIdx, windowIdx)}
                            standardSizes={STANDARD_WINDOW_SIZES}
                            types={WINDOW_GLASS_TYPES}
                            frameTypes={FRAME_TYPES}
                            sectionWallThicknessMm={section.thickness}
                            materialData={materialData}
                            readonly={readonly}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No windows added
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          {wallSections.filter((section) => section.type === "external")
            .length === 0 && (
            <p className="text-sm text-slate-500 italic text-center py-8">
              No external wall sections added. Click "Add External Wall Section"
              to get started.
            </p>
          )}
        </TabsContent>

        <TabsContent value="internal" className="space-y-4 mt-4">
          {wallSections
            .filter((section) => section.type === "internal")
            .map((section, sectionIdx) => {
              const actualIdx = wallSections.indexOf(section);
              return (
                <Card
                  key={`internal-${actualIdx}`}
                  className={`p-4 rounded-3xl border`}
                >
                  <h5 className=" mb-3 capitalize flex items-center text-blue-900 dark:text-blue-100">
                    <Building className="w-4 h-4 mr-2" />
                    Internal Wall Section
                  </h5>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <DoorOpen className="w-3 h-3 mr-1" />
                        Doors ({section.doors?.length || 0})
                      </p>
                      {!readonly && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addDoor(actualIdx)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Door
                        </Button>
                      )}
                    </div>
                    {section.doors && section.doors.length > 0 ? (
                      <div className="space-y-2">
                        {section.doors.map((door, doorIdx) => (
                          <EditableDoorWindow
                            key={`door-${actualIdx}-${doorIdx}`}
                            type="door"
                            item={door}
                            onUpdate={(field, value) =>
                              updateDoor(actualIdx, doorIdx, field, value)
                            }
                            onRemove={() => removeDoor(actualIdx, doorIdx)}
                            standardSizes={STANDARD_DOOR_SIZES}
                            types={DOOR_TYPES}
                            frameTypes={FRAME_TYPES}
                            sectionWallThicknessMm={
                              getBlockThicknessMmFromType(section.blockType) ||
                              normalizeWallThicknessMm(
                                section.thickness,
                                section.type,
                              )
                            }
                            materialData={materialData}
                            readonly={readonly}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No doors added
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <LucideAppWindow className="w-3 h-3 mr-1" />
                        Windows ({section.windows?.length || 0})
                      </p>
                      {!readonly && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addWindow(actualIdx)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Window
                        </Button>
                      )}
                    </div>
                    {section.windows && section.windows.length > 0 ? (
                      <div className="space-y-2">
                        {section.windows.map((window, windowIdx) => (
                          <EditableDoorWindow
                            key={`window-${actualIdx}-${windowIdx}`}
                            type="window"
                            item={window}
                            onUpdate={(field, value) =>
                              updateWindow(actualIdx, windowIdx, field, value)
                            }
                            onRemove={() => removeWindow(actualIdx, windowIdx)}
                            standardSizes={STANDARD_WINDOW_SIZES}
                            types={WINDOW_GLASS_TYPES}
                            frameTypes={FRAME_TYPES}
                            sectionWallThicknessMm={section.thickness}
                            materialData={materialData}
                            readonly={readonly}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No windows added
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          {wallSections.filter((section) => section.type === "internal")
            .length === 0 && (
            <p className="text-sm text-slate-500 italic text-center py-8">
              No internal wall sections added. Click "Add Internal Wall Section"
              to get started.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface EditableDoorWindowProps {
  type: "door" | "window";
  item: Door | Window;
  onUpdate: (key: string, value: any) => void;
  onRemove: () => void;
  standardSizes: string[];
  types: string[];
  frameTypes: string[];
  sectionWallThicknessMm?: number;
  materialData?: any;
  readonly?: boolean;
}

const EditableDoorWindow = ({
  type,
  item,
  onUpdate,
  onRemove,
  standardSizes,
  types,
  frameTypes,
  sectionWallThicknessMm,
  materialData,
  readonly = false,
}: EditableDoorWindowProps) => {
  const doorItem = item as Door;
  const windowItem = item as Window;
  const effectiveDoorThickness =
    doorItem.wallThickness || sectionWallThicknessMm || 150;
  const recommendedGlassThickness =
    windowItem.recommendedGlassThickness ??
    getRecommendedGlassThickness(windowItem.span || 1.2);
  const isGlassSufficient =
    (windowItem.glassThickness || 4) >= recommendedGlassThickness;

  const getDoorWidthM = () => {
    if (doorItem.sizeType === "standard") {
      return (
        parseStandardSize(doorItem.standardSize)?.width ||
        parseFloat(DOOR_DEFAULT_WIDTH_M)
      );
    }
    const width = parseFloat(doorItem.custom?.width || "");
    return Number.isFinite(width) ? width : parseFloat(DOOR_DEFAULT_WIDTH_M);
  };

  const getDoorHeightM = () => {
    if (doorItem.sizeType === "standard") {
      return (
        parseStandardSize(doorItem.standardSize)?.height ||
        parseFloat(DOOR_DEFAULT_HEIGHT_M)
      );
    }
    const height = parseFloat(doorItem.custom?.height || "");
    return Number.isFinite(height) ? height : parseFloat(DOOR_DEFAULT_HEIGHT_M);
  };

  const getFramePerimeterLm = () => {
    const height = getDoorHeightM();
    const width = getDoorWidthM();
    const transomHeight = doorItem.transom?.enabled
      ? parseFloat(doorItem.transom?.height || "") ||
        parseFloat(DOOR_TRANSOM_HEIGHT_M)
      : 0;
    const totalHeight = height + transomHeight;
    return height * 2 + width;
  };

  const transomHeight = doorItem.transom?.enabled
    ? parseFloat(doorItem.transom?.height || "") ||
      parseFloat(DOOR_TRANSOM_HEIGHT_M)
    : 0;
  const autoArchitraveQty = getFramePerimeterLm() + transomHeight;
  const autoQuarterRoundQty = getFramePerimeterLm();

  const getFrameRate = () => {
    // Check if custom frame price is explicitly set
    const customFramePrice = Number(doorItem.frame?.custom?.price);
    if (Number.isFinite(customFramePrice) && customFramePrice > 0) {
      return customFramePrice;
    }

    // Otherwise, look up from material data based on frame type and door size
    let materialRate: number | null = null;
    if (Array.isArray(materialData)) {
      const frameMaterial = materialData.find(
        (m: any) =>
          m.name?.toLowerCase().includes("door") &&
          m.name?.toLowerCase().includes("frame"),
      );
      const types = frameMaterial?.type;
      if (Array.isArray(types)) {
        const targetType = (doorItem.frame?.type || "").toLowerCase();
        const match = types.find((t: any) => {
          const name = (t.type || t.name || "").toLowerCase();
          return name === targetType;
        });

        // Determine the door size to use for lookup
        const doorSize =
          doorItem.sizeType === "standard"
            ? doorItem.standardSize
            : `${doorItem.custom?.width} × ${doorItem.custom?.height} m`;

        materialRate = match?.price_kes?.[doorSize] ?? null;
      }
    }

    return Number.isFinite(materialRate) ? materialRate : null;
  };

  const getWindowWidthM = () => {
    if (windowItem.sizeType === "standard") {
      return parseStandardSize(windowItem.standardSize)?.width || 1.2;
    }
    const width = parseFloat(windowItem.custom?.width || "");
    return Number.isFinite(width) ? width : 1.2;
  };

  const getWindowHeightM = () => {
    if (windowItem.sizeType === "standard") {
      return parseStandardSize(windowItem.standardSize)?.height || 1.2;
    }
    const height = parseFloat(windowItem.custom?.height || "");
    return Number.isFinite(height) ? height : 1.2;
  };

  const autoWindowArchitraveQty = getWindowHeightM() * 2 + getWindowWidthM();

  const getWindowGlassArea = () => getWindowHeightM() * getWindowWidthM();

  // Auto-sync frame size with door size
  React.useEffect(() => {
    if (type !== "door") return;

    const frame = doorItem?.frame;
    let changed = false;
    const updatedFrame = { ...frame };

    // If door size type or size changes, update frame to match
    if (updatedFrame.sizeType !== doorItem.sizeType) {
      updatedFrame.sizeType = doorItem.sizeType;
      changed = true;
    }

    if (doorItem.sizeType === "standard") {
      if (updatedFrame.standardSize !== doorItem.standardSize) {
        updatedFrame.standardSize = doorItem.standardSize;
        // Parse standard size and update height/width fields
        const parsed = parseStandardSize(doorItem.standardSize);
        if (parsed) {
          updatedFrame.height = parsed.height.toFixed(1);
          updatedFrame.width = parsed.width.toFixed(1);
          updatedFrame.custom = {
            ...updatedFrame.custom,
            height: parsed.height.toFixed(1),
            width: parsed.width.toFixed(1),
          };
        }
        changed = true;
      }
    } else {
      // Custom size - sync frame custom dimensions with door custom dimensions
      const doorWidth = doorItem.custom?.width || "";
      const doorHeight = doorItem.custom?.height || "";

      if (
        updatedFrame.height !== doorHeight ||
        updatedFrame.width !== doorWidth
      ) {
        updatedFrame.height = doorHeight;
        updatedFrame.width = doorWidth;
        updatedFrame.custom = {
          ...updatedFrame.custom,
          height: doorHeight,
          width: doorWidth,
        };
        changed = true;
      }
    }

    if (changed) {
      onUpdate("frame", updatedFrame);
    }
  }, [
    type,
    doorItem.sizeType,
    doorItem.standardSize,
    doorItem.custom?.width,
    doorItem.custom?.height,
    onUpdate,
  ]);

  React.useEffect(() => {
    if (type !== "door") return;
    const transom = doorItem.transom || {};
    const doorWidthM = getDoorWidthM();
    const doorHeightM = getDoorHeightM();
    const heightValue = parseFloat(transom.height || "");
    const widthValue = parseFloat(transom.width || "");
    const nextHeight = Number.isFinite(heightValue)
      ? heightValue
      : parseFloat(DOOR_TRANSOM_HEIGHT_M);
    const nextWidth = Number.isFinite(widthValue) ? widthValue : doorWidthM;
    const frameRate = getFrameRate();
    const hasHeight = !!transom.height;
    const hasWidth = !!transom.width;
    // Check if user has manually set the price (> 0 indicates user input)
    const userSetPrice = Number(transom.price) > 0;

    // Calculate transom price as a fraction of the frame price
    // Based on perimeter ratio: transom is a fraction of the whole frame
    let nextPrice = transom.price;
    if (
      frameRate &&
      Number.isFinite(frameRate) &&
      frameRate > 0 &&
      !userSetPrice
    ) {
      const transomPerimeter = 2 * nextHeight + nextWidth;
      const fullDoorPerimeter = 2 * doorHeightM + doorWidthM;
      const perimetreFraction = transomPerimeter / fullDoorPerimeter;
      nextPrice = frameRate * perimetreFraction;
    }

    const glazingArea = nextWidth * nextHeight;
    const puttyLength = 2 * (nextWidth + nextHeight);

    // Only skip if nothing would change
    if (
      hasHeight &&
      hasWidth &&
      transom.glazing?.glassAreaM2 === glazingArea &&
      transom.quantity === doorItem.count &&
      transom.price === nextPrice
    ) {
      return;
    }

    onUpdate("transom", {
      ...transom,
      quantity: doorItem.count,
      height: hasHeight ? transom.height : nextHeight.toFixed(2),
      width: hasWidth ? transom.width : nextWidth.toFixed(2),
      price: userSetPrice ? transom.price : Number(nextPrice?.toFixed(2)),
      glazing: {
        ...transom.glazing,
        included: true,
        glassAreaM2: glazingArea,
        puttyLengthM: puttyLength,
      },
    });
  }, [type, doorItem, materialData, onUpdate]);

  const getFastenerOptions = (fastenerCategory: string) => {
    try {
      const fastenersMaterial = materialData?.find(
        (m: any) => m.name?.toLowerCase() === "fasteners",
      );
      const resolvedCategory = resolveFastenerCategory(
        fastenersMaterial?.type,
        fastenerCategory,
      );
      const categoryKey =
        resolvedCategory || fastenerCategory?.toLowerCase() || "";
      return Array.isArray(fastenersMaterial?.type?.[categoryKey])
        ? fastenersMaterial.type[categoryKey]
        : [];
    } catch (error) {
      console.warn(
        `Error getting fastener options for ${fastenerCategory}:`,
        error,
      );
      return [];
    }
  };

  const getAvailableSizes = (
    fastenerCategory: string,
    selectedType: string,
  ) => {
    const options = getFastenerOptions(fastenerCategory);
    return options
      .filter((opt: any) => opt.type === selectedType)
      .map((opt: any) => opt.size)
      .filter(
        (size: string, index: number, arr: string[]) =>
          arr.indexOf(size) === index,
      );
  };

  const getFastenerPrice = (
    fastenerCategory: string,
    selectedType?: string,
    selectedSize?: string,
  ) => {
    try {
      const options = getFastenerOptions(fastenerCategory);
      if (!selectedType || !selectedSize) return null;
      const fastener = options.find(
        (opt: any) => opt.type === selectedType && opt.size === selectedSize,
      );
      return fastener?.price || null;
    } catch (error) {
      console.warn(`Error getting fastener price:`, error);
      return null;
    }
  };

  const getGlassUnitM2Price = (glassType?: string, standardSize?: string) => {
    const glassData = getMaterialTypePrice(
      materialData,
      "Windows",
      glassType || "Clear",
    );
    // Look up price_per_m2 directly from the glass data
    return glassData?.m2 || 0;
  };

  const getGlassUnitPrice = (glassType?: string) =>
    getMaterialTypePrice(materialData, "Windows", glassType || "Clear");

  const getPuttyUnitPrice = () =>
    getMaterialTypePrice(materialData, "Sealant", "Window Putty");

  const getPuttyPriceBySize = (size?: string) => {
    const puttyPrices: Record<string, number> = {
      "500 g tin": 400,
      "1 kg tin": 700,
      "2 kg tin": 1300,
    };
    return size ? puttyPrices[size] || null : null;
  };

  const getPuttyCoverageBySize = (size?: string): number => {
    // Linear meters of putty coverage per tin size
    const puttyCoverage: Record<string, number> = {
      "500 g tin": 10, // ~10 linear meters per 500g tin
      "1 kg tin": 20, // ~20 linear meters per 1kg tin
      "2 kg tin": 40, // ~40 linear meters per 2kg tin
    };
    return size ? puttyCoverage[size] || 10 : 10;
  };

  const getAppropriatesPuttySize = (kgNeeded: number): string => {
    // Select the smallest tin size that can hold the kg needed
    const PUTTY_KG_PER_LINEAR_METER = 0.09;
    if (kgNeeded <= 0.5) return "500 g tin";
    if (kgNeeded <= 1) return "1 kg tin";
    return "2 kg tin";
  };

  // Auto-fill glass and putty prices for door transom (following useMasonryCalculator pattern)
  React.useEffect(() => {
    if (type !== "door") return;

    const resolvePrice = (override?: number, fallback?: number): number => {
      const overrideNumber = Number(override);
      if (Number.isFinite(overrideNumber) && overrideNumber > 0)
        return overrideNumber;
      const fallbackNumber = Number(fallback);
      return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
    };

    const transom = doorItem.transom || {};
    const glazing = transom.glazing || {};
    let changed = false;

    // Initialize glass type if missing (default to "Clear")
    const glassType = glazing.glassType || "Clear";
    if (!glazing.glassType) {
      glazing.glassType = "Clear";
      changed = true;
    }

    // Auto-fill glass price using the new pricing function
    const currentGlassPrice = glazing.glassPricePerM2;
    const transomSizeKey = `${transom.height || 0.6} × ${transom.width || 1.2} m`;
    const resolvedGlassPrice = getGlassUnitM2Price(glassType, transomSizeKey);
    if (
      resolvedGlassPrice > 0 &&
      (!currentGlassPrice ||
        currentGlassPrice === 0 ||
        currentGlassPrice === undefined)
    ) {
      glazing.glassPricePerM2 = resolvedGlassPrice;
      changed = true;
    }

    if (!changed) return;

    onUpdate("transom", {
      ...transom,
      glazing: { ...glazing },
    });
  }, [type, doorItem.transom?.glazing, materialData, onUpdate]);

  // Auto-fill door component quantities (architrave, quarter round, ironmongery)
  React.useEffect(() => {
    if (type !== "door") return;
    if (doorItem.type === "Steel") return;

    const doorHeight = getDoorHeightM();
    const doorWidth = getDoorWidthM();
    const componentLength = doorHeight * 2 + doorWidth;

    const architrave = doorItem.architrave || {};
    const quarterRound = doorItem.quarterRound || {};
    const ironmongery = doorItem.ironmongery || {};
    let changed = false;

    // Auto-fill architrave quantity if not already set
    if (
      architrave.quantity === undefined ||
      architrave.quantity === null ||
      architrave.quantity === 0
    ) {
      architrave.quantity = componentLength;
      changed = true;
    }

    // Auto-fill quarter round quantity if not already set
    if (
      quarterRound.quantity === undefined ||
      quarterRound.quantity === null ||
      quarterRound.quantity === 0
    ) {
      quarterRound.quantity = componentLength;
      changed = true;
    }

    // Auto-fill ironmongery defaults
    const hinges = ironmongery.hinges || {};
    const locks = ironmongery.locks || {};
    const handles = ironmongery.handles || {};
    const bolts = ironmongery.bolts || {};
    const closers = ironmongery.closers || {};

    // Set hinges to 3 if not already set
    if (
      (hinges.quantity === undefined ||
        hinges.quantity === null ||
        hinges.quantity === 0) &&
      !hinges.selected?.type
    ) {
      hinges.quantity = 3;
      changed = true;
    }

    // Set locks to 1 if not already set
    if (
      (locks.quantity === undefined ||
        locks.quantity === null ||
        locks.quantity === 0) &&
      !locks.selected?.type
    ) {
      locks.quantity = 1;
      changed = true;
    }

    // Set handles to 1 if not already set
    if (
      (handles.quantity === undefined ||
        handles.quantity === null ||
        handles.quantity === 0) &&
      !handles.selected?.type
    ) {
      handles.quantity = 1;
      changed = true;
    }

    // Keep bolts and closers at 0 by default
    if (bolts.quantity === undefined || bolts.quantity === null) {
      bolts.quantity = 0;
      changed = true;
    }
    if (closers.quantity === undefined || closers.quantity === null) {
      closers.quantity = 0;
      changed = true;
    }

    if (!changed) return;

    onUpdate("architrave", { ...architrave });
    onUpdate("quarterRound", { ...quarterRound });
    onUpdate("ironmongery", {
      ...ironmongery,
      hinges,
      locks,
      handles,
      bolts,
      closers,
    });
  }, [
    type,
    doorItem.type,
    doorItem.sizeType,
    doorItem.standardSize,
    doorItem.custom?.width,
    doorItem.custom?.height,
    onUpdate,
  ]);

  // Initialize missing fields with defaults for door components
  React.useEffect(() => {
    if (type !== "door") return;
    if (doorItem.type === "Steel") return;

    const architrave = doorItem.architrave || {};
    const quarterRound = doorItem.quarterRound || {};
    const ironmongery = doorItem.ironmongery || {};
    let changed = false;

    // Initialize architrave selected if missing
    if (!architrave.selected?.type || !architrave.selected?.size) {
      architrave.selected = {
        type: "timber-architrave",
        size: "40x20mm",
      };
      changed = true;
    }

    // Initialize architrave price if missing
    if (architrave.price === undefined || architrave.price === null) {
      architrave.price = 0;
      changed = true;
    }

    // Initialize quarter round selected if missing
    if (!quarterRound.selected?.type || !quarterRound.selected?.size) {
      quarterRound.selected = {
        type: "timber-quarter-round",
        size: "20mm",
      };
      changed = true;
    }

    // Initialize quarter round price if missing
    if (quarterRound.price === undefined || quarterRound.price === null) {
      quarterRound.price = 0;
      changed = true;
    }

    // Initialize ironmongery components
    const hinges = ironmongery.hinges || {};
    const locks = ironmongery.locks || {};
    const handles = ironmongery.handles || {};
    const bolts = ironmongery.bolts || {};
    const closers = ironmongery.closers || {};

    // Hinges defaults
    if (!hinges.selected?.type || !hinges.selected?.size) {
      hinges.selected = {
        type: "butt-hinge",
        size: "100mm",
      };
      changed = true;
    }
    if (hinges.price === undefined || hinges.price === null) {
      hinges.price = 0;
      changed = true;
    }
    if (hinges.quantity === undefined || hinges.quantity === null) {
      hinges.quantity = 3;
      changed = true;
    }
    if (hinges.enabled === undefined || hinges.enabled === null) {
      hinges.enabled = true;
      changed = true;
    }

    // Locks defaults
    if (!locks.selected?.type || !locks.selected?.size) {
      locks.selected = {
        type: "mortice-lock",
        size: "3-lever",
      };
      changed = true;
    }
    if (locks.price === undefined || locks.price === null) {
      locks.price = 0;
      changed = true;
    }
    if (locks.quantity === undefined || locks.quantity === null) {
      locks.quantity = 1;
      changed = true;
    }
    if (locks.enabled === undefined || locks.enabled === null) {
      locks.enabled = true;
      changed = true;
    }

    // Handles defaults
    if (!handles.selected?.type || !handles.selected?.size) {
      handles.selected = {
        type: "lever-handle",
        size: "standard",
      };
      changed = true;
    }
    if (handles.price === undefined || handles.price === null) {
      handles.price = 0;
      changed = true;
    }
    if (handles.quantity === undefined || handles.quantity === null) {
      handles.quantity = 1;
      changed = true;
    }
    if (handles.enabled === undefined || handles.enabled === null) {
      handles.enabled = true;
      changed = true;
    }

    // Bolts defaults
    if (!bolts.selected?.type || !bolts.selected?.size) {
      bolts.selected = {
        type: "tower-bolt",
        size: "150mm",
      };
      changed = true;
    }
    if (bolts.price === undefined || bolts.price === null) {
      bolts.price = 0;
      changed = true;
    }
    if (bolts.quantity === undefined || bolts.quantity === null) {
      bolts.quantity = 0;
      changed = true;
    }
    if (bolts.enabled === undefined || bolts.enabled === null) {
      bolts.enabled = false;
      changed = true;
    }

    // Closers defaults
    if (!closers.selected?.type || !closers.selected?.size) {
      closers.selected = {
        type: "pneumatic-closer",
        size: "standard",
      };
      changed = true;
    }
    if (closers.price === undefined || closers.price === null) {
      closers.price = 0;
      changed = true;
    }
    if (closers.quantity === undefined || closers.quantity === null) {
      closers.quantity = 0;
      changed = true;
    }
    if (closers.enabled === undefined || closers.enabled === null) {
      closers.enabled = false;
      changed = true;
    }

    if (!changed) return;

    onUpdate("architrave", { ...architrave });
    onUpdate("quarterRound", { ...quarterRound });
    onUpdate("ironmongery", {
      ...ironmongery,
      hinges,
      locks,
      handles,
      bolts,
      closers,
    });
  }, [
    type,
    doorItem.type,
    doorItem.architrave,
    doorItem.quarterRound,
    doorItem.ironmongery,
    onUpdate,
  ]);

  // Clear architrave, quarter round, transom, and ironmongery for steel doors
  React.useEffect(() => {
    if (type !== "door") return;
    if (doorItem.type !== "Steel" && doorItem.type !== "Aluminium") return;

    let changed = false;
    const updates: Record<string, any> = {};

    // Clear architrave
    if (doorItem.architrave && Object.keys(doorItem.architrave).length > 0) {
      updates.architrave = {
        selected: { type: "", size: "" },
        quantity: 0,
        price: 0,
      };
      changed = true;
    }

    // Clear quarter round
    if (
      doorItem.quarterRound &&
      Object.keys(doorItem.quarterRound).length > 0
    ) {
      updates.quarterRound = {
        selected: { type: "", size: "" },
        quantity: 0,
        price: 0,
      };
      changed = true;
    }

    // Clear transom
    if (doorItem.transom && Object.keys(doorItem.transom).length > 0) {
      updates.transom = {
        enabled: false,
        height: DOOR_TRANSOM_HEIGHT_M,
        width: DOOR_DEFAULT_WIDTH_M,
        quantity: 0,
        price: 0,
        glazing: {
          included: false,
          glassAreaM2: 0,
          glassPricePerM2: 0,
        },
      };
      changed = true;
    }

    // Clear ironmongery
    if (doorItem.ironmongery && Object.keys(doorItem.ironmongery).length > 0) {
      updates.ironmongery = {
        hinges: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        locks: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        handles: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        bolts: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
        closers: {
          selected: undefined,
          quantity: 0,
          price: 0,
          enabled: false,
        },
      };
      changed = true;
    }

    if (!changed) return;

    Object.entries(updates).forEach(([key, value]) => {
      onUpdate(key, value);
    });
  }, [type, doorItem.type, onUpdate]);

  // Auto-fill unit prices from materials data for door components
  React.useEffect(() => {
    if (type !== "door") return;
    if (!materialData) return;
    if (doorItem.type === "Steel") return; // Skip for steel doors

    const architrave = doorItem.architrave || {};
    const quarterRound = doorItem.quarterRound || {};
    const ironmongery = doorItem.ironmongery || {};
    let changed = false;

    // Auto-fill architrave price if not set and has selected type/size
    if (
      architrave.selected?.type &&
      architrave.selected?.size &&
      (!architrave.price || architrave.price === 0)
    ) {
      const price = getFastenerPrice(
        "Architraves",
        architrave.selected.type,
        architrave.selected.size,
      );
      if (price !== null && price !== undefined) {
        architrave.price = price;
        changed = true;
      }
    }

    // Auto-fill quarter round price if not set and has selected type/size
    if (
      quarterRound.selected?.type &&
      quarterRound.selected?.size &&
      (!quarterRound.price || quarterRound.price === 0)
    ) {
      const price = getFastenerPrice(
        "Quarter_Rounds",
        quarterRound.selected.type,
        quarterRound.selected.size,
      );
      if (price !== null && price !== undefined) {
        quarterRound.price = price;
        changed = true;
      }
    }

    // Auto-fill ironmongery prices
    const hinges = ironmongery.hinges || {};
    const locks = ironmongery.locks || {};
    const handles = ironmongery.handles || {};
    const bolts = ironmongery.bolts || {};
    const closers = ironmongery.closers || {};

    // Hinges
    if (
      hinges.selected?.type &&
      hinges.selected?.size &&
      (!hinges.price || hinges.price === 0)
    ) {
      const price = getFastenerPrice(
        "Hinges",
        hinges.selected.type,
        hinges.selected.size,
      );
      if (price !== null && price !== undefined) {
        hinges.price = price;
        changed = true;
      }
    }

    // Locks
    if (
      locks.selected?.type &&
      locks.selected?.size &&
      (!locks.price || locks.price === 0)
    ) {
      const price = getFastenerPrice(
        "Locks",
        locks.selected.type,
        locks.selected.size,
      );
      if (price !== null && price !== undefined) {
        locks.price = price;
        changed = true;
      }
    }

    // Handles
    if (
      handles.selected?.type &&
      handles.selected?.size &&
      (!handles.price || handles.price === 0)
    ) {
      const price = getFastenerPrice(
        "Handles",
        handles.selected.type,
        handles.selected.size,
      );
      if (price !== null && price !== undefined) {
        handles.price = price;
        changed = true;
      }
    }

    // Bolts
    if (
      bolts.selected?.type &&
      bolts.selected?.size &&
      (!bolts.price || bolts.price === 0)
    ) {
      const price = getFastenerPrice(
        "Bolts",
        bolts.selected.type,
        bolts.selected.size,
      );
      if (price !== null && price !== undefined) {
        bolts.price = price;
        changed = true;
      }
    }

    // Closers
    if (
      closers.selected?.type &&
      closers.selected?.size &&
      (!closers.price || closers.price === 0)
    ) {
      const price = getFastenerPrice(
        "Closers",
        closers.selected.type,
        closers.selected.size,
      );
      if (price !== null && price !== undefined) {
        closers.price = price;
        changed = true;
      }
    }

    if (!changed) return;

    onUpdate("architrave", { ...architrave });
    onUpdate("quarterRound", { ...quarterRound });
    onUpdate("ironmongery", {
      ...ironmongery,
      hinges,
      locks,
      handles,
      bolts,
      closers,
    });
  }, [
    type,
    doorItem.architrave?.selected?.type,
    doorItem.architrave?.selected?.size,
    doorItem.quarterRound?.selected?.type,
    doorItem.quarterRound?.selected?.size,
    doorItem.ironmongery?.hinges?.selected?.type,
    doorItem.ironmongery?.hinges?.selected?.size,
    doorItem.ironmongery?.locks?.selected?.type,
    doorItem.ironmongery?.locks?.selected?.size,
    doorItem.ironmongery?.handles?.selected?.type,
    doorItem.ironmongery?.handles?.selected?.size,
    doorItem.ironmongery?.bolts?.selected?.type,
    doorItem.ironmongery?.bolts?.selected?.size,
    doorItem.ironmongery?.closers?.selected?.type,
    doorItem.ironmongery?.closers?.selected?.size,
    materialData,
    onUpdate,
  ]);

  // Initialize missing fields with defaults for window components
  React.useEffect(() => {
    if (type !== "window") return;

    const glazing = windowItem.glazing || {};
    const glass = glazing.glass || {};
    const putty = glazing.putty || {};
    const ironmongery = windowItem.ironmongery || {};
    let changed = false;

    // Initialize glass if missing
    if (!glass.type) {
      glass.type = "Clear";
      changed = true;
    }
    if (glass.thickness === undefined || glass.thickness === null) {
      glass.thickness = 3;
      changed = true;
    }
    if (glass.quantity === undefined || glass.quantity === null) {
      glass.quantity = 1;
      changed = true;
    }
    if (glass.pricePerM2 === undefined || glass.pricePerM2 === null) {
      glass.pricePerM2 = 0;
      changed = true;
    }

    // Initialize putty if missing
    if (!putty.size) {
      putty.size = "1 kg tin";
      changed = true;
    }
    if (putty.quantity === undefined || putty.quantity === null) {
      putty.quantity = 1;
      changed = true;
    }
    if (putty.price === undefined || putty.price === null) {
      putty.price = 0;
      changed = true;
    }

    // Initialize ironmongery components (all optional for windows)
    const hinges = ironmongery.hinges || {};
    const locks = ironmongery.locks || {};
    const handles = ironmongery.handles || {};
    const bolts = ironmongery.bolts || {};
    const closers = ironmongery.closers || {};

    // Hinges defaults
    if (hinges.price === undefined || hinges.price === null) {
      hinges.price = 0;
      changed = true;
    }
    if (hinges.quantity === undefined || hinges.quantity === null) {
      hinges.quantity = 0;
      changed = true;
    }
    if (hinges.enabled === undefined || hinges.enabled === null) {
      hinges.enabled = false;
      changed = true;
    }

    // Locks defaults
    if (locks.price === undefined || locks.price === null) {
      locks.price = 0;
      changed = true;
    }
    if (locks.quantity === undefined || locks.quantity === null) {
      locks.quantity = 0;
      changed = true;
    }
    if (locks.enabled === undefined || locks.enabled === null) {
      locks.enabled = false;
      changed = true;
    }

    // Handles defaults
    if (handles.price === undefined || handles.price === null) {
      handles.price = 0;
      changed = true;
    }
    if (handles.quantity === undefined || handles.quantity === null) {
      handles.quantity = 0;
      changed = true;
    }
    if (handles.enabled === undefined || handles.enabled === null) {
      handles.enabled = false;
      changed = true;
    }

    // Bolts defaults
    if (bolts.price === undefined || bolts.price === null) {
      bolts.price = 0;
      changed = true;
    }
    if (bolts.quantity === undefined || bolts.quantity === null) {
      bolts.quantity = 0;
      changed = true;
    }
    if (bolts.enabled === undefined || bolts.enabled === null) {
      bolts.enabled = false;
      changed = true;
    }

    // Closers defaults
    if (closers.price === undefined || closers.price === null) {
      closers.price = 0;
      changed = true;
    }
    if (closers.quantity === undefined || closers.quantity === null) {
      closers.quantity = 0;
      changed = true;
    }
    if (closers.enabled === undefined || closers.enabled === null) {
      closers.enabled = false;
      changed = true;
    }

    if (!changed) return;

    onUpdate("glazing", {
      ...glazing,
      glass: { ...glass },
      putty: { ...putty },
    });

    onUpdate("ironmongery", {
      ...ironmongery,
      hinges,
      locks,
      handles,
      bolts,
      closers,
    });
  }, [type, windowItem.glazing, windowItem.ironmongery, onUpdate]);

  // Auto-fill unit prices from materials data for window components
  React.useEffect(() => {
    if (type !== "window") return;
    if (!materialData) return;

    const ironmongery = windowItem.ironmongery || {};
    let changed = false;

    // Auto-fill ironmongery prices
    const hinges = ironmongery.hinges || {};
    const locks = ironmongery.locks || {};
    const handles = ironmongery.handles || {};
    const bolts = ironmongery.bolts || {};
    const closers = ironmongery.closers || {};

    // Hinges
    if (
      hinges.selected?.type &&
      hinges.selected?.size &&
      (!hinges.price || hinges.price === 0)
    ) {
      const price = getFastenerPrice(
        "Hinges",
        hinges.selected.type,
        hinges.selected.size,
      );
      if (price !== null && price !== undefined) {
        hinges.price = price;
        changed = true;
      }
    }

    // Locks
    if (
      locks.selected?.type &&
      locks.selected?.size &&
      (!locks.price || locks.price === 0)
    ) {
      const price = getFastenerPrice(
        "Locks",
        locks.selected.type,
        locks.selected.size,
      );
      if (price !== null && price !== undefined) {
        locks.price = price;
        changed = true;
      }
    }

    // Handles
    if (
      handles.selected?.type &&
      handles.selected?.size &&
      (!handles.price || handles.price === 0)
    ) {
      const price = getFastenerPrice(
        "Handles",
        handles.selected.type,
        handles.selected.size,
      );
      if (price !== null && price !== undefined) {
        handles.price = price;
        changed = true;
      }
    }

    // Bolts
    if (
      bolts.selected?.type &&
      bolts.selected?.size &&
      (!bolts.price || bolts.price === 0)
    ) {
      const price = getFastenerPrice(
        "Bolts",
        bolts.selected.type,
        bolts.selected.size,
      );
      if (price !== null && price !== undefined) {
        bolts.price = price;
        changed = true;
      }
    }

    // Closers
    if (
      closers.selected?.type &&
      closers.selected?.size &&
      (!closers.price || closers.price === 0)
    ) {
      const price = getFastenerPrice(
        "Closers",
        closers.selected.type,
        closers.selected.size,
      );
      if (price !== null && price !== undefined) {
        closers.price = price;
        changed = true;
      }
    }

    if (!changed) return;

    onUpdate("ironmongery", {
      ...ironmongery,
      hinges,
      locks,
      handles,
      bolts,
      closers,
    });
  }, [
    type,
    windowItem.ironmongery?.hinges?.selected?.type,
    windowItem.ironmongery?.hinges?.selected?.size,
    windowItem.ironmongery?.locks?.selected?.type,
    windowItem.ironmongery?.locks?.selected?.size,
    windowItem.ironmongery?.handles?.selected?.type,
    windowItem.ironmongery?.handles?.selected?.size,
    windowItem.ironmongery?.bolts?.selected?.type,
    windowItem.ironmongery?.bolts?.selected?.size,
    windowItem.ironmongery?.closers?.selected?.type,
    windowItem.ironmongery?.closers?.selected?.size,
    materialData,
    onUpdate,
  ]);

  // Auto-fill glass and putty prices for windows (following useMasonryCalculator pattern)
  React.useEffect(() => {
    if (type !== "window") return;

    const resolvePrice = (override?: number, fallback?: number): number => {
      const overrideNumber = Number(override);
      if (Number.isFinite(overrideNumber) && overrideNumber > 0)
        return overrideNumber;
      const fallbackNumber = Number(fallback);
      return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
    };

    const glassType =
      windowItem.glazing?.glass?.type || windowItem.glassType || "Clear";
    const defaultPutty = getPuttyUnitPrice();
    const glazing = windowItem.glazing || {};
    const glass = glazing.glass || {};
    const putty = glazing.putty || {};
    let changed = false;

    // Auto-fill glass price using the new pricing function with standard size
    const currentGlassPrice = glass.pricePerM2;
    const resolvedGlassPrice = getGlassUnitM2Price(
      glassType,
      windowItem.standardSize,
    );
    if (
      resolvedGlassPrice > 0 &&
      (!currentGlassPrice ||
        currentGlassPrice === 0 ||
        currentGlassPrice === undefined)
    ) {
      glass.pricePerM2 = resolvedGlassPrice;
      changed = true;
    }

    // Auto-fill putty price if not set or zero
    const currentPuttyPrice = putty.price;
    const resolvedPuttyPrice = resolvePrice(currentPuttyPrice, defaultPutty);
    if (
      resolvedPuttyPrice > 0 &&
      (!currentPuttyPrice ||
        currentPuttyPrice === 0 ||
        currentPuttyPrice === undefined)
    ) {
      putty.price = resolvedPuttyPrice;
      changed = true;
    }

    if (!changed) return;

    onUpdate("glazing", {
      ...glazing,
      glass: { ...glass },
      putty: { ...putty },
    });
  }, [
    type,
    windowItem.glazing?.glass?.type,
    windowItem.glassType,
    windowItem.standardSize,
    materialData,
    onUpdate,
  ]);

  // Auto-calculate putty requirements based on window dimensions
  React.useEffect(() => {
    if (type !== "window") return;

    const PUTTY_KG_PER_LINEAR_METER = 0.09;
    const glazing = windowItem.glazing || {};
    const putty = glazing.putty || {};

    // Calculate window perimeter (putty length needed in linear meters)
    const width = getWindowWidthM();
    const height = getWindowHeightM();
    const puttyLengthNeeded = 2 * (width + height);

    // Calculate kg needed
    const kgNeeded = puttyLengthNeeded * PUTTY_KG_PER_LINEAR_METER;

    // Determine size: use existing if manually set, otherwise auto-determine
    let sizeToUse = putty.size;
    if (!sizeToUse) {
      // Auto-determine size only if not manually set
      sizeToUse = getAppropriatesPuttySize(kgNeeded);
    }

    // Get the price for the size
    const pricePerTin = getPuttyPriceBySize(sizeToUse);
    const coverage = getPuttyCoverageBySize(sizeToUse);
    const tinsNeeded = Math.ceil(puttyLengthNeeded / coverage);

    // Only update if values have changed
    if (
      putty.size !== sizeToUse ||
      putty.lengthNeeded !== puttyLengthNeeded ||
      putty.tinsNeeded !== tinsNeeded ||
      putty.quantity !== tinsNeeded ||
      putty.price !== pricePerTin
    ) {
      onUpdate("glazing", {
        ...glazing,
        putty: {
          ...putty,
          size: sizeToUse,
          lengthNeeded: puttyLengthNeeded,
          price: pricePerTin || 0,
          puttyPricePerM: pricePerTin && coverage ? pricePerTin / coverage : 0,
          tinsNeeded: tinsNeeded,
          quantity: tinsNeeded, // Auto-fill quantity with number of tins needed
        },
      });
    }
  }, [
    type,
    windowItem.sizeType,
    windowItem.standardSize,
    windowItem.custom?.width,
    windowItem.custom?.height,
    onUpdate,
  ]);

  return (
    <div className="p-3 border rounded-3xl bg-white dark:bg-slate-800/50 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <Select
          value={item.sizeType}
          onValueChange={(value) => onUpdate("sizeType", value)}
          disabled={readonly}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {item.sizeType === "standard" ? (
          <Select
            value={item.standardSize}
            onValueChange={(value) => onUpdate("standardSize", value)}
            disabled={readonly}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select Size" />
            </SelectTrigger>
            <SelectContent>
              {standardSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              step="0.01"
              className="h-9 text-xs"
              value={item.custom.height}
              onChange={(e) =>
                onUpdate("custom", {
                  ...item.custom,
                  height: e.target.value,
                })
              }
              disabled={readonly}
            />
            <Input
              placeholder="Width (m)"
              type="number"
              step="0.01"
              className="h-9 text-xs"
              value={item.custom.width}
              onChange={(e) =>
                onUpdate("custom", {
                  ...item.custom,
                  width: e.target.value,
                })
              }
              disabled={readonly}
            />
          </>
        )}

        <Select
          value={
            type === "window"
              ? windowItem.glassType || windowItem.type || ""
              : item.type
          }
          onValueChange={(value) => {
            if (type === "window") {
              onUpdate("__batch", {
                type: value,
                glassType: value,
                glazing: {
                  ...windowItem.glazing,
                  glass: {
                    ...windowItem.glazing?.glass,
                    type: value,
                  },
                },
              });
              return;
            }
            onUpdate("type", value);
          }}
          disabled={readonly}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue
              placeholder={type === "door" ? "Door Type" : "Glass Type"}
            />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Qty"
          type="number"
          min="1"
          className="h-9 text-xs"
          value={item.count}
          onChange={(e) => onUpdate("count", parseInt(e.target.value) || 1)}
          disabled={readonly}
        />

        {item.sizeType !== "standard" && (
          <Input
            placeholder="Price (Ksh)"
            type="number"
            min="0"
            className="h-9 text-xs"
            value={item.custom?.price ?? ""}
            onChange={(e) =>
              onUpdate("custom", {
                ...item.custom,
                price: parseFloat(e.target.value) || undefined,
              })
            }
            disabled={readonly}
          />
        )}

        {!readonly && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onRemove}
            className="h-9"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {(type === "window" ||
        (type === "door" &&
          doorItem.type !== "Steel" &&
          doorItem.type !== "Aluminium")) && (
        <div className="space-y-3 pt-2 border-t">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem
              value="frame-spec"
              className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
            >
              <AccordionTrigger className="px-3 py-2 text-sm">
                Frame Specification
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  <div>
                    <label className="text-xs font-medium">Frame Type</label>
                    <Select
                      value={item.frame.type}
                      onValueChange={(value) =>
                        onUpdate("frame", {
                          ...item.frame,
                          type: value,
                        })
                      }
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Frame Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameTypes.map((frameType) => (
                          <SelectItem key={frameType} value={frameType}>
                            {frameType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">
                      Frame Thickness
                    </label>
                    <Select
                      value={item.frame?.thickness || ""}
                      onValueChange={(value) =>
                        onUpdate("frame", {
                          ...item.frame,
                          thickness: value,
                        })
                      }
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Thickness" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">4"x2"</SelectItem>
                        <SelectItem value="150">6"x2"</SelectItem>
                        <SelectItem value="200">8"x2"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {item.frame?.sizeType === "custom" && (
                    <>
                      <div>
                        <label className="text-xs font-medium">
                          Price (Ksh)
                        </label>
                        <Input
                          placeholder="Price (Ksh)"
                          type="number"
                          min="0"
                          className="h-8 text-xs"
                          value={item.frame?.custom?.price || ""}
                          onChange={(e) =>
                            onUpdate("frame", {
                              ...item.frame,
                              custom: {
                                ...item.frame?.custom,
                                price: parseFloat(e.target.value) || undefined,
                              },
                            })
                          }
                          disabled={readonly}
                        />
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {type === "door" && (
        <div className="space-y-3 ">
          <Accordion type="single" collapsible className="space-y-2">
            {doorItem.type !== "Steel" && doorItem.type !== "Aluminium" && (
              <AccordionItem
                value="architrave"
                className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
              >
                <AccordionTrigger className="px-3 py-2 text-sm ">
                  Architrave
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div>
                      <label className="text-xs font-medium">
                        Architrave Type
                      </label>
                      <Select
                        value={doorItem.architrave?.selected?.type || ""}
                        onValueChange={(value) =>
                          onUpdate("architrave", {
                            ...doorItem.architrave,
                            selected: {
                              type: value,
                              size: "",
                            },
                            quantity: doorItem.architrave?.quantity,
                          })
                        }
                        disabled={readonly}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("Architraves").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={doorItem.architrave?.selected?.size || ""}
                        onValueChange={(value) =>
                          onUpdate("architrave", {
                            ...doorItem.architrave,
                            selected: {
                              ...doorItem.architrave?.selected,
                              size: value,
                            },
                          })
                        }
                        disabled={
                          readonly || !doorItem.architrave?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "Architraves",
                            doorItem.architrave?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. 50x25mm"
                        value={doorItem.architrave?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("architrave", {
                            ...doorItem.architrave,
                            customSize: e.target.value,
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        step="0.1"
                        className="h-8 text-xs"
                        value={(
                          doorItem.architrave?.quantity ?? autoArchitraveQty
                        ).toFixed(2)}
                        onChange={(e) =>
                          onUpdate("architrave", {
                            ...doorItem.architrave,
                            quantity: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.architrave?.price ??
                            getFastenerPrice(
                              "Architraves",
                              doorItem.architrave?.selected?.type,
                              doorItem.architrave?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("architrave", {
                            ...doorItem.architrave,
                            price: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.architrave?.quantity ?? autoArchitraveQty,
                          (doorItem.architrave?.price ??
                            getFastenerPrice(
                              "Architraves",
                              doorItem.architrave?.selected?.type,
                              doorItem.architrave?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {doorItem.type !== "Steel" && doorItem.type !== "Aluminium" && (
              <AccordionItem
                value="quarter-round"
                className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
              >
                <AccordionTrigger className="px-3 py-2 text-sm ">
                  Quarter Round
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div>
                      <label className="text-xs font-medium">
                        Quarter Round Type
                      </label>
                      <Select
                        value={doorItem.quarterRound?.selected?.type || ""}
                        onValueChange={(value) =>
                          onUpdate("quarterRound", {
                            ...doorItem.quarterRound,
                            selected: {
                              type: value,
                              size: "",
                            },
                            quantity: doorItem.quarterRound?.quantity,
                          })
                        }
                        disabled={readonly}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("quarter_rounds").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={doorItem.quarterRound?.selected?.size || ""}
                        onValueChange={(value) =>
                          onUpdate("quarterRound", {
                            ...doorItem.quarterRound,
                            selected: {
                              ...doorItem.quarterRound?.selected,
                              size: value,
                            },
                            quantity: doorItem.quarterRound?.quantity,
                          })
                        }
                        disabled={
                          readonly || !doorItem.quarterRound?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "quarter_rounds",
                            doorItem.quarterRound?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. 25mm"
                        value={doorItem.quarterRound?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("quarterRound", {
                            ...doorItem.quarterRound,
                            customSize: e.target.value,
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        step="0.1"
                        className="h-8 text-xs"
                        value={(
                          doorItem.quarterRound?.quantity ?? autoQuarterRoundQty
                        ).toFixed(2)}
                        onChange={(e) =>
                          onUpdate("quarterRound", {
                            ...doorItem.quarterRound,
                            quantity: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.quarterRound?.price ??
                            getFastenerPrice(
                              "Quarter_Rounds",
                              doorItem.quarterRound?.selected?.type,
                              doorItem.quarterRound?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("quarterRound", {
                            ...doorItem.quarterRound,
                            price: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.quarterRound?.quantity ??
                            autoQuarterRoundQty,
                          (doorItem.quarterRound?.price ??
                            getFastenerPrice(
                              "Quarter_Rounds",
                              doorItem.quarterRound?.selected?.type,
                              doorItem.quarterRound?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {doorItem.type !== "Steel" && doorItem.type !== "Aluminium" && (
              <AccordionItem
                value="ironmongery"
                className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
              >
                <AccordionTrigger className="px-3 py-2 text-sm ">
                  Ironmongery
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="hinges-enable"
                        checked={doorItem.ironmongery?.hinges?.enabled ?? true}
                        onCheckedChange={(checked) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            hinges: {
                              ...(doorItem.ironmongery?.hinges || {}),
                              enabled: !!checked,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                      <label
                        htmlFor="hinges-enable"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Use Hinges
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Hinges Type</label>
                      <Select
                        value={
                          doorItem.ironmongery?.hinges?.selected?.type || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            hinges: {
                              ...doorItem.ironmongery?.hinges,
                              selected: {
                                type: value,
                                size: "",
                              },
                            },
                          })
                        }
                        disabled={
                          readonly || !doorItem.ironmongery?.hinges?.enabled
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("Hinges").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={
                          doorItem.ironmongery?.hinges?.selected?.size || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            hinges: {
                              ...doorItem.ironmongery?.hinges,
                              selected: {
                                ...doorItem.ironmongery?.hinges?.selected,
                                size: value,
                              },
                            },
                          })
                        }
                        disabled={
                          readonly ||
                          !doorItem.ironmongery?.hinges?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "Hinges",
                            doorItem.ironmongery?.hinges?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. 150mm"
                        value={doorItem.ironmongery?.hinges?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            hinges: {
                              ...(doorItem.ironmongery?.hinges || {}),
                              customSize: e.target.value,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={
                          (doorItem.ironmongery?.hinges?.quantity || "") as any
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            hinges: {
                              ...(doorItem.ironmongery?.hinges || {}),
                              quantity: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.ironmongery?.hinges?.price ??
                            getFastenerPrice(
                              "Hinges",
                              doorItem.ironmongery?.hinges?.selected?.type,
                              doorItem.ironmongery?.hinges?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            hinges: {
                              ...doorItem.ironmongery?.hinges,
                              price: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.ironmongery?.hinges?.quantity,
                          (doorItem.ironmongery?.hinges?.price ??
                            getFastenerPrice(
                              "Hinges",
                              doorItem.ironmongery?.hinges?.selected?.type,
                              doorItem.ironmongery?.hinges?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="locks-enable"
                        checked={doorItem.ironmongery?.locks?.enabled ?? true}
                        onCheckedChange={(checked) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            locks: {
                              ...(doorItem.ironmongery?.locks || {}),
                              enabled: !!checked,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                      <label
                        htmlFor="locks-enable"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Use Locks
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Locks Type</label>
                      <Select
                        value={
                          doorItem.ironmongery?.locks?.selected?.type || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            locks: {
                              ...doorItem.ironmongery?.locks,
                              selected: {
                                type: value,
                                size: "",
                              },
                            },
                          })
                        }
                        disabled={
                          readonly || !doorItem.ironmongery?.locks?.enabled
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("Locks").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={
                          doorItem.ironmongery?.locks?.selected?.size || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            locks: {
                              ...doorItem.ironmongery?.locks,
                              selected: {
                                ...doorItem.ironmongery?.locks?.selected,
                                size: value,
                              },
                            },
                          })
                        }
                        disabled={
                          readonly ||
                          !doorItem.ironmongery?.locks?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "Locks",
                            doorItem.ironmongery?.locks?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. custom"
                        value={doorItem.ironmongery?.locks?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            locks: {
                              ...(doorItem.ironmongery?.locks || {}),
                              customSize: e.target.value,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={
                          (doorItem.ironmongery?.locks?.quantity || "") as any
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            locks: {
                              ...(doorItem.ironmongery?.locks || {}),
                              quantity: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.ironmongery?.locks?.price ??
                            getFastenerPrice(
                              "Locks",
                              doorItem.ironmongery?.locks?.selected?.type,
                              doorItem.ironmongery?.locks?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            locks: {
                              ...doorItem.ironmongery?.locks,
                              price: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.ironmongery?.locks?.quantity,
                          (doorItem.ironmongery?.locks?.price ??
                            getFastenerPrice(
                              "Locks",
                              doorItem.ironmongery?.locks?.selected?.type,
                              doorItem.ironmongery?.locks?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="handles-enable"
                        checked={doorItem.ironmongery?.handles?.enabled ?? true}
                        onCheckedChange={(checked) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            handles: {
                              ...(doorItem.ironmongery?.handles || {}),
                              enabled: !!checked,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                      <label
                        htmlFor="handles-enable"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Use Handles
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Handles Type
                      </label>
                      <Select
                        value={
                          doorItem.ironmongery?.handles?.selected?.type || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            handles: {
                              ...doorItem.ironmongery?.handles,
                              selected: {
                                type: value,
                                size: "",
                              },
                            },
                          })
                        }
                        disabled={
                          readonly || !doorItem.ironmongery?.handles?.enabled
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("Handles").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={
                          doorItem.ironmongery?.handles?.selected?.size || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            handles: {
                              ...doorItem.ironmongery?.handles,
                              selected: {
                                ...doorItem.ironmongery?.handles?.selected,
                                size: value,
                              },
                            },
                          })
                        }
                        disabled={
                          readonly ||
                          !doorItem.ironmongery?.handles?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "Handles",
                            doorItem.ironmongery?.handles?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. custom"
                        value={doorItem.ironmongery?.handles?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            handles: {
                              ...(doorItem.ironmongery?.handles || {}),
                              customSize: e.target.value,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={
                          (doorItem.ironmongery?.handles?.quantity || "") as any
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            handles: {
                              ...(doorItem.ironmongery?.handles || {}),
                              quantity: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.ironmongery?.handles?.price ??
                            getFastenerPrice(
                              "Handles",
                              doorItem.ironmongery?.handles?.selected?.type,
                              doorItem.ironmongery?.handles?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            handles: {
                              ...doorItem.ironmongery?.handles,
                              price: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.ironmongery?.handles?.quantity,
                          (doorItem.ironmongery?.handles?.price ??
                            getFastenerPrice(
                              "Handles",
                              doorItem.ironmongery?.handles?.selected?.type,
                              doorItem.ironmongery?.handles?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="bolts-enable"
                        checked={doorItem.ironmongery?.bolts?.enabled ?? false}
                        onCheckedChange={(checked) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            bolts: {
                              ...(doorItem.ironmongery?.bolts || {}),
                              enabled: !!checked,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                      <label
                        htmlFor="bolts-enable"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Use Bolts
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Bolts Type</label>
                      <Select
                        value={
                          doorItem.ironmongery?.bolts?.selected?.type || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            bolts: {
                              ...doorItem.ironmongery?.bolts,
                              selected: {
                                type: value,
                                size: "",
                              },
                            },
                          })
                        }
                        disabled={
                          readonly || !doorItem.ironmongery?.bolts?.enabled
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("Bolts").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={
                          doorItem.ironmongery?.bolts?.selected?.size || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            bolts: {
                              ...doorItem.ironmongery?.bolts,
                              selected: {
                                ...doorItem.ironmongery?.bolts?.selected,
                                size: value,
                              },
                            },
                          })
                        }
                        disabled={
                          readonly ||
                          !doorItem.ironmongery?.bolts?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "Bolts",
                            doorItem.ironmongery?.bolts?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. 200mm"
                        value={doorItem.ironmongery?.bolts?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            bolts: {
                              ...(doorItem.ironmongery?.bolts || {}),
                              customSize: e.target.value,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={
                          (doorItem.ironmongery?.bolts?.quantity || "") as any
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            bolts: {
                              ...(doorItem.ironmongery?.bolts || {}),
                              quantity: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.ironmongery?.bolts?.price ??
                            getFastenerPrice(
                              "Bolts",
                              doorItem.ironmongery?.bolts?.selected?.type,
                              doorItem.ironmongery?.bolts?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            bolts: {
                              ...doorItem.ironmongery?.bolts,
                              price: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.ironmongery?.bolts?.quantity,
                          (doorItem.ironmongery?.bolts?.price ??
                            getFastenerPrice(
                              "Bolts",
                              doorItem.ironmongery?.bolts?.selected?.type,
                              doorItem.ironmongery?.bolts?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="closers-enable"
                        checked={
                          doorItem.ironmongery?.closers?.enabled ?? false
                        }
                        onCheckedChange={(checked) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            closers: {
                              ...(doorItem.ironmongery?.closers || {}),
                              enabled: !!checked,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                      <label
                        htmlFor="closers-enable"
                        className="text-xs font-medium cursor-pointer"
                      >
                        Use Closers
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Closers Type
                      </label>
                      <Select
                        value={
                          doorItem.ironmongery?.closers?.selected?.type || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            closers: {
                              ...doorItem.ironmongery?.closers,
                              selected: {
                                type: value,
                                size: "",
                              },
                            },
                          })
                        }
                        disabled={
                          readonly || !doorItem.ironmongery?.closers?.enabled
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              getFastenerOptions("Closers").map(
                                (opt: any) => opt.type,
                              ),
                            ),
                          ).map((t: any) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Size</label>
                      <Select
                        value={
                          doorItem.ironmongery?.closers?.selected?.size || ""
                        }
                        onValueChange={(value) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            closers: {
                              ...doorItem.ironmongery?.closers,
                              selected: {
                                ...doorItem.ironmongery?.closers?.selected,
                                size: value,
                              },
                            },
                          })
                        }
                        disabled={
                          readonly ||
                          !doorItem.ironmongery?.closers?.selected?.type
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(
                            "Closers",
                            doorItem.ironmongery?.closers?.selected?.type || "",
                          ).map((size: string) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Custom Size</label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. custom"
                        value={doorItem.ironmongery?.closers?.customSize || ""}
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            closers: {
                              ...(doorItem.ironmongery?.closers || {}),
                              customSize: e.target.value,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={
                          (doorItem.ironmongery?.closers?.quantity || "") as any
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            closers: {
                              ...(doorItem.ironmongery?.closers || {}),
                              quantity: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Ksh"
                        type="number"
                        className="h-8 text-xs "
                        value={
                          (doorItem.ironmongery?.closers?.price ??
                            getFastenerPrice(
                              "Closers",
                              doorItem.ironmongery?.closers?.selected?.type,
                              doorItem.ironmongery?.closers?.selected?.size,
                            )) ||
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("ironmongery", {
                            ...doorItem.ironmongery,
                            closers: {
                              ...doorItem.ironmongery?.closers,
                              price: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.ironmongery?.closers?.quantity,
                          (doorItem.ironmongery?.closers?.price ??
                            getFastenerPrice(
                              "Closers",
                              doorItem.ironmongery?.closers?.selected?.type,
                              doorItem.ironmongery?.closers?.selected?.size,
                            )) ||
                            0,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {doorItem.type !== "Steel" && doorItem.type !== "Aluminium" && (
              <AccordionItem
                value="transom"
                className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
              >
                <AccordionTrigger className="px-3 py-2 text-sm ">
                  Transom/Fanlight
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded mb-2">
                    <Checkbox
                      id="transom-enable"
                      checked={doorItem.transom?.enabled ?? false}
                      onCheckedChange={(checked) =>
                        onUpdate("transom", {
                          ...doorItem.transom,
                          enabled: !!checked,
                        })
                      }
                      disabled={readonly}
                    />
                    <label
                      htmlFor="transom-enable"
                      className="text-xs font-medium cursor-pointer"
                    >
                      Include Transom/Fanlight
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="text-xs font-medium">Transom Qty</label>
                      <Input
                        placeholder="Qty"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={(doorItem.transom?.quantity || "") as any}
                        onChange={(e) =>
                          onUpdate("transom", {
                            ...doorItem.transom,
                            quantity: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={readonly || !doorItem.transom?.enabled}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Height (m)</label>
                      <Input
                        placeholder="Height"
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 text-xs"
                        value={doorItem.transom?.height || ""}
                        onChange={(e) =>
                          onUpdate("transom", {
                            ...doorItem.transom,
                            height: e.target.value,
                          })
                        }
                        disabled={readonly || !doorItem.transom?.enabled}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Width (m)</label>
                      <Input
                        placeholder="Width"
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 text-xs"
                        value={doorItem.transom?.width || ""}
                        onChange={(e) =>
                          onUpdate("transom", {
                            ...doorItem.transom,
                            width: e.target.value,
                          })
                        }
                        disabled={readonly || !doorItem.transom?.enabled}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Unit Price (Ksh)
                      </label>
                      <Input
                        placeholder="Auto"
                        type="number"
                        min="0"
                        className="h-8 text-xs"
                        value={(doorItem.transom?.price || "") as any}
                        onChange={(e) =>
                          onUpdate("transom", {
                            ...doorItem.transom,
                            price: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={readonly || !doorItem.transom?.enabled}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.transom?.quantity,
                          doorItem.transom?.price,
                          doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                    <div>
                      <label className="text-xs font-medium">Glass Type</label>
                      <Select
                        value={doorItem.transom?.glazing?.glassType || "Clear"}
                        onValueChange={(value) =>
                          onUpdate("transom", {
                            ...doorItem.transom,
                            glazing: {
                              ...doorItem.transom?.glazing,
                              glassType: value,
                              // Reset price when type changes to allow auto-fill
                              glassPricePerM2: undefined,
                            },
                          })
                        }
                        disabled={readonly || !doorItem.transom?.enabled}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Glass Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clear">Clear</SelectItem>
                          <SelectItem value="Tinted">Tinted</SelectItem>
                          <SelectItem value="Frosted">Frosted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Glass Area (m²)
                      </label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={(
                          doorItem.transom?.glazing?.glassAreaM2 || 0
                        ).toFixed(3)}
                        disabled={true}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Glass Unit (Ksh/m²)
                      </label>
                      <Input
                        className="h-8 text-xs"
                        type="number"
                        value={
                          doorItem.transom?.glazing?.glassPricePerM2 ??
                          getGlassUnitM2Price(
                            doorItem.transom?.glazing?.glassType || "Clear",
                            `${doorItem.transom?.height || 0.6} \u00d7 ${doorItem.transom?.width || 1.2} m`,
                          ) ??
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("transom", {
                            ...doorItem.transom,
                            glazing: {
                              ...doorItem.transom?.glazing,
                              glassPricePerM2:
                                parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly || !doorItem.transom?.enabled}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Glass Total (Ksh)
                      </label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          doorItem.transom?.glazing?.glassAreaM2 || 0,
                          doorItem.transom?.glazing?.glassPricePerM2 ??
                            getGlassUnitM2Price(
                              doorItem.transom?.glazing?.glassType || "Clear",
                              `${doorItem.transom?.height || 0.6} \u00d7 ${doorItem.transom?.width || 1.2} m`,
                            ) ??
                            0,
                          (doorItem.transom?.quantity || 1) * doorItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}

      {type === "window" && (
        <div className="space-y-3 pt-2 border-t">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem
              value="glass-spec"
              className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
            >
              <AccordionTrigger className="px-3 py-2 text-sm ">
                Glass Specification
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="text-xs font-medium">Glass Type</label>
                      <Select
                        value={windowItem.glassType || "Clear"}
                        onValueChange={(value) => {
                          onUpdate("__batch", {
                            glassType: value,
                            type: value,
                            glazing: {
                              ...windowItem.glazing,
                              glass: {
                                ...windowItem.glazing?.glass,
                                type: value,
                              },
                            },
                          });
                        }}
                        disabled={readonly}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clear">Clear</SelectItem>
                          <SelectItem value="Tinted">Tinted</SelectItem>
                          <SelectItem value="Frosted">Frosted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Span (m)</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        className="h-8 text-xs"
                        value={windowItem.span || 1.2}
                        onChange={(e) =>
                          onUpdate("span", parseFloat(e.target.value) || 1.2)
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Glass Thickness
                      </label>
                      <Select
                        value={windowItem.glassThickness?.toString() || "4"}
                        onValueChange={(value) => {
                          const thickness = parseInt(value);
                          const isSufficient =
                            thickness >= recommendedGlassThickness;
                          onUpdate("__batch", {
                            glassThickness: thickness,
                            isGlassUnderSized: !isSufficient,
                            glazing: {
                              ...windowItem.glazing,
                              glass: {
                                ...windowItem.glazing?.glass,
                                thickness,
                              },
                            },
                          });
                        }}
                        disabled={readonly}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GLASS_THICKNESS_OPTIONS.map((thickness) => (
                            <SelectItem
                              key={thickness}
                              value={thickness.toString()}
                            >
                              {thickness}mm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Recommended</label>
                      <Input
                        className="h-8 text-xs"
                        value={recommendedGlassThickness}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || undefined;
                          const fallback = getRecommendedGlassThickness(
                            windowItem.span || 1.2,
                          );
                          const nextRecommended = value ?? fallback;
                          onUpdate("__batch", {
                            recommendedGlassThickness: value,
                            isGlassUnderSized:
                              (windowItem.glassThickness || 4) <
                              nextRecommended,
                          });
                        }}
                        disabled={readonly}
                      />
                    </div>
                  </div>

                  {/* Validation Feedback */}
                  <div>
                    {isGlassSufficient ? (
                      <div className="text-xs p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 rounded flex items-center gap-1">
                        <span>✓</span>
                        <span>
                          Glass thickness {windowItem.glassThickness}mm is
                          sufficient for span {windowItem.span || 1.2}m
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 rounded flex items-center gap-1">
                        <span>✗</span>
                        <span>
                          Glass thickness {windowItem.glassThickness}mm is
                          undersized. Minimum recommended:{" "}
                          {recommendedGlassThickness}mm
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Glass and Putty Calculation */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    <div>
                      <label className="text-xs font-medium">Area (m²)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getWindowGlassArea().toFixed(3)}
                        disabled={true}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Price (Ksh/m²)
                      </label>
                      <Input
                        className="h-8 text-xs"
                        type="number"
                        value={
                          windowItem.glazing?.glass?.pricePerM2 ??
                          getGlassUnitM2Price(
                            windowItem.glazing?.glass?.type ||
                              windowItem.glassType,
                            windowItem.standardSize,
                          ) ??
                          ""
                        }
                        onChange={(e) =>
                          onUpdate("glazing", {
                            ...windowItem.glazing,
                            glass: {
                              ...windowItem.glazing?.glass,
                              pricePerM2:
                                parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Panes</label>
                      <Input
                        className="h-8 text-xs"
                        type="number"
                        min="1"
                        value={windowItem.glazing?.glass?.quantity || 1}
                        onChange={(e) =>
                          onUpdate("glazing", {
                            ...windowItem.glazing,
                            glass: {
                              ...windowItem.glazing?.glass,
                              quantity: parseFloat(e.target.value) || 1,
                            },
                          })
                        }
                        disabled={readonly}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Total (Ksh)</label>
                      <Input
                        className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                        value={getTotalPrice(
                          getWindowGlassArea() *
                            (windowItem.glazing?.glass?.quantity || 1),
                          windowItem.glazing?.glass?.pricePerM2 ??
                            getGlassUnitPrice(
                              windowItem.glazing?.glass?.type ||
                                windowItem.glassType,
                            ) ??
                            0,
                          windowItem.count,
                        ).toFixed(2)}
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Putty Section */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="text-xs font-medium">
                          Putty Size
                        </label>
                        <Select
                          value={windowItem.glazing?.putty?.size || ""}
                          onValueChange={(value) =>
                            onUpdate("glazing", {
                              ...windowItem.glazing,
                              putty: {
                                ...windowItem.glazing?.putty,
                                size: value,
                                price: getPuttyPriceBySize(value),
                              },
                            })
                          }
                          disabled={readonly}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="500 g tin">500 g tin</SelectItem>
                            <SelectItem value="1 kg tin">1 kg tin</SelectItem>
                            <SelectItem value="2 kg tin">2 kg tin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Color</label>
                        <Select
                          value={windowItem.glazing?.putty?.color || ""}
                          onValueChange={(value) =>
                            onUpdate("glazing", {
                              ...windowItem.glazing,
                              putty: {
                                ...windowItem.glazing?.putty,
                                color: value,
                              },
                            })
                          }
                          disabled={readonly}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select Color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="White">White</SelectItem>
                            <SelectItem value="Grey">Grey</SelectItem>
                            <SelectItem value="Brown">Brown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium">
                          Length (m)
                        </label>
                        <Input
                          className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                          type="number"
                          value={(
                            windowItem.glazing?.putty?.lengthNeeded || 0
                          ).toFixed(2)}
                          disabled={true}
                          title="Auto-calculated from window dimensions"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">
                          Qty (Cans)
                        </label>
                        <Input
                          className="h-8 text-xs bg-blue-50 dark:bg-blue-950/30"
                          type="number"
                          min="0"
                          value={windowItem.glazing?.putty?.tinsNeeded || ""}
                          onChange={(e) =>
                            onUpdate("glazing", {
                              ...windowItem.glazing,
                              putty: {
                                ...windowItem.glazing?.putty,
                                quantity:
                                  parseFloat(e.target.value) || undefined,
                                tinsNeeded:
                                  parseFloat(e.target.value) || undefined,
                              },
                            })
                          }
                          disabled={readonly}
                          title="Auto-calculated based on window perimeter and coverage"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">
                          Total (Ksh)
                        </label>
                        <Input
                          className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                          value={getTotalPrice(
                            windowItem.glazing?.putty?.quantity || 0,
                            windowItem.glazing?.putty?.price ??
                              getPuttyPriceBySize(
                                windowItem.glazing?.putty?.size,
                              ) ??
                              0,
                            windowItem.count,
                          ).toFixed(2)}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default DoorsWindowsEditor;
