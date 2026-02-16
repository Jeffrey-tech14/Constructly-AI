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
import { Zap, Trash } from "lucide-react";
import { motion } from "framer-motion";
import useSubcontractorsCalculator from "@/hooks/useSubcontractorsCalculator";

interface SubcontractorsSelectorProps {
  quoteData: any;
  setQuoteData: (updater: (prev: any) => any) => void;
  subContractors: any[];
}

export const SubcontractorsSelector: React.FC<SubcontractorsSelectorProps> = ({
  quoteData,
  setQuoteData,
  subContractors,
}) => {
  const {
    updatePaymentPlan,
    updateCost,
    updateDays,
    updateSubcontractorName,
    removeSubcontractor,
    getSubcontractor,
    isSubcontractorSelected,
  } = useSubcontractorsCalculator({
    quoteData,
    setQuoteData,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg  mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Zap className="w-5 h-5" />
          Subcontractor Charges
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {subContractors
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((service) => {
              const isChecked = isSubcontractorSelected(service.id);
              const selectedSubcontractor = getSubcontractor(service.id);

              return (
                <Card
                  key={service.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="grid grid-cols-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuoteData((prev: any) => ({
                              ...prev,
                              subcontractors: [
                                ...prev.subcontractors,
                                {
                                  ...service,
                                  subcontractor_payment_plan: "full",
                                  total: service.price,
                                },
                              ],
                            }));
                          } else {
                            removeSubcontractor(service.id);
                          }
                        }}
                      />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <Badge className="text-black" variant="secondary">
                        KSh {service.price.toLocaleString()}/{service.unit}
                      </Badge>
                    </div>
                  </div>
                  {isChecked && selectedSubcontractor && (
                    <div className="mt-3 animate-fade-in space-y-3">
                      <div>
                        <Label className="text-gray-900 dark:text-white">
                          Payment Plan *
                        </Label>
                        <Select
                          value={
                            selectedSubcontractor.subcontractor_payment_plan ||
                            "full"
                          }
                          onValueChange={(value: "daily" | "full") =>
                            updatePaymentPlan(service.id, value)
                          }
                        >
                          <SelectTrigger className="">
                            <SelectValue placeholder="Select Payment Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Amount</SelectItem>
                            <SelectItem value="daily">
                              Daily Payments
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor={`contractorCost-${service.id}`}
                          className="text-gray-900 dark:text-white"
                        >
                          Contractor Cost
                        </Label>
                        <Input
                          id={`contractorCost-${service.id}`}
                          type="number"
                          min="0"
                          value={
                            selectedSubcontractor.subcontractor_payment_plan ===
                            "full"
                              ? selectedSubcontractor.total || service.price
                              : selectedSubcontractor.price || service.price
                          }
                          placeholder={
                            selectedSubcontractor.subcontractor_payment_plan ===
                            "full"
                              ? "Total cost"
                              : "Daily rate"
                          }
                          onChange={(e) =>
                            updateCost(
                              service.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className=""
                        />
                      </div>
                      {selectedSubcontractor.subcontractor_payment_plan ===
                        "daily" && (
                        <div>
                          <Label
                            htmlFor={`days-${service.id}`}
                            className="text-gray-900 dark:text-white"
                          >
                            Number of Days
                          </Label>
                          <Input
                            id={`days-${service.id}`}
                            type="number"
                            min="1"
                            value={selectedSubcontractor.days || ""}
                            placeholder="e.g., 5"
                            onChange={(e) =>
                              updateDays(
                                service.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className=""
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

          {/* Custom Subcontractors */}
          {quoteData.subcontractors
            .filter(
              (s: any) => !subContractors.some((srv: any) => srv.id === s.id),
            )
            .map((sub: any) => (
              <Card
                key={sub.id}
                className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={sub.name}
                      placeholder="Subcontractor name"
                      onChange={(e) =>
                        updateSubcontractorName(sub.id, e.target.value)
                      }
                      className=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={sub.subcontractor_payment_plan || "full"}
                      onValueChange={(value: "daily" | "full") =>
                        updatePaymentPlan(sub.id, value)
                      }
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="Payment Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Amount</SelectItem>
                        <SelectItem value="daily">Daily Payments</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      placeholder={
                        sub.subcontractor_payment_plan === "full"
                          ? "Total cost"
                          : "Daily rate"
                      }
                      value={
                        sub.subcontractor_payment_plan === "full"
                          ? sub.total || ""
                          : sub.price || ""
                      }
                      onChange={(e) =>
                        updateCost(sub.id, parseFloat(e.target.value) || 0)
                      }
                      className=""
                    />
                    {sub.subcontractor_payment_plan === "daily" && (
                      <Input
                        type="number"
                        min="1"
                        placeholder="Days"
                        value={sub.days || ""}
                        onChange={(e) =>
                          updateDays(sub.id, parseInt(e.target.value) || 0)
                        }
                        className=""
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSubcontractor(sub.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

          <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
            <Button
              onClick={() => {
                const newId = `custom-${Date.now()}`;
                setQuoteData((prev: any) => ({
                  ...prev,
                  subcontractors: [
                    ...prev.subcontractors,
                    {
                      id: newId,
                      name: "",
                      unit: "day",
                      price: 0,
                      total: 0,
                      days: 1,
                      subcontractor_payment_plan: "daily",
                    },
                  ],
                }));
              }}
              className="rounded-full  shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                padding: "0.75rem 2rem",
              }}
            >
              + Add Custom Subcontractor
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default SubcontractorsSelector;
