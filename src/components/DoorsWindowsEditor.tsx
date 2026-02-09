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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, DoorOpen, LucideAppWindow, Plus, Trash2 } from "lucide-react";
import { Door, WallSection, Window, getRecommendedGlassThickness, isGlassThicknessSufficient } from "@/hooks/useMasonryCalculatorNew";

// STEP 1: 5 Door specification types
export const DOOR_TYPES = ["Steel", "Solid flush", "Semi-solid flush", "Panel", "T&G"];
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

const getDoorFrameSize = (wallThickness: number) => {
  if (wallThickness === 200) {
    return { height: "200", width: "50", label: "200x50mm" };
  }
  return { height: "150", width: "50", label: "150x50mm" };
};

const normalizeWallThicknessMm = (thickness?: number, type?: "external" | "internal") => {
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

const getTotalPrice = (quantity?: number, unitPrice?: number, count?: number) => {
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
  const updateSections = (updater: (sections: WallSection[]) => WallSection[]) => {
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
    const wallThickness = blockThickness || normalizeWallThicknessMm(section?.thickness, section?.type);
    const defaultFrameSize = getDoorFrameSize(wallThickness);
    const newDoor: Door = {
      sizeType: "standard",
      standardSize: STANDARD_DOOR_SIZES[0],
      custom: { height: DOOR_DEFAULT_HEIGHT_M, width: DOOR_DEFAULT_WIDTH_M },
      type: DOOR_TYPES[0],
      count: 1,
      wallThickness,
      frame: {
        type: FRAME_TYPES[0],
        sizeType: "custom",
        standardSize: STANDARD_DOOR_SIZES[0],
        height: defaultFrameSize.height,
        width: defaultFrameSize.width,
        custom: { height: defaultFrameSize.height, width: defaultFrameSize.width },
      },
      architrave: {
        selected: {
          type: "timber-architrave",
          size: "40x20mm"
        },
        quantity: 1
      },
      transom: {
        enabled: false,
        height: DOOR_TRANSOM_HEIGHT_M,
        width: DOOR_DEFAULT_WIDTH_M,
        glazing: {
          included: true,
        },
      },
      quarterRound: {
        selected: {
          type: "timber-quarter-round",
          size: "20mm"
        },
        quantity: 1
      },
      ironmongery: {
        hinges: {
          selected: {
            type: "butt-hinge",
            size: "100mm"
          },
          quantity: 3
        },
        locks: {
          selected: {
            type: "mortice-lock",
            size: "3-lever"
          },
          quantity: 1
        },
        handles: {
          selected: {
            type: "lever-handle",
            size: "standard"
          },
          quantity: 1
        },
        bolts: {
          selected: {
            type: "tower-bolt",
            size: "150mm"
          },
          quantity: 0
        },
        closers: {
          selected: undefined,
          quantity: 0
        }
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
      const sectionThickness = blockThickness || normalizeWallThicknessMm(section?.thickness, section?.type);
      const updatedDoors = (section.doors || []).map((door) => {
        if (door.wallThickness !== undefined && door.wallThickness !== null) return door;
        updatedAny = true;
        const frameSize = getDoorFrameSize(sectionThickness);
        return {
          ...door,
          wallThickness: sectionThickness,
          frame: {
            ...door.frame,
            sizeType: "custom",
            custom: {
              ...door.frame?.custom,
              height: frameSize.height,
              width: frameSize.width,
            },
          },
        };
      });
      if (!updatedAny) return section;
      return {
        ...section,
        doors: updatedDoors,
      };
    });
    if (updatedAny) {
      onUpdate(updatedSections);
    }
  }, [onUpdate, wallSections]);

  const addWindow = (sectionIndex: number) => {
    const newWindow: Window = {
      sizeType: "standard",
      standardSize: STANDARD_WINDOW_SIZES[0],
      custom: { height: "1.2", width: "1.2" },
      type: "Quality clear",
      glassType: "Quality clear",
      glassThickness: 3,
      span: 1.2,
      count: 1,
      frame: {
        type: FRAME_TYPES[0],
        sizeType: "standard",
        standardSize: STANDARD_WINDOW_SIZES[0],
        height: "",
        width: "",
        custom: { height: "", width: "" },
      },
      architrave: {
        selected: {
          type: "timber-architrave",
          size: "40x20mm",
        },
        quantity: 1,
      },
      glazing: {
        glass: {
          type: "Quality clear",
          thickness: 3,
          quantity: 1
        },
        putty: {
          quantity: 0,
          unit: "m"
        }
      },
      isGlassUnderSized: false
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
      const doors = updated[sectionIndex].doors?.filter((_, i) => i !== doorIndex);
      updated[sectionIndex] = { ...updated[sectionIndex], doors };
      return updated;
    });
  };

  const removeWindow = (sectionIndex: number, windowIndex: number) => {
    updateSections((sections) => {
      const updated = [...sections];
      const windows = updated[sectionIndex].windows?.filter((_, i) => i !== windowIndex);
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
      const fastenersMaterial = materialData?.find((m: any) =>
        m.name?.toLowerCase() === "fasteners"
      );
      const resolvedCategory = resolveFastenerCategory(
        fastenersMaterial?.type,
        fastenerCategory,
      );
      const categoryKey = resolvedCategory || fastenerCategory?.toLowerCase() || "";
      const options = Array.isArray(fastenersMaterial?.type?.[categoryKey])
        ? fastenersMaterial.type[categoryKey]
        : [];
      const fastener = options.find((opt: any) =>
        opt.type === selected.type && opt.size === selected.size
      );
      return Number(fastener?.price) || 0;
    } catch (error) {
      console.warn(`Error getting fastener price:`, error);
      return 0;
    }
  };

  const getGlassUnitPrice = (glassType?: string) =>
    Number(getMaterialTypePrice(materialData, "Glazing", glassType || "Clear")) || 0;

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
        const framePrice = Number(door.frame?.custom?.price ?? door.frame?.price) || 0;
        totals.doorLeaves += doorPrice * count;
        totals.doorFrames += framePrice * count;

        if (door.architrave?.quantity) {
          const unit = Number(door.architrave?.price) ||
            getFastenerPrice("Architraves", door.architrave?.selected);
          totals.doorArchitrave += (Number(door.architrave.quantity) || 0) * unit * count;
        }

        if (door.quarterRound?.quantity) {
          const unit = Number(door.quarterRound?.price) ||
            getFastenerPrice("Quarter_Rounds", door.quarterRound?.selected);
          totals.doorQuarterRound += (Number(door.quarterRound.quantity) || 0) * unit * count;
        }

        if (door.ironmongery) {
          const hinge = door.ironmongery.hinges;
          const lock = door.ironmongery.locks;
          const handle = door.ironmongery.handles;
          const bolt = door.ironmongery.bolts;
          const closer = door.ironmongery.closers;

          const hingeUnit = Number(hinge?.price) || getFastenerPrice("Hinges", hinge?.selected);
          const lockUnit = Number(lock?.price) || getFastenerPrice("Locks", lock?.selected);
          const handleUnit = Number(handle?.price) || getFastenerPrice("Handles", handle?.selected);
          const boltUnit = Number(bolt?.price) || getFastenerPrice("Bolts", bolt?.selected);
          const closerUnit = Number(closer?.price) || getFastenerPrice("Closers", closer?.selected);

          totals.doorIronmongery +=
            (Number(hinge?.quantity) || 0) * hingeUnit * count +
            (Number(lock?.quantity) || 0) * lockUnit * count +
            (Number(handle?.quantity) || 0) * handleUnit * count +
            (Number(bolt?.quantity) || 0) * boltUnit * count +
            (Number(closer?.quantity) || 0) * closerUnit * count;
        }

        if (door.transom?.quantity && door.transom?.price) {
          totals.doorTransom +=
            (Number(door.transom.quantity) || 0) *
            (Number(door.transom.price) || 0) *
            count;
        }

        if (door.transom?.glazing?.glassAreaM2) {
          const glassUnit = Number(door.transom.glazing?.glassPricePerM2) || getGlassUnitPrice("Clear");
          totals.transomGlass +=
            (Number(door.transom.glazing.glassAreaM2) || 0) *
            glassUnit *
            (Number(door.transom?.quantity) || 1) *
            count;
        }

        if (door.transom?.glazing?.puttyLengthM) {
          const puttyUnit = Number(door.transom.glazing?.puttyPricePerM) || getPuttyUnitPrice();
          totals.transomPutty +=
            (Number(door.transom.glazing.puttyLengthM) || 0) *
            puttyUnit *
            (Number(door.transom?.quantity) || 1) *
            count;
        }
      });

      (section.windows || []).forEach((window) => {
        const count = Number(window.count) || 0;
        const windowPrice = Number(window.custom?.price ?? window.price) || 0;
        const framePrice = Number(window.frame?.custom?.price ?? window.frame?.price) || 0;
        totals.windowLeaves += windowPrice * count;
        totals.windowFrames += framePrice * count;

        if (window.architrave?.quantity) {
          const unit = Number(window.architrave?.price) ||
            getFastenerPrice("Architraves", window.architrave?.selected);
          totals.windowArchitrave += (Number(window.architrave.quantity) || 0) * unit * count;
        }

        const parsed = window.sizeType === "standard"
          ? parseStandardSize(window.standardSize)
          : {
              width: Number(window.custom?.width) || 0,
              height: Number(window.custom?.height) || 0,
            };
        const windowArea = (parsed?.width || 0) * (parsed?.height || 0);
        const panes = Number(window.glazing?.glass?.quantity) || 1;
        const glassUnit = Number(window.glazing?.glass?.pricePerM2) ||
          getGlassUnitPrice(window.glazing?.glass?.type || window.glassType);
        totals.windowGlass += windowArea * panes * glassUnit * count;

        const puttyUnit = Number(window.glazing?.putty?.price) || getPuttyUnitPrice();
        totals.windowPutty += (Number(window.glazing?.putty?.quantity) || 0) * puttyUnit * count;
      });
    });

    return totals;
  }, [materialData, wallSections]);

  if (!wallSections || wallSections.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No wall sections found yet. Add wall sections to start adding doors and windows.
        </p>
        {!readonly && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => addWallSection("external")}
            >
              Add External Wall Section
            </Button>
            <Button size="sm" variant="outline" onClick={() => addWallSection("internal")}
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
            <Button size="sm" variant="outline" onClick={() => addWallSection("external")}
            >
              Add External Wall Section
            </Button>
            <Button size="sm" variant="outline" onClick={() => addWallSection("internal")}
            >
              Add Internal Wall Section
            </Button>
          </>
        )}
      </div>
      {wallSections.map((section, sectionIdx) => (
        <div
          key={`${section.type}-${sectionIdx}`}
          className={`p-4 rounded-3xl border ${
            section.type === "external"
              ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700"
              : "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700"
          }`}
        >
          <h5
            className={`font-semibold mb-3 capitalize flex items-center ${
              section.type === "external"
                ? "text-green-900 dark:text-green-100"
                : "text-blue-900 dark:text-blue-100"
            }`}
          >
            <Building className="w-4 h-4 mr-2" />
            {section.type} Walls
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
                  onClick={() => addDoor(sectionIdx)}
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
                    key={`door-${sectionIdx}-${doorIdx}`}
                    type="door"
                    item={door}
                    onUpdate={(field, value) => updateDoor(sectionIdx, doorIdx, field, value)}
                    onRemove={() => removeDoor(sectionIdx, doorIdx)}
                    standardSizes={STANDARD_DOOR_SIZES}
                    types={DOOR_TYPES}
                    frameTypes={FRAME_TYPES}
                    sectionWallThicknessMm={
                      getBlockThicknessMmFromType(section.blockType) ||
                      normalizeWallThicknessMm(section.thickness, section.type)
                    }
                    materialData={materialData}
                    readonly={readonly}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No doors added</p>
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
                  onClick={() => addWindow(sectionIdx)}
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
                    key={`window-${sectionIdx}-${windowIdx}`}
                    type="window"
                    item={window}
                    onUpdate={(field, value) =>
                      updateWindow(sectionIdx, windowIdx, field, value)
                    }
                    onRemove={() => removeWindow(sectionIdx, windowIdx)}
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
              <p className="text-xs text-slate-500 italic">No windows added</p>
            )}
          </div>
        </div>
      ))}
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
  const effectiveDoorThickness = doorItem.wallThickness || sectionWallThicknessMm || 150;
  const recommendedGlassThickness =
    windowItem.recommendedGlassThickness ??
    getRecommendedGlassThickness(windowItem.span || 1.2);
  const isGlassSufficient =
    (windowItem.glassThickness || 4) >= recommendedGlassThickness;

  const getDoorWidthM = () => {
    if (doorItem.sizeType === "standard") {
      return parseStandardSize(doorItem.standardSize)?.width ||
        parseFloat(DOOR_DEFAULT_WIDTH_M);
    }
    const width = parseFloat(doorItem.custom?.width || "");
    return Number.isFinite(width) ? width : parseFloat(DOOR_DEFAULT_WIDTH_M);
  };

  const getDoorHeightM = () => {
    if (doorItem.sizeType === "standard") {
      return parseStandardSize(doorItem.standardSize)?.height ||
        parseFloat(DOOR_DEFAULT_HEIGHT_M);
    }
    const height = parseFloat(doorItem.custom?.height || "");
    return Number.isFinite(height) ? height : parseFloat(DOOR_DEFAULT_HEIGHT_M);
  };

  const getFramePerimeterLm = () => {
    const height = getDoorHeightM();
    const width = getDoorWidthM();
    const transomHeight = doorItem.transom?.enabled
      ? (parseFloat(doorItem.transom?.height || "") || parseFloat(DOOR_TRANSOM_HEIGHT_M))
      : 0;
    const totalHeight = height + transomHeight;
    return (totalHeight * 2) + width;
  };

  const autoArchitraveQty = getFramePerimeterLm();
  const autoQuarterRoundQty = getFramePerimeterLm();

  const getFrameRate = () => {
    const localRate = Number(doorItem.frame?.custom?.price);
    let materialRate: number | null = null;
    if (Array.isArray(materialData)) {
      const frameMaterial = materialData.find((m: any) =>
        m.name?.toLowerCase().includes("frame")
      );
      const types = frameMaterial?.type;
      if (Array.isArray(types)) {
        const targetType = (doorItem.frame?.type || "").toLowerCase();
        const match = types.find((t: any) => {
          const name = (t.type || t.name || "").toLowerCase();
          return name === targetType;
        });
        materialRate =
          match?.price ?? match?.price_kes ?? match?.unit_price ?? null;
      }
    }
    if (Number.isFinite(materialRate as number)) return materialRate as number;
    return Number.isFinite(localRate) ? localRate : null;
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

  const autoWindowArchitraveQty =
    (getWindowHeightM() * 2) + getWindowWidthM();

  const getWindowGlassArea = () => getWindowHeightM() * getWindowWidthM();

  React.useEffect(() => {
    if (type !== "door") return;
    const transom = doorItem.transom || {};
    const doorWidthM = getDoorWidthM();
    const heightValue = parseFloat(transom.height || "");
    const widthValue = parseFloat(transom.width || "");
    const nextHeight = Number.isFinite(heightValue)
      ? heightValue
      : parseFloat(DOOR_TRANSOM_HEIGHT_M);
    const nextWidth = Number.isFinite(widthValue) ? widthValue : doorWidthM;
    const frameRate = getFrameRate();
    const hasHeight = !!transom.height;
    const hasWidth = !!transom.width;
    const hasPrice = transom.price !== undefined && transom.price !== null;
    const nextPrice = frameRate
      ? ((2 * nextHeight) + nextWidth) * frameRate
      : transom.price;
    const glazingArea = nextWidth * nextHeight;
    const puttyLength = 2 * (nextWidth + nextHeight);

    if (
      hasHeight &&
      hasWidth &&
      (hasPrice || !frameRate) &&
      transom.glazing?.glassAreaM2 !== undefined &&
      transom.glazing?.puttyLengthM !== undefined
    ) {
      return;
    }

    onUpdate("transom", {
      ...transom,
      height: hasHeight ? transom.height : nextHeight.toFixed(2),
      width: hasWidth ? transom.width : nextWidth.toFixed(2),
      price: hasPrice || !frameRate ? transom.price : Number(nextPrice?.toFixed(2)),
      glazing: {
        ...transom.glazing,
        included: true,
        glassAreaM2: glazingArea,
        puttyLengthM: puttyLength,
      },
    });
  }, [
    type,
    doorItem.sizeType,
    doorItem.standardSize,
    doorItem.custom?.width,
    doorItem.transom,
    doorItem.frame?.custom?.price,
    doorItem.frame?.type,
    materialData,
    onUpdate,
  ]);

  const getFastenerOptions = (fastenerCategory: string) => {
    try {
      const fastenersMaterial = materialData?.find((m: any) =>
        m.name?.toLowerCase() === "fasteners"
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
      console.warn(`Error getting fastener options for ${fastenerCategory}:`, error);
      return [];
    }
  };

  const getAvailableSizes = (fastenerCategory: string, selectedType: string) => {
    const options = getFastenerOptions(fastenerCategory);
    return options
      .filter((opt: any) => opt.type === selectedType)
      .map((opt: any) => opt.size)
      .filter((size: string, index: number, arr: string[]) => arr.indexOf(size) === index);
  };

  const getFastenerPrice = (fastenerCategory: string, selectedType?: string, selectedSize?: string) => {
    try {
      const options = getFastenerOptions(fastenerCategory);
      if (!selectedType || !selectedSize) return null;
      const fastener = options.find((opt: any) => 
        opt.type === selectedType && opt.size === selectedSize
      );
      return fastener?.price || null;
    } catch (error) {
      console.warn(`Error getting fastener price:`, error);
      return null;
    }
  };

  const getGlassUnitPrice = (glassType?: string) =>
    getMaterialTypePrice(materialData, "Glazing", glassType || "Clear");

  const getPuttyUnitPrice = () =>
    getMaterialTypePrice(materialData, "Sealant", "Glazing Putty") ??
    getMaterialTypePrice(materialData, "Sealant", "Putty") ??
    getMaterialTypePrice(materialData, "Sealant", "Silicone");

  React.useEffect(() => {
    if (type !== "door") return;
    const defaultGlass = getGlassUnitPrice("Clear");
    const defaultPutty = getPuttyUnitPrice();
    const transom = doorItem.transom || {};
    const glazing = transom.glazing || {};
    let changed = false;

    if (
      glazing.glassPricePerM2 === undefined &&
      defaultGlass !== null &&
      defaultGlass !== undefined
    ) {
      glazing.glassPricePerM2 = defaultGlass;
      changed = true;
    }

    if (
      glazing.puttyPricePerM === undefined &&
      defaultPutty !== null &&
      defaultPutty !== undefined
    ) {
      glazing.puttyPricePerM = defaultPutty;
      changed = true;
    }

    if (!changed) return;

    onUpdate("transom", {
      ...transom,
      glazing: { ...glazing },
    });
  }, [
    type,
    doorItem.transom,
    materialData,
    onUpdate,
  ]);

  React.useEffect(() => {
    if (type !== "window") return;
    const defaultGlass = getGlassUnitPrice(
      windowItem.glazing?.glass?.type || windowItem.glassType,
    );
    const defaultPutty = getPuttyUnitPrice();
    const glazing = windowItem.glazing || {};
    const glass = glazing.glass || {};
    const putty = glazing.putty || {};
    let changed = false;

    if (
      glass.pricePerM2 === undefined &&
      defaultGlass !== null &&
      defaultGlass !== undefined
    ) {
      glass.pricePerM2 = defaultGlass;
      changed = true;
    }

    if (
      putty.price === undefined &&
      defaultPutty !== null &&
      defaultPutty !== undefined
    ) {
      putty.price = defaultPutty;
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
    windowItem.glazing,
    windowItem.glassType,
    materialData,
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
            <SelectValue placeholder={type === "door" ? "Door Type" : "Glass Type"} />
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t">
        <h4 className="col-span-full text-xs font-semibold text-slate-700 dark:text-slate-300">
          Frame Specification
          </h4>
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
          <SelectTrigger className="h-9 text-xs">
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

        <Select
          value={item.frame?.sizeType || "standard"}
          onValueChange={(value) =>
            onUpdate("frame", {
              ...item.frame,
              sizeType: value,
            })
          }
          disabled={readonly}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Frame Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {item.frame?.sizeType === "custom" && (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              step="0.01"
              className="h-9 text-xs"
              value={item.frame?.custom?.height || ""}
              onChange={(e) =>
                onUpdate("frame", {
                  ...item.frame,
                  height: e.target.value,
                  custom: {
                    ...item.frame?.custom,
                    height: e.target.value,
                  },
                })
              }
              disabled={readonly}
            />
            <Input
              placeholder="Width (m)"
              type="number"
              step="0.01"
              className="h-9 text-xs"
              value={item.frame?.custom?.width || ""}
              onChange={(e) =>
                onUpdate("frame", {
                  ...item.frame,
                  width: e.target.value,
                  custom: {
                    ...item.frame?.custom,
                    width: e.target.value,
                  },
                })
              }
              disabled={readonly}
            />
            <Input
              placeholder="Price (Ksh)"
              type="number"
              min="0"
              className="h-9 text-xs"
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
          </>
        )}
      </div>

      {type === "door" && (
        <div className="space-y-3 pt-2 border-t">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem
              value="architrave"
              className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
            >
              <AccordionTrigger className="px-3 py-2 text-sm font-semibold">
                Architrave
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-xs font-medium">Architrave Type</label>
                    <Select
                      value={doorItem.architrave?.selected?.type || ""}
                      onValueChange={(value) =>
                        onUpdate("architrave", {
                          ...doorItem.architrave,
                          selected: {
                            type: value,
                            size: "40x20mm",
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
                            getFastenerOptions("Architraves").map((opt: any) => opt.type)
                          )
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
                    <Input
                      className="h-8 text-xs "
                      value={doorItem.architrave?.selected?.size || "40×20mm"}
                      onChange={(e) =>
                        onUpdate("architrave", {
                          ...doorItem.architrave,
                          selected: {
                            ...doorItem.architrave?.selected,
                            size: e.target.value,
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
                      step="0.1"
                      className="h-8 text-xs"
                      value={(doorItem.architrave?.quantity ?? autoArchitraveQty).toFixed(2)}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.architrave?.price ??
                          getFastenerPrice(
                            "Architraves",
                            doorItem.architrave?.selected?.type,
                            doorItem.architrave?.selected?.size || "40x20mm"
                          )
                        ) || ""
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
                        (
                          doorItem.architrave?.price ??
                          getFastenerPrice(
                            "Architraves",
                            doorItem.architrave?.selected?.type,
                            doorItem.architrave?.selected?.size || "40x20mm"
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="quarter-round"
              className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
            >
              <AccordionTrigger className="px-3 py-2 text-sm font-semibold">
                Quarter Round
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-xs font-medium">Quarter Round Type</label>
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
                            getFastenerOptions("quarter_rounds").map((opt: any) => opt.type)
                          )
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
                      disabled={readonly || !doorItem.quarterRound?.selected?.type}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSizes(
                          "Quarter_Rounds",
                          doorItem.quarterRound?.selected?.type || ""
                        ).map((size: string) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty</label>
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="0"
                      step="0.1"
                      className="h-8 text-xs"
                      value={(doorItem.quarterRound?.quantity ?? autoQuarterRoundQty).toFixed(2)}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.quarterRound?.price ??
                          getFastenerPrice(
                            "Quarter_Rounds",
                            doorItem.quarterRound?.selected?.type,
                            doorItem.quarterRound?.selected?.size
                          )
                        ) || ""
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
                        doorItem.quarterRound?.quantity ?? autoQuarterRoundQty,
                        (
                          doorItem.quarterRound?.price ??
                          getFastenerPrice(
                            "Quarter_Rounds",
                            doorItem.quarterRound?.selected?.type,
                            doorItem.quarterRound?.selected?.size
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="ironmongery"
              className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
            >
              <AccordionTrigger className="px-3 py-2 text-sm font-semibold">
                Ironmongery
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                  <div>
                    <label className="text-xs font-medium">Hinges Type</label>
                    <Select
                      value={doorItem.ironmongery?.hinges?.selected?.type || ""}
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
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            getFastenerOptions("Hinges").map((opt: any) => opt.type)
                          )
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
                      value={doorItem.ironmongery?.hinges?.selected?.size || ""}
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
                      disabled={readonly || !doorItem.ironmongery?.hinges?.selected?.type}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSizes(
                          "Hinges",
                          doorItem.ironmongery?.hinges?.selected?.type || ""
                        ).map((size: string) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty</label>
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="0"
                      className="h-8 text-xs"
                      value={(doorItem.ironmongery?.hinges?.quantity || "") as any}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.ironmongery?.hinges?.price ??
                          getFastenerPrice(
                            "Hinges",
                            doorItem.ironmongery?.hinges?.selected?.type,
                            doorItem.ironmongery?.hinges?.selected?.size
                          )
                        ) || ""
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
                        (
                          doorItem.ironmongery?.hinges?.price ??
                          getFastenerPrice(
                            "Hinges",
                            doorItem.ironmongery?.hinges?.selected?.type,
                            doorItem.ironmongery?.hinges?.selected?.size
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                  <div>
                    <label className="text-xs font-medium">Locks Type</label>
                    <Select
                      value={doorItem.ironmongery?.locks?.selected?.type || ""}
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
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            getFastenerOptions("Locks").map((opt: any) => opt.type)
                          )
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
                      value={doorItem.ironmongery?.locks?.selected?.size || ""}
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
                      disabled={readonly || !doorItem.ironmongery?.locks?.selected?.type}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSizes(
                          "Locks",
                          doorItem.ironmongery?.locks?.selected?.type || ""
                        ).map((size: string) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty</label>
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="0"
                      className="h-8 text-xs"
                      value={(doorItem.ironmongery?.locks?.quantity || "") as any}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.ironmongery?.locks?.price ??
                          getFastenerPrice(
                            "Locks",
                            doorItem.ironmongery?.locks?.selected?.type,
                            doorItem.ironmongery?.locks?.selected?.size
                          )
                        ) || ""
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
                        (
                          doorItem.ironmongery?.locks?.price ??
                          getFastenerPrice(
                            "Locks",
                            doorItem.ironmongery?.locks?.selected?.type,
                            doorItem.ironmongery?.locks?.selected?.size
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                  <div>
                    <label className="text-xs font-medium">Handles Type</label>
                    <Select
                      value={doorItem.ironmongery?.handles?.selected?.type || ""}
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
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            getFastenerOptions("Handles").map((opt: any) => opt.type)
                          )
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
                      value={doorItem.ironmongery?.handles?.selected?.size || ""}
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
                      disabled={readonly || !doorItem.ironmongery?.handles?.selected?.type}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSizes(
                          "Handles",
                          doorItem.ironmongery?.handles?.selected?.type || ""
                        ).map((size: string) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty</label>
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="0"
                      className="h-8 text-xs"
                      value={(doorItem.ironmongery?.handles?.quantity || "") as any}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.ironmongery?.handles?.price ??
                          getFastenerPrice(
                            "Handles",
                            doorItem.ironmongery?.handles?.selected?.type,
                            doorItem.ironmongery?.handles?.selected?.size
                          )
                        ) || ""
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
                        (
                          doorItem.ironmongery?.handles?.price ??
                          getFastenerPrice(
                            "Handles",
                            doorItem.ironmongery?.handles?.selected?.type,
                            doorItem.ironmongery?.handles?.selected?.size
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                  <div>
                    <label className="text-xs font-medium">Bolts Type</label>
                    <Select
                      value={doorItem.ironmongery?.bolts?.selected?.type || ""}
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
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            getFastenerOptions("Bolts").map((opt: any) => opt.type)
                          )
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
                      value={doorItem.ironmongery?.bolts?.selected?.size || ""}
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
                      disabled={readonly || !doorItem.ironmongery?.bolts?.selected?.type}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSizes(
                          "Bolts",
                          doorItem.ironmongery?.bolts?.selected?.type || ""
                        ).map((size: string) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty</label>
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="0"
                      className="h-8 text-xs"
                      value={(doorItem.ironmongery?.bolts?.quantity || "") as any}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.ironmongery?.bolts?.price ??
                          getFastenerPrice(
                            "Bolts",
                            doorItem.ironmongery?.bolts?.selected?.type,
                            doorItem.ironmongery?.bolts?.selected?.size
                          )
                        ) || ""
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
                        (
                          doorItem.ironmongery?.bolts?.price ??
                          getFastenerPrice(
                            "Bolts",
                            doorItem.ironmongery?.bolts?.selected?.type,
                            doorItem.ironmongery?.bolts?.selected?.size
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 bg-gray-50 dark:bg-slate-800/30 rounded">
                  <div>
                    <label className="text-xs font-medium">Closers Type</label>
                    <Select
                      value={doorItem.ironmongery?.closers?.selected?.type || ""}
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
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            getFastenerOptions("Closers").map((opt: any) => opt.type)
                          )
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
                      value={doorItem.ironmongery?.closers?.selected?.size || ""}
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
                      disabled={readonly || !doorItem.ironmongery?.closers?.selected?.type}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSizes(
                          "Closers",
                          doorItem.ironmongery?.closers?.selected?.type || ""
                        ).map((size: string) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty</label>
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="0"
                      className="h-8 text-xs"
                      value={(doorItem.ironmongery?.closers?.quantity || "") as any}
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
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
                    <Input
                      placeholder="Ksh"
                      type="number"
                      className="h-8 text-xs "
                      value={
                        (
                          doorItem.ironmongery?.closers?.price ??
                          getFastenerPrice(
                            "Closers",
                            doorItem.ironmongery?.closers?.selected?.type,
                            doorItem.ironmongery?.closers?.selected?.size
                          )
                        ) || ""
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
                        (
                          doorItem.ironmongery?.closers?.price ??
                          getFastenerPrice(
                            "Closers",
                            doorItem.ironmongery?.closers?.selected?.type,
                            doorItem.ironmongery?.closers?.selected?.size
                          )
                        ) || 0,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="transom"
              className="border rounded-2xl bg-slate-50/60 dark:bg-slate-900/40"
            >
              <AccordionTrigger className="px-3 py-2 text-sm font-semibold">
                Transom
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
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
                      disabled={readonly}
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
                      disabled={readonly}
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
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Unit Price (Ksh)</label>
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
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Total (Ksh)</label>
                    <Input
                      className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                      value={getTotalPrice(
                        doorItem.transom?.quantity,
                        doorItem.transom?.price,
                        doorItem.count
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  <div>
                    <label className="text-xs font-medium">Glass Area (m²)</label>
                    <Input
                      className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                      value={(doorItem.transom?.glazing?.glassAreaM2 || 0).toFixed(3)}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Putty Length (m)</label>
                    <Input
                      className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                      value={(doorItem.transom?.glazing?.puttyLengthM || 0).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Glass Unit (Ksh/m²)</label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      value={
                        doorItem.transom?.glazing?.glassPricePerM2 ??
                        getGlassUnitPrice("Clear") ??
                        ""
                      }
                      onChange={(e) =>
                        onUpdate("transom", {
                          ...doorItem.transom,
                          glazing: {
                            ...doorItem.transom?.glazing,
                            glassPricePerM2: parseFloat(e.target.value) || undefined,
                          },
                        })
                      }
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Putty Unit (Ksh/m)</label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      value={
                        doorItem.transom?.glazing?.puttyPricePerM ??
                        getPuttyUnitPrice() ??
                        ""
                      }
                      onChange={(e) =>
                        onUpdate("transom", {
                          ...doorItem.transom,
                          glazing: {
                            ...doorItem.transom?.glazing,
                            puttyPricePerM: parseFloat(e.target.value) || undefined,
                          },
                        })
                      }
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Glass Total (Ksh)</label>
                    <Input
                      className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                      value={getTotalPrice(
                        doorItem.transom?.glazing?.glassAreaM2 || 0,
                        doorItem.transom?.glazing?.glassPricePerM2 ??
                          getGlassUnitPrice("Clear") ??
                          0,
                        (doorItem.transom?.quantity || 1) * doorItem.count,
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Putty Total (Ksh)</label>
                    <Input
                      className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                      value={getTotalPrice(
                        doorItem.transom?.glazing?.puttyLengthM || 0,
                        doorItem.transom?.glazing?.puttyPricePerM ??
                          getPuttyUnitPrice() ??
                          0,
                        (doorItem.transom?.quantity || 1) * doorItem.count,
                      ).toFixed(2)}
                      disabled={true}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {type === "window" && (
        <div className="space-y-3 pt-2 border-t">
          {/* STEP 2: Glass Specification */}
          <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded-3xl border border-cyan-200 dark:border-cyan-700">
      
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
                  <label className="text-xs font-medium">Glass Thickness</label>
                  <Select
                    value={windowItem.glassThickness?.toString() || "4"}
                    onValueChange={(value) => {
                      const thickness = parseInt(value);
                      const isSufficient = thickness >= recommendedGlassThickness;
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
                        <SelectItem key={thickness} value={thickness.toString()}>
                          {thickness}mm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Recommended</label>
                  <Input
                    className="h-8 text-xs "
                    value={recommendedGlassThickness}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || undefined;
                      const fallback = getRecommendedGlassThickness(
                        windowItem.span || 1.2
                      );
                      const nextRecommended = value ?? fallback;
                      onUpdate("__batch", {
                        recommendedGlassThickness: value,
                        isGlassUnderSized:
                          (windowItem.glassThickness || 4) < nextRecommended,
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
                      Glass thickness {windowItem.glassThickness}mm is sufficient for span{" "}
                      {windowItem.span || 1.2}m
                    </span>
                  </div>
                ) : (
                  <div className="text-xs p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 rounded flex items-center gap-1">
                    <span>✗</span>
                    <span>
                      Glass thickness {windowItem.glassThickness}mm is undersized. Minimum
                      recommended: {recommendedGlassThickness}mm
                    </span>
                  </div>
                )}
              </div>

              {/* Architrave - Fixed to 40x20mm */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs font-medium">Architrave Type</label>
                  <Select
                    value={windowItem.architrave?.selected?.type || ""}
                    onValueChange={(value) =>
                      onUpdate("architrave", {
                        ...windowItem.architrave,
                        selected: {
                          type: value,
                          size: "40x20mm",
                        },
                        quantity: windowItem.architrave?.quantity,
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
                          getFastenerOptions("Architraves").map((opt: any) => opt.type)
                        )
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
                  <Input
                    className="h-8 text-xs "
                    value={windowItem.architrave?.selected?.size || "40x20mm"}
                    onChange={(e) =>
                      onUpdate("architrave", {
                        ...windowItem.architrave,
                        selected: {
                          ...windowItem.architrave?.selected,
                          size: e.target.value,
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
                    step="0.1"
                    className="h-8 text-xs"
                    value={(windowItem.architrave?.quantity ?? autoWindowArchitraveQty).toFixed(2)}
                    onChange={(e) =>
                      onUpdate("architrave", {
                        ...windowItem.architrave,
                        quantity: parseFloat(e.target.value) || undefined,
                      })
                    }
                    disabled={readonly}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Unit Price (Ksh)</label>
                  <Input
                    placeholder="Ksh"
                    type="number"
                    className="h-8 text-xs "
                        value={
                          (
                            windowItem.architrave?.price ??
                            getFastenerPrice(
                              "Architraves",
                              windowItem.architrave?.selected?.type,
                              windowItem.architrave?.selected?.size || "40x20mm"
                            )
                          ) || ""
                        }
                    onChange={(e) =>
                      onUpdate("architrave", {
                        ...windowItem.architrave,
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
                      windowItem.architrave?.quantity ?? autoWindowArchitraveQty,
                      (
                        windowItem.architrave?.price ??
                        getFastenerPrice(
                          "Architraves",
                          windowItem.architrave?.selected?.type,
                          windowItem.architrave?.selected?.size || "40x20mm"
                        )
                      ) || 0,
                      windowItem.count
                    ).toFixed(2)}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Putty Calculation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs font-medium">Glass Area (m²)</label>
                  <Input
                    className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                    value={getWindowGlassArea().toFixed(3)}
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Glass Unit (Ksh/m²)</label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    value={
                      windowItem.glazing?.glass?.pricePerM2 ??
                      getGlassUnitPrice(
                        windowItem.glazing?.glass?.type || windowItem.glassType
                      ) ??
                      ""
                    }
                    onChange={(e) =>
                      onUpdate("glazing", {
                        ...windowItem.glazing,
                        glass: {
                          ...windowItem.glazing?.glass,
                          pricePerM2: parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                    disabled={readonly}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Glass Total (Ksh)</label>
                  <Input
                    className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                    value={getTotalPrice(
                      getWindowGlassArea() * (windowItem.glazing?.glass?.quantity || 1),
                      windowItem.glazing?.glass?.pricePerM2 ??
                        getGlassUnitPrice(
                          windowItem.glazing?.glass?.type || windowItem.glassType
                        ) ??
                        0,
                      windowItem.count,
                    ).toFixed(2)}
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Glass Panes</label>
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
                  <label className="text-xs font-medium">Putty (linear m)</label>
                  <Input
                    className="h-8 text-xs "
                    value={windowItem.glazing?.putty?.quantity || 0}
                    onChange={(e) =>
                      onUpdate("glazing", {
                        ...windowItem.glazing,
                        putty: {
                          ...windowItem.glazing?.putty,
                          quantity: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    disabled={readonly}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Putty (m²)</label>
                  <Input
                    className="h-8 text-xs "
                    value={
                      ((windowItem.glazing?.putty?.quantity || 0) *
                        (windowItem.glassThickness || 4) / 1000).toFixed(3)
                    }
                    onChange={(e) => {
                      const area = parseFloat(e.target.value) || 0;
                      const thickness = windowItem.glassThickness || 4;
                      const linear = thickness > 0 ? (area * 1000) / thickness : 0;
                      onUpdate("glazing", {
                        ...windowItem.glazing,
                        putty: {
                          ...windowItem.glazing?.putty,
                          quantity: linear,
                        },
                      });
                    }}
                    disabled={readonly}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Putty Unit (Ksh/m)</label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    value={
                      windowItem.glazing?.putty?.price ??
                      getPuttyUnitPrice() ??
                      ""
                    }
                    onChange={(e) =>
                      onUpdate("glazing", {
                        ...windowItem.glazing,
                        putty: {
                          ...windowItem.glazing?.putty,
                          price: parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                    disabled={readonly}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Putty Total (Ksh)</label>
                  <Input
                    className="h-8 text-xs bg-gray-100 dark:bg-slate-700"
                    value={getTotalPrice(
                      windowItem.glazing?.putty?.quantity || 0,
                      windowItem.glazing?.putty?.price ?? getPuttyUnitPrice() ?? 0,
                      windowItem.count,
                    ).toFixed(2)}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoorsWindowsEditor;