// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { BOQSection, BOQItem } from "@/types/boq";

export const generateProfessionalBOQ = (quoteData: any): BOQSection[] => {
  if (!quoteData || typeof quoteData !== "object") {
    return [];
  }

  // Use existing BOQ data if available
  if (hasValidBOQData(quoteData)) {
    return processExistingBOQData(quoteData.boq_data);
  }

  // Generate from available structured data
  const sections = generateFromAvailableData(quoteData);

  return sections.filter((section) => section.items.length > 1); // Must have more than just header
};

const hasValidBOQData = (data: any): boolean => {
  return Array.isArray(data.boq_data) && data.boq_data.length > 0;
};

const processExistingBOQData = (boqData: any[]): BOQSection[] => {
  return boqData.map((section, index) => ({
    ...section,
    title: section.title || `BILL NO. ${index + 1}`,
    items: section.items.map((item) => ({
      ...item,
      amount: item.isHeader ? 0 : item.quantity * item.rate,
    })),
  }));
};

const generateFromAvailableData = (data: any): BOQSection[] => {
  const sections: BOQSection[] = [];

  // Generate sections only when we have concrete data
  const preliminaries = generatePreliminariesSection(data);
  if (preliminaries.items.length > 1) sections.push(preliminaries);

  const substructure = generateSubstructureSection(data);
  if (substructure.items.length > 1) sections.push(substructure);

  const superstructure = generateSuperstructureSection(data);
  if (superstructure.items.length > 1) sections.push(superstructure);

  const finishes = generateFinishesSection(data);
  if (finishes.items.length > 1) sections.push(finishes);

  const openings = generateOpeningsSection(data);
  if (openings.items.length > 1) sections.push(openings);

  const services = generateServicesSection(data);
  if (services.items.length > 1) sections.push(services);

  const external = generateExternalWorksSection(data);
  if (external.items.length > 1) sections.push(external);

  return sections;
};

// Section Generators
const generatePreliminariesSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("PRELIMINARIES AND GENERAL ITEMS", "preliminaries"),
  ];

  // Services
  if (Array.isArray(data.services)) {
    data.services.forEach((service: any) => {
      if (service.price > 0) {
        items.push(
          createBOQItem(
            service.name,
            "Sum",
            1,
            service.price,
            "preliminaries",
            "Service"
          )
        );
      }
    });
  }

  // Equipment
  if (Array.isArray(data.equipment)) {
    data.equipment.forEach((equip: any) => {
      if (equip.total_cost > 0) {
        items.push(
          createBOQItem(
            `${equip.name} - ${equip.desc}`,
            equip.usage_unit,
            equip.usage_quantity,
            equip.rate_per_unit,
            "preliminaries",
            "Equipment"
          )
        );
      }
    });
  }

  // Transport and other costs
  if (data.transport_costs > 0) {
    items.push(
      createBOQItem(
        "Transport of materials and personnel",
        "Sum",
        1,
        data.transport_costs,
        "preliminaries",
        "Transport"
      )
    );
  }

  if (data.equipment_costs > 0) {
    items.push(
      createBOQItem(
        "Plant and equipment",
        "Sum",
        1,
        data.equipment_costs,
        "preliminaries",
        "Equipment"
      )
    );
  }

  if (data.additional_services_cost > 0) {
    items.push(
      createBOQItem(
        "Additional services",
        "Sum",
        1,
        data.additional_services_cost,
        "preliminaries",
        "Services"
      )
    );
  }

  if (data.permit_cost > 0) {
    items.push(
      createBOQItem(
        "Permits and approvals",
        "Sum",
        1,
        data.permit_cost,
        "preliminaries",
        "Permits"
      )
    );
  }

  return {
    title: "BILL NO. 1: PRELIMINARIES AND GENERAL ITEMS",
    items,
  };
};

const generateSubstructureSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("SUBSTRUCTURE WORKS", "substructure"),
  ];

  // Extract from concrete_rows
  if (Array.isArray(data.concrete_rows)) {
    const substructureConcrete = data.concrete_rows.filter(
      (row: any) =>
        row.category === "substructure" || row.element === "foundation"
    );

    substructureConcrete.forEach((row: any) => {
      const volume = calculateExactVolume(row);
      if (volume > 0) {
        const rate = getConcreteRateFromData(data, row);
        if (rate > 0) {
          items.push(
            createBOQItem(
              `Vibrated reinforced concrete to ${row.element}`,
              "m³",
              volume,
              rate,
              "substructure",
              row.element
            )
          );
        }
      }
    });
  }

  // Add foundation walling if available
  const foundationWalling = extractFoundationWalling(data);
  items.push(...foundationWalling);

  return {
    title: "BILL NO. 2: SUBSTRUCTURE WORKS",
    items,
  };
};

const generateSuperstructureSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("SUPERSTRUCTURE WORKS", "superstructure"),
  ];

  // Concrete elements
  if (Array.isArray(data.concrete_rows)) {
    const superstructureConcrete = data.concrete_rows.filter(
      (row: any) => row.category === "superstructure"
    );

    superstructureConcrete.forEach((row: any) => {
      const volume = calculateExactVolume(row);
      if (volume > 0) {
        const rate = getConcreteRateFromData(data, row);
        if (rate > 0) {
          items.push(
            createBOQItem(
              `Vibrated reinforced concrete to ${row.element}`,
              "m³",
              volume,
              rate,
              "superstructure",
              row.element
            )
          );
        }
      }
    });
  }

  // Reinforcement
  if (Array.isArray(data.rebar_calculations)) {
    data.rebar_calculations.forEach((rebar: any) => {
      if (rebar.totalWeightKg > 0) {
        items.push(
          createBOQItem(
            `Reinforcement steel ${rebar.primaryBarSize || ""}`,
            "kg",
            rebar.totalWeightKg,
            rebar.rate || 180,
            "superstructure",
            "Reinforcement"
          )
        );
      }
    });
  }

  // Masonry from wall structure
  const masonryItems = extractMasonryFromWalls(
    data.wallDimensions,
    data.wallSections,
    data.wallProperties
  );
  items.push(...masonryItems);

  // Lintel beam - comes after walling, length equals total walling length
  const lintelItems = extractLintelFromMasonry(data.masonry_materials);
  items.push(...lintelItems);

  return {
    title: "BILL NO. 3: SUPERSTRUCTURE WORKS",
    items,
  };
};

const generateFinishesSection = (data: any): BOQSection => {
  const items: BOQItem[] = [createHeaderItem("INTERNAL FINISHES", "finishes")];

  if (data.masonry_materials) {
    const masonry = data.masonry_materials;

    if (masonry.netPlasterArea > 0 && masonry.netPlasterCost > 0) {
      items.push(
        createBOQItem(
          "Internal wall plaster",
          "m²",
          masonry.netPlasterArea,
          masonry.netPlasterCost / masonry.netPlasterArea,
          "finishes",
          "Plaster"
        )
      );
    }
  }

  return {
    title: "BILL NO. 4: INTERNAL FINISHES",
    items,
  };
};

const generateOpeningsSection = (data: any): BOQSection => {
  const items: BOQItem[] = [createHeaderItem("DOORS AND WINDOWS", "openings")];

  const openingItems = extractDoorsAndWindowsFromWalls(data.wallSections || []);
  items.push(...openingItems);

  return {
    title: "BILL NO. 5: DOORS AND WINDOWS",
    items,
  };
};

const generateServicesSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("SERVICES INSTALLATIONS", "services"),
  ];

  if (data.mechanical_cost > 0) {
    items.push(
      createBOQItem(
        "Mechanical works and installations",
        "Sum",
        1,
        data.mechanical_cost,
        "services",
        "Mechanical"
      )
    );
  }

  if (data.electrical_cost > 0) {
    items.push(
      createBOQItem(
        "Electrical fittings and installations",
        "Sum",
        1,
        data.electrical_cost,
        "services",
        "Electrical"
      )
    );
  }

  return {
    title: "BILL NO. 6: SERVICES INSTALLATIONS",
    items,
  };
};

