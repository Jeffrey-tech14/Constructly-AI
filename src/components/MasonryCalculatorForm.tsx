import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, Trash } from "lucide-react";
import useMasonryCalculator, {
  MasonryQSSettings,
  Room,
  Door,
  Window,
} from "@/hooks/useMasonryCalculator";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";

const blockTypes = [
  {
    id: 1,
    displayName: "Standard Block (400×200×200mm)",
    name: "Standard Block",
    size: { length: 0.4, height: 0.2, thickness: 0.2 },
  },
  {
    id: 2,
    displayName: "Half Block (400×200×100mm)",
    name: "Half Block",
    size: { length: 0.4, height: 0.2, thickness: 0.1 },
  },
  {
    id: 3,
    displayName: "Brick (225×112.5×75mm)",
    name: "Brick",
    size: { length: 0.225, height: 0.075, thickness: 0.1125 },
  },
  { id: 4, displayName: "Custom", name: "Custom", size: null },
];

const doorTypes = ["Flush", "Panel", "Metal", "Glass"];
const windowGlassTypes = ["Clear", "Tinted", "Frosted"];
const frameTypes = ["Wood", "Steel", "Aluminum"];
const plasterOptions = ["None", "One Side", "Both Sides"];
const standardDoorSizes = ["0.9 × 2.1 m", "1.0 × 2.1 m", "1.2 × 2.4 m"];
const standardWindowSizes = ["1.2 × 1.2 m", "1.5 × 1.2 m", "2.0 × 1.5 m"];

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
    regionalMultipliers: any[]
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
    rooms,
    results,
    addRoom,
    removeRoom,
    handleRoomChange,
    handleNestedChange,
    addDoor,
    addWindow,
    removeNested,
    removeEntry,
    qsSettings,
    updateQsSettings,
    waterPrice,
  } = useMasonryCalculator({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });

  const handleQsSettingChange = (key: keyof MasonryQSSettings, value: any) => {
    updateQsSettings({
      ...qsSettings,
      [key]: value,
    });
  };

  const handleNumericQsSettingChange = (
    key: keyof MasonryQSSettings,
    value: string
  ) => {
    const numValue = parseFloat(value);
    handleQsSettingChange(key, isNaN(numValue) ? 0 : numValue);
  };

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
      {/* Summary Card */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
          Total Cost: Ksh {results.grossTotalCost?.toLocaleString() || 0}
        </h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Blocks:</span>{" "}
            {results.netBlocks?.toFixed(0) || 0} net →{" "}
            {results.grossBlocks?.toFixed(0) || 0} gross pcs
          </div>
          <div>
            <span className="font-medium">Mortar:</span>{" "}
            {results.netMortar?.toFixed(3) || 0} net →{" "}
            {results.grossMortar?.toFixed(3) || 0} gross m³
          </div>
          <div>
            <span className="font-medium">Plaster:</span>{" "}
            {results.netPlaster?.toFixed(2) || 0} net →{" "}
            {results.grossPlaster?.toFixed(2) || 0} gross m²
          </div>
          <div>
            <span className="font-medium">Wall Area:</span>{" "}
            {results.netArea?.toFixed(2) || 0} m² net
          </div>
          <div>
            <span className="font-medium">Water:</span>{" "}
            {results.netWater?.toFixed(0) || 0} net →{" "}
            {results.grossWater?.toFixed(0) || 0} gross liters
          </div>
          {!qsSettings.clientProvidesWater && results.grossWaterCost > 0 && (
            <div>
              <span className="font-medium">Water Cost:</span> Ksh{" "}
              {results.grossWaterCost?.toLocaleString() || 0}
              <span className="text-xs text-gray-500 ml-1">
                (@ Ksh {waterPrice || 0}/m³)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Calculation Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="mortar-ratio">Mortar Ratio (Cement:Sand)</Label>
          <Input
            id="mortar-ratio"
            type="text"
            value={quote.mortarRatio || "1:4"}
            onChange={(e) => handleMortarRatioChange(e.target.value)}
            placeholder="e.g., 1:4"
          />
        </div>

        <div>
          <Label htmlFor="joint-thickness">Joint Thickness (m)</Label>
          <Input
            id="joint-thickness"
            type="number"
            step="0.001"
            min="0.005"
            max="0.02"
            value={quote.jointThickness || 0.01}
            onChange={(e) => handleJointThicknessChange(e.target.value)}
          />
          <span className="text-xs text-gray-500">Typical: 0.01m (10mm)</span>
        </div>

        <div>
          <Label htmlFor="cement-water-ratio">Water-Cement Ratio</Label>
          <Input
            id="cement-water-ratio"
            type="number"
            step="0.05"
            min="0.4"
            max="0.6"
            value={qsSettings.cementWaterRatio}
            onChange={(e) =>
              handleQsSettingChange("cementWaterRatio", e.target.value)
            }
          />
          <span className="text-xs text-gray-500">
            {qsSettings.cementWaterRatio}:1 (water:cement) - Typical: 0.4-0.6
          </span>
        </div>
      </div>

      {/* Water Information */}
      {qsSettings.clientProvidesWater ? (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            💧 Water will be provided by client -{" "}
            {results.grossWater?.toFixed(0)} liters required
          </p>
        </div>
      ) : results.grossWaterCost > 0 ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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

      {/* Professional QS Settings */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border rounded-lg space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Professional QS Settings</h3>

          {/* Wastage Settings */}
          <div className="flex-1">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-3">Wastage Percentages</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 max-md:grid-cols-2 w-full gap-3">
                <div>
                  <Label htmlFor="wastage-blocks">Blocks (%)</Label>
                  <Input
                    id="wastage-blocks"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={qsSettings.wastageBlocksPercent}
                    onChange={(e) =>
                      handleNumericQsSettingChange(
                        "wastageBlocksPercent",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="wastage-cement">Cement (%)</Label>
                  <Input
                    id="wastage-cement"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={qsSettings.wastageCementPercent}
                    onChange={(e) =>
                      handleNumericQsSettingChange(
                        "wastageCementPercent",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="wastage-sand">Sand (%)</Label>
                  <Input
                    id="wastage-sand"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={qsSettings.wastageSandPercent}
                    onChange={(e) =>
                      handleNumericQsSettingChange(
                        "wastageSandPercent",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="wastage-water">Water (%)</Label>
                  <Input
                    id="wastage-water"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={qsSettings.wastageWaterPercent}
                    onChange={(e) =>
                      handleNumericQsSettingChange(
                        "wastageWaterPercent",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Water Settings */}
            <div className="w-full">
              <h4 className="font-medium text-sm mb-3 mt-5">Water Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-3 flex-1">
                  <Label className="flex items-center space-x-2">
                    <Checkbox
                      checked={qsSettings.clientProvidesWater}
                      onCheckedChange={(checked) =>
                        handleQsSettingChange(
                          "clientProvidesWater",
                          checked === true
                        )
                      }
                    />
                    <span>Client provides water</span>
                  </Label>

                  <div className="grid grid-cols-2 space-x-4">
                    <Label htmlFor="sand-moisture">
                      Sand Moisture Content (%)
                      <Input
                        id="sand-moisture"
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={qsSettings.sandMoistureContentPercent}
                        onChange={(e) =>
                          handleNumericQsSettingChange(
                            "sandMoistureContentPercent",
                            e.target.value
                          )
                        }
                      />
                    </Label>

                    <Label htmlFor="other-water">
                      Other Site Water (L/m³)
                      <Input
                        id="other-water"
                        type="number"
                        step="1"
                        min="0"
                        value={qsSettings.otherSiteWaterAllowanceLM3}
                        onChange={(e) =>
                          handleNumericQsSettingChange(
                            "otherSiteWaterAllowanceLM3",
                            e.target.value
                          )
                        }
                      />
                      <span className="text-xs text-gray-500">
                        For cleaning, curing, etc.
                      </span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div className="space-y-4">
        {rooms.map((room: Room, index: number) => (
          <RoomSection
            key={index}
            room={room}
            index={index}
            onRoomChange={handleRoomChange}
            onNestedChange={handleNestedChange}
            onAddDoor={() => addDoor(index)}
            onAddWindow={() => addWindow(index)}
            onRemoveNested={removeNested}
            onRemoveEntry={removeEntry}
            onRemoveRoom={() => removeRoom(index)}
            roomBreakdown={results.breakdown?.[index]}
          />
        ))}

        <Button
          onClick={addRoom}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>
    </div>
  );
}

interface RoomSectionProps {
  room: Room;
  index: number;
  onRoomChange: (index: number, field: keyof Room, value: any) => void;
  onNestedChange: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number,
    key: string,
    value: any
  ) => void;
  onAddDoor: () => void;
  onAddWindow: () => void;
  onRemoveNested: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number
  ) => void;
  onRemoveEntry: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number
  ) => void;
  onRemoveRoom: () => void;
  roomBreakdown?: any;
}

function RoomSection({
  room,
  index,
  onRoomChange,
  onNestedChange,
  onAddDoor,
  onAddWindow,
  onRemoveNested,
  onRemoveEntry,
  onRemoveRoom,
  roomBreakdown,
}: RoomSectionProps) {
  return (
    <Card className="border rounded-lg overflow-hidden">
      {/* Room Header */}
      <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b">
        <div className="flex items-center justify-between">
          <Input
            type="text"
            value={room.room_name || ""}
            onChange={(e) => onRoomChange(index, "room_name", e.target.value)}
            placeholder="Room Name"
            className="text-lg font-bold border-0 bg-transparent p-0 focus:ring-0 w-auto"
          />
          <Button variant="destructive" size="sm" onClick={onRemoveRoom}>
            <Trash className="w-4 h-4 mr-1" />
            Remove Room
          </Button>
        </div>
      </div>

      {/* Room Configuration */}
      <div className="p-4 space-y-4 rounded-lg">
        {/* Dimensions and Block Type */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Length (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={room.length}
              onChange={(e) => onRoomChange(index, "length", e.target.value)}
              placeholder="Length"
            />
          </div>
          <div>
            <Label>Width (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={room.width}
              onChange={(e) => onRoomChange(index, "width", e.target.value)}
              placeholder="Width"
            />
          </div>
          <div>
            <Label>Height (m)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={room.height}
              onChange={(e) => onRoomChange(index, "height", e.target.value)}
              placeholder="Height"
            />
          </div>
          <div>
            <Label>Block Type</Label>
            <Select
              value={room.blockType}
              onValueChange={(value) => onRoomChange(index, "blockType", value)}
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
        </div>

        {/* Custom Block Inputs */}
        {room.blockType === "Custom" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div>
              <Label>Custom Length (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={room.customBlock.length}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    length: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Custom Height (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={room.customBlock.height}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    height: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Custom Thickness (m)</Label>
              <Input
                type="number"
                step="0.01"
                value={room.customBlock.thickness}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    thickness: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Custom Price (Ksh)</Label>
              <Input
                type="number"
                min="0"
                value={room.customBlock.price}
                onChange={(e) =>
                  onRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    price: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Plaster Selection */}
        <div className="max-w-xs">
          <Label>Plastering</Label>
          <Select
            value={room.plaster}
            onValueChange={(value) => onRoomChange(index, "plaster", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Plaster Option" />
            </SelectTrigger>
            <SelectContent>
              {plasterOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doors Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Doors</h4>
            <Button size="sm" variant="outline" onClick={onAddDoor}>
              <Plus className="w-4 h-4 mr-1" />
              Add Door
            </Button>
          </div>
          {room.doors.map((door: Door, doorIndex: number) => (
            <DoorWindowItem
              key={doorIndex}
              type="door"
              item={door}
              index={index}
              itemIndex={doorIndex}
              onNestedChange={onNestedChange}
              onRemove={onRemoveNested}
              standardSizes={standardDoorSizes}
              types={doorTypes}
            />
          ))}
        </div>

        {/* Windows Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Windows</h4>
            <Button size="sm" variant="outline" onClick={onAddWindow}>
              <Plus className="w-4 h-4 mr-1" />
              Add Window
            </Button>
          </div>
          {room.windows.map((window: Window, windowIndex: number) => (
            <DoorWindowItem
              key={windowIndex}
              type="window"
              item={window}
              index={index}
              itemIndex={windowIndex}
              onNestedChange={onNestedChange}
              onRemove={onRemoveEntry}
              standardSizes={standardWindowSizes}
              types={windowGlassTypes}
            />
          ))}
        </div>

        {/* Room Breakdown */}
        {roomBreakdown && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-lg mb-3">Room Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Dimensions:</span> {room.length}m
                × {room.width}m × {room.height}m
              </div>
              <div>
                <span className="font-medium">Wall Area:</span>{" "}
                {roomBreakdown.grossWallArea?.toFixed(2)} m² gross
              </div>
              <div>
                <span className="font-medium">Net Area:</span>{" "}
                {roomBreakdown.netWallArea?.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Blocks:</span>{" "}
                {roomBreakdown.netBlocks} net → {roomBreakdown.grossBlocks}{" "}
                gross
              </div>
              <div>
                <span className="font-medium">Plaster:</span>{" "}
                {roomBreakdown.netPlasterArea?.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Total Cost:</span> Ksh{" "}
                {roomBreakdown.totalCost?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface DoorWindowItemProps {
  type: "door" | "window";
  item: Door | Window;
  index: number;
  itemIndex: number;
  onNestedChange: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number,
    key: string,
    value: any
  ) => void;
  onRemove: (
    index: number,
    field: "doors" | "windows",
    nestedIndex: number
  ) => void;
  standardSizes: string[];
  types: string[];
}

function DoorWindowItem({
  type,
  item,
  index,
  itemIndex,
  onNestedChange,
  onRemove,
  standardSizes,
  types,
}: DoorWindowItemProps) {
  const field = type === "door" ? "doors" : "windows";

  return (
    <div className="p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 space-y-3">
      {/* Main Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        {/* Size Type */}
        <Select
          value={item.sizeType}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "sizeType", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Size Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Standard Size */}
        {item.sizeType === "standard" && (
          <Select
            value={item.standardSize}
            onValueChange={(value) =>
              onNestedChange(index, field, itemIndex, "standardSize", value)
            }
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

        {/* Custom Size Inputs */}
        {item.sizeType === "custom" && (
          <>
            <Input
              placeholder="Height (m)"
              type="number"
              step="0.01"
              value={item.custom.height}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "custom", {
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
                onNestedChange(index, field, itemIndex, "custom", {
                  ...item.custom,
                  width: e.target.value,
                })
              }
            />
            <Input
              placeholder="Price (Ksh)"
              type="number"
              min="0"
              value={item.custom.price}
              onChange={(e) =>
                onNestedChange(index, field, itemIndex, "custom", {
                  ...item.custom,
                  price: e.target.value,
                })
              }
            />
          </>
        )}

        {/* Type Selection */}
        <Select
          value={item.type}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "type", value)
          }
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

        {/* Quantity */}
        <Input
          placeholder="Qty"
          type="number"
          min="1"
          value={item.count}
          onChange={(e) =>
            onNestedChange(
              index,
              field,
              itemIndex,
              "count",
              parseInt(e.target.value) || 1
            )
          }
        />

        {/* Remove Button */}
        <Button
          size="icon"
          variant="destructive"
          onClick={() => onRemove(index, field, itemIndex)}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>

      {/* Frame Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2  rounded">
        <Select
          value={item.frame.type}
          onValueChange={(value) =>
            onNestedChange(index, field, itemIndex, "frame", {
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

        <Input
          placeholder="Frame Price (Ksh)"
          type="number"
          min="0"
          value={item.frame.price}
          onChange={(e) =>
            onNestedChange(index, field, itemIndex, "frame", {
              ...item.frame,
              price: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
