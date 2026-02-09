// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import usePaintingCalculator from "@/hooks/usePaintingCalculator";
import PaintingLayerConfig from "@/components/PaintingLayerConfig";
import {
  PaintingSpecification,
  DEFAULT_PAINTING_CONFIG,
  DEFAULT_COVERAGE_RATES,
} from "@/types/painting";
import { add } from "date-fns";

interface PaintingCalculatorProps {
  materialPrices: any[];
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
  wallDimensions?: any;
}

export default function PaintingCalculator({
  materialPrices,
  readonly = false,
  setQuoteData,
  quote,
  wallDimensions,
}: PaintingCalculatorProps) {
  const [hasInitializedPaintings, setHasInitializedPaintings] = useState(false);

  // Initialize painting calculator for paint finishes
  const {
    paintings,
    totals: paintingTotals,
    addPainting,
    updatePainting,
    deletePainting,
  } = usePaintingCalculator({
    initialPaintings: quote?.paintings_specifications || [],
    materialPrices,
    quote,
    setQuoteData,
  });

   // Auto-create interior and exterior walls paintings
   useEffect(() => {
     if (
       !hasInitializedPaintings &&
       wallDimensions?.internalWallPerimiter &&
       wallDimensions?.internalWallHeight &&
       wallDimensions?.externalWallPerimiter &&
       wallDimensions?.externalWallHeight &&
       !readonly &&
       setQuoteData
     ) {
       const internalPerimeter =
         parseFloat(wallDimensions.internalWallPerimiter) || 0;
       const internalHeight = parseFloat(wallDimensions.internalWallHeight) || 0;
       const externalPerimeter =
         parseFloat(wallDimensions.externalWallPerimiter) || 0;
       const externalHeight = parseFloat(wallDimensions.externalWallHeight) || 0;
 
       if (
         internalPerimeter > 0 &&
         internalHeight > 0 &&
         externalPerimeter > 0 &&
         externalHeight > 0
       ) {
         const internalArea = internalPerimeter * internalHeight * 2;
         const externalArea = externalPerimeter * externalHeight;
 
         // Create both paintings directly in quote data
         const interiorPainting: PaintingSpecification = {
           id: `painting-interior-${Date.now()}`,
           surfaceArea: internalArea,
           location: "Interior Walls",
           skimming: {
             enabled: DEFAULT_PAINTING_CONFIG.skimming.enabled,
             coats: DEFAULT_PAINTING_CONFIG.skimming.coats,
             coverage: DEFAULT_COVERAGE_RATES.skimming,
           },
           undercoat: {
             enabled: DEFAULT_PAINTING_CONFIG.undercoat.enabled,
             coverage: DEFAULT_COVERAGE_RATES.undercoat,
           },
           finishingPaint: {
             category: DEFAULT_PAINTING_CONFIG.finishingPaint.category,
             subtype: DEFAULT_PAINTING_CONFIG.finishingPaint.subtype,
             coats: DEFAULT_PAINTING_CONFIG.finishingPaint.coats,
             coverage: DEFAULT_COVERAGE_RATES.finishPaint,
           },
           calculations: {
             skimming: null,
             undercoat: null,
             finishing: null,
           },
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString(),
         };
 
         const exteriorPainting: PaintingSpecification = {
           id: `painting-exterior-${Date.now()}`,
           surfaceArea: externalArea,
           location: "Exterior Walls",
           skimming: {
             enabled: DEFAULT_PAINTING_CONFIG.skimming.enabled,
             coats: DEFAULT_PAINTING_CONFIG.skimming.coats,
             coverage: DEFAULT_COVERAGE_RATES.skimming,
           },
           undercoat: {
             enabled: DEFAULT_PAINTING_CONFIG.undercoat.enabled,
             coverage: DEFAULT_COVERAGE_RATES.undercoat,
           },
           finishingPaint: {
             category: DEFAULT_PAINTING_CONFIG.finishingPaint.category,
             subtype: DEFAULT_PAINTING_CONFIG.finishingPaint.subtype,
             coats: DEFAULT_PAINTING_CONFIG.finishingPaint.coats,
             coverage: DEFAULT_COVERAGE_RATES.finishPaint,
           },
           calculations: {
             skimming: null,
             undercoat: null,
             finishing: null,
           },
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString(),
         };
 
         setQuoteData((prev: any) => ({
           ...prev,
           paintings_specifications: [interiorPainting, exteriorPainting],
         }));
 
         setHasInitializedPaintings(true);
       }
     }
   }, [wallDimensions, readonly, setQuoteData, hasInitializedPaintings, quote]);

  return (
    <Card>
      <CardHeader className="border-b rounded-t-2xl">
                  <CardTitle className="text-lg flex items-center gap-2 ">
                    <span className="text-2xl">🎨</span> Painting Specifications
                  </CardTitle>
                  <CardDescription className="text-slate-700 dark:text-slate-300">
                    Multi-layer painting calculations with coverage-aware sizing
                  </CardDescription>
                </CardHeader>
      <CardContent className="space-y-6">
        {paintings.length > 0 && (
          paintings.map((painting) => (
             <PaintingLayerConfig
                key={painting.id}
                painting={painting}
                onUpdate={(updates) => updatePainting(painting.id, updates)}
                onDelete={() => deletePainting(painting.id)}
                wallDimensions={wallDimensions}
              />
          ))
        )}
        
        {/* Add Painting Button */}
        {!readonly && (
                      <Button
                        onClick={() => addPainting(0, "")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Painting Surface
                      </Button>
                    )}
        
                    {/* Painting Totals Summary */}
                    {paintingTotals && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 p-4 rounded-lg bg-muted ">
                        <div className="p-3 rounded-3xl">
                          <div className="text-xs font-bold ">Total Area</div>
                          <div className="text-lg font-bold ">
                            {paintingTotals.totalArea.toFixed(2)} m²
                          </div>
                        </div>
                        <div className="p-3 rounded-3xl">
                          <div className="text-xs font-bold ">Total Paint</div>
                          <div className="text-lg font-bold ">
                            {paintingTotals.totalLitres.toFixed(2)} L
                          </div>
                        </div>
                        <div className="p-3 rounded-3xl">
                          <div className="text-xs font-bold ">Total Cost</div>
                          <div className="text-lg font-bold ">
                            Ksh.{paintingTotals.totalCostWithWastage.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
      </CardContent>
    </Card>
  );
}
