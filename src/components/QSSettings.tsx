import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculator";
import { RebarSize } from "@/hooks/useRebarCalculator";
import { Building, DollarSign } from "lucide-react";

interface MasonrySettingsProps {
  quoteData;
  setQuoteData;
  updatePercentageField;
}

export default function QSSettings({
  quoteData,
  setQuoteData,
  updatePercentageField,
}: MasonrySettingsProps) {
  const qsSettings =
    quoteData?.qsSettings !== null
      ? quoteData.qsSettings
      : {
          wastageBlocksPercent: 5,
          wastageCementPercent: 5,
          wastageSandPercent: 7,
          wastageWaterPercent: 11,
          wastageStonePercent: 5,
          clientProvidesWater: true,
          cementWaterRatio: "0.5",
          sandMoistureContentPercent: 4,
          otherSiteWaterAllowanceLM3: 5,
          aggregateMoistureContentPercent: 4,
          aggregateAbsorptionPercent: 1.5,
          curingWaterRateLM2PerDay: 5,
          curingDays: 3,
          mortarJointThicknessM: 0.01,
          concreteMixRatio: "1:2:4",
          concreteWaterCementRatio: 0.5,
          lintelRebarSize: "Y12" as RebarSize,
          verticalRebarSize: "Y12" as RebarSize,
          bedJointRebarSize: "Y8" as RebarSize,
          includesLintels: true,
          includesReinforcement: false,
          includesDPC: true,
          includesScaffolding: true,
          includesMovementJoints: false,
          includesWasteRemoval: true,
          lintelDepth: 0.15,
          lintelWidth: 0.2,
          reinforcementSpacing: 3,
          verticalReinforcementSpacing: 1.2,
          DPCWidth: 0.225,
          movementJointSpacing: 6,
          scaffoldingDailyRate: 150,
          wasteRemovalRate: 800,
        };
  const [localSettings, setLocalSettings] =
    useState<MasonryQSSettings>(qsSettings);

  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuoteData((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuoteData]
  );

  useEffect(() => {
    setQuoteData((prev) => ({
      ...prev,
      qsSettings: qsSettings,
    }));
  }, []);

  const handleChange = (key: keyof MasonryQSSettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const handleNumericChange = (key: keyof MasonryQSSettings, value: string) => {
    const numValue = parseFloat(value);
    handleChange(key, isNaN(numValue) ? 0 : numValue);
  };

  const handleReset = () => {
    const defaultSettings: MasonryQSSettings = {
      wastageBlocksPercent: 5,
      wastageCementPercent: 5,
      wastageSandPercent: 7,
      wastageWaterPercent: 10,
      wastageStonePercent: 5,
      clientProvidesWater: true,
      cementWaterRatio: "0.5",
      sandMoistureContentPercent: 4,
      otherSiteWaterAllowanceLM3: 5,
      aggregateMoistureContentPercent: 4,
      aggregateAbsorptionPercent: 1.5,
      curingWaterRateLM2PerDay: 5,
      curingDays: 3,
      mortarJointThicknessM: 0.01,
      includesLintels: true,
      includesReinforcement: false,
      includesDPC: true,
      includesScaffolding: true,
      includesMovementJoints: false,
      includesWasteRemoval: true,
      lintelDepth: 0.15,
      lintelWidth: 0.2,
      reinforcementSpacing: 3,
      verticalReinforcementSpacing: 1.2,
      DPCWidth: 0.225,
      movementJointSpacing: 6,
      scaffoldingDailyRate: 150,
      wasteRemovalRate: 800,
      concreteMixRatio: "1:2:4",
      concreteWaterCementRatio: 0.5,
      lintelRebarSize: "Y12",
      verticalRebarSize: "Y12",
      bedJointRebarSize: "Y8",
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const houseTypes = [
    { value: "Bungalow", label: "Bungalow" },
    { value: "Maisonette", label: "Maisonette" },
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Mansion", label: "Mansion" },
  ];
  return (
    <div className="space-y-6 overflow-y-auto p-1">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">QS Settings</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Building className="w-5 h-5" />
            House Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="houseType"
              className="text-gray-900 dark:text-white"
            >
              House Type *
            </Label>
            <Select
              required
              value={quoteData.house_type}
              onValueChange={(value) =>
                setQuoteData((prev) => ({
                  ...prev,
                  house_type: value,
                }))
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select house type" />
              </SelectTrigger>
              <SelectContent>
                {houseTypes.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="floors" className="text-gray-900 dark:text-white">
              Floors *
            </Label>
            <Input
              id="floors"
              placeholder="Number of floors"
              type="number"
              min="0"
              value={quoteData.floors}
              required
              onChange={(e) => {
                setQuoteData((prev) => ({
                  ...prev,
                  floors: parseFloat(e.target.value),
                }));
              }}
              className=""
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <DollarSign className="w-5 h-5" />
            Financial Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="laborPercentage"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                Labor %
              </Label>
              <Input
                id="laborPercentage"
                type="number"
                min="0"
                required
                placeholder="10"
                value={quoteData?.percentages[0]?.labour ?? ""}
                onChange={(e) =>
                  updatePercentageField("labour", parseFloat(e.target.value))
                }
                className=" text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="overheadPercentage"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                Overhead %
              </Label>
              <Input
                id="overheadPercentage"
                type="number"
                min="0"
                required
                placeholder="10"
                value={quoteData?.percentages[0]?.overhead ?? ""}
                onChange={(e) =>
                  updatePercentageField("overhead", parseFloat(e.target.value))
                }
                className=" text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="profitPercentage"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                Profit %
              </Label>
              <Input
                id="profitPercentage"
                type="number"
                min="0"
                required
                placeholder="5"
                value={quoteData.percentages[0]?.profit ?? ""}
                onChange={(e) =>
                  updatePercentageField("profit", parseFloat(e.target.value))
                }
                className=" text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="contingencyPercentage"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                Contingency %
              </Label>
              <Input
                id="contingencyPercentage"
                type="number"
                min="0"
                required
                placeholder="5"
                value={quoteData.percentages[0]?.contingency ?? ""}
                onChange={(e) =>
                  updatePercentageField(
                    "contingency",
                    parseFloat(e.target.value)
                  )
                }
                className=" text-sm"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="permitCost"
              className="text-gray-900 dark:text-white"
            >
              Permit Cost (KSh)
            </Label>
            <Input
              id="permitCost"
              type="number"
              min="0"
              required
              placeholder="50000"
              value={quoteData.permit_cost}
              onChange={(e) =>
                setQuoteData((prev) => ({
                  ...prev,
                  permit_cost: parseFloat(e.target.value) || 0,
                }))
              }
              className=""
            />
          </div>
        </CardContent>
      </Card>
      {/* Wastage Percentages */}
      <Card>
        <CardHeader>
          <CardTitle>Wastage Percentages</CardTitle>
          <CardDescription>
            Adjust wastage percentages for different materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="wastage-blocks">Blocks (%)</Label>
              <Input
                id="wastage-blocks"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={localSettings.wastageBlocksPercent}
                onChange={(e) =>
                  handleNumericChange("wastageBlocksPercent", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-cement">Cement (%)</Label>
              <Input
                id="wastage-cement"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={localSettings.wastageCementPercent}
                onChange={(e) =>
                  handleNumericChange("wastageCementPercent", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-sand">Sand (%)</Label>
              <Input
                id="wastage-sand"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={localSettings.wastageSandPercent}
                onChange={(e) =>
                  handleNumericChange("wastageSandPercent", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-water">Water (%)</Label>
              <Input
                id="wastage-water"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={localSettings.wastageWaterPercent}
                onChange={(e) =>
                  handleNumericChange("wastageWaterPercent", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-stone">Stone (%)</Label>
              <Input
                id="wastage-stone"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={localSettings.wastageStonePercent}
                onChange={(e) =>
                  handleNumericChange("wastageStonePercent", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Water Settings</CardTitle>
          <CardDescription>
            Configure water calculations and ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="client-provides-water"
                checked={localSettings.clientProvidesWater}
                onCheckedChange={(checked) =>
                  handleChange("clientProvidesWater", checked === true)
                }
              />
              <Label htmlFor="client-provides-water">
                Client provides water
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="cement-water-ratio">
                  Mortar Water-Cement Ratio
                </Label>
                <Input
                  id="cement-water-ratio"
                  type="text"
                  value={localSettings.cementWaterRatio}
                  onChange={(e) =>
                    handleChange("cementWaterRatio", e.target.value)
                  }
                  placeholder="e.g., 0.5"
                />
              </div>
              <div>
                <Label htmlFor="sand-moisture">Sand Moisture Content (%)</Label>
                <Input
                  id="sand-moisture"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={localSettings.sandMoistureContentPercent}
                  onChange={(e) =>
                    handleNumericChange(
                      "sandMoistureContentPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="other-water">Other Site Water (L/m³)</Label>
                <Input
                  id="other-water"
                  type="number"
                  step="1"
                  min="0"
                  value={localSettings.otherSiteWaterAllowanceLM3}
                  onChange={(e) =>
                    handleNumericChange(
                      "otherSiteWaterAllowanceLM3",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="curing-water">Curing Water (L/m²/day)</Label>
                <Input
                  id="curing-water"
                  type="number"
                  step="1"
                  min="0"
                  value={localSettings.curingWaterRateLM2PerDay}
                  onChange={(e) =>
                    handleNumericChange(
                      "curingWaterRateLM2PerDay",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="aggregate-moisture">
                  Aggregate Moisture (%)
                </Label>
                <Input
                  id="aggregate-moisture"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={localSettings.aggregateMoistureContentPercent}
                  onChange={(e) =>
                    handleNumericChange(
                      "aggregateMoistureContentPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="aggregate-absorption">
                  Aggregate Absorption (%)
                </Label>
                <Input
                  id="aggregate-absorption"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={localSettings.aggregateAbsorptionPercent}
                  onChange={(e) =>
                    handleNumericChange(
                      "aggregateAbsorptionPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="curing-days">Curing Days</Label>
                <Input
                  id="curing-days"
                  type="number"
                  step="1"
                  min="0"
                  max="14"
                  value={localSettings.curingDays}
                  onChange={(e) =>
                    handleNumericChange("curingDays", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional QS Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Professional QS Elements</CardTitle>
          <CardDescription>
            Toggle which professional elements to include in calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-lintels"
                checked={localSettings.includesLintels}
                onCheckedChange={(checked) =>
                  handleChange("includesLintels", checked === true)
                }
              />
              <Label htmlFor="includes-lintels">Include Lintels</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-reinforcement"
                checked={localSettings.includesReinforcement}
                onCheckedChange={(checked) =>
                  handleChange("includesReinforcement", checked === true)
                }
              />
              <Label htmlFor="includes-reinforcement">
                Include Reinforcement
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-dpc"
                checked={localSettings.includesDPC}
                onCheckedChange={(checked) =>
                  handleChange("includesDPC", checked === true)
                }
              />
              <Label htmlFor="includes-dpc">Include DPC</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-scaffolding"
                checked={localSettings.includesScaffolding}
                onCheckedChange={(checked) =>
                  handleChange("includesScaffolding", checked === true)
                }
              />
              <Label htmlFor="includes-scaffolding">Include Scaffolding</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-movement-joints"
                checked={localSettings.includesMovementJoints}
                onCheckedChange={(checked) =>
                  handleChange("includesMovementJoints", checked === true)
                }
              />
              <Label htmlFor="includes-movement-joints">
                Include Movement Joints
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-waste-removal"
                checked={localSettings.includesWasteRemoval}
                onCheckedChange={(checked) =>
                  handleChange("includesWasteRemoval", checked === true)
                }
              />
              <Label htmlFor="includes-waste-removal">
                Include Waste Removal
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concrete & Reinforcement Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Concrete & Reinforcement Settings</CardTitle>
          <CardDescription>
            Configure concrete mix and reinforcement details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="concrete-mix-ratio">
                  Concrete Mix Ratio (C:S:B)
                </Label>
                <Input
                  id="concrete-mix-ratio"
                  type="text"
                  value={localSettings.concreteMixRatio}
                  onChange={(e) =>
                    handleChange("concreteMixRatio", e.target.value)
                  }
                  placeholder="e.g., 1:2:4"
                />
              </div>
              <div>
                <Label htmlFor="concrete-water-cement-ratio">
                  Concrete Water-Cement Ratio
                </Label>
                <Input
                  id="concrete-water-cement-ratio"
                  type="number"
                  step="0.05"
                  min="0.4"
                  max="0.6"
                  value={localSettings.concreteWaterCementRatio}
                  onChange={(e) =>
                    handleNumericChange(
                      "concreteWaterCementRatio",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lintel-rebar-size">Lintel Rebar Size</Label>
                <Select
                  value={localSettings.lintelRebarSize}
                  onValueChange={(value: RebarSize) =>
                    handleChange("lintelRebarSize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y8">Y8 (8mm)</SelectItem>
                    <SelectItem value="Y10">Y10 (10mm)</SelectItem>
                    <SelectItem value="Y12">Y12 (12mm)</SelectItem>
                    <SelectItem value="Y16">Y16 (16mm)</SelectItem>
                    <SelectItem value="Y20">Y20 (20mm)</SelectItem>
                    <SelectItem value="Y25">Y25 (25mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vertical-rebar-size">Vertical Rebar Size</Label>
                <Select
                  value={localSettings.verticalRebarSize}
                  onValueChange={(value: RebarSize) =>
                    handleChange("verticalRebarSize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y8">Y8 (8mm)</SelectItem>
                    <SelectItem value="Y10">Y10 (10mm)</SelectItem>
                    <SelectItem value="Y12">Y12 (12mm)</SelectItem>
                    <SelectItem value="Y16">Y16 (16mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedjoint-rebar-size">
                  Bed Joint Rebar Size
                </Label>
                <Select
                  value={localSettings.bedJointRebarSize}
                  onValueChange={(value: RebarSize) =>
                    handleChange("bedJointRebarSize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y8">Y8 (8mm)</SelectItem>
                    <SelectItem value="Y10">Y10 (10mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions & Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensions & Spacing</CardTitle>
          <CardDescription>
            Configure structural dimensions and spacing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="lintel-width">Lintel Width (m)</Label>
              <Input
                id="lintel-width"
                type="number"
                step="0.01"
                min="0.1"
                max="0.3"
                value={localSettings.lintelWidth}
                onChange={(e) =>
                  handleNumericChange("lintelWidth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="lintel-depth">Lintel Depth (m)</Label>
              <Input
                id="lintel-depth"
                type="number"
                step="0.01"
                min="0.1"
                max="0.3"
                value={localSettings.lintelDepth}
                onChange={(e) =>
                  handleNumericChange("lintelDepth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="reinforcement-spacing">
                Bed Joint Spacing (courses)
              </Label>
              <Input
                id="reinforcement-spacing"
                type="number"
                step="1"
                min="1"
                max="6"
                value={localSettings.reinforcementSpacing}
                onChange={(e) =>
                  handleNumericChange("reinforcementSpacing", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="vertical-reinforcement-spacing">
                Vertical Rebar Spacing (m)
              </Label>
              <Input
                id="vertical-reinforcement-spacing"
                type="number"
                step="0.1"
                min="0.6"
                max="2.0"
                value={localSettings.verticalReinforcementSpacing}
                onChange={(e) =>
                  handleNumericChange(
                    "verticalReinforcementSpacing",
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="dpc-width">DPC Width (m)</Label>
              <Input
                id="dpc-width"
                type="number"
                step="0.01"
                min="0.1"
                max="0.5"
                value={localSettings.DPCWidth}
                onChange={(e) =>
                  handleNumericChange("DPCWidth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="movement-joint-spacing">
                Movement Joint Spacing (m)
              </Label>
              <Input
                id="movement-joint-spacing"
                type="number"
                step="0.1"
                min="3"
                max="12"
                value={localSettings.movementJointSpacing}
                onChange={(e) =>
                  handleNumericChange("movementJointSpacing", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="mortar-joint-thickness">
                Mortar Joint Thickness (m)
              </Label>
              <Input
                id="mortar-joint-thickness"
                type="number"
                step="0.001"
                min="0.005"
                max="0.02"
                value={localSettings.mortarJointThicknessM}
                onChange={(e) =>
                  handleNumericChange("mortarJointThicknessM", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates & Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Rates & Costs</CardTitle>
          <CardDescription>
            Configure daily rates and removal costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scaffolding-rate">
                Scaffolding Rate (Ksh/day)
              </Label>
              <Input
                id="scaffolding-rate"
                type="number"
                step="10"
                min="0"
                value={localSettings.scaffoldingDailyRate}
                onChange={(e) =>
                  handleNumericChange("scaffoldingDailyRate", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="waste-removal-rate">
                Waste Removal Rate (Ksh/m³)
              </Label>
              <Input
                id="waste-removal-rate"
                type="number"
                step="50"
                min="0"
                value={localSettings.wasteRemovalRate}
                onChange={(e) =>
                  handleNumericChange("wasteRemovalRate", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
