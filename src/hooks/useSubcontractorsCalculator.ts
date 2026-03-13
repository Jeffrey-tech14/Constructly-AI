// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback } from "react";

export interface SubcontractorItem {
  id: string | number;
  name: string;
  unit: string;
  price: number;
  total: number;
  days: number;
  subcontractor_payment_plan: "full" | "daily";
}

interface UseSubcontractorsCalculatorProps {
  quoteData: any;
  setQuoteData: (updater: (prev: any) => any) => void;
}

export const useSubcontractorsCalculator = ({
  quoteData,
  setQuoteData,
}: UseSubcontractorsCalculatorProps) => {
  const subcontractors = quoteData.subcontractors || [];

  const addSubcontractor = useCallback(
    (subcontractor: any) => {
      setQuoteData((prev: any) => ({
        ...prev,
        subcontractors: [
          ...prev.subcontractors,
          {
            ...subcontractor,
            subcontractor_payment_plan: "full",
            total: subcontractor.price,
            days: subcontractor.days || 1,
          },
        ],
      }));
    },
    [setQuoteData],
  );

  const removeSubcontractor = useCallback(
    (subcontractorId: string | number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        subcontractors: prev.subcontractors.filter(
          (s: SubcontractorItem) => s.id !== subcontractorId,
        ),
      }));
    },
    [setQuoteData],
  );

  const updatePaymentPlan = useCallback(
    (subcontractorId: string | number, paymentPlan: "full" | "daily") => {
      setQuoteData((prev: any) => ({
        ...prev,
        subcontractors: prev.subcontractors.map((sub: SubcontractorItem) =>
          sub.id === subcontractorId
            ? {
                ...sub,
                subcontractor_payment_plan: paymentPlan,
                total: paymentPlan === "full" ? sub.price : sub.total,
                price:
                  paymentPlan === "daily" ? sub.price : sub.total || sub.price,
              }
            : sub,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateCost = useCallback(
    (subcontractorId: string | number, cost: number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        subcontractors: prev.subcontractors.map((sub: SubcontractorItem) =>
          sub.id === subcontractorId
            ? {
                ...sub,
                total:
                  sub.subcontractor_payment_plan === "full" ? cost : sub.total,
                price:
                  sub.subcontractor_payment_plan === "daily" ? cost : sub.price,
              }
            : sub,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateDays = useCallback(
    (subcontractorId: string | number, days: number) => {
      setQuoteData((prev: any) => ({
        ...prev,
        subcontractors: prev.subcontractors.map((sub: SubcontractorItem) =>
          sub.id === subcontractorId
            ? {
                ...sub,
                days,
              }
            : sub,
        ),
      }));
    },
    [setQuoteData],
  );

  const updateSubcontractorName = useCallback(
    (subcontractorId: string | number, name: string) => {
      setQuoteData((prev: any) => ({
        ...prev,
        subcontractors: prev.subcontractors.map((sub: SubcontractorItem) =>
          sub.id === subcontractorId ? { ...sub, name } : sub,
        ),
      }));
    },
    [setQuoteData],
  );

  const getSubcontractor = useCallback(
    (subcontractorId: string | number) => {
      return subcontractors.find(
        (s: SubcontractorItem) => s.id === subcontractorId,
      );
    },
    [subcontractors],
  );

  const isSubcontractorSelected = useCallback(
    (subcontractorId: string | number) => {
      return subcontractors.some(
        (s: SubcontractorItem) => s.id === subcontractorId,
      );
    },
    [subcontractors],
  );

  const calculateTotalSubcontractorsCost = useCallback(() => {
    return subcontractors.reduce((sum: number, sub: SubcontractorItem) => {
      return sum + (sub.total || 0);
    }, 0);
  }, [subcontractors]);

  return {
    subcontractors,
    addSubcontractor,
    removeSubcontractor,
    updatePaymentPlan,
    updateCost,
    updateDays,
    updateSubcontractorName,
    getSubcontractor,
    isSubcontractorSelected,
    calculateTotalSubcontractorsCost,
  };
};

export default useSubcontractorsCalculator;
