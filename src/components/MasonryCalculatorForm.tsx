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
import { Calculator, Layers } from "lucide-react";
import useMasonryCalculatorNew, {
  MasonryQSSettings,
  Dimensions,
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
const plasterOptions = ["None", "One Side", "Both Sides"];
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
    wallProperties,
    updateWallDimensions,
    updateWallProperties,
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

        {/* Doors & Windows Breakdown */}
        {(results.netDoorsCost > 0 ||
          results.netWindowsCost > 0) && (
          <Card className="border">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b rounded-t-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                Doors & Windows Breakdown
              </h4>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {results.netDoorsCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Door Leaves (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netDoors || 0} net →{" "}
                        {results.grossDoors || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Door Leaves Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netDoorsCost?.toLocaleString() || 0} →{" "}
                        {results.grossDoorsCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
                {results.netDoorFramesCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Door Frames (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netDoorFrames || 0} net →{" "}
                        {results.grossDoorFrames || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Door Frames Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netDoorFramesCost?.toLocaleString() || 0}{" "}
                        → {results.grossDoorFramesCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
                {results.netDoorArchitraveCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Door Architrave Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorArchitraveCost?.toLocaleString() || 0}{" "}
                      → {results.grossDoorArchitraveCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {results.netDoorQuarterRoundCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Door Quarter Round Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorQuarterRoundCost?.toLocaleString() || 0}{" "}
                      → {results.grossDoorQuarterRoundCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {results.netDoorIronmongCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Door Ironmongery Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorIronmongCost?.toLocaleString() || 0}{" "}
                      → {results.grossDoorIronmongCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {results.netDoorTransomCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Door Transom Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorTransomCost?.toLocaleString() || 0}{" "}
                      → {results.grossDoorTransomCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {results.netWindowsCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Window Leaves (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netWindows || 0} net →{" "}
                        {results.grossWindows || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Window Leaves Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netWindowsCost?.toLocaleString() || 0} →{" "}
                        {results.grossWindowsCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
                {results.netWindowFramesCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Window Frames (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netWindowFrames || 0} net →{" "}
                        {results.grossWindowFrames || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Window Frames Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netWindowFramesCost?.toLocaleString() || 0}{" "}
                        → {results.grossWindowFramesCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
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

            {/* Block Type Selectors - from Wall Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <Label htmlFor="ext-block-type">External Wall Block Type</Label>
                <Select
                  value={
                    quote?.wallSections?.find((s) => s.type === "external")
                      ?.blockType || ""
                  }
                  onValueChange={(value) => {
                    const selectedBlockType = blockTypes.find(
                      (b) => b.name === value
                    );
                    setQuote((prev) => ({
                      ...prev,
                      wallSections: prev.wallSections?.map((section) =>
                        section.type === "external"
                          ? {
                              ...section,
                              blockType: value,
                              thickness: selectedBlockType?.size?.thickness || section.thickness,
                            }
                          : section
                      ),
                    }));
                    calculateMasonry();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Block Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {blockTypes.map((block) => (
                      <SelectItem key={`${block.id}-ext`} value={block.name}>
                        {block.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="int-block-type">Internal Wall Block Type</Label>
                <Select
                  value={
                    quote?.wallSections?.find((s) => s.type === "internal")
                      ?.blockType || ""
                  }
                  onValueChange={(value) => {
                    const selectedBlockType = blockTypes.find(
                      (b) => b.name === value
                    );
                    setQuote((prev) => ({
                      ...prev,
                      wallSections: prev.wallSections?.map((section) =>
                        section.type === "internal"
                          ? {
                              ...section,
                              blockType: value,
                              thickness: selectedBlockType?.size?.thickness || section.thickness,
                            }
                          : section
                      ),
                    }));
                    calculateMasonry();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Block Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {blockTypes.map((block) => (
                      <SelectItem key={`${block.id}-int`} value={block.name}>
                        {block.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
