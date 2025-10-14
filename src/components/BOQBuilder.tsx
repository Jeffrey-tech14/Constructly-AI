import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { MaterialType } from "@/utils/advancedMaterialExtractor";
import { getMaterialConfig, getMaterialBreakdown, } from "@/config/materialConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Plus, Trash2, Edit, Save, FolderPlus, Type, GripVertical, } from "lucide-react";
import { BOQItem, BOQSection, MaterialBreakdown } from "@/types/boq";
import { mapMasonryToBOQ, mapConcreteToBOQ, mapRebarToBOQ, mapDoorsToBOQ, mapWindowsToBOQ, mapDoorFramesToBOQ, mapWindowFramesToBOQ, mapFoundationWallingToBOQ, } from "@/utils/boqMappers";
interface BOQBuilderProps {
    quoteData: any;
    onBOQUpdate: (boqData: BOQSection[]) => void;
}
const getDefaultMaterialBreakdown = (type: string): MaterialBreakdown[] => {
    const config = getMaterialConfig(type.toLowerCase());
    if (!config)
        return [];
    const { breakdown, errors, warnings } = getMaterialBreakdown(type, 1);
    if (errors.length > 0) {
        console.warn("Material breakdown errors:", errors);
        return [];
    }
    if (warnings.length > 0) {
        console.info("Material breakdown warnings:", warnings);
    }
    return breakdown.map((material) => ({
        ...material,
        materialType: material.materialType ||
            determineDefaultMaterialType(type, material.material),
    }));
};
const determineDefaultMaterialType = (category: string, description: string): MaterialType => {
    const lowerDesc = description.toLowerCase();
    const lowerCat = category.toLowerCase();
    if (lowerCat === "concrete") {
        if (lowerDesc.includes("cement"))
            return "binding";
        if (lowerDesc.includes("sand") || lowerDesc.includes("aggregate"))
            return "primary";
        if (lowerDesc.includes("water"))
            return "auxiliary";
    }
    if (lowerCat === "masonry") {
        if (lowerDesc.includes("stone") || lowerDesc.includes("block"))
            return "primary";
        if (lowerDesc.includes("cement") || lowerDesc.includes("mortar"))
            return "binding";
        if (lowerDesc.includes("sand"))
            return "primary";
        if (lowerDesc.includes("ties") || lowerDesc.includes("dpc"))
            return "auxiliary";
    }
    if (lowerCat === "formwork") {
        if (lowerDesc.includes("board"))
            return "primary";
        if (lowerDesc.includes("timber") || lowerDesc.includes("support"))
            return "structural-timber";
        if (lowerDesc.includes("release"))
            return "auxiliary";
    }
    return "primary";
};
const BOQBuilder = ({ quoteData, onBOQUpdate }: BOQBuilderProps) => {
    const [boqSections, setBoqSections] = useState<BOQSection[]>([]);
    const [editingItem, setEditingItem] = useState<{
        sectionIndex: number;
        itemIndex: number;
    } | null>(null);
    const [dragItem, setDragItem] = useState<{
        sectionIndex: number;
        itemIndex: number;
    } | null>(null);
    const [selectedMaterialType, setSelectedMaterialType] = useState<string>("other");
    const materialTypes = [
        { value: "concrete", label: "Concrete Works" },
        { value: "masonry", label: "Masonry Works" },
        { value: "formwork", label: "Formwork" },
        { value: "steel", label: "Steel/Reinforcement" },
        { value: "waterproofing", label: "Waterproofing" },
        { value: "chemicals", label: "Chemical Treatment" },
        { value: "earthworks", label: "Earthworks" },
        { value: "other", label: "Other" },
    ];
    const validateBOQData = (boqSections: BOQSection[]): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];
        let totalCalculated = 0;
        boqSections.forEach((section, sectionIndex) => {
            section.items.forEach((item, itemIndex) => {
                if (!item.isHeader) {
                    if (item.quantity < 0)
                        errors.push(`Negative quantity in ${item.itemNo}`);
                    if (item.rate < 0)
                        errors.push(`Negative rate in ${item.itemNo}`);
                    const calculatedAmount = item.quantity * item.rate;
                    if (Math.abs(calculatedAmount - item.amount) > 1) {
                        errors.push(`Amount mismatch in ${item.itemNo}`);
                    }
                    totalCalculated += item.amount;
                }
            });
        });
        return {
            isValid: errors.length === 0,
            errors,
        };
    };
    useEffect(() => {
        const validation = validateBOQData(boqSections);
        if (!validation.isValid) {
            console.error("BOQ Validation Errors:", validation.errors);
        }
        const boqTotal = calculateGrandTotal();
        const expectedTotal = (quoteData.materials_cost || 0) +
            (quoteData.concrete_materials?.find((m) => m.name === "Grand Total")
                ?.total_price || 0);
    }, [boqSections]);
    useEffect(() => {
        const initializeBOQ = () => {
            let allSections: BOQSection[] = [];
            const concreteItems = mapConcreteToBOQ(quoteData.concrete_rows || [], quoteData.concrete_materials || []);
            const rebarItems = mapRebarToBOQ(quoteData.rebar_calculations || [], quoteData.rebar_rows || []);
            const foundationWallingItems = mapFoundationWallingToBOQ(quoteData.concrete_rows || [], quoteData.concrete_materials || {});
            const masonryItems = mapMasonryToBOQ(quoteData.rooms || []);
            const windowItems = mapWindowsToBOQ(quoteData.rooms || []);
            const windowFrameItems = mapWindowFramesToBOQ(quoteData.rooms || []);
            const doorItems = mapDoorsToBOQ(quoteData.rooms || []);
            const doorFrameItems = mapDoorFramesToBOQ(quoteData.rooms || []);
            const sections: BOQSection[] = [
                {
                    title: "1. Substructure Works",
                    items: [
                        {
                            itemNo: "1.1",
                            description: "Concrete Works in Foundation",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "substructure",
                            element: "Header",
                        },
                        ...concreteItems.filter((item) => item.category === "substructure" &&
                            item.element?.toLowerCase().includes("foundation") &&
                            !item.element?.toLowerCase().includes("walling")),
                        {
                            itemNo: "1.0",
                            description: "Reinforcement in Substructure",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "substructure",
                            element: "Header",
                        },
                        ...rebarItems.filter((item) => item.category === "substructure"),
                        {
                            itemNo: "1.2",
                            description: "Foundation Walling",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "substructure",
                            element: "Header",
                        },
                        ...foundationWallingItems,
                    ],
                },
                {
                    title: "2. Superstructure Frame",
                    items: [
                        {
                            itemNo: "2.0",
                            description: "Concrete Works in Superstructure",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "superstructure",
                            element: "Header",
                        },
                        ...concreteItems.filter((item) => item.category === "superstructure" &&
                            !item.element?.toLowerCase().includes("foundation")),
                        {
                            itemNo: "2.1",
                            description: "Reinforcement in Superstructure",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "superstructure",
                            element: "Header",
                        },
                        ...rebarItems.filter((item) => item.category === "superstructure"),
                    ],
                },
                {
                    title: "3. Walling and Partitions",
                    items: [
                        ...masonryItems.filter((item) => item.category !== "substructure" &&
                            !item.element?.toLowerCase().includes("foundation")),
                    ],
                },
                {
                    title: "4. Openings",
                    items: [
                        {
                            itemNo: "4.0",
                            description: "Doors and Frames",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "openings",
                            element: "Header",
                        },
                        ...doorItems,
                        ...doorFrameItems,
                        {
                            itemNo: "4.1",
                            description: "Windows and Frames",
                            isHeader: true,
                            unit: "",
                            quantity: 0,
                            rate: 0,
                            amount: 0,
                            category: "openings",
                            element: "Header",
                        },
                        ...windowItems,
                        ...windowFrameItems,
                    ],
                },
            ];
            const existingBOQ = quoteData.boq_data || [];
            const mapperItemKeys = new Set<string>();
            const mapperHeaderKeys = new Set<string>();
            sections.forEach((section) => {
                section.items.forEach((item) => {
                    const key = `${item.category}_${item.element}_${item.description}`;
                    if (item.isHeader) {
                        mapperHeaderKeys.add(key);
                    }
                    else {
                        mapperItemKeys.add(key);
                    }
                });
            });
            existingBOQ.forEach((existingSection: BOQSection) => {
                const matchingSection = sections.find((s) => s.title === existingSection.title);
                if (matchingSection) {
                    existingSection.items.forEach((item: BOQItem) => {
                        const key = `${item.category}_${item.element}_${item.description}`;
                        if (item.isHeader) {
                            if (!mapperHeaderKeys.has(key)) {
                                matchingSection.items.push({
                                    ...item,
                                    isExisting: true,
                                    wasMatched: false,
                                });
                            }
                        }
                        else {
                            if (!mapperItemKeys.has(key)) {
                                matchingSection.items.push({
                                    ...item,
                                    isExisting: true,
                                    wasMatched: false,
                                });
                            }
                        }
                    });
                }
                else {
                    const nonConflictingItems = existingSection.items.filter((item) => {
                        const key = `${item.category}_${item.element}_${item.description}`;
                        if (item.isHeader) {
                            return !mapperHeaderKeys.has(key);
                        }
                        else {
                            return !mapperItemKeys.has(key);
                        }
                    });
                    if (nonConflictingItems.length > 0) {
                        sections.push({
                            title: existingSection.title,
                            items: nonConflictingItems.map((item) => ({
                                ...item,
                                isExisting: true,
                                wasMatched: false,
                            })),
                        });
                    }
                }
            });
            sections.sort((a, b) => {
                const aNum = parseInt(a.title.split(".")[0]) || 999;
                const bNum = parseInt(b.title.split(".")[0]) || 999;
                return aNum - bNum;
            });
            const nonEmptySections = sections.filter((section) => section.items.length > 0);
            setBoqSections(nonEmptySections);
            onBOQUpdate(nonEmptySections);
        };
        initializeBOQ();
    }, [quoteData, onBOQUpdate]);
    const calculateSectionTotal = (items: BOQItem[]): number => {
        return items.reduce((total, item) => {
            if (item.isHeader)
                return total;
            return total + (item.amount || 0);
        }, 0);
    };
    const calculateGrandTotal = (): number => {
        return boqSections.reduce((total, section) => {
            return total + calculateSectionTotal(section.items);
        }, 0);
    };
    const addCustomItem = (sectionIndex: number) => {
        const newSections = [...boqSections];
        const section = newSections[sectionIndex];
        let insertIndex = section.items.length;
        newSections[sectionIndex].items.push({
            itemNo: `CUS-${section.items.length + 1}`,
            description: "",
            unit: "",
            quantity: 0,
            rate: 0,
            amount: 0,
            category: section.title,
            isHeader: false,
            element: "Custom",
        });
        setBoqSections(newSections);
        onBOQUpdate(newSections);
    };
    const addHeaderItem = (sectionIndex: number) => {
        const newSections = [...boqSections];
        const section = newSections[sectionIndex];
        newSections[sectionIndex].items.push({
            itemNo: `HDR-${section.items.length + 1}`,
            description: "New Header/Note",
            unit: "",
            quantity: 0,
            rate: 0,
            amount: 0,
            category: section.title,
            element: "Header",
            isHeader: true,
        });
        setBoqSections(newSections);
        onBOQUpdate(newSections);
    };
    const addCustomSection = () => {
        const newSections = [
            ...boqSections,
            {
                title: `Custom Section ${boqSections.length + 1}`,
                items: [],
            },
        ];
        setBoqSections(newSections);
        onBOQUpdate(newSections);
    };
    const updateSectionTitle = (sectionIndex: number, title: string) => {
        const newSections = [...boqSections];
        newSections[sectionIndex].title = title;
        setBoqSections(newSections);
        onBOQUpdate(newSections);
    };
    const removeSection = (sectionIndex: number) => {
        if (boqSections.length <= 1)
            return;
        const newSections = [...boqSections];
        newSections.splice(sectionIndex, 1);
        setBoqSections(newSections);
        onBOQUpdate(newSections);
    };
    const updateItem = (sectionIndex: number, itemIndex: number, field: string, value: any) => {
        const newSections = [...boqSections];
        const item = newSections[sectionIndex].items[itemIndex];
        try {
            if (field === "materialType") {
                item.materialType = value;
                setSelectedMaterialType(value);
                const config = getMaterialConfig(value);
                if (config) {
                    if (!item.unit ||
                        (config.defaultUnit && item.unit !== config.defaultUnit)) {
                        item.unit = config.defaultUnit;
                    }
                    item.materialBreakdown = getDefaultMaterialBreakdown(value);
                    item.sourceLocation = newSections[sectionIndex].title;
                    item.category = config.category || value;
                }
                else {
                    console.warn(`No material configuration found for type: ${value}`);
                    item.materialBreakdown = [];
                }
            }
            else if (field === "quantity" || field === "rate") {
                const newValue = parseFloat(value) || 0;
                if (newValue < 0) {
                    console.warn(`Warning: Negative ${field} entered for item ${item.itemNo}`);
                    return;
                }
                item[field] = newValue;
                if (field === "quantity" && item.materialBreakdown?.length > 0) {
                    try {
                        item.materialBreakdown = item.materialBreakdown.map((mat) => {
                            const ratio = mat.ratio || 0;
                            if (ratio < 0 || ratio > 1) {
                                console.warn(`Invalid ratio ${ratio} for material ${mat.material} in item ${item.itemNo}`);
                            }
                            return {
                                ...mat,
                                quantity: newValue * ratio,
                            };
                        });
                    }
                    catch (error) {
                        console.error(`Error updating material quantities for item ${item.itemNo}:`, error);
                    }
                }
                if (!item.isHeader) {
                    const quantity = item.quantity || 0;
                    const rate = item.rate || 0;
                    if (quantity < 0 || rate < 0) {
                        console.warn(`Negative values detected for item ${item.itemNo} - quantity: ${quantity}, rate: ${rate}`);
                    }
                    item.amount = quantity * rate;
                }
            }
            else {
                item[field] = value;
            }
            validateItem(item);
            setBoqSections(newSections);
            onBOQUpdate(newSections);
        }
        catch (error) {
            console.error(`Error updating item ${item.itemNo}:`, error);
        }
    };
    const validateItem = (item: BOQItem) => {
        if (item.isHeader)
            return;
        const warnings: string[] = [];
        const errors: string[] = [];
        if (!item.description) {
            errors.push("Description is required");
        }
        else if (item.description.length < 3) {
            warnings.push("Description seems too short");
        }
        if (!item.unit) {
            errors.push("Unit is required");
        }
        if (typeof item.quantity !== "number") {
            errors.push("Quantity must be a number");
        }
        else if (item.quantity === 0) {
            warnings.push("Quantity should be greater than 0");
        }
        else if (item.quantity < 0) {
            errors.push("Quantity cannot be negative");
        }
        if (typeof item.rate !== "number") {
            errors.push("Rate must be a number");
        }
        else if (item.rate === 0) {
            warnings.push("Rate should be greater than 0");
        }
        else if (item.rate < 0) {
            errors.push("Rate cannot be negative");
        }
        if (item.materialType) {
            if (!getMaterialConfig(item.materialType)) {
                warnings.push(`Unknown material type: ${item.materialType}`);
            }
            if (!item.materialBreakdown?.length) {
                warnings.push("Material type selected but no breakdown available");
            }
            else {
                const totalRatio = item.materialBreakdown.reduce((sum, mat) => sum + (mat.ratio || 0), 0);
                if (Math.abs(totalRatio - 1) > 0.0001) {
                    warnings.push(`Material ratios sum to ${totalRatio.toFixed(4)}, should be 1.0`);
                }
                item.materialBreakdown.forEach((mat, index) => {
                    if (!mat.material) {
                        errors.push(`Material name missing in breakdown item ${index + 1}`);
                    }
                    if (typeof mat.ratio !== "number") {
                        errors.push(`Invalid ratio in material ${mat.material || `item ${index + 1}`}`);
                    }
                });
            }
        }
        if (errors.length > 0) {
            console.error(`Validation errors for item ${item.itemNo}:`, errors);
        }
        if (warnings.length > 0) {
            console.warn(`Validation warnings for item ${item.itemNo}:`, warnings);
        }
        return { errors, warnings };
    };
    const removeItem = (sectionIndex: number, itemIndex: number) => {
        const newSections = [...boqSections];
        newSections[sectionIndex].items.splice(itemIndex, 1);
        setBoqSections(newSections);
        onBOQUpdate(newSections);
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button className="text-white" onClick={addCustomSection}>
          <FolderPlus className="w-4 h-4 mr-2"/> Add New Section
        </Button>
      </div>

      {boqSections.map((section, sectionIndex) => (<Card className="" key={sectionIndex}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Input value={section.title} onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)} className="bg-background text-lg font-semibold border-none focus:ring-0"/>
            <Button variant="ghost" size="sm" onClick={() => removeSection(sectionIndex)} disabled={boqSections.length <= 1}>
              <Trash2 className="w-4 h-4"/>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate (KSh)</TableHead>
                  <TableHead>Amount (KSh)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item, itemIndex) => (<TableRow key={itemIndex} className={`
                      ${item.isHeader
                    ? "bg-muted/50 rounded-lg font-semibold"
                    : ""}
                      ${item.isHeader ? "" : "hover:bg-muted/30"}
                      ${item.isExisting ? "border-l-2 border-primary" : ""}
                      relative
                    `}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!item.isHeader && (<GripVertical className="w-4 h-4 text-muted-foreground shrink-0"/>)}
                        {item.isHeader ? "" : item.itemNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex ? (<>
                            <Input value={item.description} onChange={(e) => updateItem(sectionIndex, itemIndex, "description", e.target.value)}/>
                            {!item.isHeader && (<Select value={item.materialType || "other"} onValueChange={(value) => updateItem(sectionIndex, itemIndex, "materialType", value)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select material type"/>
                                </SelectTrigger>
                                <SelectContent>
                                  {materialTypes.map((type) => (<SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>))}
                                </SelectContent>
                              </Select>)}
                          </>) : (<div>
                            <span className={item.isHeader ? "font-semibold" : ""}>
                              {item.description}
                            </span>
                            {!item.isHeader && item.materialType && (<div className="text-sm text-muted-foreground mt-1">
                                Type:{" "}
                                {materialTypes.find((t) => t.value === item.materialType)?.label || item.materialType}
                              </div>)}
                          </div>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? ("") : editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex ? (<Select value={item.unit} onValueChange={(value) => updateItem(sectionIndex, itemIndex, "unit", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="m²">m²</SelectItem>
                            <SelectItem value="m³">m³</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Lm">Lm</SelectItem>
                            <SelectItem value="Roll">Roll</SelectItem>
                            <SelectItem value="Liter">Liter</SelectItem>
                            <SelectItem value="Sum">Sum</SelectItem>
                            <SelectItem value="Bag">Bag</SelectItem>
                          </SelectContent>
                        </Select>) : (item.unit)}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? ("") : editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex ? (<Input type="number" value={item.quantity} onChange={(e) => updateItem(sectionIndex, itemIndex, "quantity", e.target.value)}/>) : (item.quantity)}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? ("") : editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex ? (<Input type="number" value={item.rate} onChange={(e) => updateItem(sectionIndex, itemIndex, "rate", e.target.value)}/>) : (item.rate?.toLocaleString())}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? "" : item.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                    if (editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex) {
                        setEditingItem(null);
                    }
                    else {
                        setEditingItem({ sectionIndex, itemIndex });
                    }
                }}>
                          {editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex ? (<Save size={16}/>) : (<Edit size={16}/>)}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => removeItem(sectionIndex, itemIndex)}>
                          <Trash2 size={16}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>))}

                
                <TableRow className="bg-muted rounded rounded-xl font-semibold">
                  <TableCell colSpan={5} className="text-right">
                    Section Total:
                  </TableCell>
                  <TableCell className="font-bold">
                    KSh {calculateSectionTotal(section.items).toLocaleString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex space-x-2 mt-4">
              <Button variant="outline" onClick={() => addCustomItem(sectionIndex)}>
                <Plus size={16} className="mr-2"/> Add Item
              </Button>
              <Button variant="outline" onClick={() => addHeaderItem(sectionIndex)}>
                <Type size={16} className="mr-2"/> Add Header/Note
              </Button>
            </div>
          </CardContent>
        </Card>))}

      
      <Card className="bg-primary/10 border-primary dark:border-blue-300">
        <CardHeader>
          <CardTitle className="text-primary dark:text-blue-300">
            Grand Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary dark:text-blue-300">
            KSh {calculateGrandTotal().toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default BOQBuilder;
