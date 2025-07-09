
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuoteCalculations, CalculationResult } from '@/hooks/useQuoteCalculations';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useQuotes } from '@/hooks/useQuotes';
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Home, 
  Package, 
  Users, 
  Plus, 
  FileText,
  Wrench,
  Calculator,
  Truck,
  Building,
  Bed,
  Bath
} from 'lucide-react';

const EnhancedQuoteBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { calculateQuote, loading: calculationLoading } = useQuoteCalculations();
  const { equipmentTypes, additionalServices, loading: settingsLoading } = useUserSettings();
  const { createQuote } = useQuotes();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [quoteData, setQuoteData] = useState({
    // Step 1: Project Details
    projectName: '',
    clientName: '',
    clientEmail: '',
    location: '',
    region: '',
    
    // Step 2: House Details
    houseType: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    length: '',
    width: '',
    height: '',
    
    // Step 3: Contract Type & Distance
    contractType: 'full_contract' as 'full_contract' | 'labor_only',
    distanceKm: '',
    
    // Step 4: Equipment Selection
    selectedEquipment: [] as string[],
    
    // Step 5: Additional Services
    selectedServices: [] as string[],
    
    // Step 6: Specifications
    customSpecs: ''
  });

  const steps = [
    { id: 1, name: 'Project Details', icon: <FileText className="w-5 h-5" /> },
    { id: 2, name: 'House Details', icon: <Building className="w-5 h-5" /> },
    { id: 3, name: 'Contract & Distance', icon: <MapPin className="w-5 h-5" /> },
    { id: 4, name: 'Equipment', icon: <Wrench className="w-5 h-5" /> },
    { id: 5, name: 'Services', icon: <Plus className="w-5 h-5" /> },
    { id: 6, name: 'Review & Calculate', icon: <Calculator className="w-5 h-5" /> }
  ];

  const regions = [
    { value: 'Nairobi', label: 'Nairobi' },
    { value: 'Mombasa', label: 'Mombasa' },
    { value: 'Kisumu', label: 'Kisumu' },
    { value: 'Nakuru', label: 'Nakuru' },
    { value: 'Eldoret', label: 'Eldoret' },
    { value: 'Thika', label: 'Thika' },
    { value: 'Machakos', label: 'Machakos' }
  ];

  const houseTypes = [
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'mansion', label: 'Mansion' }
  ];

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculate = async () => {
    try {
      const result = await calculateQuote({
        length: parseFloat(quoteData.length),
        width: parseFloat(quoteData.width),
        height: parseFloat(quoteData.height),
        region: quoteData.region,
        distance_km: parseFloat(quoteData.distanceKm || '0'),
        contract_type: quoteData.contractType,
        selected_equipment: quoteData.selectedEquipment,
        selected_services: quoteData.selectedServices
      });
      
      setCalculation(result);
      toast({
        title: "Calculation Complete",
        description: "Quote has been calculated successfully"
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Failed to calculate quote",
        variant: "destructive"
      });
    }
  };

  const handleSaveQuote = async () => {
    if (!calculation) return;
    
    try {
      await createQuote({
        title: quoteData.projectName,
        client_name: quoteData.clientName,
        client_email: quoteData.clientEmail || undefined,
        location: quoteData.location,
        region: quoteData.region,
        project_type: 'construction',
        custom_specs: quoteData.customSpecs || undefined,
        status: 'draft',
        materials_cost: Math.round(calculation.materials_cost),
        labor_cost: Math.round(calculation.labor_cost),
        addons_cost: Math.round(calculation.services_cost),
        total_amount: Math.round(calculation.total_amount),
        materials: calculation.detailed_breakdown.materials,
        labor: [{ type: 'calculated', percentage: 25, cost: calculation.labor_cost }],
        addons: calculation.detailed_breakdown.services
      });
      
      toast({
        title: "Quote Saved",
        description: "Quote has been saved successfully"
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save quote",
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={quoteData.projectName}
                onChange={(e) => setQuoteData(prev => ({ ...prev, projectName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={quoteData.clientName}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email (Optional)</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={quoteData.clientEmail}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, clientEmail: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Project Location</Label>
              <Input
                id="location"
                placeholder="Enter specific location or address"
                value={quoteData.location}
                onChange={(e) => setQuoteData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select onValueChange={(value) => setQuoteData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region for pricing" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="houseType">House Type</Label>
                <Select onValueChange={(value) => setQuoteData(prev => ({ ...prev, houseType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select house type" />
                  </SelectTrigger>
                  <SelectContent>
                    {houseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="floors">Number of Floors</Label>
                <Input
                  id="floors"
                  type="number"
                  placeholder="1"
                  value={quoteData.floors}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, floors: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="3"
                  value={quoteData.bedrooms}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="2"
                  value={quoteData.bathrooms}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, bathrooms: e.target.value }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length">Length (meters)</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="Length"
                  value={quoteData.length}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, length: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="width">Width (meters)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="Width"
                  value={quoteData.width}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, width: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (meters)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Height"
                  value={quoteData.height}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
            </div>

            {quoteData.length && quoteData.width && quoteData.height && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h4 className="font-semibold">Calculated Volume</h4>
                    <p className="text-2xl font-bold text-primary">
                      {(parseFloat(quoteData.length) * parseFloat(quoteData.width) * parseFloat(quoteData.height)).toFixed(2)} m³
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Contract Type</Label>
              <Select 
                value={quoteData.contractType} 
                onValueChange={(value: 'full_contract' | 'labor_only') => 
                  setQuoteData(prev => ({ ...prev, contractType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_contract">Full Contract (Materials + Labor)</SelectItem>
                  <SelectItem value="labor_only">Labor Only (Client Provides Materials)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {quoteData.contractType === 'full_contract' 
                  ? 'You provide all materials and labor'
                  : 'Client provides materials, you provide labor only'
                }
              </p>
            </div>
            <div>
              <Label htmlFor="distanceKm">Distance from your location (KM)</Label>
              <Input
                id="distanceKm"
                type="number"
                placeholder="Distance in kilometers"
                value={quoteData.distanceKm}
                onChange={(e) => setQuoteData(prev => ({ ...prev, distanceKm: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Used to calculate transport costs
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Required Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipmentTypes.map((equipment) => (
                  <Card key={equipment.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={quoteData.selectedEquipment.includes(equipment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuoteData(prev => ({
                              ...prev,
                              selectedEquipment: [...prev.selectedEquipment, equipment.id]
                            }));
                          } else {
                            setQuoteData(prev => ({
                              ...prev,
                              selectedEquipment: prev.selectedEquipment.filter(id => id !== equipment.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{equipment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {(equipment.daily_rate / 100).toLocaleString()}/day
                        </p>
                        {equipment.description && (
                          <p className="text-xs text-muted-foreground">{equipment.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
              <div className="space-y-4">
                {additionalServices.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={quoteData.selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setQuoteData(prev => ({
                                ...prev,
                                selectedServices: [...prev.selectedServices, service.id]
                              }));
                            } else {
                              setQuoteData(prev => ({
                                ...prev,
                                selectedServices: prev.selectedServices.filter(id => id !== service.id)
                              }));
                            }
                          }}
                        />
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          KSh {(service.default_price / 100).toLocaleString()}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{service.category}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="customSpecs">Additional Specifications</Label>
              <Textarea
                id="customSpecs"
                placeholder="Any additional requirements or specifications..."
                value={quoteData.customSpecs}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customSpecs: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Project:</span>
                    <span className="font-medium">{quoteData.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span className="font-medium">{quoteData.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{quoteData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Type:</span>
                    <span className="font-medium">{quoteData.houseType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bedrooms:</span>
                    <span className="font-medium">{quoteData.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bathrooms:</span>
                    <span className="font-medium">{quoteData.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="font-medium">
                      {quoteData.length}m × {quoteData.width}m × {quoteData.height}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract Type:</span>
                    <span className="font-medium">
                      {quoteData.contractType === 'full_contract' ? 'Full Contract' : 'Labor Only'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {calculation && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Materials:</span>
                      <span className="font-medium">KSh {(calculation.materials_cost / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor:</span>
                      <span className="font-medium">KSh {(calculation.labor_cost / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment:</span>
                      <span className="font-medium">KSh {(calculation.equipment_cost / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport:</span>
                      <span className="font-medium">KSh {(calculation.transport_cost / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span className="font-medium">KSh {(calculation.services_cost / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin:</span>
                      <span className="font-medium">KSh {(calculation.profit_amount / 100).toLocaleString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold text-green-800">
                      <span>Total:</span>
                      <span>KSh {(calculation.total_amount / 100).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleCalculate}
                disabled={calculationLoading}
                className="flex-1"
              >
                {calculationLoading ? 'Calculating...' : 'Calculate Quote'}
              </Button>
              {calculation && (
                <Button
                  onClick={handleSaveQuote}
                  className="flex-1"
                  variant="default"
                >
                  Save Quote
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <Wrench className="w-8 h-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Constructly</span>
              </Link>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enhanced Quote Builder</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create accurate construction quotes with advanced calculations</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <div key={step.id} className={`flex items-center ${step.id < steps.length ? 'flex-1' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {step.id < steps.length && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 6) * 100} className="w-full" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {steps[currentStep - 1].icon}
              <span className="ml-2">{steps[currentStep - 1].name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 6 && (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuoteBuilder;
