// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback } from "react";

export interface ServiceItem {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  total: number;
  days: number;
  unit: string;
  payment_plan: "full" | "interval";
}

interface UseServicesCalculatorProps {
  quoteData: any;
  setQuoteData: (updater: (prev: any) => any) => void;
}

export const useServicesCalculator = ({
  quoteData,
  setQuoteData,
}: UseServicesCalculatorProps) => {
  const services = quoteData.services || [];

  const addService = useCallback(
    (service: any, isCustom: boolean = false) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: [
          ...prev.services,
          {
            ...service,
            payment_plan: isCustom ? "interval" : "full",
            total: isCustom
              ? service.price * (service.days || 1)
              : service.price,
            days: service.days || 1,
            unit: service.unit || "item",
          },
        ],
      }));
    },
    [setQuoteData],
  );

  const removeService = useCallback(
    (serviceId: string | number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.filter((s: ServiceItem) => s.id !== serviceId),
      }));
    },
    [setQuoteData],
  );

  const updatePaymentPlan = useCallback(
    (serviceId: string | number, paymentPlan: "full" | "interval") => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId
            ? {
                ...service,
                payment_plan: paymentPlan,
                total:
                  paymentPlan === "full"
                    ? service.price
                    : (service.price || 0) * (service.days || 1),
              }
            : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateCost = useCallback(
    (serviceId: string | number, cost: number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId
            ? {
                ...service,
                total:
                  service.payment_plan === "full"
                    ? cost
                    : cost * (service.days || 1),
                price:
                  service.payment_plan === "interval" ? cost : service.price,
              }
            : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateUnit = useCallback(
    (serviceId: string | number, unit: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId ? { ...service, unit } : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateDays = useCallback(
    (serviceId: string | number, days: number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId
            ? {
                ...service,
                days,
                total: (service.price || 0) * days,
              }
            : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateServiceName = useCallback(
    (serviceId: string | number, name: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId ? { ...service, name } : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateServiceCategory = useCallback(
    (serviceId: string | number, category: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId ? { ...service, category } : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateServiceDescription = useCallback(
    (serviceId: string | number, description: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        services: prev.services.map((service: ServiceItem) =>
          service.id === serviceId ? { ...service, description } : service,
        ),
      }));
    },
    [setQuoteData],
  );

  const getService = useCallback(
    (serviceId: string | number) => {
      return services.find((s: ServiceItem) => s.id === serviceId);
    },
    [services],
  );

  const isServiceSelected = useCallback(
    (serviceId: string | number) => {
      return services.some((s: ServiceItem) => s.id === serviceId);
    },
    [services],
  );

  const calculateTotalServicesCost = useCallback(() => {
    return services.reduce((sum: number, service: ServiceItem) => {
      return sum + (service.total || 0);
    }, 0);
  }, [services]);

  return {
    services,
    addService,
    removeService,
    updatePaymentPlan,
    updateCost,
    updateUnit,
    updateDays,
    updateServiceName,
    updateServiceCategory,
    updateServiceDescription,
    getService,
    isServiceSelected,
    calculateTotalServicesCost,
  };
};

export default useServicesCalculator;
