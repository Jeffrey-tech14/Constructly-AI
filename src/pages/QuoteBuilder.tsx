import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuoteBuilder } from "@/hooks/useQuoteBuilder";
import { useLocalStorageQuote } from "@/hooks/useLocalStorageQuote";
import useQuoteGuidance from "@/hooks/useQuoteGuidance";
import QuoteGuidanceSidebar from "@/components/QuoteGuidanceSidebar";
import { SavedQuoteDialog } from "@/components/SavedQuoteDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  FileText,
  Wrench,
  Calculator,
  Building,
  Shell,
  Crown,
  Shield,
  Star,
  BuildingIcon,
  FileSpreadsheet,
  Zap,
  Trash,
  UploadCloud,
  ListStartIcon,
  Mailbox,
  Earth,
  Newspaper,
  Pickaxe,
  Users,
  MapPin,
  Truck,
  HardHat,
  LoaderPinwheel,
  Paintbrush,
  ChevronRight,
  ChevronLeft,
  Settings,
  Shovel,
  BrickWall,
  LucideHousePlus,
  DoorOpen,
  Grid3x3,
  ClipboardList,
} from "lucide-react";

// Import all child components
import QSSettings from "@/components/QSSettings";
import PreliminariesOptionsPage from "@/components/PreliminariesOptionsPage";
import EarthworksForm from "@/components/EarthWorksForm";
import ConcreteCalculatorForm from "@/components/ConcreteCalculatorForm";
import FoundationWallingCalculator from "@/components/FoundationWallingCalculator";
import RebarCalculatorForm from "@/components/RebarCalculationForm";
import DoorsWindowsEditor from "@/components/DoorsWindowsEditor";
import MasonryCalculatorForm from "@/components/MasonryCalculatorForm";
import PlumbingCalculator from "@/components/PlumbingCalculator";
import ElectricalCalculator from "@/components/ElectricalCalculator";
import RoofingCalculator from "@/components/RoofingCalculator";
import FlooringCalculator from "@/components/FlooringCalculator";
import InternalFinishesCalculator from "@/components/InternalFinishesCalculator";
import ExternalFinishesCalculator from "@/components/ExternalFinishesCalculator";
import CeilingCalculator from "@/components/CeilingCalculator";
import KitchenAndWardrobesCalculator from "@/components/KitchenAndWardrobesCalculator";
import DoorWindowPaintCalculator from "@/components/DoorWindowPaintCalculator";
import OtherFinishesCalculator from "@/components/OtherFinishes";
import EquipmentSelector from "@/components/EquipmentSelector";
import ServicesSelector from "@/components/ServicesSelector";
import SubcontractorsSelector from "@/components/SubcontractorsSelector";
import PreliminariesBuilder from "@/components/PreliminariesBuilder";
import BOQBuilder from "@/components/BOQBuilder";

