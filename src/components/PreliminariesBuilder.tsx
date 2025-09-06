import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Save, FolderPlus, Type } from "lucide-react";

interface PrelimItem {
  itemNo: string;
  description: string;
  amount: number;
  isHeader?: boolean;
}

interface PrelimSection {
  title: string;
  items: PrelimItem[];
}

interface PreliminariesBuilderProps {
  quoteData: any;
  onPreliminariesUpdate: (sections: PrelimSection[]) => void;
  onSaveToQuote: (sections: PrelimSection[]) => void; // Add this prop
}

const PreliminariesBuilder = ({
  quoteData,
  onPreliminariesUpdate,
  onSaveToQuote,
}: PreliminariesBuilderProps) => {
  const sections: PrelimSection[] = useMemo(() => {
    const prelims = quoteData?.preliminaries;
    if (Array.isArray(prelims) && prelims.length > 0) {
      return JSON.parse(JSON.stringify(prelims));
    }
    return [{ title: "General Preliminaries", items: [] }];
  }, [quoteData?.preliminaries]);

  const [editingItem, setEditingItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);

  const calculateSectionTotal = (items: PrelimItem[]): number =>
    items.reduce((sum, i) => (i.isHeader ? sum : sum + (i.amount || 0)), 0);

  const calculateGrandTotal = (): number =>
    sections.reduce((sum, s) => sum + calculateSectionTotal(s.items), 0);

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].title = title;
    updateSections(newSections);
  };

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof PrelimItem,
    value: any
  ) => {
    const newSections = [...sections];
    const item = newSections[sectionIndex].items[itemIndex];
    if (field === "amount") {
      item.amount = parseFloat(value) || 0;
    } else {
      (item as any)[field] = value;
    }
    updateSections(newSections);
  };

  const updateSections = (newSections: PrelimSection[]) => {
    onPreliminariesUpdate(newSections);
    onSaveToQuote(newSections); // Auto-save on any change
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    const newItemNo = `A${
      newSections[sectionIndex].items.filter((i) => !i.isHeader).length + 1
    }`;
    newSections[sectionIndex].items.push({
      itemNo: newItemNo,
      description: "",
      amount: 0,
    });
    updateSections(newSections);
  };

  const addHeader = (sectionIndex: number) => {
    const newSections = [...sections];
    const newItemNo = `HDR-${
      newSections[sectionIndex].items.filter((i) => i.isHeader).length + 1
    }`;
    newSections[sectionIndex].items.push({
      itemNo: newItemNo,
      description: "New Heading/Note",
      amount: 0,
      isHeader: true,
    });
    updateSections(newSections);
  };

  const addSection = () => {
    const newSections = [
      ...sections,
      { title: `Section ${sections.length + 1}`, items: [] },
    ];
    updateSections(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    updateSections(newSections);
  };

  const removeSection = (sectionIndex: number) => {
    if (sections.length <= 1) return;
    const newSections = [...sections];
    newSections.splice(sectionIndex, 1);
    updateSections(newSections);
  };
  // Toggle edit mode for a row and save when exiting edit mode
  const toggleEdit = (sectionIndex: number, itemIndex: number) => {
    setEditingItem((prev) => {
      if (
        prev?.sectionIndex === sectionIndex &&
        prev?.itemIndex === itemIndex
      ) {
        // We're switching from edit to save mode - save to quote
        onSaveToQuote(sections);
        return null; // Save and exit editing
      }
      return { sectionIndex, itemIndex }; // Enter editing mode
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={addSection} className="text-white">
          <FolderPlus className="w-4 h-4 mr-2" /> Add Section
        </Button>
      </div>

      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
              className="bg-background text-lg font-semibold border-none focus:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSection(sectionIndex)}
              disabled={sections.length <= 1}
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
                  <TableHead>Amount (KSh)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item, itemIndex) => {
                  const isEditing =
                    editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex;

                  return (
                    <TableRow
                      key={`${sectionIndex}-${itemIndex}-${item.itemNo}`}
                      className={
                        item.isHeader ? "bg-muted/50 font-semibold" : ""
                      }
                    >
                      <TableCell>{item.isHeader ? "" : item.itemNo}</TableCell>
                      <TableCell>
                        {isEditing ? (
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
                          <span>{item.description}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.isHeader ? (
                          ""
                        ) : isEditing ? (
                          <Input
                            type="number"
                            value={item.amount || 0}
                            onChange={(e) =>
                              updateItem(
                                sectionIndex,
                                itemIndex,
                                "amount",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          `KSh ${(item.amount || 0).toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEdit(sectionIndex, itemIndex)}
                          >
                            {isEditing ? (
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
                  );
                })}

                {section.items.length > 0 && (
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2} className="text-right">
                      Section Total:
                    </TableCell>
                    <TableCell>
                      KSh{" "}
                      {calculateSectionTotal(section.items).toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex space-x-2 mt-4">
              <Button variant="outline" onClick={() => addItem(sectionIndex)}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
              <Button variant="outline" onClick={() => addHeader(sectionIndex)}>
                <Type className="w-4 h-4 mr-2" /> Add Header/Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {sections.length > 0 && sections.some((s) => s.items.length > 0) && (
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
      )}
    </div>
  );
};

export default PreliminariesBuilder;
