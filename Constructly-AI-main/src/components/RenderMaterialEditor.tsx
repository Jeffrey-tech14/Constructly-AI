// utils/renderMaterialEditor.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Save } from "lucide-react";
import { Label } from "./ui/label";

export default function renderMaterialEditor(
  material,
  tempValues,
  setTempValues,
  handleSave,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice
) {
  if (!material.type) return null;

  // Rebar editor
  if (material.name === "Rebar") {
    const userOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion
    );

    const effectivePrice = getEffectiveMaterialPrice(
      material.id,
      userRegion,
      userOverride,
      userMaterialPrices,
      materialBasePrices,
      regionalMultipliers
    );

    return (
      <Collapsible>
        <CollapsibleTrigger className="flex animate-fade-in items-center justify-between w-full p-2 border rounded-lg bg-primary/20">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {material.name}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 animate-fade-in mt-2">
          <div className="space-y-2 mt-2">
            {material.type.map((bar, idx) => {
              const overridePrice =
                tempValues[`rebar-${idx}`] !== undefined
                  ? tempValues[`rebar-${idx}`]
                  : userOverride?.type?.[idx]?.price_kes_per_kg ??
                    bar.price_kes_per_kg;

              return (
                <div key={idx} className="p-2 border rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{bar.size}</span>
                    <span className="text-xs text-gray-500">
                      Ø{bar.diameter_mm}mm, {bar.unit_weight_kg_per_kg} kg/m
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [`rebar-${idx}`]: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          material.name,
                          "material",
                          material.id,
                          material.name,
                          tempValues[`rebar-${idx}`] ?? bar.price_kes_per_kg,
                          idx
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Block editor
  if (material.name === "Bricks" || material.name.includes("Block")) {
    const userOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion
    );

    const effectivePrice = getEffectiveMaterialPrice(
      material.id,
      userRegion,
      userOverride,
      materialBasePrices,
      regionalMultipliers
    );

    return (
      <Collapsible>
        <CollapsibleTrigger className="flex animate-fade-in items-center justify-between w-full p-2 border rounded-lg bg-primary/20">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {material.name}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 animate-fade-in mt-2">
          <div className="space-y-2 mt-2">
            {effectivePrice.type.map((block, idx) => {
              const overridePrice =
                tempValues[`block-${idx}`] !== undefined
                  ? tempValues[`block-${idx}`]
                  : userOverride?.type?.[idx]?.price_kes ?? block.price_kes;

              return (
                <div key={idx} className="p-2 border rounded">
                  <span className="font-medium">{block.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {block.dimensions_m.length}×{block.dimensions_m.height}×
                    {block.dimensions_m.thickness}m
                  </span>

                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [`block-${idx}`]: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          material.name,
                          "material",
                          material.id,
                          material.name,
                          tempValues[`block-${idx}`] ?? block.price_kes,
                          idx
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Doors + Windows (similar structure)
  // Doors + Windows (similar structure)
  if (
    material.name === "Doors" ||
    material.name === "Windows" ||
    material.name === "Door Frames" ||
    material.name === "Window Frames"
  ) {
    const userOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion
    );

    const effectivePrice = getEffectiveMaterialPrice(
      material.id,
      userRegion,
      userOverride,
      materialBasePrices,
      regionalMultipliers
    );

    return (
      <Collapsible>
        <CollapsibleTrigger className="flex animate-fade-in items-center justify-between w-full p-2 border rounded-lg bg-primary/20">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {material.name}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 animate-fade-in mt-2">
          <div className="space-y-2 mt-2">
            {effectivePrice.type.map((item, idx) => (
              <div key={idx} className="p-2 border rounded">
                <span className="font-medium">{item.type}</span>

                {Object.entries(item.price_kes).map(([size, price]) => {
                  const key = `${material.name.toLowerCase()}-${idx}-${size}`;
                  const overridePrice =
                    tempValues[key] !== undefined ? tempValues[key] : price;

                  return (
                    <div
                      key={size}
                      className="flex items-center justify-center mt-1"
                    >
                      <p className="min-w-[80px] items-center">{size}</p>
                      <Input
                        key={size}
                        className="mr-2"
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            material.name,
                            "material",
                            material.id,
                            material.name,
                            tempValues[key] ?? price,
                            `${idx}-${size}` // pass both index & size for uniqueness
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return null;
}
