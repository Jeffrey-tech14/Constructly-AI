import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, Trash } from "lucide-react";
import useMasonryCalculator from "@/hooks/useMasonryCalculator";
import { useUserSettings } from "@/hooks/useUserSettings";

    const blockTypes = [
    { id: 1, name: "Standard Block (400×200×200mm)", size: { length: 0.4, height: 0.2, thickness: 0.2 } },
    { id: 2, name: "Half Block (400×200×100mm)", size: { length: 0.4, height: 0.2, thickness: 0.1 } },
    { id: 3, name: "Brick (225×112.5×75mm)", size: { length: 0.225, height: 0.075, thickness: 0.1125 } },
    { id: 4, name: "Custom", size: null },
    ];

    const doorTypes = ["Flush", "Panel", "Metal", "Glass"];
    const windowGlassTypes = ["Clear", "Tinted", "Frosted"];
    const frameTypes = ["Wood", "Steel", "Aluminum"];
    const plasterOptions = ["None", "One Side", "Both Sides"];
    const standardDoorSizes = ["0.9 × 2.1 m", "1.0 × 2.1 m", "1.2 × 2.4 m"];
    const standardWindowSizes = ["1.2 × 1.2 m", "1.5 × 1.2 m", "2.0 × 1.5 m"];

export default function MasonryCalculatorForm({quote, setQuote}) {
  const { addWall, removeEntry, addDoor, addWindow, removeNested, removeWall, handleNestedChange, calculateMasonry, handleWallChange }= useMasonryCalculator({setQuote, quote})
  const { roomTypes } = useUserSettings();

  return (
    <div>
      {quote.rooms.map((wall, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 items-start border p-4 rounded-xl shadow-sm"
        >
          {/* Room Type */}
          <Select
            value={wall.room_name || undefined}
            onValueChange={(value) => handleWallChange(index, "room_name", value)}
          >
            <SelectTrigger><SelectValue placeholder="Select room type" /></SelectTrigger>
            <SelectContent>
              {roomTypes.map((r) => (
                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Length */}
          <Input
            placeholder="Length (m)"
            type="number"
            min="0"
            value={wall.length}
            onChange={(e) => handleWallChange(index, "length", e.target.value)}
          />

           {/* Width */}
          <Input
            placeholder="Width (m)"
            type="number"
            min="0"
            value={wall.width}
            onChange={(e) => handleWallChange(index, "width", e.target.value)}
          />

          {/* Height */}
          <Input
            placeholder="Height (m)"
            type="number"
            min="0"
            value={wall.height}
            onChange={(e) => handleWallChange(index, "height", e.target.value)}
          />

          {/* Block Type */}
          <Select
            value={wall.blockType || undefined}
            onValueChange={(value) => handleWallChange(index, "blockType", value)}
          >
            <SelectTrigger><SelectValue placeholder="Block Type" /></SelectTrigger>
            <SelectContent>
              {blockTypes.map((b) => (
                <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Block Input (if chosen) */}
          {wall.blockType === "Custom" && (
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <Input
                placeholder="Length (m)"
                type="number"
                value={wall.customBlock.length}
                onChange={(e) => handleWallChange(index, "customBlock", { ...wall.customBlock, length: e.target.value })}
              />
              <Input
                placeholder="Height (m)"
                type="number"
                value={wall.customBlock.height}
                onChange={(e) => handleWallChange(index, "customBlock", { ...wall.customBlock, height: e.target.value })}
              />
              <Input
                placeholder="Thickness (m)"
                type="number"
                value={wall.customBlock.thickness}
                onChange={(e) => handleWallChange(index, "customBlock", { ...wall.customBlock, thickness: e.target.value })}
              />
            </div>
          )}

          {/* Plaster */}
          <Select
            value={wall.plaster || undefined}
            onValueChange={(value) => handleWallChange(index, "plaster", value)}
          >
            <SelectTrigger><SelectValue placeholder="Plastering" /></SelectTrigger>
            <SelectContent>
              {plasterOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* --- Doors --- */}
          <div className="col-span-3 space-y-2 mt-3">
            <h3 className="font-medium">Doors</h3>
            {wall.doors.map((door: any, dIndex: number) => (
              <div key={dIndex} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center border p-2 rounded-lg">
                {/* Size Type */}
                <Select
                  value={door.sizeType || undefined}
                  onValueChange={(value) => handleNestedChange(index, "doors", dIndex, "sizeType", value)}
                >
                  <SelectTrigger><SelectValue placeholder="Size Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {door.sizeType === "standard" && (
                  <Select
                    value={door.standardSize || undefined}
                    onValueChange={(value) => handleNestedChange(index, "doors", dIndex, "standardSize", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Standard Size" /></SelectTrigger>
                    <SelectContent>
                      {standardDoorSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                {door.sizeType === "custom" && (
                  <>
                    <Input
                      placeholder="Height (m)"
                      type="number"
                      value={door.custom.height}
                      onChange={(e) => handleNestedChange(index, "doors", dIndex, "custom", { ...door.custom, height: e.target.value })}
                    />
                    <Input
                      placeholder="Width (m)"
                      type="number"
                      value={door.custom.width}
                      onChange={(e) => handleNestedChange(index, "doors", dIndex, "custom", { ...door.custom, width: e.target.value })}
                    />
                  </>
                )}

                {/* Type */}
                <Select
                  value={door.type || undefined}
                  onValueChange={(value) => handleNestedChange(index, "doors", dIndex, "type", value)}
                >
                  <SelectTrigger><SelectValue placeholder="Door Type" /></SelectTrigger>
                  <SelectContent>
                    {doorTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Frame */}
                <Select
                  value={door.frame || undefined}
                  onValueChange={(value) => handleNestedChange(index, "doors", dIndex, "frame", value)}
                >
                  <SelectTrigger><SelectValue placeholder="Frame Type" /></SelectTrigger>
                  <SelectContent>
                    {frameTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Count */}
                <Input
                  placeholder="Qty"
                  type="number"
                  min="1"
                  value={door.count}
                  onChange={(e) => handleNestedChange(index, "doors", dIndex, "count", e.target.value)}
                />

                <Button size="icon" variant="destructive" onClick={() => removeNested(index, "doors", dIndex)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => addDoor(index)}>
              <Plus className="w-4 h-4 mr-1" /> Add Door
            </Button>
          </div>

          {/* --- Windows --- */}
          <div className="col-span-3 space-y-2 mt-3">
            <h3 className="font-medium">Windows</h3>
            {wall.windows.map((win: any, wIndex: number) => (
              <div key={wIndex} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center border p-2 rounded-lg">
                {/* Size Type */}
                <Select
                  value={win.sizeType || undefined}
                  onValueChange={(value) => handleNestedChange(index, "windows", wIndex, "sizeType", value)}
                >
                  <SelectTrigger><SelectValue placeholder="Size Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {win.sizeType === "standard" && (
                  <Select
                    value={win.standardSize || undefined}
                    onValueChange={(value) => handleNestedChange(index, "windows", wIndex, "standardSize", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Standard Size" /></SelectTrigger>
                    <SelectContent>
                      {standardWindowSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                {win.sizeType === "custom" && (
                  <>
                    <Input
                      placeholder="Height (m)"
                      type="number"
                      value={win.custom.height}
                      onChange={(e) => handleNestedChange(index, "windows", wIndex, "custom", { ...win.custom, height: e.target.value })}
                    />
                    <Input
                      placeholder="Width (m)"
                      type="number"
                      value={win.custom.width}
                      onChange={(e) => handleNestedChange(index, "windows", wIndex, "custom", { ...win.custom, width: e.target.value })}
                    />
                  </>
                )}

                {/* Glass */}
                <Select
                  value={win.glass || undefined}
                  onValueChange={(value) => handleNestedChange(index, "windows", wIndex, "glass", value)}
                >
                  <SelectTrigger><SelectValue placeholder="Glass Type" /></SelectTrigger>
                  <SelectContent>
                    {windowGlassTypes.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Frame */}
                <Select
                  value={win.frame || undefined}
                  onValueChange={(value) => handleNestedChange(index, "windows", wIndex, "frame", value)}
                >
                  <SelectTrigger><SelectValue placeholder="Frame Type" /></SelectTrigger>
                  <SelectContent>
                    {frameTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Count */}
                <Input
                  placeholder="Qty"
                  type="number"
                  min="1"
                  value={win.count}
                  onChange={(e) => handleNestedChange(index, "windows", wIndex, "count", e.target.value)}
                />

                <Button size="icon" variant="destructive" onClick={() => removeEntry(index, "windows", wIndex)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => addWindow(index)}>
              <Plus className="w-4 h-4 mr-1" /> Add Window
            </Button>
          </div>

          {/* Remove Wall */}
          <div className="col-span-3 flex justify-end">
            <Button variant="destructive" size="sm" onClick={() => removeWall(index)}>
              <Trash className="w-4 h-4" /> Remove Room
            </Button>
          </div>
        </div>
      ))}

      <Button onClick={addWall} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" /> Add Room
      </Button>

      <Button onClick={calculateMasonry} variant="outline" size="sm">
        <Calculator className="w-4 h-4 mr-1" /> Calculate
      </Button>
    </div>
  );
}