const generateExternalWorksSection = (data: any): BOQSection => {
  const items: BOQItem[] = [createHeaderItem("EXTERNAL WORKS", "external")];

  if (data.external_works_cost > 0) {
    items.push(
      createBOQItem(
        "External works and landscaping",
        "Sum",
        1,
        data.external_works_cost,
        "external",
        "External Works"
      )
    );
  }

  if (data.landscaping_cost > 0) {
    items.push(
      createBOQItem(
        "Landscaping works",
        "Sum",
        1,
        data.landscaping_cost,
        "external",
        "Landscaping"
      )
    );
  }

  return {
    title: "BILL NO. 7: EXTERNAL WORKS",
    items,
  };
};

// Helper Functions
const calculateExactVolume = (row: any): number => {
  const width = parseFloat(row.width) || 0;
  const length = parseFloat(row.length) || 0;
  const height = parseFloat(row.height) || 0;
  const number = parseFloat(row.number) || 1;
  return width * length * height * number;
};

const getConcreteRateFromData = (data: any, row: any): number => {
  // Try to find actual rate from concrete_materials
  if (Array.isArray(data.concrete_materials)) {
    const material = data.concrete_materials.find(
      (m: any) => m.rowId === row.id && m.rate > 0
    );
    if (material) return material.rate;
  }

  // Fallback to mix-based rates (from actual data)
  const mixRates: { [key: string]: number } = {
    "1:2:4": 13500,
    "1:3:6": 12500,
    "1:1.5:3": 14500,
  };

  return mixRates[row.mix] || 0;
};

const extractFoundationWalling = (data: any): BOQItem[] => {
  const items: BOQItem[] = [];

  if (Array.isArray(data.concrete_rows)) {
    data.concrete_rows.forEach((row: any) => {
      if (row.hasMasonryWall && row.masonryWallThickness) {
        const wallArea = calculateWallArea(row);
        if (wallArea > 0) {
          items.push(
            createBOQItem(
              `${row.masonryWallThickness * 1000}mm foundation walling`,
              "m²",
              wallArea,
              1200, // Default masonry rate
              "substructure",
              "Foundation Walling"
            )
          );
        }
      }
    });
  }

  return items;
};

const calculateWallArea = (row: any): number => {
  const length = parseFloat(row.length) || 0;
  const height = parseFloat(row.masonryWallHeight) || 1.0;
  return length * height;
};

const extractMasonryFromWalls = (
  dimensions: any,
  sections: any[],
  properties: any
): BOQItem[] => {
  const items: BOQItem[] = [];

  if (!dimensions || !properties) {
    return items;
  }

  try {
    // Calculate total wall area from external and internal walls
    const externalWallArea =
      (dimensions.externalWallPerimiter || 0) *
      (dimensions.externalWallHeight || 0);
    const internalWallArea =
      (dimensions.internalWallPerimiter || 0) *
      (dimensions.internalWallHeight || 0);
    const totalWallArea = externalWallArea + internalWallArea;

    // Calculate opening area (doors and windows) to subtract
    let openingArea = 0;
    if (sections && Array.isArray(sections)) {
      sections.forEach((section: any) => {
        if (section.doors) {
          section.doors.forEach((door: any) => {
            const doorWidth = door.width || 0.9;
            const doorHeight = door.height || 2.1;
            openingArea += doorWidth * doorHeight;
          });
        }
        if (section.windows) {
          section.windows.forEach((window: any) => {
            const windowWidth = window.width || 1.2;
            const windowHeight = window.height || 1.5;
            openingArea += windowWidth * windowHeight;
          });
        }
      });
    }

    // Net wall area for material calculation
    const netWallArea = Math.max(0, totalWallArea - openingArea);

    if (netWallArea > 0) {
      items.push(
        createBOQItem(
          `${(properties.thickness || 0.2) * 1000}mm ${
            properties.blockType || "Standard Block"
          } walling (${properties.plaster || "Both Sides"})`,
          "m²",
          netWallArea,
          1200, // Default masonry rate - adjust based on your data
          "superstructure",
          "Masonry"
        )
      );
    }
  } catch (error) {
    console.error("Error extracting masonry from walls:", error);
  }

  return items;
};

