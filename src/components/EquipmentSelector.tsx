// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import useEquipmentCalculator from "@/hooks/useEquipmentCalculator";

interface EquipmentSelectorProps {
  quoteData: any;
  setQuoteData: (updater: (prev: any) => any) => void;
  equipmentRates: any[];
  customEquipment: any[];
}

export const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  quoteData,
  setQuoteData,
  equipmentRates,
  customEquipment,
}) => {
  const {
    equipment,
    addEquipment,
    removeEquipment,
    updateQuantity,
    updateUnit,
    updateRate,
    updateName,
    getEquipmentItem,
    isEquipmentSelected,
  } = useEquipmentCalculator(quoteData, setQuoteData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Wrench className="w-5 h-5" />
          Select Required Equipment
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Standard Equipment */}
          {equipmentRates
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((equipmentItem) => {
              const isChecked = isEquipmentSelected(equipmentItem.id);
              const selectedEquipment = getEquipmentItem(equipmentItem.id);

              return (
                <Card key={equipmentItem.id} className="p-6">
                  <div className="items-center justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addEquipment(equipmentItem, false);
                            } else {
                              removeEquipment(equipmentItem.id);
                            }
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {equipmentItem.name}
                          </h4>
                          {equipmentItem.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {equipmentItem.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isChecked && selectedEquipment && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label
                                htmlFor={`quantity-${equipmentItem.id}`}
                                className="text-gray-900 dark:text-white"
                              >
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${equipmentItem.id}`}
                                type="number"
                                min="0"
                                step="0.1"
                                value={selectedEquipment.usage_quantity || 1}
                                onChange={(e) =>
                                  updateQuantity(
                                    equipmentItem.id,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`unit-${equipmentItem.id}`}
                                className="text-gray-900 dark:text-white"
                              >
                                Unit
                              </Label>
                              <div id={`unit-${equipmentItem.id}`}>
                                <Select
                                  value={selectedEquipment.usage_unit || "day"}
                                  onValueChange={(value) =>
                                    updateUnit(equipmentItem.id, value)
                                  }
                                >
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hour">Hour</SelectItem>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="unit">Unit</SelectItem>
                                    <SelectItem value="trip">Trip</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor={`rate-${equipmentItem.id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Rate per {selectedEquipment.usage_unit || "unit"}
                            </Label>
                            <Input
                              id={`rate-${equipmentItem.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={selectedEquipment.rate_per_unit || 0}
                              onChange={(e) =>
                                updateRate(
                                  equipmentItem.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`total-${equipmentItem.id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Total Cost
                            </Label>
                            <Input
                              id={`total-${equipmentItem.id}`}
                              type="text"
                              readOnly
                              value={`KES ${(
                                selectedEquipment.total_cost || 0
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                              className="bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {selectedEquipment.usage_quantity || 0}{" "}
                              {selectedEquipment.usage_unit || "unit"} × KES
                              {(
                                selectedEquipment.rate_per_unit || 0
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                              /{selectedEquipment.usage_unit || "unit"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

          {/* Custom Equipment from Database */}
          {customEquipment
            .sort((a, b) => a.equipment_name.localeCompare(b.equipment_name))
            .map((customEq) => {
              const isChecked = isEquipmentSelected(customEq.id);
              const selectedEquipment = getEquipmentItem(customEq.id);

              return (
                <Card
                  key={customEq.id}
                  className="p-6 border-l-4 border-l-blue-500"
                >
                  <div className="items-center justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addEquipment(customEq, true);
                            } else {
                              removeEquipment(customEq.id);
                            }
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {customEq.equipment_name}
                            <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              Custom
                            </Badge>
                          </h4>
                          {customEq.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {customEq.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isChecked && selectedEquipment && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label
                                htmlFor={`quantity-${customEq.id}`}
                                className="text-gray-900 dark:text-white"
                              >
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${customEq.id}`}
                                type="number"
                                min="0"
                                step="0.1"
                                value={selectedEquipment.usage_quantity || 1}
                                onChange={(e) =>
                                  updateQuantity(
                                    customEq.id,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`unit-${customEq.id}`}
                                className="text-gray-900 dark:text-white"
                              >
                                Unit
                              </Label>
                              <div id={`unit-${customEq.id}`}>
                                <Select
                                  value={selectedEquipment.usage_unit || "day"}
                                  onValueChange={(value) =>
                                    updateUnit(customEq.id, value)
                                  }
                                >
                                  <SelectTrigger className="h-10 w-full">
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hour">Hour</SelectItem>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="unit">Unit</SelectItem>
                                    <SelectItem value="trip">Trip</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor={`rate-${customEq.id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Rate per {selectedEquipment.usage_unit || "unit"}
                            </Label>
                            <Input
                              id={`rate-${customEq.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={selectedEquipment.rate_per_unit || 0}
                              onChange={(e) =>
                                updateRate(
                                  customEq.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`total-${customEq.id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Total Cost
                            </Label>
                            <Input
                              id={`total-${customEq.id}`}
                              type="text"
                              readOnly
                              value={`KES ${(
                                selectedEquipment.total_cost || 0
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                              className="bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {selectedEquipment.usage_quantity || 0}{" "}
                              {selectedEquipment.usage_unit || "unit"} × KES
                              {(
                                selectedEquipment.rate_per_unit || 0
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                              /{selectedEquipment.usage_unit || "unit"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

          {/* Orphaned Equipment (custom added items) */}
          {equipment
            .filter(
              (eq: any) =>
                !equipmentRates.some(
                  (e: any) => e.id === eq.equipment_type_id,
                ) &&
                !customEquipment.some(
                  (ce: any) => ce.id === eq.equipment_type_id,
                ),
            )
            .map((eq: any) => {
              const totalCost =
                (eq.usage_quantity || 0) * (eq.rate_per_unit || 0);
              return (
                <Card
                  key={eq.equipment_type_id}
                  className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-2 items-center justify-center sm:space-x-2">
                        <Label
                          htmlFor={`name-${eq.equipment_type_id}`}
                          className="whitespace-nowrap sm:mb-0 mb-1"
                        >
                          Equipment Name
                        </Label>
                        <Input
                          id={`name-${eq.equipment_type_id}`}
                          type="text"
                          value={eq.name}
                          onChange={(e) =>
                            updateName(eq.equipment_type_id, e.target.value)
                          }
                          placeholder="e.g., Specialized Crane"
                          className="flex-1"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="justify-center"
                        onClick={() => removeEquipment(eq.equipment_type_id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor={`custom-quantity-${eq.equipment_type_id}`}
                          className="text-gray-900 dark:text-white"
                        >
                          Quantity
                        </Label>
                        <Input
                          id={`custom-quantity-${eq.equipment_type_id}`}
                          type="number"
                          min="0"
                          step="0.1"
                          value={eq.usage_quantity || 1}
                          onChange={(e) =>
                            updateQuantity(
                              eq.equipment_type_id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`custom-unit-${eq.equipment_type_id}`}
                          className="text-gray-900 dark:text-white"
                        >
                          Unit
                        </Label>
                        <Select
                          value={eq?.usage_unit}
                          onValueChange={(value) =>
                            updateUnit(eq.equipment_type_id, value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hour">Hour</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="unit">Unit</SelectItem>
                            <SelectItem value="trip">Trip</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor={`custom-rate-${eq.equipment_type_id}`}
                        className="text-gray-900 dark:text-white"
                      >
                        Rate per {eq.usage_unit || "unit"}
                      </Label>
                      <Input
                        id={`custom-rate-${eq.equipment_type_id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={eq.rate_per_unit || 0}
                        onChange={(e) =>
                          updateRate(
                            eq.equipment_type_id,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`custom-total-${eq.equipment_type_id}`}
                        className="text-gray-900 dark:text-white"
                      >
                        Total Cost
                      </Label>
                      <Input
                        id={`custom-total-${eq.equipment_type_id}`}
                        type="text"
                        readOnly
                        value={`KES ${totalCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                        className="bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {eq.usage_quantity || 0} {eq.usage_unit || "unit"} × KES
                        {(eq.rate_per_unit || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        /{eq.usage_unit || "unit"}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}

          {/* Add Custom Equipment Button */}
          <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
            <Button
              onClick={() => {
                const customId = uuidv4();
                setQuoteData((prev: any) => ({
                  ...prev,
                  equipment: [
                    ...prev.equipment,
                    {
                      equipment_type_id: customId,
                      name: "",
                      usage_quantity: 1,
                      usage_unit: "day",
                      rate_per_unit: 0,
                      total_cost: 0,
                    },
                  ],
                }));
              }}
              className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                padding: "0.75rem 2rem",
              }}
            >
              + Add Custom Equipment
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default EquipmentSelector;
