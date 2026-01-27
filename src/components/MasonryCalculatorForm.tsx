// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, Trash, Layers } from "lucide-react";
import useMasonryCalculatorNew, {
  MasonryQSSettings,
  Door,
  Window,
  Dimensions,
  WallSection,
  WallProperties,
} from "@/hooks/useMasonryCalculatorNew";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { RebarSize } from "@/hooks/useRebarCalculator";
const blockTypes = [
  {
    id: 1,
    displayName: "200×200/9×9",
    name: "Large Block",
    size: { length: 0.2, height: 0.2, thickness: 0.2 },
  },
  {
    id: 2,
    displayName: "150×200/6×9",
    name: "Standard Block",
    size: { length: 0.15, height: 0.2, thickness: 0.15 },
  },
  {
    id: 3,
    displayName: "100×200/4×9",
    name: "Small Block",
    size: { length: 0.1, height: 0.2, thickness: 0.1 },
  },
  { id: 4, displayName: "Custom", name: "Custom", size: null },
];
const doorTypes = ["Flush", "Panel", "Metal", "Glass"];
const windowGlassTypes = ["Clear", "Tinted", "Frosted"];
const frameTypes = ["Wood", "Steel", "Aluminum"];
const plasterOptions = ["None", "One Side", "Both Sides"];
const standardDoorSizes = [
  "0.9 \u00D7 2.1 m",
  "1.0 \u00D7 2.1 m",
  "1.2 \u00D7 2.4 m",
];
const standardWindowSizes = [
  "1.2 \u00D7 1.2 m",
  "1.5 \u00D7 1.2 m",
  "2.0 \u00D7 1.5 m",
];
interface MasonryCalculatorFormProps {
  quote: any;
  setQuote: (quote: any) => void;
  materialBasePrices: any[];
  userMaterialPrices: any[];
  regionalMultipliers: any[];
  userRegion: string;
  getEffectiveMaterialPrice: (
    materialId: string,
    userRegion: string,
    userOverride: any,
    materialBasePrices: any[],
    regionalMultipliers: any[],
  ) => any;
}
export default function MasonryCalculatorForm({
  quote,
  setQuote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}: MasonryCalculatorFormProps) {
  const {
    wallDimensions,
    wallSections,
    wallProperties,
    updateWallDimensions,
    updateWallProperties,
    addWallSection,
    removeWallSection,
    addDoorToSection,
    addWindowToSection,
    removeDoorFromSection,
    removeWindowFromSection,
    updateDoorInSection,
    updateWindowInSection,
    updateWallSectionProperties,
    calculateMasonry,
    results,
    qsSettings,
    waterPrice,
  } = useMasonryCalculatorNew({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });

  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuote((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuote],
  );

  const handleMortarRatioChange = (value: string) => {
    setQuote((prev: any) => ({
      ...prev,
      mortarRatio: value,
    }));
  };
  const handleJointThicknessChange = (value: string) => {
    const numValue = parseFloat(value);
    setQuote((prev: any) => ({
      ...prev,
      jointThickness: isNaN(numValue) ? 0.01 : numValue,
    }));
  };
  return (
    <div className="space-y-4">
      <div className="p-4 m-2 bg-blue-50 dark:bg-primary/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-lg text-primary dark:text-blue-100">
          Total Cost: Ksh {results.grossTotalCost?.toLocaleString() || 0}
        </h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Blocks:</span>{" "}
            {results.netBlocks?.toFixed(0) || 0} net →{" "}
            {results.grossBlocks?.toFixed(0) || 0} gross pcs (
            {results.netBlocksFeet?.toFixed(2) || 0} →{" "}
            {results.grossBlocksFeet?.toFixed(2) || 0} ft)
          </div>
          <div>
            <span className="font-medium">Mortar:</span>{" "}
            {results.netMortar?.toFixed(3) || 0} net →{" "}
            {results.grossMortar?.toFixed(3) || 0} gross m³
          </div>
          <div>
            <span className="font-medium">Water:</span>{" "}
            {results.netWater?.toFixed(0) || 0} net →{" "}
            {results.grossWater?.toFixed(0) || 0} gross liters
          </div>
          {qsSettings.clientProvidesWater && results.grossWaterCost > 0 && (
            <div>
              <span className="font-medium">Water Cost:</span> Ksh{" "}
              {results.grossWaterCost?.toLocaleString() || 0}
              <span className="text-xs text-gray-500 ml-1">
                (@ Ksh {waterPrice || 0}/m³)
              </span>
            </div>
          )}
          {qsSettings.includesLintels && (
            <>
              <div>
                <span className="font-medium">Lintel Beam:</span>{" "}
                {results.netLintelRebar?.toFixed(1) || 0} net →{" "}
                {results.grossLintelRebar?.toFixed(1) || 0} gross kg (rebar)
              </div>
              <div>
                <span className="font-medium">Lintel Cost:</span> Ksh{" "}
                {results.netLintelsCost?.toLocaleString() || 0} net → Ksh{" "}
                {results.grossLintelsCost?.toLocaleString() || 0} gross
              </div>
            </>
          )}
          {qsSettings.includesRingBeams && (
            <>
              <div>
                <span className="font-medium">Ring Beam Rebar:</span>{" "}
                {results.netRingBeamRebar?.toFixed(1) || 0} net →{" "}
                {results.grossRingBeamRebar?.toFixed(1) || 0} gross kg
              </div>
              <div>
                <span className="font-medium">Ring Beam Cost:</span> Ksh{" "}
                {results.netRingBeamsCost?.toLocaleString() || 0} net → Ksh{" "}
                {results.grossRingBeamsCost?.toLocaleString() || 0} gross
              </div>
            </>
          )}
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="space-y-4 m-2">
        {/* Lintels Breakdown */}
        {qsSettings.includesLintels &&
          (results.netLintelsCost > 0 || results.grossLintelsCost > 0) && (
            <Card className="border">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-b rounded-t-lg">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                  Lintel Beam Breakdown
                </h4>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Rebar (kg):
                    </span>
                    <span className="font-medium">
                      {results.netLintelRebar?.toFixed(1) || 0} net →{" "}
                      {results.grossLintelRebar?.toFixed(1) || 0} gross
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Concrete (m³):
                    </span>
                    <span className="font-medium">
                      {results.netLintelConcrete?.toFixed(3) || 0} net →{" "}
                      {results.grossLintelConcrete?.toFixed(3) || 0} gross
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Rebar Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netLintelRebarCost?.toLocaleString() || 0} →{" "}
                      {results.grossLintelRebarCost?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Material Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netLintelsCost?.toLocaleString() || 0} →{" "}
                      {results.grossLintelsCost?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

        {/* Ring Beams Breakdown */}
        {qsSettings.includesRingBeams &&
          (results.netRingBeamsCost > 0 || results.grossRingBeamsCost > 0) && (
            <Card className="border">
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-b rounded-t-lg">
                <h4 className="font-semibold text-cyan-900 dark:text-cyan-100">
                  Ring Beam Breakdown
                </h4>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Rebar (kg):
                    </span>
                    <span className="font-medium">
                      {results.netRingBeamRebar?.toFixed(1) || 0} net →{" "}
                      {results.grossRingBeamRebar?.toFixed(1) || 0} gross
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Concrete (m³):
                    </span>
                    <span className="font-medium">
                      {results.netRingBeamConcrete?.toFixed(3) || 0} net →{" "}
                      {results.grossRingBeamConcrete?.toFixed(3) || 0} gross
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Rebar Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netRingBeamRebarCost?.toLocaleString() || 0}{" "}
                      → {results.grossRingBeamRebarCost?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Material Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netRingBeamsCost?.toLocaleString() || 0} →{" "}
                      {results.grossRingBeamsCost?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 m-2">
        <div>
          <Label htmlFor="wastage">Wastage (%)</Label>
          <Input
            id="wastage"
            type="number"
            value={qsSettings.wastageMasonry || 5}
            onChange={(e) =>
              onSettingsChange({
                ...qsSettings,
                wastageMasonry: parseFloat(e.target.value),
              })
            }
            placeholder="e.g., 5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-2">
        <div>
          <Label htmlFor="dpc-type">DPC Type</Label>

          <Select
            value={quote.dpcType || "Polyethylene"}
            onValueChange={(value) =>
              setQuote((prev) => ({
                ...prev,
                dpcType: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Polyethylene">Polyethylene</SelectItem>
              <SelectItem value="Bituminous Felt">Bituminous Felt</SelectItem>
              <SelectItem value="PVC DPC Roll">PVC DPC Roll</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 m-2">
        <Checkbox
          id="include-dpc"
          checked={quote.includeDPC !== false}
          onCheckedChange={(checked) =>
            setQuote((prev) => ({
              ...prev,
              includeDPC: checked,
            }))
          }
        />
        <Label htmlFor="include-dpc" className="cursor-pointer font-medium">
          Include DPC (Damp Proof Course) in calculations
        </Label>
      </div>

      {qsSettings.clientProvidesWater ? (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            💧 Water will be provided by client -{" "}
            {results.grossWater?.toFixed(0)} liters required
          </p>
        </div>
      ) : results.grossWaterCost > 0 ? (
        <div className="p-3 bg-blue-50 dark:bg-primary/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div className="font-medium">💧 Water Cost Calculation:</div>
            <div>• Water Required: {results.grossWater?.toFixed(0)} liters</div>
            <div>• Water-Cement Ratio: {qsSettings.cementWaterRatio}:1</div>
            <div>
              • Water Price: Ksh {waterPrice?.toLocaleString() || "0"} per m³
            </div>
            <div className="font-semibold mt-1">
              • Total Water Cost: Ksh {results.grossWaterCost?.toLocaleString()}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {/* Wall Dimensions Section */}
        <Card className="border">
          <div className="p-4 rounded-t-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Wall Dimensions
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ext-perimeter">
                  External Wall Length/Perimeter (m)
                </Label>
                <Input
                  id="ext-perimeter"
                  type="number"
                  min="0"
                  step="0.1"
                  value={wallDimensions?.externalWallPerimiter || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    updateWallDimensions({
                      ...wallDimensions,
                      externalWallPerimiter: value,
                    });
                    calculateMasonry();
                  }}
                  placeholder="e.g., 100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total perimeter of external walls
                </p>
              </div>
              <div>
                <Label htmlFor="int-perimeter">
                  Internal Wall Length/Perimeter (m)
                </Label>
                <Input
                  id="int-perimeter"
                  type="number"
                  min="0"
                  step="0.1"
                  value={wallDimensions?.internalWallPerimiter || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    updateWallDimensions({
                      ...wallDimensions,
                      internalWallPerimiter: value,
                    });
                    calculateMasonry();
                  }}
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total perimeter of internal walls
                </p>
              </div>
              <div>
                <Label htmlFor="ext-height">External Wall Height (m)</Label>
                <Input
                  id="ext-height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={wallDimensions?.externalWallHeight || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    updateWallDimensions({
                      ...wallDimensions,
                      externalWallHeight: value,
                    });
                    calculateMasonry();
                  }}
                  placeholder="e.g., 3.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Height of external walls
                </p>
              </div>
              <div>
                <Label htmlFor="int-height">Internal Wall Height (m)</Label>
                <Input
                  id="int-height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={wallDimensions?.internalWallHeight || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    updateWallDimensions({
                      ...wallDimensions,
                      internalWallHeight: value,
                    });
                    calculateMasonry();
                  }}
                  placeholder="e.g., 2.8"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Height of internal walls
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Wall Sections Section */}
        <Card className="border">
          <div className="p-4 bg-gradient-to-r rounded-t-3xl from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Wall Sections & Openings
              </h3>
              <Button
                onClick={() => {
                  addWallSection("external");
                  calculateMasonry();
                }}
                size="sm"
                variant="outline"
                className="mr-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add External Wall
              </Button>
              <Button
                onClick={() => {
                  addWallSection("internal");
                  calculateMasonry();
                }}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Internal Wall
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {wallSections && wallSections.length > 0 ? (
              wallSections.map((section: WallSection, sectionIndex: number) => (
                <WallSectionComponent
                  key={sectionIndex}
                  section={section}
                  sectionIndex={sectionIndex}
                  onAddDoor={() => {
                    addDoorToSection(sectionIndex);
                    calculateMasonry();
                  }}
                  onAddWindow={() => {
                    addWindowToSection(sectionIndex);
                    calculateMasonry();
                  }}
                  onRemoveSection={() => {
                    removeWallSection(sectionIndex);
                    calculateMasonry();
                  }}
                  onRemoveDoor={(doorIndex) => {
                    removeDoorFromSection(sectionIndex, doorIndex);
                    calculateMasonry();
                  }}
                  onRemoveWindow={(windowIndex) => {
                    removeWindowFromSection(sectionIndex, windowIndex);
                    calculateMasonry();
                  }}
                  onUpdateDoor={(doorIndex, field, value) => {
                    updateDoorInSection(sectionIndex, doorIndex, field, value);
                    calculateMasonry();
                  }}
                  onUpdateWindow={(windowIndex, field, value) => {
                    updateWindowInSection(
                      sectionIndex,
                      windowIndex,
                      field,
                      value,
                    );
                    calculateMasonry();
                  }}
                  onUpdateProperties={(properties) => {
                    updateWallSectionProperties(sectionIndex, properties);
                    calculateMasonry();
                  }}
                  standardDoorSizes={standardDoorSizes}
                  standardWindowSizes={standardWindowSizes}
                  doorTypes={doorTypes}
                  windowGlassTypes={windowGlassTypes}
                  frameTypes={frameTypes}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-gray-800/20">
                No wall sections added yet. Click "Add External Wall" or "Add
                Internal Wall" to start.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
interface WallSectionComponentProps {
  section: WallSection;
  sectionIndex: number;
  onAddDoor: () => void;
  onAddWindow: () => void;
  onRemoveSection: () => void;
  onRemoveDoor: (doorIndex: number) => void;
  onRemoveWindow: (windowIndex: number) => void;
  onUpdateDoor: (doorIndex: number, field: string, value: any) => void;
  onUpdateWindow: (windowIndex: number, field: string, value: any) => void;
  onUpdateProperties: (properties: Partial<WallSection>) => void;
  standardDoorSizes: string[];
  standardWindowSizes: string[];
  doorTypes: string[];
  windowGlassTypes: string[];
  frameTypes: string[];
}

function WallSectionComponent({
  section,
  sectionIndex,
  onAddDoor,
  onAddWindow,
  onRemoveSection,
  onRemoveDoor,
  onRemoveWindow,
  onUpdateDoor,
  onUpdateWindow,
  onUpdateProperties,
  standardDoorSizes,
  standardWindowSizes,
  doorTypes,
  windowGlassTypes,
  frameTypes,
}: WallSectionComponentProps) {
  return (
    <Card
      className={`border-l-4 ${
        section.type === "external"
          ? "border-l-blue-500"
          : "border-l-orange-500"
      }`}
    >
      <div
        className={`p-4 rounded-t-3xl ${
          section.type === "external"
            ? "bg-blue-50 dark:bg-blue-900/20"
            : "bg-orange-50 dark:bg-orange-900/20"
        } border-b`}
      >
        <div className="flex items-center justify-between">
          <h4
            className={`font-semibold text-lg capitalize ${
              section.type === "external"
                ? "text-blue-900 dark:text-blue-100"
                : "text-orange-900 dark:text-orange-100"
            }`}
          >
            {section.type === "external"
              ? "🏢 External Wall"
              : "🏠 Internal Wall"}
          </h4>
          <Button variant="destructive" size="sm" onClick={onRemoveSection}>
            <Trash className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Wall Properties Section */}
        <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20 space-y-3">
          <h5 className="font-semibold text-md text-purple-900 dark:text-purple-100">
            Wall Properties
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Block Type</Label>
              <Select
                value={section.blockType || ""}
                onValueChange={(value) => {
                  const selectedBlock = blockTypes.find(
                    (b) => b.name === value,
                  );
                  const updates: Partial<WallSection> = { blockType: value };
                  // Auto-update thickness when block type changes
                  if (selectedBlock && selectedBlock.size) {
                    updates.thickness = selectedBlock.size.thickness;
                  }
                  onUpdateProperties(updates);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Block Type" />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map((block) => (
                    <SelectItem key={block.id} value={block.name}>
                      {block.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Block Thickness (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={section.thickness || ""}
                onChange={(e) => {
                  const thickness = parseFloat(e.target.value);
                  const updates: Partial<WallSection> = { thickness };
                  // Auto-update block type when thickness changes
                  const matchingBlock = blockTypes.find(
                    (b) => b.size && b.size.thickness === thickness,
                  );
                  if (matchingBlock) {
                    updates.blockType = matchingBlock.name;
                  } else {
                    // Set to Custom if no matching block type
                    updates.blockType = "Custom";
                  }
                  onUpdateProperties(updates);
                }}
                placeholder="e.g., 0.2"
              />
            </div>
          </div>

          {section.blockType === "Custom" && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800">
              <div>
                <Label className="text-xs">Block Name</Label>
                <Input
                  type="text"
                  value={section.customBlockName || ""}
                  onChange={(e) => {
                    onUpdateProperties({
                      customBlockName: e.target.value,
                    });
                  }}
                  placeholder="e.g., Interlocking"
                />
              </div>
              <div>
                <Label className="text-xs">Custom Length (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={section.customBlockLength || ""}
                  onChange={(e) => {
                    onUpdateProperties({
                      customBlockLength: parseFloat(e.target.value),
                    });
                  }}
                  placeholder="Length"
                />
              </div>
              <div>
                <Label className="text-xs">Custom Height (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={section.customBlockHeight || ""}
                  onChange={(e) => {
                    onUpdateProperties({
                      customBlockHeight: parseFloat(e.target.value),
                    });
                  }}
                  placeholder="Height"
                />
              </div>
              <div>
                <Label className="text-xs">Custom Price (Ksh)</Label>
                <Input
                  type="number"
                  min="0"
                  value={section.customBlockPrice || ""}
                  onChange={(e) => {
                    onUpdateProperties({
                      customBlockPrice: parseFloat(e.target.value),
                    });
                  }}
                  placeholder="Price"
                />
              </div>
            </div>
          )}
        </div>

        {/* Doors Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-md">Doors</h5>
            <Button size="sm" variant="outline" onClick={onAddDoor}>
              <Plus className="w-4 h-4 mr-1" />
              Add Door
            </Button>
          </div>
          {section.doors && section.doors.length > 0 ? (
            section.doors.map((door: Door, doorIndex: number) => (
              <DoorWindowItem
                key={doorIndex}
                type="door"
                item={door}
                itemIndex={doorIndex}
                onUpdate={(field, value) =>
                  onUpdateDoor(doorIndex, field, value)
                }
                onRemove={() => onRemoveDoor(doorIndex)}
                standardSizes={standardDoorSizes}
                types={doorTypes}
                frameTypes={frameTypes}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No doors added</p>
          )}
        </div>

        {/* Windows Section */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-md">Windows</h5>
            <Button size="sm" variant="outline" onClick={onAddWindow}>
              <Plus className="w-4 h-4 mr-1" />
              Add Window
            </Button>
          </div>
          {section.windows && section.windows.length > 0 ? (
            section.windows.map((window: Window, windowIndex: number) => (
              <DoorWindowItem
                key={windowIndex}
                type="window"
                item={window}
                itemIndex={windowIndex}
                onUpdate={(field, value) =>
                  onUpdateWindow(windowIndex, field, value)
                }
                onRemove={() => onRemoveWindow(windowIndex)}
                standardSizes={standardWindowSizes}
                types={windowGlassTypes}
                frameTypes={frameTypes}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No windows added</p>
          )}
        </div>
      </div>
    </Card>
  );
}
interface DoorWindowItemProps {
  type: "door" | "window";
  item: Door | Window;
  itemIndex: number;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  standardSizes: string[];
  types: string[];
  frameTypes: string[];
}
function DoorWindowItem({
  type,
  item,
  itemIndex,
  onUpdate,
  onRemove,
  standardSizes,
  types,
  frameTypes,
}: DoorWindowItemProps) {
  return (
    <div className="p-3 border rounded-lg bg-gray-50 dark:bg-transparent space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <Select
          value={item.sizeType}
          onValueChange={(value) => onUpdate("sizeType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {item.sizeType === "standard" && (
          <Select
            value={item.standardSize}
            onValueChange={(value) => onUpdate("standardSize", value)}
          >
            <SelectTrigger>
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
        )}

        {item.sizeType === "custom" && (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              step="0.01"
              value={item.custom.height}
              onChange={(e) =>
                onUpdate("custom", {
                  ...item.custom,
                  height: e.target.value,
                })
              }
            />
            <Input
              placeholder="Width (m)"
              type="number"
              step="0.01"
              value={item.custom.width}
              onChange={(e) =>
                onUpdate("custom", {
                  ...item.custom,
                  width: e.target.value,
                })
              }
            />
            <Input
              placeholder="Price (Ksh)"
              type="number"
              min="0"
              value={item.custom.price || ""}
              onChange={(e) =>
                onUpdate("custom", {
                  ...item.custom,
                  price: e.target.value,
                })
              }
            />
          </>
        )}

        <Select
          value={item.type}
          onValueChange={(value) => onUpdate("type", value)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={`${type === "door" ? "Door" : "Glass"} Type`}
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
          value={item.count}
          onChange={(e) => onUpdate("count", parseInt(e.target.value) || 1)}
        />

        <Input
          placeholder="Price (Ksh)"
          type="number"
          min="0"
          value={item.price || ""}
          onChange={(e) => onUpdate("price", e.target.value)}
        />

        <Button size="icon" variant="destructive" onClick={onRemove}>
          <Trash className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 rounded">
        <Select
          value={item.frame.type}
          onValueChange={(value) =>
            onUpdate("frame", {
              ...item.frame,
              type: value,
            })
          }
        >
          <SelectTrigger>
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
          value={item.frame?.sizeType || ""}
          onValueChange={(value) =>
            onUpdate("frame", {
              ...item.frame,
              sizeType: value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Frame Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {item.frame?.sizeType === "custom" ? (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              value={item.frame?.custom?.height || ""}
              onChange={(e) =>
                onUpdate("frame", {
                  ...item.frame,
                  custom: {
                    ...item.frame?.custom,
                    height: e.target.value,
                  },
                })
              }
            />
            <Input
              placeholder="Width (m)"
              type="number"
              value={item.frame?.custom?.width || ""}
              onChange={(e) =>
                onUpdate("frame", {
                  ...item.frame,
                  custom: {
                    ...item.frame?.custom,
                    width: e.target.value,
                  },
                })
              }
            />
            <Input
              placeholder="Price (Ksh)"
              type="number"
              value={item.frame?.custom?.price || ""}
              onChange={(e) =>
                onUpdate("frame", {
                  ...item.frame,
                  custom: {
                    ...item.frame?.custom,
                    price: e.target.value,
                  },
                })
              }
            />
          </>
        ) : (
          <Input
            placeholder="Frame Price (Ksh)"
            type="number"
            min="0"
            value={item.frame.price || ""}
            onChange={(e) =>
              onUpdate("frame", {
                ...item.frame,
                price: e.target.value,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
