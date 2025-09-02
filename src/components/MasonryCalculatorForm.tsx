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
import useMasonryCalculator from "@/hooks/useMasonryCalculator";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Label } from "./ui/label";

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

export default function MasonryCalculatorForm({
  quote,
  setQuote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}) {
  const {
    results,
    addRoom,
    removeEntry,
    addDoor,
    addWindow,
    removeNested,
    removeRoom,
    handleNestedChange,
    calculateMasonry,
    handleRoomChange,
  } = useMasonryCalculator({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });
  const { roomTypes } = useUserSettings();

  return (
    <div>
      <div className="mb-3">
        <h3>Total Cost: Ksh {results.cost?.toLocaleString() || 0}</h3>
        <h4>Breakdown:</h4>
        <ul>
          <li>Blocks: {results.blocks || 0}</li>
          <li>Mortar: {results.mortar?.toFixed(2) || 0} m³</li>
          <li>Plaster Area: {results.plaster?.toFixed(2) || 0} m²</li>
          <li>Total Area: {results.netArea?.toFixed(2) || 0} m²</li>
        </ul>
      </div>
      <Label className="mt-3">
        Motar Ratio
        <Input
          type="text"
          value={quote.mortarRatio || "1:3"}
          onChange={(e) => setQuote({ ...quote, mortarRatio: e.target.value })}
        />
      </Label>

      <Label className="mb-3">
        Joint thickness
        <Input
          type="number"
          step="0.001"
          value={quote.jointThickness || 0.01}
          onChange={(e) =>
            setQuote({ ...quote, jointThickness: parseFloat(e.target.value) })
          }
        />
      </Label>
      {quote.rooms.map((room, index) => (
        <div
          key={index}
          className="mt-3 grid grid-cols-5 md:grid-cols-1 justify-between gap-2 mb-3 items-start border p-4 rounded-xl shadow-sm"
        >
          {/* Room Type */}
          <Input
            type="text"
            value={room.room_name || ""}
            className="sm:text-md text-sm"
            onChange={(e) =>
              handleRoomChange(index, "room_name", e.target.value)
            }
            placeholder="Enter room name"
          />

          {/* Length */}
          <Input
            placeholder="Length (m)"
            type="number"
            min="0"
            value={room.length}
            onChange={(e) => handleRoomChange(index, "length", e.target.value)}
          />

          {/* Width */}
          <Input
            placeholder="Width (m)"
            type="number"
            min="0"
            value={room.width}
            onChange={(e) => handleRoomChange(index, "width", e.target.value)}
          />

          {/* Height */}
          <Input
            placeholder="Height (m)"
            type="number"
            min="0"
            value={room.height}
            onChange={(e) => handleRoomChange(index, "height", e.target.value)}
          />

          {/* Block Type */}
          <Select
            value={room.blockType || undefined}
            onValueChange={(value) =>
              handleRoomChange(index, "blockType", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Block Type" />
            </SelectTrigger>
            <SelectContent>
              {blockTypes.map((b) => (
                <SelectItem key={b.id} value={b.name}>
                  {b.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Block Input (if chosen) */}
          {room.blockType === "Custom" && (
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <Input
                placeholder="Length (m)"
                type="number"
                value={room.customBlock.length}
                onChange={(e) =>
                  handleRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    length: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Height (m)"
                type="number"
                value={room.customBlock.height}
                onChange={(e) =>
                  handleRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    height: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Thickness (m)"
                type="number"
                value={room.customBlock.thickness}
                onChange={(e) =>
                  handleRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    thickness: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Price (Ksh)"
                type="number"
                value={room.customBlock.price}
                onChange={(e) =>
                  handleRoomChange(index, "customBlock", {
                    ...room.customBlock,
                    price: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* Plaster */}
          <Select
            value={room.plaster || undefined}
            onValueChange={(value) => handleRoomChange(index, "plaster", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Plastering" />
            </SelectTrigger>
            <SelectContent>
              {plasterOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* --- Doors --- */}
          <div className="col-span-3 space-y-2 mt-3">
            <h3 className="font-medium">Doors</h3>
            {room.doors.map((door: any, dIndex: number) => (
              <div key={dIndex} className="space-y-2 border p-2 rounded-lg">
                {/* --- Door Row --- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                  {/* Size Type */}
                  <Select
                    value={door.sizeType || undefined}
                    onValueChange={(value) =>
                      handleNestedChange(
                        index,
                        "doors",
                        dIndex,
                        "sizeType",
                        value
                      )
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

                  {door.sizeType === "standard" && (
                    <Select
                      value={door.standardSize || undefined}
                      onValueChange={(value) =>
                        handleNestedChange(
                          index,
                          "doors",
                          dIndex,
                          "standardSize",
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Standard Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {standardDoorSizes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {door.sizeType === "custom" && (
                    <>
                      <Input
                        placeholder="Height (m)"
                        type="number"
                        value={door.custom?.height}
                        onChange={(e) =>
                          handleNestedChange(index, "doors", dIndex, "custom", {
                            ...door.custom,
                            height: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Width (m)"
                        type="number"
                        value={door.custom?.width}
                        onChange={(e) =>
                          handleNestedChange(index, "doors", dIndex, "custom", {
                            ...door.custom,
                            width: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Price (Ksh)"
                        type="number"
                        value={door.custom?.price}
                        onChange={(e) =>
                          handleNestedChange(index, "doors", dIndex, "custom", {
                            ...door.custom,
                            price: e.target.value,
                          })
                        }
                      />
                    </>
                  )}

                  {/* Door Type */}
                  <Select
                    value={door.type || undefined}
                    onValueChange={(value) =>
                      handleNestedChange(index, "doors", dIndex, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Door Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {doorTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Count */}
                  <Input
                    placeholder="Qty"
                    type="number"
                    min="1"
                    value={door.count}
                    onChange={(e) =>
                      handleNestedChange(
                        index,
                        "doors",
                        dIndex,
                        "count",
                        e.target.value
                      )
                    }
                  />

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => removeNested(index, "doors", dIndex)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                {/* --- Frame Row --- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg">
                  {/* Frame Type */}
                  <Select
                    value={door.frame?.type || ""}
                    onValueChange={(v) =>
                      handleNestedChange(index, "doors", dIndex, "frame", {
                        ...door.frame,
                        type: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Frame Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameTypes.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Frame Size Type */}
                  <Select
                    value={door.frame?.sizeType || ""}
                    onValueChange={(value) =>
                      handleNestedChange(index, "doors", dIndex, "frame", {
                        ...door.frame,
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

                  {door.frame?.sizeType === "standard" && (
                    <Select
                      value={door.frame?.standardSize || ""}
                      onValueChange={(value) =>
                        handleNestedChange(index, "doors", dIndex, "frame", {
                          ...door.frame,
                          standardSize: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Frame Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {standardDoorSizes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {door.frame?.sizeType === "custom" && (
                    <>
                      <Input
                        placeholder="Height (m)"
                        type="number"
                        value={door.frame?.custom?.height || ""}
                        onChange={(e) =>
                          handleNestedChange(index, "doors", dIndex, "frame", {
                            ...door.frame,
                            custom: {
                              ...door.frame?.custom,
                              height: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="Width (m)"
                        type="number"
                        value={door.frame?.custom?.width || ""}
                        onChange={(e) =>
                          handleNestedChange(index, "doors", dIndex, "frame", {
                            ...door.frame,
                            custom: {
                              ...door.frame?.custom,
                              width: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="Price (Ksh)"
                        type="number"
                        value={door.frame?.custom?.price || ""}
                        onChange={(e) =>
                          handleNestedChange(index, "doors", dIndex, "frame", {
                            ...door.frame,
                            custom: {
                              ...door.frame?.custom,
                              price: e.target.value,
                            },
                          })
                        }
                      />
                    </>
                  )}

                  {/* Frame Qty */}
                  <Input
                    placeholder="Frame Qty"
                    type="number"
                    min="1"
                    value={door.frame?.count || ""}
                    onChange={(e) =>
                      handleNestedChange(index, "doors", dIndex, "frame", {
                        ...door.frame,
                        count: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => addDoor(index)}>
              <Plus className="w-4 h-4 mr-1" /> Add Door
            </Button>
          </div>

          {/* --- Windows --- */}
          <div className="col-span-3 space-y-2 mt-3">
            <h3 className="font-medium">Windows</h3>
            {room.windows.map((win: any, wIndex: number) => (
              <div key={wIndex} className="space-y-2 border p-2 rounded-lg">
                {/* --- Window Row --- */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                  {/* Size Type */}
                  <Select
                    value={win.sizeType || undefined}
                    onValueChange={(value) =>
                      handleNestedChange(
                        index,
                        "windows",
                        wIndex,
                        "sizeType",
                        value
                      )
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

                  {win.sizeType === "standard" && (
                    <Select
                      value={win.standardSize || undefined}
                      onValueChange={(value) =>
                        handleNestedChange(
                          index,
                          "windows",
                          wIndex,
                          "standardSize",
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Standard Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {standardWindowSizes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {win.sizeType === "custom" && (
                    <>
                      <Input
                        placeholder="Height (m)"
                        type="number"
                        value={win.custom?.height}
                        onChange={(e) =>
                          handleNestedChange(
                            index,
                            "windows",
                            wIndex,
                            "custom",
                            { ...win.custom, height: e.target.value }
                          )
                        }
                      />
                      <Input
                        placeholder="Width (m)"
                        type="number"
                        value={win.custom?.width}
                        onChange={(e) =>
                          handleNestedChange(
                            index,
                            "windows",
                            wIndex,
                            "custom",
                            { ...win.custom, width: e.target.value }
                          )
                        }
                      />
                      <Input
                        placeholder="Price (Ksh)"
                        type="number"
                        value={win.custom?.price}
                        onChange={(e) =>
                          handleNestedChange(
                            index,
                            "windows",
                            wIndex,
                            "custom",
                            { ...win.custom, price: e.target.value }
                          )
                        }
                      />
                    </>
                  )}

                  {/* Glass Type */}
                  <Select
                    value={win.glass || undefined}
                    onValueChange={(value) =>
                      handleNestedChange(
                        index,
                        "windows",
                        wIndex,
                        "glass",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Glass Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {windowGlassTypes.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Count */}
                  <Input
                    placeholder="Qty"
                    type="number"
                    min="1"
                    value={win.count}
                    onChange={(e) =>
                      handleNestedChange(
                        index,
                        "windows",
                        wIndex,
                        "count",
                        e.target.value
                      )
                    }
                  />

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => removeEntry(index, "windows", wIndex)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                {/* --- Frame Row --- */}
                <div key={wIndex} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg">
                    {/* Frame Type */}
                    <Select
                      value={win.frame?.type || ""}
                      onValueChange={(v) =>
                        handleNestedChange(index, "windows", wIndex, "frame", {
                          ...win.frame,
                          type: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Frame Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameTypes.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Frame Size Type */}
                    <Select
                      value={win.frame?.sizeType || ""}
                      onValueChange={(value) =>
                        handleNestedChange(index, "windows", wIndex, "frame", {
                          ...win.frame,
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

                    {win.frame?.sizeType === "standard" && (
                      <Select
                        value={win.frame?.standardSize || ""}
                        onValueChange={(value) =>
                          handleNestedChange(
                            index,
                            "windows",
                            wIndex,
                            "frame",
                            {
                              ...win.frame,
                              standardSize: value,
                            }
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Frame Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {standardWindowSizes.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {win.frame?.sizeType === "custom" && (
                      <>
                        <Input
                          placeholder="Height (m)"
                          type="number"
                          value={win.frame?.custom?.height || ""}
                          onChange={(e) =>
                            handleNestedChange(
                              index,
                              "windows",
                              wIndex,
                              "frame",
                              {
                                ...win.frame,
                                custom: {
                                  ...win.frame?.custom,
                                  height: e.target.value,
                                },
                              }
                            )
                          }
                        />
                        <Input
                          placeholder="Width (m)"
                          type="number"
                          value={win.frame?.custom?.width || ""}
                          onChange={(e) =>
                            handleNestedChange(
                              index,
                              "windows",
                              wIndex,
                              "frame",
                              {
                                ...win.frame,
                                custom: {
                                  ...win.frame?.custom,
                                  width: e.target.value,
                                },
                              }
                            )
                          }
                        />
                        <Input
                          placeholder="Price (Ksh)"
                          type="number"
                          value={win.frame?.custom?.price || ""}
                          onChange={(e) =>
                            handleNestedChange(
                              index,
                              "windows",
                              wIndex,
                              "frame",
                              {
                                ...win.frame,
                                custom: {
                                  ...win.frame?.custom,
                                  price: e.target.value,
                                },
                              }
                            )
                          }
                        />
                      </>
                    )}

                    {/* Frame Qty */}
                    <Input
                      placeholder="Frame Qty"
                      type="number"
                      min="1"
                      value={win.frame?.count || ""}
                      onChange={(e) =>
                        handleNestedChange(index, "windows", wIndex, "frame", {
                          ...win.frame,
                          count: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={() => addWindow(index)}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Window
            </Button>

            {/* Remove Room */}
            <div className="col-span-3 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeRoom(index)}
              >
                <Trash className="w-4 h-4" /> Remove Room
              </Button>
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addRoom} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" /> Add Room
      </Button>
      <Button onClick={calculateMasonry} variant="outline" size="sm">
        <Calculator className="w-4 h-4 mr-1" /> Calculate
      </Button>
    </div>
  );
}
