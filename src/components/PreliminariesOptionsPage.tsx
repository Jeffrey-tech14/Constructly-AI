// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export interface PreliminaryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  isApplicable: boolean;
  totalCost: number;
  area?: number; // For site clearance
  rate?: number; // For site clearance
}

interface PreliminariesOptionsPageProps {
  quoteData: any;
  onPreliminaryUpdate: (preliminaries: PreliminaryOption[]) => void;
}

const PreliminariesOptionsPage = ({
  quoteData,
  onPreliminaryUpdate,
}: PreliminariesOptionsPageProps) => {
  const { toast } = useToast();

  const houseType = quoteData?.house_type.toLowerCase() || "";
  const isHighRise =
    quoteData?.project_type.toLowerCase() === "commercial" ||
    quoteData?.floors > 3;
  const isLowRise = houseType === "bungalow" || houseType === "mansionette";

  // Site clearance specific state
  const [siteClearanceArea, setSiteClearanceArea] = useState(
    quoteData?.total_area * 3 || 100,
  );
  const [siteClearanceRate, setSiteClearanceRate] = useState(1000);

  // Initialize preliminaries from quoteData or create defaults
  const [preliminaries, setPreleminaries] = useState<PreliminaryOption[]>(
    () => {
      if (
        quoteData?.preliminaryOptions.length > 0 &&
        Array.isArray(quoteData.preliminaryOptions)
      ) {
        return quoteData.preliminaryOptions;
      }

      // Site clearance rate per m² (default: 1000 KES per m²)
      const clearanceRate = 1000;
      const clearanceArea = siteClearanceArea || 100;
      const clearanceCost = clearanceRate * clearanceArea;

      return [
        {
          id: "site-clearance",
          name: "Site Clearance",
          description: `Area: ${clearanceArea}m² | Rate: KES ${clearanceRate.toLocaleString()}/m² = KES ${clearanceCost.toLocaleString()}`,
          price: clearanceCost,
          quantity: 1,
          unit: "lump sum",
          isApplicable: true,
          totalCost: clearanceCost,
          area: clearanceArea,
          rate: clearanceRate,
        },
        {
          id: "sign-board",
          name: "Sign Board",
          description: "Project identification and safety signage",
          price: 15000,
          quantity: 1,
          unit: "lump sum",
          isApplicable: true,
          totalCost: 15000,
        },
        {
          id: "hoarding",
          name: "Hoarding",
          description: "Site boundary fencing",
          price: 50000,
          quantity: 1,
          unit: "lump sum",
          isApplicable: !isLowRise,
          totalCost: isLowRise ? 0 : 50000,
        },
        {
          id: "nets",
          name: "Safety Nets",
          description: "Safety nets for site protection",
          price: 25000,
          quantity: 1,
          unit: "lump sum",
          isApplicable: !isLowRise,
          totalCost: isLowRise ? 0 : 25000,
        },
        {
          id: "fall-prevention",
          name: "Fall Prevention Fence",
          description: "Safety barriers for high-rise construction",
          price: 120000,
          quantity: 1,
          unit: "lump sum",
          isApplicable: isHighRise && !isLowRise,
          totalCost: isHighRise && !isLowRise ? 120000 : 0,
        },
      ];
    },
  );

  // Note: We no longer auto-update applicability based on house type
  // Users can now toggle any item on/off as needed

  // Update site clearance when area or rate changes
  useEffect(() => {
    const siteClearanceCost = siteClearanceArea * siteClearanceRate;
    setPreleminaries((prev) =>
      prev.map((prel) =>
        prel.id === "site-clearance"
          ? {
              ...prel,
              price: siteClearanceCost,
              totalCost: siteClearanceCost,
              description: `Area: ${siteClearanceArea}m² | Rate: KES ${siteClearanceRate.toLocaleString()}/m² = KES ${siteClearanceCost.toLocaleString()}`,
              area: siteClearanceArea,
              rate: siteClearanceRate,
            }
          : prel,
      ),
    );
  }, [siteClearanceArea, siteClearanceRate]);

  useEffect(() => {
    const selectedPrelimaries = preliminaries.filter((p) => p.isApplicable);
    onPreliminaryUpdate(selectedPrelimaries);
  }, [preliminaries]);

  const togglePreliminary = (id: string) => {
    setPreleminaries((prev) =>
      prev.map((prel) =>
        prel.id === id
          ? {
              ...prel,
              isApplicable: !prel.isApplicable,
              totalCost: !prel.isApplicable ? prel.price * prel.quantity : 0,
            }
          : prel,
      ),
    );
  };

  const updatePrice = (id: string, price: number) => {
    setPreleminaries((prev) =>
      prev.map((prel) =>
        prel.id === id
          ? {
              ...prel,
              price,
              totalCost: prel.isApplicable ? price * prel.quantity : 0,
            }
          : prel,
      ),
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    setPreleminaries((prev) =>
      prev.map((prel) =>
        prel.id === id
          ? {
              ...prel,
              quantity,
              totalCost: prel.isApplicable ? prel.price * quantity : 0,
            }
          : prel,
      ),
    );
  };

  const calculateTotal = () =>
    preliminaries
      .filter((prel) => prel.isApplicable)
      .reduce((sum, prel) => sum + prel.totalCost, 0);

  const getApplicabilityNote = (prelId: string) => {
    if ((prelId === "hoarding" || prelId === "nets") && isLowRise) {
      return "Not applicable for most buidlings";
    }
    if (prelId === "fall-prevention" && !isHighRise) {
      return "Only applicable for high-rise buildings";
    }
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
          Preliminaries & Statutory Requirements
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Configure preliminary works and statutory requirements for your
          project
        </p>
      </div>

      {/* Project Type Information */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Customize Preliminary Works
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Select the preliminary items you need for your project. Some items are recommended for specific building types, but you can include any that apply to your project.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preliminaries Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {preliminaries.map((preliminary) => {
          const applicabilityNote = getApplicabilityNote(preliminary.id);

          return (
            <Card
              key={preliminary.id}
              className="transition-all border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={preliminary.isApplicable}
                      onCheckedChange={() =>
                        togglePreliminary(preliminary.id)
                      }
                      className="mt-1"
                      title={preliminary.name}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {preliminary.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {preliminary.description}
                      </p>
                      {applicabilityNote && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                          💡 {applicabilityNote}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {preliminary.isApplicable && (
                <CardContent className="space-y-4">
                  {/* Site Clearance specific inputs */}
                  {preliminary.id === "site-clearance" && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <Label
                          htmlFor="site-clearance-area"
                          className="text-xs"
                        >
                          Area (m²)
                        </Label>
                        <Input
                          id="site-clearance-area"
                          type="number"
                          min="0"
                          step="1"
                          value={siteClearanceArea}
                          onChange={(e) =>
                            setSiteClearanceArea(
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="site-clearance-rate"
                          className="text-xs"
                        >
                          Rate (KES/m²)
                        </Label>
                        <Input
                          id="site-clearance-rate"
                          type="number"
                          min="0"
                          step="100"
                          value={siteClearanceRate}
                          onChange={(e) =>
                            setSiteClearanceRate(
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Standard inputs for other items */}
                  {preliminary.id !== "site-clearance" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor={`price-${preliminary.id}`}
                          className="text-xs"
                        >
                          Unit Price (KES)
                        </Label>
                        <Input
                          id={`price-${preliminary.id}`}
                          type="number"
                          min="0"
                          step="1000"
                          value={preliminary.price}
                          onChange={(e) =>
                            updatePrice(
                              preliminary.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`quantity-${preliminary.id}`}
                          className="text-xs"
                        >
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${preliminary.id}`}
                          type="number"
                          min="0"
                          step="0.1"
                          value={preliminary.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              preliminary.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total Cost:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        KES {preliminary.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}

              {!preliminary.isApplicable && (
                <CardContent className="py-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Check to include this item
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Preliminaries Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {preliminaries
              .filter((p) => p.isApplicable)
              .map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {p.name}
                  </span>
                  <span className=" text-gray-900 dark:text-white">
                    KES {p.totalCost.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
          <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                Total Preliminaries Cost
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                KES {calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Note:</strong> These preliminaries will be included in your
          final Bill of Quantities. Prices and quantities can be adjusted based
          on actual site requirements and project scope.
        </p>
      </div>
    </motion.div>
  );
};

export default PreliminariesOptionsPage;
