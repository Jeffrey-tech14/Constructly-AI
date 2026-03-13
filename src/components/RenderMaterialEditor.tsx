// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Save } from "lucide-react";

export default function renderMaterialEditor(
  material,
  tempValues,
  setTempValues,
  handleSave,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
) {
  if (!material.type) return null;

  const isArray = (value) => Array.isArray(value);
  const isObject = (value) =>
    value && typeof value === "object" && !isArray(value);

  // Helper function to get user override and effective price
  const getUserOverrideAndPrice = () => {
    const userOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const effectivePrice = getEffectiveMaterialPrice(
      material.id,
      userRegion,
      userOverride,
      userMaterialPrices,
      materialBasePrices,
      regionalMultipliers,
    );
    return { userOverride, effectivePrice };
  };

  // Generic collapsible wrapper
  const renderCollapsible = (content, title = material.name) => (
    <Collapsible>
      <CollapsibleTrigger className="flex animate-fade-in items-center justify-between w-full p-2 border rounded-lg bg-primary/20">
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 animate-fade-in mt-2">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );

  // 1. Rebar - Array of objects with price_kes_per_kg
  if (material.name === "Rebar" && isArray(material.type)) {
    // Find override once by material_id and region
    const rebarOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideRebar = (rebarOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((bar, idx) => {
          // Get override from the override array item
          const overrideItem = (overrideRebar as any)?.[idx];
          const effectivePrice =
            overrideItem?.price_kes_per_kg ?? bar.price_kes_per_kg;
          const overridePrice =
            tempValues[`rebar-${idx}`] !== undefined
              ? tempValues[`rebar-${idx}`]
              : effectivePrice;
          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{bar.size}</span>
                <span className="text-xs text-gray-500">
                  Ø{bar.diameter_mm}mm, {bar.unit_weight_kg_per_m} kg/m
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
                      idx,
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
    );

    return renderCollapsible(content);
  }

  // 2. Bricks/Blocks - Array of objects with price_kes and dimensions
  if (
    (material.name === "Bricks" || material.name.includes("Block")) &&
    isArray(material.type)
  ) {
    // Find override once by material_id and region
    const bricksBlocksOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideBricksBlocks =
      (bricksBlocksOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((block, idx) => {
          // Get override from the override array item
          const overrideItem = (overrideBricksBlocks as any)?.[idx];
          const effectivePrice = overrideItem?.price_kes ?? block.price_kes;
          const overridePrice =
            tempValues[`block-${idx}`] !== undefined
              ? tempValues[`block-${idx}`]
              : effectivePrice;
          return (
            <div key={idx} className="p-2 border rounded-lg">
              <span className="font-medium">{block.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                {block.dimensions_m?.length}×{block.dimensions_m?.height}×
                {block.dimensions_m?.thickness}m
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
                      idx,
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
    );

    return renderCollapsible(content);
  }

  // 3. Doors, Windows, Frames - Array of objects with price_kes object for sizes
  if (
    (material.name === "Doors" ||
      material.name === "Windows" ||
      material.name === "Door Frames" ||
      material.name === "Window Frames") &&
    isArray(material.type)
  ) {
    // Find override once by material_id and region
    const doorsWindowsOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideDoorsWindows =
      (doorsWindowsOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2 rounded-lg">
        {material.type.map((item, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{item.type}</span>

            {Object.entries(item.price_kes).map(([size, price]) => {
              const key = `${material.name.toLowerCase()}-${idx}-${size}`;

              // Get override from the override array item
              const overrideItem = (overrideDoorsWindows as any)?.[idx];
              const overrideSizePrice = overrideItem?.price_kes?.[size];

              const effectivePrice = overrideSizePrice ?? price;
              const overridePrice =
                tempValues[key] !== undefined
                  ? tempValues[key]
                  : effectivePrice;
              return (
                <div
                  key={size}
                  className="flex items-center justify-between mt-1"
                >
                  <p className="min-w-[80px] items-center">{size}</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
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
                          `${idx}-${size}`,
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
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 5. BRC Mesh - Array with price_kes_per_sqm and technical specs
  if (material.name === "BRC Mesh" && isArray(material.type)) {
    // Find override once by material_id and region
    const brcMeshOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideBrcMesh = (brcMeshOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((mesh, idx) => {
          const key = `brc-mesh-${idx}`;
          // Get override from the override array item
          const overrideItem = (overrideBrcMesh as any)?.[idx];
          const effectivePrice =
            overrideItem?.price_kes_per_sqm ?? mesh.price_kes_per_sqm;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{mesh.grade}</span>
                <span className="text-xs text-gray-500">
                  Spacing: {mesh.spacing}mm, Weight: {mesh.weightPerSqm}kg/m²
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Wire: Ø{mesh.wireDiameter}mm
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <Input
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
                      tempValues[key] ?? mesh.price_kes_per_sqm,
                      idx,
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
    );

    return renderCollapsible(content);
  }

  // 6. Pipes - Array with price_kes_per_meter and diameters
  if (material.name === "Pipes" && isArray(material.type)) {
    // Find override once by material_id and region
    const pipesOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overridePipes = (pipesOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((pipeType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{pipeType.type}</span>

            {Object.entries(pipeType.price_kes_per_meter).map(
              ([diameter, price]) => {
                const key = `pipe-${idx}-${diameter}`;
                // Get override from the override array item
                const overrideItem = (overridePipes as any)?.[idx];
                const overridePricePerMeter =
                  overrideItem?.price_kes_per_meter?.[diameter];
                const effectivePrice = overridePricePerMeter ?? price;
                const overridePrice =
                  tempValues[key] !== undefined
                    ? tempValues[key]
                    : effectivePrice;

                return (
                  <div
                    key={diameter}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{diameter}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
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
                            `${idx}-${diameter}`,
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 7. Cable - Array with price_kes_per_meter and sizes
  if (material.name === "Cable" && isArray(material.type)) {
    // Find override once by material_id and region
    const cableOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideCable = (cableOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((cableType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{cableType.type}</span>

            {Object.entries(cableType.price_kes_per_meter).map(
              ([size, price]) => {
                const key = `cable-${idx}-${size}`;
                // Get override from the override array item
                const overrideItem = (overrideCable as any)?.[idx];
                const overridePricePerMeter =
                  overrideItem?.price_kes_per_meter?.[size];
                const effectivePrice = overridePricePerMeter ?? price;
                const overridePrice =
                  tempValues[key] !== undefined
                    ? tempValues[key]
                    : effectivePrice;

                return (
                  <div
                    key={size}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{size}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
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
                            `${idx}-${size}`,
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 8. Lighting - Array with price_kes_per_unit and wattage/control types
  if (material.name === "Lighting" && isArray(material.type)) {
    // Find override once by material_id and region
    const lightingOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideLighting = (lightingOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((lightType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{lightType.type}</span>

            {Object.entries(lightType.price_kes_per_unit).map(
              ([spec, price]) => {
                const key = `lighting-${idx}-${spec}`;
                // Get override from the override array item
                const overrideItem = (overrideLighting as any)?.[idx];
                const overridePricePerUnit =
                  overrideItem?.price_kes_per_unit?.[spec];
                const effectivePrice = overridePricePerUnit ?? price;
                const overridePrice =
                  tempValues[key] !== undefined
                    ? tempValues[key]
                    : effectivePrice;

                return (
                  <div
                    key={spec}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{spec}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
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
                            `${idx}-${spec}`,
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 9. Outlets - Array with price_kes_per_unit and ratings
  if (material.name === "Outlets" && isArray(material.type)) {
    // Find override once by material_id and region
    const outletsOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideOutlets = (outletsOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((outletType, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{outletType.type}</span>

            {Object.entries(outletType.price_kes_per_unit).map(
              ([rating, price]) => {
                const key = `outlet-${idx}-${rating}`;
                // Get override from the override array item
                const overrideItem = (overrideOutlets as any)?.[idx];
                const overridePricePerUnit =
                  overrideItem?.price_kes_per_unit?.[rating];
                const effectivePrice = overridePricePerUnit ?? price;
                const overridePrice =
                  tempValues[key] !== undefined
                    ? tempValues[key]
                    : effectivePrice;

                return (
                  <div
                    key={rating}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm">{rating}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
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
                            `${idx}-${rating}`,
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 10. DPC, Sealant - Array with price_kes object for sizes
  if (
    (material.name === "DPC" || material.name === "Sealant") &&
    isArray(material.type)
  ) {
    // Find override once by material_id and region
    const dpcSealantOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideDpcSealant =
      (dpcSealantOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((item, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{item.type}</span>

            {Object.entries(item.price_kes).map(([size, price]) => {
              const key = `${material.name.toLowerCase()}-${idx}-${size}`;

              // Get override from the override array item
              const overrideItem = (overrideDpcSealant as any)?.[idx];
              const overrideSizePrice = overrideItem?.price_kes?.[size];

              const effectivePrice = overrideSizePrice ?? price;
              const overridePrice =
                tempValues[key] !== undefined
                  ? tempValues[key]
                  : effectivePrice;

              return (
                <div
                  key={size}
                  className="flex items-center justify-between mt-1"
                >
                  <span className="text-sm">{size}</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
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
                          `${idx}-${size}`,
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
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 10a. Polythene - Object with gauge keys (1000g, 1200g, 1500g)
  if (material.name === "Polythene" && isObject(material.type)) {
    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(material.type).map(([gauge, price]) => {
          const key = `${material.name.toLowerCase()}-${gauge}`;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : price;

          return (
            <div key={gauge} className="p-2 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{gauge}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() => {
                      const currentValue =
                        tempValues[key] !== undefined ? tempValues[key] : price;
                      handleSave(
                        material.name,
                        "material",
                        material.id,
                        material.name,
                        currentValue,
                        gauge,
                      );
                    }}
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 11. Fixtures - Array with price_kes_per_item and qualities
  if (material.name === "Fixtures" && isArray(material.type)) {
    // Find override once by material_id and region
    const fixturesOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideFixtures = (fixturesOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((fixture, idx) => (
          <div key={idx} className="p-2 border rounded-lg">
            <span className="font-medium">{fixture.fixture}</span>

            {Object.entries(fixture.price_kes_per_item).map(
              ([quality, price]) => {
                const key = `fixture-${idx}-${quality}`;
                // Get override from the override array item
                const overrideItem = (overrideFixtures as any)?.[idx];
                const overridePricePerItem =
                  overrideItem?.price_kes_per_item?.[quality];
                const effectivePrice = overridePricePerItem ?? price;
                const overridePrice =
                  tempValues[key] !== undefined
                    ? tempValues[key]
                    : effectivePrice;

                return (
                  <div
                    key={quality}
                    className="flex items-center justify-between mt-1"
                  >
                    <span className="text-sm capitalize">{quality}</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={overridePrice}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-32"
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
                            `${idx}-${quality}`,
                          )
                        }
                      >
                        <Save className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ))}
      </div>
    );

    return renderCollapsible(content);
  }

  // 12. Timber, Insulation, Underlayment - Array with direct price property
  if (
    (material.name === "Timber" ||
      material.name === "Insulation" ||
      material.name === "UnderLayment") &&
    isArray(material.type)
  ) {
    // Find override once by material_id and region
    const timberOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideTimber = (timberOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((item, idx) => {
          const key = `${material.name.toLowerCase()}-${idx}`;
          // Get override from the override array item
          const overrideItem = (overrideTimber as any)?.[idx];
          const effectivePrice = overrideItem?.price ?? item.price;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{item.name || item.type}</span>
                <span className="text-xs text-gray-500">
                  {item.size && `Size: ${item.size}`}
                  {item.thickness && `, Thickness: ${item.thickness}`}
                  {item.rValue && `, R-Value: ${item.rValue}`}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <Input
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
                      tempValues[key] ?? item.price,
                      idx,
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
    );

    return renderCollapsible(content);
  }

  // 13. Accessories - Object with nested arrays
  if (material.name === "Accesories" && isObject(material.type)) {
    // Find override once by material_id and region
    const accessoriesOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideAccessories =
      (accessoriesOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2">
        {Object.entries(material.type).map(([category, items]) => {
          if (!isArray(items)) return null;

          return (
            <div key={category} className="p-2 border rounded-lg">
              <h4 className="font-medium capitalize mb-2">
                {category.replace(/([A-Z])/g, " $1")}
              </h4>
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const key = `accessory-${category}-${idx}`;
                  // Get override from the override material
                  const overrideItemPrice =
                    (overrideAccessories as any)?.[category]?.[idx]?.price ??
                    item.price;
                  const overridePrice =
                    tempValues[key] !== undefined
                      ? tempValues[key]
                      : overrideItemPrice;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {item.type || item.size || item.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {item.material && `(${item.material})`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={overridePrice}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [key]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-32"
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
                              tempValues[key] ?? item.price,
                              `${category}-${idx}`,
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
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 14. Fasteners - Object with nested arrays
  if (material.name === "Fasteners" && isObject(material.type)) {
    // Find override once by material_id and region
    const fastenersOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideFasteners = (fastenersOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2">
        {Object.entries(material.type).map(([category, items]) => {
          if (!isArray(items)) return null;

          return (
            <div key={category} className="p-2 border rounded-lg">
              <h4 className="font-medium capitalize mb-2">{category}</h4>
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const key = `fastener-${category}-${idx}`;
                  // Get override from the override material
                  const overrideItemPrice =
                    (overrideFasteners as any)?.[category]?.[idx]?.price ??
                    item.price;
                  const overridePrice =
                    tempValues[key] !== undefined
                      ? tempValues[key]
                      : overrideItemPrice;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {item.type} ({item.size})
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={overridePrice}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [key]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-32"
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
                              tempValues[key] ?? item.price,
                              `${category}-${idx}`,
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
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // DPC (Damp Proof Course) - Simple object with material types and prices
  if (material.name === "DPC" && isObject(material.type)) {
    // Find override once by material_id and region
    const dpcOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideDpc = (dpcOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(material.type).map(([dpcType, price], idx) => {
          const key = `dpc-${dpcType}`;
          // Get override from the override material
          const overridePrice =
            tempValues[key] !== undefined
              ? tempValues[key]
              : (overrideDpc?.[dpcType] ?? price);

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{dpcType}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32"
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
                        tempValues[key] ?? overridePrice,
                        dpcType,
                      )
                    }
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // Waterproof - Simple object with material types and prices
  if (material.name === "Waterproof" && isObject(material.type)) {
    // Find override once by material_id and region
    const waterproofOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideWaterproof =
      (waterproofOverride?.type as any) || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(material.type).map(([waterproofType, price], idx) => {
          const key = `waterproof-${waterproofType}`;
          // Get override from the override material
          const overridePrice =
            tempValues[key] !== undefined
              ? tempValues[key]
              : (overrideWaterproof?.[waterproofType] ?? price);

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{waterproofType}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32"
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
                        tempValues[key] ?? overridePrice,
                        waterproofType,
                      )
                    }
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 15. Roof-Covering - Array of roofing types (simple and complex)
  if (material.name === "Roof-Covering" && isArray(material.type)) {
    const roofingTypes = material.type;

    // Find override once by material_id and region
    const roofCoveringOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideRoofingTypes =
      (roofCoveringOverride?.type as any) || roofingTypes;

    const content = (
      <div className="space-y-4 mt-2">
        {roofingTypes.map((roofItem, roofIdx) => {
          // Check if this is the complex roofing structure
          if (roofItem.structuralTimber || roofItem.roofingSheets) {
            return (
              <div key={roofIdx} className="border rounded-lg p-3">
                <div className="space-y-4">
                  {/* Structural Timber */}
                  {roofItem.structuralTimber &&
                    isArray(roofItem.structuralTimber) && (
                      <div className="border-b pb-4">
                        <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                          Structural Timber
                        </h4>
                        <div className="space-y-2">
                          {roofItem.structuralTimber.map(
                            (timber, timberIdx) => {
                              const key = `roof-timber-${roofIdx}-${timberIdx}`;

                              // Get override from the override array item
                              const overrideRoofItem = (
                                overrideRoofingTypes as any
                              )?.[roofIdx];
                              const overrideTimber =
                                overrideRoofItem?.structuralTimber?.[timberIdx];

                              const effectivePrice =
                                overrideTimber?.price_kes ?? timber.price_kes;
                              const overridePrice =
                                tempValues[key] !== undefined
                                  ? tempValues[key]
                                  : effectivePrice;

                              return (
                                <div
                                  key={timberIdx}
                                  className="p-2 border rounded-lg"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium text-sm">
                                      {timber.size}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {timber.description}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Input
                                      type="number"
                                      value={overridePrice}
                                      onChange={(e) =>
                                        setTempValues({
                                          ...tempValues,
                                          [key]:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-28 h-8"
                                    />
                                    <Button
                                      className="text-white"
                                      size="sm"
                                      onClick={() =>
                                        handleSave(
                                          "Roof-Covering",
                                          "material",
                                          material.id,
                                          `Roof-Covering - Timber ${timber.size}`,
                                          overridePrice,
                                          `timber-${roofIdx}-${timberIdx}`,
                                        )
                                      }
                                    >
                                      <Save className="w-3 h-3 text-white" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                  {/* Roofing Sheets */}
                  {roofItem.roofingSheets &&
                    isArray(roofItem.roofingSheets) && (
                      <div className="border-b pb-4">
                        <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                          Roofing Sheets
                        </h4>
                        <div className="space-y-3">
                          {roofItem.roofingSheets.map((sheet, sheetIdx) => (
                            <div
                              key={sheetIdx}
                              className="p-2 border rounded-lg"
                            >
                              <div className="font-medium text-sm mb-2">
                                {sheet.type}
                                {sheet.grade && ` (${sheet.grade})`}
                              </div>
                              {sheet.sizes &&
                                isObject(sheet.sizes) &&
                                Object.entries(sheet.sizes).map(
                                  ([size, sizeData]) => {
                                    const key = `roof-sheet-${roofIdx}-${sheetIdx}-${size}`;

                                    // Get override from the override array item
                                    const overrideRoofItem = (
                                      overrideRoofingTypes as any
                                    )?.[roofIdx];
                                    const overrideSheet =
                                      overrideRoofItem?.roofingSheets?.[
                                        sheetIdx
                                      ];
                                    const overrideSizeData =
                                      overrideSheet?.sizes?.[size];

                                    const effectivePrice =
                                      overrideSizeData?.price_kes ??
                                      (sizeData as any)?.price_kes;
                                    const overridePrice =
                                      tempValues[key] !== undefined
                                        ? tempValues[key]
                                        : effectivePrice;

                                    return (
                                      <div
                                        key={size}
                                        className="flex items-center justify-between ml-2 mt-1"
                                      >
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {size}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="number"
                                            value={overridePrice}
                                            onChange={(e) =>
                                              setTempValues({
                                                ...tempValues,
                                                [key]:
                                                  parseFloat(e.target.value) ||
                                                  0,
                                              })
                                            }
                                            className="w-28 h-8"
                                          />
                                          <Button
                                            className="text-white"
                                            size="sm"
                                            onClick={() =>
                                              handleSave(
                                                "Roof-Covering",
                                                "material",
                                                material.id,
                                                `Roof-Covering - Sheet ${sheet.type} ${size}`,
                                                overridePrice,
                                                `sheet-${roofIdx}-${sheetIdx}-${size}`,
                                              )
                                            }
                                          >
                                            <Save className="w-3 h-3 text-white" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Roofing Finishing */}
                  {roofItem.roofingFinishing &&
                    isArray(roofItem.roofingFinishing) && (
                      <div className="border-b pb-4">
                        <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                          Roofing Finishing
                        </h4>
                        <div className="space-y-3">
                          {roofItem.roofingFinishing.map(
                            (finishCategory, catIdx) => (
                              <div
                                key={catIdx}
                                className="p-2 border rounded-lg"
                              >
                                <div className="font-medium text-sm mb-2">
                                  {finishCategory.name}
                                </div>
                                {isArray(finishCategory.types) &&
                                  finishCategory.types.map(
                                    (finishType, typeIdx) => {
                                      const key = `roof-finish-${roofIdx}-${catIdx}-${typeIdx}`;

                                      // Get override from the override array item
                                      const overrideRoofItem = (
                                        overrideRoofingTypes as any
                                      )?.[roofIdx];
                                      const overrideFinishCategory =
                                        overrideRoofItem?.roofingFinishing?.[
                                          catIdx
                                        ];
                                      const overrideFinishType =
                                        overrideFinishCategory?.types?.[
                                          typeIdx
                                        ];

                                      const effectivePrice =
                                        overrideFinishType?.price_kes ??
                                        finishType.price_kes;
                                      const overridePrice =
                                        tempValues[key] !== undefined
                                          ? tempValues[key]
                                          : effectivePrice;

                                      return (
                                        <div
                                          key={typeIdx}
                                          className="flex items-center justify-between ml-2 mt-1"
                                        >
                                          <div>
                                            <span className="text-sm font-medium">
                                              {finishType.name}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                              {finishType.description}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="number"
                                              value={overridePrice}
                                              onChange={(e) =>
                                                setTempValues({
                                                  ...tempValues,
                                                  [key]:
                                                    parseFloat(
                                                      e.target.value,
                                                    ) || 0,
                                                })
                                              }
                                              className="w-28 h-8"
                                            />
                                            <Button
                                              className="text-white"
                                              size="sm"
                                              onClick={() =>
                                                handleSave(
                                                  "Roof-Covering",
                                                  "material",
                                                  material.id,
                                                  `Roof-Covering - ${finishCategory.name} ${finishType.name}`,
                                                  overridePrice,
                                                  `finish-${roofIdx}-${catIdx}-${typeIdx}`,
                                                )
                                              }
                                            >
                                              <Save className="w-3 h-3 text-white" />
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    },
                                  )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Accessories */}
                  {roofItem.accessories && roofItem.accessories.items && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                        Accessories
                      </h4>
                      <div className="space-y-2">
                        {isArray(roofItem.accessories.items) &&
                          roofItem.accessories.items.map(
                            (accessory, accIdx) => {
                              const key = `roof-accessory-${roofIdx}-${accIdx}`;

                              // Get override from the override array item
                              const overrideRoofItem = (
                                overrideRoofingTypes as any
                              )?.[roofIdx];
                              const overrideAccessory =
                                overrideRoofItem?.accessories?.items?.[accIdx];

                              const effectivePrice =
                                overrideAccessory?.price_kes ??
                                accessory.price_kes;
                              const overridePrice =
                                tempValues[key] !== undefined
                                  ? tempValues[key]
                                  : effectivePrice;

                              return (
                                <div
                                  key={accIdx}
                                  className="p-2 border rounded-lg"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <span className="font-medium text-sm">
                                        {accessory.name}
                                      </span>
                                      <p className="text-xs text-gray-500">
                                        {accessory.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        type="number"
                                        value={overridePrice}
                                        onChange={(e) =>
                                          setTempValues({
                                            ...tempValues,
                                            [key]:
                                              parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="w-28 h-8"
                                      />
                                      <Button
                                        className="text-white"
                                        size="sm"
                                        onClick={() =>
                                          handleSave(
                                            "Roof-Covering",
                                            "material",
                                            material.id,
                                            `Roof-Covering - Accessory ${accessory.name}`,
                                            overridePrice,
                                            `accessory-${roofIdx}-${accIdx}`,
                                          )
                                        }
                                      >
                                        <Save className="w-3 h-3 text-white" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            // Simple roofing type with just price and optional properties
            const key = `roof-${roofIdx}`;

            // Get override from the override array item
            const overrideRoofItem = (overrideRoofingTypes as any)?.[roofIdx];

            const effectivePrice = overrideRoofItem?.price ?? roofItem.price;
            const overridePrice =
              tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

            return (
              <div key={roofIdx} className="p-2 border rounded-lg ">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-sm">{roofItem.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({roofItem.type})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-28 h-8"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() =>
                      handleSave(
                        "Roof-Covering",
                        "material",
                        material.id,
                        `Roof-Covering - ${roofItem.name}`,
                        overridePrice,
                        `roof-${roofIdx}`,
                      )
                    }
                  >
                    <Save className="w-3 h-3 text-white" />
                  </Button>
                </div>

                {/* Display additional properties */}
                {(roofItem.colors ||
                  roofItem.finish ||
                  roofItem.coverage ||
                  roofItem.thickness ||
                  roofItem.sizes ||
                  roofItem.lengths ||
                  roofItem.materialType) && (
                  <div className="mt-2 pt-2 border-t text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {roofItem.colors && (
                      <p>
                        <span className="font-medium">Colors:</span>{" "}
                        {roofItem.colors.join(", ")}
                      </p>
                    )}
                    {roofItem.finish && (
                      <p>
                        <span className="font-medium">Finish:</span>{" "}
                        {roofItem.finish.join(", ")}
                      </p>
                    )}
                    {roofItem.coverage && (
                      <p>
                        <span className="font-medium">Coverage:</span>{" "}
                        {roofItem.coverage}
                      </p>
                    )}
                    {roofItem.thickness && (
                      <p>
                        <span className="font-medium">Thickness:</span>{" "}
                        {roofItem.thickness}
                      </p>
                    )}
                    {roofItem.sizes && (
                      <p>
                        <span className="font-medium">Sizes:</span>{" "}
                        {roofItem.sizes.join(", ")}
                      </p>
                    )}
                    {roofItem.lengths && (
                      <p>
                        <span className="font-medium">Lengths:</span>{" "}
                        {roofItem.lengths.join(", ")}
                      </p>
                    )}
                    {roofItem.materialType && (
                      <p>
                        <span className="font-medium">Material Type:</span>{" "}
                        {roofItem.materialType.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
    );

    return renderCollapsible(content, "Roof-Covering");
  }

  // 16. Hoop Iron - Simple array with sizes and prices
  if (material.name === "Hoop Iron" && isArray(material.type)) {
    const content = (
      <div className="space-y-2 mt-2">
        {material.type.map((iron, idx) => {
          const key = `hoop-iron-${idx}`;

          // Check for user override in database
          // Find override once by material_id and region, then navigate type field
          const userOverrideRecord = userMaterialPrices.find(
            (p) => p.material_id === material.id && p.region === userRegion,
          );

          const overrideIron = (userOverrideRecord?.type as any)?.[idx];
          const effectivePrice = overrideIron?.price_kes ?? iron.price_kes;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

          return (
            <div key={idx} className="p-2 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{iron.name}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() =>
                      handleSave(
                        "Hoop Iron",
                        "material",
                        material.id,
                        `Hoop Iron - ${iron.name}`,
                        overridePrice,
                        `hoop-iron-${idx}`,
                      )
                    }
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 17. Flooring - Complex nested structure with four categories
  if (material.name === "Flooring" && isObject(material.type)) {
    const flooring = material.type;

    // Find override once by material_id and region
    const flooringOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideFlooring = (flooringOverride?.type as any) || flooring;

    const categories = [
      { key: "flooringMaterials", label: "Flooring Materials" },
      { key: "screeningBaseMaterials", label: "Base Materials" },
      { key: "skirtingMaterials", label: "Skirting Materials" },
      { key: "skirtingAccessories", label: "Skirting Accessories" },
    ];

    const content = (
      <div className="space-y-4 mt-2">
        {categories.map((category) => {
          const items = flooring[category.key];
          const overrideItems = overrideFlooring[category.key];
          if (!isArray(items)) return null;

          return (
            <div key={category.key} className="border rounded-lg p-3">
              <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                {category.label}
              </h4>
              <div className="space-y-3">
                {items.map((material, matIdx) => {
                  const overrideMaterial = (overrideItems as any)?.[matIdx];
                  return (
                    <div key={matIdx} className="p-2 border rounded-lg">
                      <div className="font-medium text-sm mb-2 text-gray-900 dark:text-white">
                        {material.name}
                      </div>

                      {isArray(material.type) &&
                        material.type.map((typeItem, typeIdx) => (
                          <div key={typeIdx} className="space-y-2 ml-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {typeItem.name}
                              {typeItem.unit && ` (${typeItem.unit})`}
                            </div>

                            {/* Handle tile types if they exist */}
                            {typeItem.tileTypes &&
                            isObject(typeItem.tileTypes) ? (
                              <div className="space-y-2">
                                {Object.entries(typeItem.tileTypes).map(
                                  ([tileSize, tilePrice]) => {
                                    const key = `flooring-${category.key}-${matIdx}-${typeIdx}-${tileSize}`;

                                    // Get override from the override material
                                    const overrideTypeItem = (
                                      overrideMaterial?.type as any
                                    )?.[typeIdx];
                                    const overrideTilePrice =
                                      overrideTypeItem?.tileTypes?.[tileSize];

                                    const effectivePrice =
                                      overrideTilePrice ?? tilePrice;
                                    const overridePrice =
                                      tempValues[key] !== undefined
                                        ? tempValues[key]
                                        : effectivePrice;

                                    return (
                                      <div
                                        key={tileSize}
                                        className="flex items-center justify-between ml-2"
                                      >
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {tileSize}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="number"
                                            value={overridePrice}
                                            onChange={(e) =>
                                              setTempValues({
                                                ...tempValues,
                                                [key]:
                                                  parseFloat(e.target.value) ||
                                                  0,
                                              })
                                            }
                                            className="w-28 h-8"
                                          />
                                          <Button
                                            className="text-white"
                                            size="sm"
                                            onClick={() =>
                                              handleSave(
                                                "Flooring",
                                                "material",
                                                material.id,
                                                `Flooring - ${typeItem.name} ${tileSize}`,
                                                overridePrice,
                                                `flooring-${category.key}-${matIdx}-${typeIdx}-${tileSize}`,
                                              )
                                            }
                                          >
                                            <Save className="w-3 h-3 text-white" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            ) : (
                              /* Simple price editor for non-tile materials */
                              <div className="flex items-center justify-between ml-2">
                                <span className="text-xs text-gray-500">
                                  KES per {typeItem.unit}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {(() => {
                                    const key = `flooring-${category.key}-${matIdx}-${typeIdx}`;

                                    // Get override from the override material
                                    const overrideTypeItem = (
                                      overrideMaterial?.type as any
                                    )?.[typeIdx];
                                    const effectivePrice =
                                      overrideTypeItem?.price_kes ??
                                      typeItem.price_kes;
                                    const overridePrice =
                                      tempValues[key] !== undefined
                                        ? tempValues[key]
                                        : effectivePrice;

                                    return (
                                      <>
                                        <Input
                                          type="number"
                                          value={overridePrice}
                                          onChange={(e) =>
                                            setTempValues({
                                              ...tempValues,
                                              [key]:
                                                parseFloat(e.target.value) || 0,
                                            })
                                          }
                                          className="w-28 h-8"
                                        />
                                        <Button
                                          className="text-white"
                                          size="sm"
                                          onClick={() =>
                                            handleSave(
                                              "Flooring",
                                              "material",
                                              material.id,
                                              `Flooring - ${typeItem.name}`,
                                              overridePrice,
                                              `flooring-${category.key}-${matIdx}-${typeIdx}`,
                                            )
                                          }
                                        >
                                          <Save className="w-3 h-3 text-white" />
                                        </Button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content, "Flooring");
  }

  // 18. Wall-Finishes - Complex nested structure with categories
  if (material.name === "Wall-Finishes" && isObject(material.type)) {
    const wallFinishes = material.type;

    // Find override once by material_id and region
    const wallFinishesOverride = userMaterialPrices.find(
      (p) => p.material_id === material.id && p.region === userRegion,
    );
    const overrideWallFinishes =
      (wallFinishesOverride?.type as any) || wallFinishes;

    const categories = [
      { key: "internalWallingMaterials", label: "Internal Walling Materials" },
      { key: "tilingMaterials", label: "Tiling Materials" },
      { key: "externalWallingMaterials", label: "External Walling Materials" },
    ];

    const content = (
      <div className="space-y-4 mt-2">
        {categories.map((category) => {
          const items = wallFinishes[category.key];
          const overrideItems = overrideWallFinishes[category.key];
          if (!isArray(items)) return null;

          return (
            <div key={category.key} className="border rounded-lg p-3">
              <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                {category.label}
              </h4>
              <div className="space-y-3">
                {items.map((material, matIdx) => {
                  const overrideMaterial = (overrideItems as any)?.[matIdx];
                  return (
                    <div key={matIdx} className="p-2 border rounded-lg">
                      <div className="font-medium text-sm mb-2 text-gray-900 dark:text-white">
                        {material.name}
                      </div>

                      {isArray(material.type) &&
                        material.type.map((typeItem, typeIdx) => (
                          <div key={typeIdx} className="space-y-2 ml-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {typeItem.name}
                              {typeItem.unit && ` (${typeItem.unit})`}
                            </div>

                            {/* Handle tile types if they exist */}
                            {typeItem.tileTypes &&
                            isObject(typeItem.tileTypes) ? (
                              <div className="space-y-2">
                                {Object.entries(typeItem.tileTypes).map(
                                  ([tileSize, tilcePrice]) => {
                                    const key = `wallfinish-${category.key}-${matIdx}-${typeIdx}-${tileSize}`;

                                    // Get override from the override material
                                    const overrideTypeItem = (
                                      overrideMaterial?.type as any
                                    )?.[typeIdx];
                                    const overrideTilePrice =
                                      overrideTypeItem?.tileTypes?.[tileSize];

                                    const effectivePrice =
                                      overrideTilePrice ?? tilcePrice;
                                    const overridePrice =
                                      tempValues[key] !== undefined
                                        ? tempValues[key]
                                        : effectivePrice;

                                    return (
                                      <div
                                        key={tileSize}
                                        className="flex items-center justify-between ml-2"
                                      >
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {tileSize}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="number"
                                            value={overridePrice}
                                            onChange={(e) =>
                                              setTempValues({
                                                ...tempValues,
                                                [key]:
                                                  parseFloat(e.target.value) ||
                                                  0,
                                              })
                                            }
                                            className="w-28 h-8"
                                          />
                                          <Button
                                            className="text-white"
                                            size="sm"
                                            onClick={() =>
                                              handleSave(
                                                "Wall-Finishes",
                                                "material",
                                                material.id,
                                                `${material.name} - ${typeItem.name} ${tileSize}`,
                                                overridePrice,
                                                `wallfinish-${category.key}-${matIdx}-${typeIdx}-${tileSize}`,
                                              )
                                            }
                                          >
                                            <Save className="w-3 h-3 text-white" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            ) : (
                              /* Simple price editor for non-tile materials */
                              <div className="flex items-center justify-between ml-2">
                                <span className="text-xs text-gray-500">
                                  KES per {typeItem.unit}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {(() => {
                                    const key = `wallfinish-${category.key}-${matIdx}-${typeIdx}`;

                                    // Get override from the override material
                                    const overrideTypeItem = (
                                      overrideMaterial?.type as any
                                    )?.[typeIdx];
                                    const effectivePrice =
                                      overrideTypeItem?.price_kes ??
                                      typeItem.price_kes;
                                    const overridePrice =
                                      tempValues[key] !== undefined
                                        ? tempValues[key]
                                        : effectivePrice;

                                    return (
                                      <>
                                        <Input
                                          type="number"
                                          value={overridePrice}
                                          onChange={(e) =>
                                            setTempValues({
                                              ...tempValues,
                                              [key]:
                                                parseFloat(e.target.value) || 0,
                                            })
                                          }
                                          className="w-28 h-8"
                                        />
                                        <Button
                                          className="text-white"
                                          size="sm"
                                          onClick={() =>
                                            handleSave(
                                              "Wall-Finishes",
                                              "material",
                                              material.id,
                                              `${material.name} - ${typeItem.name}`,
                                              overridePrice,
                                              `wallfinish-${category.key}-${matIdx}-${typeIdx}`,
                                            )
                                          }
                                        >
                                          <Save className="w-3 h-3 text-white" />
                                        </Button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content, "Wall Finishes");
  }

  // 19. Ceiling - Object with material items and prices
  if (material.name === "Ceiling" && isObject(material.type)) {
    const ceilingMaterials = material.type.materials || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(ceilingMaterials).map(
          ([materialKey, materialData], idx) => {
            const data = materialData as any;
            const key = `ceiling-${materialKey}`;

            // Check for user override in database
            // Find override once by material_id and region, then navigate type field
            const userOverrideRecord = userMaterialPrices.find(
              (p) => p.material_id === material.id && p.region === userRegion,
            );

            // Navigate to the specific material in the override's type field
            const overrideMaterials =
              userOverrideRecord?.type?.materials || userOverrideRecord?.type;
            const overrideMaterialData = overrideMaterials?.[materialKey];

            const effectivePrice =
              overrideMaterialData?.price ?? data?.price ?? 0;
            const overridePrice =
              tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

            return (
              <div key={idx} className="p-2 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{materialKey}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {data?.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {data?.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    KES per {data?.unit}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-28 h-8"
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          "Ceiling",
                          "material",
                          material.id,
                          `Ceiling - ${materialKey}`,
                          overridePrice,
                          `ceiling-${materialKey}`,
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    );

    return renderCollapsible(content);
  }

  // 20. Countertops - Object with material items, units, and prices
  if (material.name === "Countertops" && isObject(material.type)) {
    const countermaterials = material.type.materials || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(countermaterials).map(
          ([materialKey, materialData], idx) => {
            const data = materialData as any;
            const key = `countertop-${materialKey}`;

            // Check for user override in database
            // Find override once by material_id and region, then navigate type field
            const userOverrideRecord = userMaterialPrices.find(
              (p) => p.material_id === material.id && p.region === userRegion,
            );

            const overrideMaterials =
              userOverrideRecord?.type?.materials || countermaterials;
            const overrideMaterialData = (overrideMaterials as any)?.[
              materialKey
            ];

            const effectivePrice = overrideMaterialData?.price ?? data?.price;
            const overridePrice =
              tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

            return (
              <div key={materialKey} className="p-2 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{materialKey}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {data?.unit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={overridePrice}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-28 h-8"
                    />
                    <Button
                      className="text-white"
                      size="sm"
                      onClick={() =>
                        handleSave(
                          "Countertops",
                          "material",
                          material.id,
                          `Countertops - ${materialKey}`,
                          overridePrice,
                          `countertop-${materialKey}`,
                        )
                      }
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    );

    return renderCollapsible(content);
  }

  // 21. Joinery - Object with material items and prices
  if (material.name === "Joinery" && isObject(material.type)) {
    const joinerymaterials = material.type.materials || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(joinerymaterials).map(([materialKey, price], idx) => {
          const key = `joinery-${materialKey}`;

          // Check for user override in database
          const userOverrideRecord = userMaterialPrices.find(
            (p) => p.material_id === material.id && p.region === userRegion,
          );

          const overrideMaterials =
            userOverrideRecord?.type?.materials || joinerymaterials;
          const overrideMaterialData = (overrideMaterials as any)?.[
            materialKey
          ];

          const effectivePrice = overrideMaterialData ?? price;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

          return (
            <div key={materialKey} className="p-2 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{materialKey}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-28 h-8"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() =>
                      handleSave(
                        "Joinery",
                        "material",
                        material.id,
                        `Joinery - ${materialKey}`,
                        overridePrice,
                        `joinery-${materialKey}`,
                      )
                    }
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 22. Paint - Object with material items and prices
  if (material.name === "Paint" && isObject(material.type)) {
    const paintmaterials = material.type.materials || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(paintmaterials).map(([materialKey, price], idx) => {
          const key = `paint-${materialKey}`;

          // Check for user override in database
          const userOverrideRecord = userMaterialPrices.find(
            (p) => p.material_id === material.id && p.region === userRegion,
          );

          const overrideMaterials =
            userOverrideRecord?.type?.materials || paintmaterials;
          const overrideMaterialData = (overrideMaterials as any)?.[
            materialKey
          ];

          const effectivePrice = overrideMaterialData ?? price;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

          return (
            <div key={materialKey} className="p-2 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{materialKey}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-28 h-8"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() =>
                      handleSave(
                        "Paint",
                        "material",
                        material.id,
                        `Paint - ${materialKey}`,
                        overridePrice,
                        `paint-${materialKey}`,
                      )
                    }
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // 23. Glazing - Object with material items and prices
  if (material.name === "Glazing" && isObject(material.type)) {
    const glazingmaterials = material.type.materials || material.type;

    const content = (
      <div className="space-y-2 mt-2">
        {Object.entries(glazingmaterials).map(([materialKey, price], idx) => {
          const key = `glazing-${materialKey}`;

          // Check for user override in database
          const userOverrideRecord = userMaterialPrices.find(
            (p) => p.material_id === material.id && p.region === userRegion,
          );

          const overrideMaterials =
            userOverrideRecord?.type?.materials || glazingmaterials;
          const overrideMaterialData = (overrideMaterials as any)?.[
            materialKey
          ];

          const effectivePrice = overrideMaterialData ?? price;
          const overridePrice =
            tempValues[key] !== undefined ? tempValues[key] : effectivePrice;

          return (
            <div key={materialKey} className="p-2 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{materialKey}</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) =>
                      setTempValues({
                        ...tempValues,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-28 h-8"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() =>
                      handleSave(
                        "Glazing",
                        "material",
                        material.id,
                        `Glazing - ${materialKey}`,
                        overridePrice,
                        `glazing-${materialKey}`,
                      )
                    }
                  >
                    <Save className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return renderCollapsible(content);
  }

  // Default case - show a simple editor for materials with type but no specific handler
  const content = (
    <div className="p-4 text-center text-gray-500">
      <p>Editor for {material.name} is not implemented yet</p>
      <p className="text-xs mt-2">
        Type: {isArray(material.type) ? "Array" : "Object"}
      </p>
      {isArray(material.type) && (
        <p className="text-xs">Items: {material.type.length}</p>
      )}
    </div>
  );

  return renderCollapsible(content);
}
