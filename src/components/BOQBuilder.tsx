import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Save, FolderPlus, Type } from "lucide-react";
import { BOQItem, BOQSection } from "@/types/boq";
import {
  mapMasonryToBOQ,
  mapConcreteToBOQ,
  mapRebarToBOQ,
  mapDoorsToBOQ,
  mapWindowsToBOQ,
  mapDoorFramesToBOQ,
  mapWindowFramesToBOQ,
} from "@/utils/boqMappers";

interface BOQBuilderProps {
  quoteData: any;
  onBOQUpdate: (boqData: BOQSection[]) => void;
}

const BOQBuilder = ({ quoteData, onBOQUpdate }: BOQBuilderProps) => {
  const [boqSections, setBoqSections] = useState<BOQSection[]>([]);
  const [editingItem, setEditingItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);

  // Initialize BOQ from quote data
  useEffect(() => {
    const initializeBOQ = () => {
      const sections: BOQSection[] = [
        {
          title: "Element A: Substructure",
          items: [
            ...mapConcreteToBOQ(
              quoteData.concrete_rows || [],
              quoteData.concrete_materials || []
            ).filter((item) => item.category === "substructure"),
            ...mapRebarToBOQ(quoteData.rebar_calculations || []).filter(
              (item) => item.category === "substructure"
            ),
          ],
        },
        {
          title: "Element B: Superstructure",
          items: [
            ...mapConcreteToBOQ(
              quoteData.concrete_rows || [],
              quoteData.concrete_materials || []
            ).filter((item) => item.category === "superstructure"),
            ...mapRebarToBOQ(quoteData.rebar_calculations || []).filter(
              (item) => item.category === "superstructure"
            ),
          ],
        },
        {
          title: "Element C: External and Internal Walling",
          items: [...mapMasonryToBOQ(quoteData.rooms || [])],
        },
        {
          title: "Element D: Windows",
          items: [
            ...mapWindowsToBOQ(quoteData.rooms || []),
            ...mapWindowFramesToBOQ(quoteData.rooms || []),
          ],
        },
        {
          title: "Element E: Doors",
          items: [
            ...mapDoorsToBOQ(quoteData.rooms || []),
            ...mapDoorFramesToBOQ(quoteData.rooms || []),
          ],
        },
        {
          title: "Element F: Roof Finishes",
          items: [],
        },
        {
          title: "Element G: Floor Finishes",
          items: [],
        },
        {
          title: "Element H: Ceiling Finishes",
          items: [],
        },
        {
          title: "Element J: Joinery Fittings",
          items: [],
        },
      ];

      setBoqSections(sections);
      onBOQUpdate(sections);
    };

    initializeBOQ();
  }, [quoteData, onBOQUpdate]);

  // Calculate section totals
  const calculateSectionTotal = (items: BOQItem[]): number => {
    return items.reduce((total, item) => {
      // Skip header items when calculating totals
      if (item.isHeader) return total;
      return total + (item.amount || 0);
    }, 0);
  };

  // Calculate grand total
  const calculateGrandTotal = (): number => {
    return boqSections.reduce((total, section) => {
      return total + calculateSectionTotal(section.items);
    }, 0);
  };

  const addCustomItem = (sectionIndex: number) => {
    const newSections = [...boqSections];
    newSections[sectionIndex].items.push({
      itemNo: `CUS-${newSections[sectionIndex].items.length + 1}`,
      description: "",
      unit: "",
      quantity: 0,
      rate: 0,
      amount: 0,
      category: newSections[sectionIndex].title,
      isHeader: false,
      element: "Custom",
    });

    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const addHeaderItem = (sectionIndex: number) => {
    const newSections = [...boqSections];
    newSections[sectionIndex].items.push({
      itemNo: `HDR-${newSections[sectionIndex].items.length + 1}`,
      description: "New Header/Note",
      unit: "",
      quantity: 0,
      rate: 0,
      amount: 0,
      category: newSections[sectionIndex].title,
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
    if (boqSections.length <= 1) return; // Don't remove the last section

    const newSections = [...boqSections];
    newSections.splice(sectionIndex, 1);
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    const newSections = [...boqSections];
    const item = newSections[sectionIndex].items[itemIndex];

    if (field === "quantity" || field === "rate") {
      item[field] = parseFloat(value) || 0;
      // Recalculate amount if quantity or rate changes (skip for headers)
      if (!item.isHeader) {
        item.amount = item.quantity * item.rate;
      }
    } else {
      item[field] = value;
    }

    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...boqSections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button className="text-white" onClick={addCustomSection}>
          <FolderPlus className="w-4 h-4 mr-2" /> Add New Section
        </Button>
      </div>

      {boqSections.map((section, sectionIndex) => (
        <Card className="gradient-card" key={sectionIndex}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
              className="bg-background text-lg font-semibold border-none focus:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSection(sectionIndex)}
              disabled={boqSections.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
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
                {section.items.map((item, itemIndex) => (
                  <TableRow
                    key={itemIndex}
                    className={
                      item.isHeader
                        ? "bg-muted/50 rounded-lg font-semibold"
                        : ""
                    }
                  >
                    <TableCell>{item.isHeader ? "" : item.itemNo}</TableCell>
                    <TableCell>
                      {editingItem?.sectionIndex === sectionIndex &&
                      editingItem?.itemIndex === itemIndex ? (
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(
                              sectionIndex,
                              itemIndex,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <span className={item.isHeader ? "font-semibold" : ""}>
                          {item.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? (
                        ""
                      ) : editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex ? (
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            updateItem(sectionIndex, itemIndex, "unit", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
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
                        </Select>
                      ) : (
                        item.unit
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? (
                        ""
                      ) : editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex ? (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              sectionIndex,
                              itemIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? (
                        ""
                      ) : editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex ? (
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              sectionIndex,
                              itemIndex,
                              "rate",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        item.rate?.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? "" : item.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              editingItem?.sectionIndex === sectionIndex &&
                              editingItem?.itemIndex === itemIndex
                            ) {
                              setEditingItem(null);
                            } else {
                              setEditingItem({ sectionIndex, itemIndex });
                            }
                          }}
                        >
                          {editingItem?.sectionIndex === sectionIndex &&
                          editingItem?.itemIndex === itemIndex ? (
                            <Save size={16} />
                          ) : (
                            <Edit size={16} />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(sectionIndex, itemIndex)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Section Total Row */}
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
              <Button
                variant="outline"
                onClick={() => addCustomItem(sectionIndex)}
              >
                <Plus size={16} className="mr-2" /> Add Item
              </Button>
              <Button
                variant="outline"
                onClick={() => addHeaderItem(sectionIndex)}
              >
                <Type size={16} className="mr-2" /> Add Header/Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Grand Total Card */}
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
    </div>
  );
};

export default BOQBuilder;