export function Stepper({
  steps,
  currentStep,
  setCurrentStep,
  setDirection,
  handleCalculate,
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to get a gradient color based on progress
  const getProgressColor = (stepId: number) => {
    const totalSteps = steps.length;
    const completionRatio = (stepId - 1) / (totalSteps - 1);

    // Primary color: #f0514e
    // Interpolate from primary to lighter shade (light mode) or darker shade (dark mode)
    // Using HSL for easier manipulation

    if (stepId <= currentStep) {
      // Primary: hsl(2, 97%, 62%) - #f0514e
      // Light mode: lighter shade, Dark mode: similar but adjusted
      const startHue = 2;
      const startSat = 97;
      const startLight = 62;

      // End color: lighter in light mode, adjusted in dark mode
      const endLight = 75; // lighter shade for light mode

      // Interpolate between the two lightness values
      const currentLight =
        startLight + (endLight - startLight) * completionRatio;

      return `hsl(${startHue}, ${startSat}%, ${currentLight}%)`;
    }
    return undefined;
  };

  // Center current step when it changes
  useEffect(() => {
    const activeStep = document.getElementById(`step-${currentStep}`);
    if (activeStep && scrollContainerRef.current) {
      activeStep.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentStep]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200; // adjust as needed
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Calculate gradient for progress bar
  const progressGradient = steps
    .map((step) => {
      const color = getProgressColor(step.id);
      const percentage = ((step.id - 1) / (steps.length - 1)) * 100;
      return color ? `${color} ${percentage}%` : null;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative mt-2 mb-4 space-y-3">
      {/* Left chevron */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/70 rounded-full p-1 shadow-md glass hover:bg-white"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto no-scrollbar scroll-smooth gap-2 px-8 py-2"
      >
        {steps.map((step) => {
          const newStep = step.id;
          const isActive = currentStep >= step.id;
          const progressColor = getProgressColor(step.id);

          return (
            <div
              key={step.id}
              id={`step-${step.id}`}
              onClick={() => {
                setDirection(currentStep < newStep ? "right" : "left");
                setCurrentStep(newStep);
                if (newStep === 13) handleCalculate();
              }}
              className={`flex items-center cursor-pointer flex-shrink-0 transition-all duration-500 ${
                step.id < steps.length ? "flex-1" : ""
              }`}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 flex-shrink-0"
                style={{
                  backgroundColor: isActive ? progressColor : "transparent",
                  borderColor: isActive ? progressColor : "#d1d5db",
                  color: isActive ? "white" : "#9ca3af",
                }}
              >
                {step.icon}
              </div>
              <div className="hidden xl:inline">
                <p
                  className="ml-2 mr-2 text-sm font-medium transition-all duration-500"
                  style={{
                    color: isActive ? progressColor : "#9ca3af",
                  }}
                >
                  {step.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar with gradient */}
      <div className="mx-8 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            background: `linear-gradient(90deg, ${progressGradient})`,
          }}
        />
      </div>

      {/* Right chevron */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 glass -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/70 rounded-full p-1 shadow-md hover:bg-white"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
    </div>
  );
}

const steps = [
  { id: 1, name: "Project Details", icon: <FileText className="w-5 h-5" /> },
  { id: 2, name: "QS Settings", icon: <HardHat className="w-5 h-5" /> },
  { id: 3, name: "Preliminaries", icon: <Newspaper className="w-5 h-5" /> },
  { id: 4, name: "Substructures", icon: <Earth className="w-5 h-5" /> },
  { id: 5, name: "Superstructures", icon: <Building className="w-5 h-5" /> },
  { id: 6, name: "Finishes", icon: <Paintbrush className="w-5 h-5" /> },
  { id: 7, name: "Extras", icon: <Zap className="w-5 h-5" /> },
  {
    id: 8,
    name: "Preliminaries and Legal",
    icon: <FileSpreadsheet className="w-5 h-5" />,
  },
  { id: 9, name: "BOQ Builder", icon: <ListStartIcon className="w-5 h-5" /> },
  { id: 10, name: "Review & Export", icon: <Calculator className="w-5 h-5" /> },
];

const regions = [
  { value: "Nairobi", label: "Nairobi" },
  { value: "Mombasa", label: "Mombasa" },
  { value: "Kisumu", label: "Kisumu" },
  { value: "Nakuru", label: "Nakuru" },
  { value: "Eldoret", label: "Eldoret" },
  { value: "Thika", label: "Thika" },
  { value: "Machakos", label: "Machakos" },
];

const projects = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "institutional", label: "Institutional" },
];

export default function QuoteBuilderPage() {
  const {
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    substructureTab,
    setSubstructureTab,
    superstructureTab,
    setSuperstructureTab,
    finishesTab,
    setFinishesTab,
    extrasTab,
    setExtrasTab,
    countertopsTab,
    setCountertopsTab,
    wallingFinishesTab,
    setWallingFinishesTab,
    otherFinishesTab,
    setOtherFinishesTab,
    quoteData,
    setQuoteData,
    materials,
    plumbingSystems,
    setPlumbingSystems,
    electricalSystems,
    setElectricalSystems,
    finishes,
    roofStructure,
    setRoofStructure,
    earthwork,
    setEarthWorks,
    wardrobes,
    setWardrobes,
    calculation,
    boqData,
    setBoqData,
    preliminaries,
    setPreliminaries,
    subContractors,
    transportCost,
    calculationLoading,
    settingsLoading,
    equipmentRates,
    services,
    customEquipment,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    getEffectiveMaterialPrice,
    handleFinishesUpdate,
    handleScreeningSkirtingUpdate,
    handleFoundationWallingUpdate,
    handleCeilingTypeChange,
    handleInternalWallTypeChange,
    handleExternalWallTypeChange,
    updatePercentageField,
    nextStep,
    prevStep,
    handleCalculate,
    handleSaveQuote,
  } = useQuoteBuilder();

  const navigate = useNavigate();

  // Local storage quote recovery
  const { loadQuoteFromStorage, deleteQuoteFromStorage, hasSavedQuote } =
    useLocalStorageQuote();

  const [showSavedQuoteDialog, setShowSavedQuoteDialog] = useState(false);
  const [savedQuoteData, setSavedQuoteData] = useState<any>(null);

  // Check for saved quote on mount
  useEffect(() => {
    if (hasSavedQuote()) {
      const saved = loadQuoteFromStorage();
      if (saved) {
        setSavedQuoteData(saved.data);
        setShowSavedQuoteDialog(true);
      }
    }
  }, []);

  const handleContinueSavedQuote = () => {
    if (savedQuoteData) {
      setQuoteData(savedQuoteData);
      setShowSavedQuoteDialog(false);
    }
  };

  const handleDeleteSavedQuote = () => {
    deleteQuoteFromStorage();
    setShowSavedQuoteDialog(false);
    setSavedQuoteData(null);
  };

  const handleStartFreshQuote = () => {
    deleteQuoteFromStorage();
    setShowSavedQuoteDialog(false);
    setSavedQuoteData(null);
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <LoaderPinwheel className="animate-spin h-8 w-8" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading quote builder...
          </p>
        </motion.div>
      </div>
    );
  }

  const renderStepContent = () => {
    const projectDetailsGuidance = useQuoteGuidance("projectDetails");
    const qsSettingsGuidance = useQuoteGuidance("qsSettings");
    const preliminariesGuidance = useQuoteGuidance("preliminaries");
    const earthworksGuidance = useQuoteGuidance("earthworks");
    const concreteGuidance = useQuoteGuidance("concrete");
    const foundationWallingGuidance = useQuoteGuidance("foundationWalling");
    const rebarGuidance = useQuoteGuidance("rebar");
    const doorsWindowsGuidance = useQuoteGuidance("doorsWindows");
    const masonryGuidance = useQuoteGuidance("masonry");
    const plumbingGuidance = useQuoteGuidance("plumbing");
    const electricalGuidance = useQuoteGuidance("electrical");
    const roofingGuidance = useQuoteGuidance("roofing");
    const flooringGuidance = useQuoteGuidance("flooring");
    const internalFinishesGuidance = useQuoteGuidance("internalFinishes");
    const externalFinishesGuidance = useQuoteGuidance("externalFinishes");
    const ceilingGuidance = useQuoteGuidance("ceiling");
    const kitchenWardrobGuidance = useQuoteGuidance("kitchenWardrobe");
    const paintDoorsGuidance = useQuoteGuidance("paintDoors");
    const otherFinishesGuidance = useQuoteGuidance("otherFinishes");
    const equipmentGuidance = useQuoteGuidance("equipment");
    const servicesGuidance = useQuoteGuidance("services");
    const subcontractorsGuidance = useQuoteGuidance("subcontractors");
    const boqGuidance = useQuoteGuidance("boq");
    const reviewGuidance = useQuoteGuidance("review");

    switch (currentStep) {
      case 1:
        return (
          <QuoteGuidanceSidebar
            guidanceData={projectDetailsGuidance}
            title="Project Details Guide"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 mx-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="projectName"
                    className="flex items-center gap-2 mb-2"
                  >
                    <Pickaxe className="w-4 h-4" />
                    Project Name *
                  </Label>
                  <Input
                    id="projectName"
                    required
                    placeholder="Enter project name"
                    value={quoteData.title}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label
                      htmlFor="clientName"
                      className="flex items-center gap-2 mb-2"
                    >
                      <Users className="w-4 h-4" />
                      Client Name *
                    </Label>
                    <Input
                      id="clientName"
                      required
                      placeholder="Enter client name"
                      value={quoteData.client_name}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          client_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="clientEmail"
                      className="flex items-center gap-2 mb-2"
                    >
                      <Mailbox className="w-4 h-4" />
                      Client Email *
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      placeholder="client@example.com"
                      value={quoteData.client_email}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          client_email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-4 h-4" />
                    Contract Type *
                  </Label>
                  <Select
                    value={quoteData.contract_type}
                    onValueChange={(value: "full_contract" | "labor_only") =>
                      setQuoteData((prev) => ({
                        ...prev,
                        contract_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_contract">
                        Full Contract (Materials + Labor)
                      </SelectItem>
                      <SelectItem value="labor_only">
                        Labor Only (Client Provides Materials)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="projectType"
                    className="flex items-center gap-2 mb-2"
                  >
                    <Building className="w-4 h-4" />
                    Project Type *
                  </Label>
                  <Select
                    value={quoteData.project_type}
                    onValueChange={(value) =>
                      setQuoteData((prev) => ({ ...prev, project_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="location"
                    className="flex items-center gap-2 mb-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Project Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter specific location"
                    required
                    value={quoteData.location}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="region"
                    className="flex items-center gap-2 mb-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Region *
                  </Label>
                  <Select
                    value={quoteData.region}
                    onValueChange={(value) =>
                      setQuoteData((prev) => ({ ...prev, region: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="distanceKm"
                    className="flex items-center gap-2 mb-2"
                  >
                    <Truck className="w-4 h-4" />
                    Distance from site (KM)
                  </Label>
                  <Input
                    id="distanceKm"
                    type="number"
                    min="0"
                    required
                    placeholder="Distance"
                    value={quoteData.distance_km}
                    onChange={(e) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        distance_km: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Transport cost: KES {transportCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Card className="border border-border bg-[#fcfdfd] dark:bg-[#111418]">
                <CardContent className="p-6 text-center">
                  <UploadCloud className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg mb-2">Upload Construction Plans</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Upload your construction plans for automatic room detection
                    and measurements
                  </p>
                  <Button
                    onClick={() =>
                      navigate("/upload/plan", { state: { quoteData } })
                    }
                    className="rounded-full shadow-md hover:shadow-lg"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </QuoteGuidanceSidebar>
        );
      case 2:
        return (
          <QuoteGuidanceSidebar
            guidanceData={qsSettingsGuidance}
            title="QS Settings Guide"
          >
            <QSSettings
              quoteData={quoteData}
              setQuoteData={setQuoteData}
              updatePercentageField={updatePercentageField}
            />
          </QuoteGuidanceSidebar>
        );
      case 3:
        return (
          <QuoteGuidanceSidebar
            guidanceData={preliminariesGuidance}
            title="Preliminaries Guide"
          >
            <PreliminariesOptionsPage
              quoteData={quoteData}
              onPreliminaryUpdate={(options) =>
                setQuoteData((prev) => ({
                  ...prev,
                  preliminaryOptions: options,
                }))
              }
            />
          </QuoteGuidanceSidebar>
        );
      case 4:
        return (
          <QuoteGuidanceSidebar
            guidanceData={
              substructureTab === "earthworks"
                ? earthworksGuidance
                : substructureTab === "concrete"
                  ? concreteGuidance
                  : substructureTab === "foundation-walling"
                    ? foundationWallingGuidance
                    : rebarGuidance
            }
            title={`${substructureTab.charAt(0).toUpperCase() + substructureTab.slice(1).replace("-", " ")} Guide`}
          >
            <div className="space-y-6">
              <Tabs value={substructureTab} onValueChange={setSubstructureTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="earthworks">Earthworks</TabsTrigger>
                  <TabsTrigger value="concrete">Concrete</TabsTrigger>
                  <TabsTrigger value="foundation-walling">
                    Foundation Walling
                  </TabsTrigger>
                  <TabsTrigger value="rebar">Reinforcement</TabsTrigger>
                </TabsList>
                <TabsContent value="earthworks">
                  <EarthworksForm
                    earthworks={earthwork}
                    excavationRates={materials}
                    setEarthworks={setEarthWorks}
                    setQuoteData={setQuoteData}
                    setQuote={setQuoteData}
                    quote={quoteData}
                  />
                </TabsContent>
                <TabsContent value="concrete">
                  <ConcreteCalculatorForm
                    quote={quoteData}
                    setQuote={setQuoteData}
                    materialBasePrices={materialBasePrices}
                    userMaterialPrices={userMaterialPrices}
                    getEffectiveMaterialPrice={getEffectiveMaterialPrice}
                  />
                </TabsContent>
                <TabsContent value="foundation-walling">
                  <FoundationWallingCalculator
                    quote={quoteData}
                    onUpdate={(walls) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        foundationWalls: walls,
                      }))
                    }
                    onFoundationWallingUpdate={handleFoundationWallingUpdate}
                    materials={materials}
                  />
                </TabsContent>
                <TabsContent value="rebar">
                  <h3 className="text-2xl mb-3">Reinforcement Calculator</h3>
                  <RebarCalculatorForm
                    quote={quoteData}
                    setQuote={setQuoteData}
                    onExport={() => {}}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </QuoteGuidanceSidebar>
        );
      case 5:
        return (
          <QuoteGuidanceSidebar
            guidanceData={
              superstructureTab === "doors-windows"
                ? doorsWindowsGuidance
                : superstructureTab === "masonry"
                  ? masonryGuidance
                  : superstructureTab === "plumbing"
                    ? plumbingGuidance
                    : superstructureTab === "electrical"
                      ? electricalGuidance
                      : roofingGuidance
            }
            title={`${superstructureTab.replace("-", " ").charAt(0).toUpperCase() + superstructureTab.replace("-", " ").slice(1)} Guide`}
          >
            <div className="space-y-6">
              <Tabs
                value={superstructureTab}
                onValueChange={setSuperstructureTab}
              >
                <TabsList className="grid w-full grid-cols-5 mb-3">
                  <TabsTrigger value="doors-windows">
                    Doors & Windows
                  </TabsTrigger>
                  <TabsTrigger value="masonry">Masonry</TabsTrigger>
                  <TabsTrigger value="plumbing">Plumbing</TabsTrigger>
                  <TabsTrigger value="electrical">Electrical</TabsTrigger>
                  <TabsTrigger value="roofing">Roofing</TabsTrigger>
                </TabsList>
                <TabsContent value="doors-windows">
                  <DoorsWindowsEditor
                    wallSections={quoteData.wallSections || []}
                    onUpdate={(sections) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        wallSections: sections,
                      }))
                    }
                    materialData={materials}
                  />
                </TabsContent>
                <TabsContent value="masonry">
                  <MasonryCalculatorForm
                    quote={quoteData}
                    setQuote={setQuoteData}
                    regionalMultipliers={regionalMultipliers}
                    userRegion={quoteData.region}
                    materialBasePrices={materialBasePrices}
                    userMaterialPrices={userMaterialPrices}
                    getEffectiveMaterialPrice={getEffectiveMaterialPrice}
                  />
                </TabsContent>
                <TabsContent value="plumbing">
                  <PlumbingCalculator
                    plumbingSystems={plumbingSystems}
                    onPlumbingSystemsUpdate={setPlumbingSystems}
                    materialPrices={materials}
                    setQuoteData={setQuoteData}
                    quote={quoteData}
                  />
                </TabsContent>
                <TabsContent value="roofing">
                  <RoofingCalculator
                    materialPrices={materials}
                    onCalculationResult={(result) =>
                      setQuoteData((prev) => ({
                        ...prev,
                        roofing_breakdown: result,
                      }))
                    }
                    setQuoteData={setQuoteData}
                    quote={quoteData}
                  />
                </TabsContent>
                <TabsContent value="electrical">
                  <ElectricalCalculator
                    electricalSystems={electricalSystems}
                    materialPrices={materials}
                    onElectricalSystemsUpdate={setElectricalSystems}
                    setQuoteData={setQuoteData}
                    quote={quoteData}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </QuoteGuidanceSidebar>
        );
      case 6:
        return (
          <QuoteGuidanceSidebar
            guidanceData={
              finishesTab === "flooring"
                ? flooringGuidance
                : finishesTab === "walling"
                  ? wallingFinishesTab === "internalFinishes"
                    ? internalFinishesGuidance
                    : externalFinishesGuidance
                  : finishesTab === "ceiling"
                    ? ceilingGuidance
                    : otherFinishesTab === "kitchen-wardrobes"
                      ? kitchenWardrobGuidance
                      : otherFinishesTab === "door-paint"
                        ? paintDoorsGuidance
                        : otherFinishesGuidance
            }
            title={`${finishesTab.charAt(0).toUpperCase() + finishesTab.slice(1)} Guide`}
          >
            <div className="space-y-6">
              <Tabs value={finishesTab} onValueChange={setFinishesTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="flooring">Flooring</TabsTrigger>
                  <TabsTrigger value="walling">Walling</TabsTrigger>
                  <TabsTrigger value="ceiling">Ceiling</TabsTrigger>
                  <TabsTrigger value="others">Extra/Other Finishes</TabsTrigger>
                </TabsList>
                <TabsContent value="flooring">
                  <FlooringCalculator
                    finishes={finishes}
                    onFinishesUpdate={handleFinishesUpdate}
                    onScreeningSkirtingUpdate={handleScreeningSkirtingUpdate}
                    materialPrices={materials}
                    quote={quoteData}
                  />
                </TabsContent>
                <TabsContent value="walling">
                  <Tabs
                    value={wallingFinishesTab}
                    onValueChange={setWallingFinishesTab}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-3">
                      <TabsTrigger value="internalFinishes">
                        Internal Walling
                      </TabsTrigger>
                      <TabsTrigger value="externalFinishes">
                        External Walling
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="internalFinishes">
                      <InternalFinishesCalculator
                        finishes={finishes}
                        onFinishesUpdate={handleFinishesUpdate}
                        onFinishTypeChange={handleInternalWallTypeChange}
                        materialPrices={materials}
                        quote={quoteData}
                        wallDimensions={quoteData.wallDimensions}
                      />
                    </TabsContent>
                    <TabsContent value="externalFinishes">
                      <ExternalFinishesCalculator
                        finishes={finishes}
                        onFinishesUpdate={handleFinishesUpdate}
                        onFinishTypeChange={handleExternalWallTypeChange}
                        materialPrices={materials}
                        quote={quoteData}
                        wallDimensions={quoteData.wallDimensions}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                <TabsContent value="ceiling">
                  <CeilingCalculator
                    finishes={finishes}
                    onFinishesUpdate={handleFinishesUpdate}
                    onCeilingTypeChange={handleCeilingTypeChange}
                    materialPrices={materials}
                    quote={quoteData}
                  />
                </TabsContent>
                <TabsContent value="others">
                  <Tabs
                    value={otherFinishesTab}
                    onValueChange={setOtherFinishesTab}
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-3">
                      <TabsTrigger value="kitchen-wardrobes">
                        Wardrobes & Kitchen Cabinets
                      </TabsTrigger>
                      <TabsTrigger value="door-paint">
                        Wood/Metal Paint
                      </TabsTrigger>
                      <TabsTrigger value="otherFinishes">
                        Extra/Other Finishes
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="kitchen-wardrobes">
                      <KitchenAndWardrobesCalculator
                        wardrobes={wardrobes}
                        setWardrobes={setWardrobes}
                        quote={quoteData}
                        materialPrices={materials}
                      />
                    </TabsContent>
                    <TabsContent value="door-paint">
                      <DoorWindowPaintCalculator
                        paints={quoteData.doorWindowPaints || []}
                        onPaintsUpdate={(paints) =>
                          setQuoteData((prev) => ({
                            ...prev,
                            doorWindowPaints: paints,
                          }))
                        }
                        materialPrices={materials}
                        readonly={false}
                      />
                    </TabsContent>
                    <TabsContent value="otherFinishes">
                      <OtherFinishesCalculator
                        otherFinishes={finishes}
                        onOtherFinishesUpdate={handleFinishesUpdate}
                        materialPrices={materials}
                        quote={quoteData}
                        wallDimensions={quoteData.wallDimensions}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </div>
          </QuoteGuidanceSidebar>
        );
      case 7:
        return (
          <QuoteGuidanceSidebar
            guidanceData={
              extrasTab === "equipment"
                ? equipmentGuidance
                : extrasTab === "services"
                  ? servicesGuidance
                  : subcontractorsGuidance
            }
            title={`${extrasTab.charAt(0).toUpperCase() + extrasTab.slice(1)} Guide`}
          >
            <div className="space-y-6">
              <Tabs value={extrasTab} onValueChange={setExtrasTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="services">Services & Extras</TabsTrigger>
                  <TabsTrigger value="subcontractors">
                    Subcontractors
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="equipment">
                  <EquipmentSelector
                    quoteData={quoteData}
                    setQuoteData={setQuoteData}
                    equipmentRates={equipmentRates}
                    customEquipment={customEquipment}
                  />
                </TabsContent>
                <TabsContent value="services">
                  <ServicesSelector
                    quoteData={quoteData}
                    setQuoteData={setQuoteData}
                    services={services}
                  />
                  <div className="mt-4">
                    <Label htmlFor="customSpecs">
                      Additional Specifications
                    </Label>
                    <Textarea
                      id="customSpecs"
                      placeholder="Any additional requirements..."
                      rows={4}
                      value={quoteData.custom_specs}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          custom_specs: e.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>
                <TabsContent value="subcontractors">
                  <SubcontractorsSelector
                    quoteData={quoteData}
                    setQuoteData={setQuoteData}
                    subContractors={subContractors}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </QuoteGuidanceSidebar>
        );
      case 8:
        return (
          <QuoteGuidanceSidebar
            guidanceData={preliminariesGuidance}
            title="Preliminaries Builder Guide"
          >
            <PreliminariesBuilder
              quoteData={quoteData}
              onPreliminariesUpdate={setPreliminaries}
              onSaveToQuote={(sections) =>
                setQuoteData((prev) => ({ ...prev, preliminaries: sections }))
              }
            />
          </QuoteGuidanceSidebar>
        );
      case 9:
        return (
          <QuoteGuidanceSidebar
            guidanceData={boqGuidance}
            title="Bill of Quantities Guide"
          >
            <BOQBuilder quoteData={quoteData} onBOQUpdate={setBoqData} />
          </QuoteGuidanceSidebar>
        );
      case 10:
        return (
          <QuoteGuidanceSidebar
            guidanceData={reviewGuidance}
            title="Review & Export Guide"
          >
            <div className="space-y-6">
              {calculation ? (
                <>
                  {boqData.length > 0 && (
                    <div>
                      <h3 className="text-lg mb-4">Bill of Quantities</h3>
                      {boqData.map((section, idx) => (
                        <Card key={idx} className="mb-4">
                          <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead>Element</TableHead>
                                  <TableHead>Unit</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead>Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {section.items.length ? (
                                  section.items.map((item, i) => {
                                    const isHeader =
                                      item.element?.toLowerCase() === "header";
                                    return isHeader ? (
                                      <TableRow key={i}>
                                        <TableCell
                                          colSpan={8}
                                          className="font-bold"
                                        >
                                          {item.description}
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      <TableRow key={i}>
                                        <TableCell>
                                          {item.itemNo || "-"}
                                        </TableCell>
                                        <TableCell>
                                          {item.description}
                                        </TableCell>
                                        <TableCell>{item.element}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                          {item.rate?.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                          {item.amount?.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={8}
                                      className="text-center"
                                    >
                                      No items
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                            <div className="mt-4 text-right font-bold">
                              Total: KSh{" "}
                              {section.items
                                .reduce((sum, i) => sum + (i.amount || 0), 0)
                                .toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle>Labour and Total</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Labour</span>
                        <span>
                          KSh {calculation.labor_cost?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit</span>
                        <span>
                          KSh {calculation.profit_amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contingency</span>
                        <span>
                          KSh {calculation.contingency_amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unknown Unknowns Reserve</span>
                        <span>
                          KSh{" "}
                          {calculation.unknown_contingency_amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead</span>
                        <span>
                          KSh {calculation.overhead_amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Materials</span>
                        <span>
                          KSh {calculation.materials_cost?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preliminaries</span>
                        <span>
                          KSh {calculation.preliminariesCost?.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>KSh {calculation.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleSaveQuote}
                      className="flex-1 rounded-full"
                    >
                      Save Quote
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-gray-500">
                  No calculation done. Click on calculate to generate quotation.
                </div>
              )}
              <div className="flex space-x-4">
                <Button
                  onClick={handleCalculate}
                  disabled={calculationLoading}
                  className="flex-1 rounded-full"
                >
                  {calculationLoading ? "Calculating..." : "Recalculate"}
                </Button>
              </div>
            </div>
          </QuoteGuidanceSidebar>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen animate-fade-in transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex sm:text-2xl text-xl font-bold text-foreground tracking-tight">
            <BuildingIcon className="sm:w-7 sm:h-7 sm:mt-0 mt-1 mr-2 text-primary dark:text-white" />
            <h2>Quote Builder</h2>
          </div>
          <p className="text-foreground tracking-tight mt-2">
            Create accurate construction quotes with advanced calculations
          </p>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            setDirection={setDirection}
            handleCalculate={handleCalculate}
          />
        </div>

        <div key={`step-${currentStep}`}>
          <Card className="mb-8 -p-5">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="flex justify-between items-center gap-3 text-foreground">
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-full bg-primary/20 dark:bg-primary">
                    {steps[currentStep - 1]?.icon}
                  </div>
                  <div>
                    <div className="text-lg">
                      {steps[currentStep - 1]?.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-normal">
                      Step {currentStep} of {steps.length}
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="sm:p-6 p-3 pt-6">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={prevStep}
            variant="outline"
            className="rounded-full px-6 bg-background shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {currentStep < 10 && (
            <Button
              onClick={nextStep}
              className="rounded-full px-6 shadow-md hover:shadow-lg"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Saved Quote Dialog */}
      <SavedQuoteDialog
        open={showSavedQuoteDialog}
        savedQuoteTimestamp={savedQuoteData?.timestamp || Date.now()}
        projectName={savedQuoteData?.title || "Untitled Project"}
        clientName={savedQuoteData?.client_name || "Unknown Client"}
        onContinue={handleContinueSavedQuote}
        onStart={handleStartFreshQuote}
        onDelete={handleDeleteSavedQuote}
      />
    </div>
  );
}