const extractLintelFromMasonry = (masonryMaterials: any): BOQItem[] => {
  const items: BOQItem[] = [];

  if (!masonryMaterials) {
    return items;
  }

  try {
    // Extract lintel data from existing masonry calculations
    if (masonryMaterials.netLintelsCost > 0) {
      items.push(
        createBOQItem(
          `Concrete lintel beam reinforced`,
          "m³",
          0, // Quantity in m³ is not directly available, using cost breakdown
          0, // Rate is embedded in cost
          "superstructure",
          "Lintel Beam"
        )
      );
    }

    // Add lintel reinforcement if available
    if (masonryMaterials.netLintelRebar > 0) {
      items.push(
        createBOQItem(
          `Reinforcement steel for lintels`,
          "kg",
          masonryMaterials.netLintelRebar,
          masonryMaterials.netLintelRebarCost /
            Math.max(masonryMaterials.netLintelRebar, 1),
          "superstructure",
          "Lintel Reinforcement"
        )
      );
    }
  } catch (error) {
    console.error("Error extracting lintel from masonry:", error);
  }

  return items;
};

const extractDoorsAndWindowsFromWalls = (sections: any[]): BOQItem[] => {
  const items: BOQItem[] = [];
  const doorsMap = new Map<string, { count: number; price: number }>();
  const windowsMap = new Map<string, { count: number; price: number }>();

  if (!sections || !Array.isArray(sections)) {
    return items;
  }

  sections.forEach((section: any) => {
    // Process doors
    if (section.doors && Array.isArray(section.doors)) {
      section.doors.forEach((door: any) => {
        if (door && typeof door === "object") {
          const doorSize =
            door.standardSize || `${door.width || 0.9}x${door.height || 2.1}`;
          const doorType = door.type || "Wooden";
          const key = `${doorType}_${doorSize}`;
          const count = door.count || 1;
          const price = door.price || 0;

          if (count > 0 && price > 0) {
            const existing = doorsMap.get(key);
            if (existing) {
              existing.count += count;
            } else {
              doorsMap.set(key, { count, price });
            }
          }
        }
      });
    }

    // Process windows
    if (section.windows && Array.isArray(section.windows)) {
      section.windows.forEach((window: any) => {
        if (window && typeof window === "object") {
          const windowSize =
            window.standardSize ||
            `${window.width || 1.2}x${window.height || 1.5}`;
          const glassType = window.glass || "Clear";
          const key = `${glassType}_${windowSize}`;
          const count = window.count || 1;
          const price = window.price || 0;

          if (count > 0 && price > 0) {
            const existing = windowsMap.get(key);
            if (existing) {
              existing.count += count;
            } else {
              windowsMap.set(key, { count, price });
            }
          }
        }
      });
    }
  });

  // Add consolidated door items
  doorsMap.forEach((value, key) => {
    const [doorType, doorSize] = key.split("_");
    items.push(
      createBOQItem(
        `${doorType} Door (${doorSize})`,
        "No",
        value.count,
        value.price,
        "openings",
        "Doors"
      )
    );
  });

  // Add consolidated window items
  windowsMap.forEach((value, key) => {
    const [glassType, windowSize] = key.split("_");
    items.push(
      createBOQItem(
        `${glassType} Glass Window (${windowSize})`,
        "No",
        value.count,
        value.price,
        "openings",
        "Windows"
      )
    );
  });

  return items;
};

const createHeaderItem = (description: string, category: string): BOQItem => ({
  itemNo: "",
  description,
  unit: "",
  quantity: 0,
  rate: 0,
  amount: 0,
  category,
  element: "Header",
  isHeader: true,
});

const createBOQItem = (
  description: string,
  unit: string,
  quantity: number,
  rate: number,
  category: string,
  element: string,
  isHeader: boolean = false
): BOQItem => ({
  itemNo: "",
  description,
  unit,
  quantity,
  rate,
  amount: isHeader ? 0 : quantity * rate,
  category,
  element,
  isHeader,
});
