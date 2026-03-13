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
import { Plus, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import useServicesCalculator from "@/hooks/useServicesCalculator";

interface ServicesSelectorProps {
  quoteData: any;
  setQuoteData: (updater: (prev: any) => any) => void;
  services: any[];
}

export const ServicesSelector: React.FC<ServicesSelectorProps> = ({
  quoteData,
  setQuoteData,
  services,
}) => {
  const {
    updatePaymentPlan,
    updateCost,
    updateUnit,
    updateDays,
    updateServiceName,
    updateServiceCategory,
    updateServiceDescription,
    removeService,
    getService,
    isServiceSelected,
  } = useServicesCalculator({
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
          <Plus className="w-5 h-5" />
          Additional Services
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {services
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((service) => {
              const isChecked = isServiceSelected(service.id);
              const selectedService = getService(service.id);

              return (
                <Card key={service.id} className="p-4">
                  <div className="grid grid-cols-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        className="text-white"
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuoteData((prev: any) => ({
                              ...prev,
                              services: [
                                ...prev.services,
                                {
                                  ...service,
                                  payment_plan: "full",
                                  total: service.price,
                                  days: 1,
                                  unit: service.unit || "item",
                                },
                              ],
                            }));
                          } else {
                            removeService(service.id);
                          }
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="text-black" variant="secondary">
                        KSh {service.price.toLocaleString()}/
                        {service.unit || "item"}
                      </Badge>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {service.category}
                      </p>
                    </div>
                  </div>

                  {isChecked && selectedService && (
                    <div className="mt-3 animate-fade-in space-y-3">
                      <div>
                        <Label className="text-gray-900 dark:text-white">
                          Payment Plan *
                        </Label>
                        <Select
                          value={selectedService.payment_plan || "full"}
                          onValueChange={(value: "interval" | "full") =>
                            updatePaymentPlan(service.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Payment Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Amount</SelectItem>
                            <SelectItem value="interval">
                              Interval Payments
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor={`serviceCost-${service.id}`}
                          className="text-gray-900 dark:text-white"
                        >
                          {selectedService.payment_plan === "full"
                            ? "Total Cost"
                            : "Rate per Unit"}
                        </Label>
                        <Input
                          id={`serviceCost-${service.id}`}
                          type="number"
                          min="0"
                          value={
                            selectedService.payment_plan === "full"
                              ? selectedService.total || service.price
                              : selectedService.price || service.price
                          }
                          placeholder={
                            selectedService.payment_plan === "full"
                              ? "Total cost"
                              : "Rate per unit"
                          }
                          onChange={(e) =>
                            updateCost(
                              service.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>

                      {selectedService.payment_plan === "interval" && (
                        <>
                          <div>
                            <Label className="text-gray-900 dark:text-white">
                              Unit
                            </Label>
                            <Select
                              value={selectedService.unit || "day"}
                              onValueChange={(value) =>
                                updateUnit(service.id, value)
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

                          <div>
                            <Label
                              htmlFor={`serviceDays-${service.id}`}
                              className="text-gray-900 dark:text-white"
                            >
                              Number of {selectedService.unit || "days"}
                            </Label>
                            <Input
                              id={`serviceDays-${service.id}`}
                              type="number"
                              min="1"
                              value={selectedService.days || ""}
                              placeholder="e.g., 5"
                              onChange={(e) =>
                                updateDays(
                                  service.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

          {/* Custom Services */}
          {quoteData.services
            .filter((s: any) => !services.some((srv: any) => srv.id === s.id))
            .map((service: any) => (
              <Card key={service.id} className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={service.name}
                      placeholder="Service name"
                      onChange={(e) =>
                        updateServiceName(service.id, e.target.value)
                      }
                    />

                    <Input
                      type="text"
                      value={service.category}
                      placeholder="Category"
                      onChange={(e) =>
                        updateServiceCategory(service.id, e.target.value)
                      }
                    />

                    {service.description && (
                      <Input
                        type="text"
                        value={service.description}
                        placeholder="Description"
                        onChange={(e) =>
                          updateServiceDescription(service.id, e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select
                      value={service.payment_plan || "full"}
                      onValueChange={(value: "interval" | "full") =>
                        updatePaymentPlan(service.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Payment Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Amount</SelectItem>
                        <SelectItem value="interval">
                          Interval Payments
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="0"
                      placeholder={
                        service.payment_plan === "full"
                          ? "Total cost"
                          : "Rate per unit"
                      }
                      value={
                        service.payment_plan === "full"
                          ? service.total || ""
                          : service.price || ""
                      }
                      onChange={(e) =>
                        updateCost(service.id, parseFloat(e.target.value) || 0)
                      }
                      className=""
                    />

                    {service.payment_plan === "interval" && (
                      <>
                        <Select
                          value={service.unit}
                          onValueChange={(value) =>
                            updateUnit(service.id, value)
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

                        <Input
                          type="number"
                          min="1"
                          placeholder={`Number of ${service.unit || "days"}`}
                          value={service.days || ""}
                          onChange={(e) =>
                            updateDays(
                              service.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeService(service.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

          <Card className="p-4 flex items-center justify-center">
            <Button
              onClick={() => {
                const customId = uuidv4();
                setQuoteData((prev: any) => ({
                  ...prev,
                  services: [
                    ...prev.services,
                    {
                      id: customId,
                      name: "",
                      description: "",
                      category: "",
                      price: 0,
                      total: 0,
                      days: 1,
                      unit: "day",
                      payment_plan: "interval",
                    },
                  ],
                }));
              }}
              className="rounded-full  shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                padding: "0.75rem 2rem",
              }}
            >
              + Add Custom Service
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ServicesSelector;
