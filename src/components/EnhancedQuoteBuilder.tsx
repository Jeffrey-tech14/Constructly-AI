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
import { useQuoteCalculations, CalculationResult, QuoteCalculation } from '@/hooks/useQuoteCalculations';
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
    { value: 'Bungalow', label: 'Bungalow' },
    { value: 'Maisonette', label: 'Maisonette' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Townhouse', label: 'Townhouse' },
    { value: 'Mansion', label: 'Mansion' }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  // State with all new fields
  const [quoteData, setQuoteData] = useState<QuoteCalculation>({
    rooms: [
      {
        name: 'Bedroom',
        length: '',
        width: '',
        height: '',
        doors: '',
        windows: ''
      }
    ],
    clientName: '',
    clientEmail: '',
    projectName: '',
    location: '',
    customSpecs: '',
    foundation_length: 0,
    foundation_width: 0,
    foundation_depth: 0,
    mortar_ratio: '1:6',
    concrete_mix_ratio: '1:2:4',
    plaster_thickness: 0.012, // meters
    rebar_percentage: 1, // percent of concrete volume
    include_wastage: true,
    wastage_percentage: 0,
    selected_equipment: [],
    selected_services: [],
    distance_km: 0,
    contract_type: 'full_contract',
    region: '',
    show_profit_to_client: false,
    house_type: '',

    labor_percentage: 25,
    overhead_percentage: 10,
    profit_percentage: 10,
    contingency_percentage: 5,
    permit_cost: 0
  });

  const steps = [
    { id: 1, name: 'Project Details', icon: <FileText className="w-5 h-5" /> },
    { id: 2, name: 'House & Materials', icon: <Building className="w-5 h-5" /> },
    { id: 3, name: 'Contract & Distance', icon: <MapPin className="w-5 h-5" /> },
    { id: 4, name: 'Equipment', icon: <Wrench className="w-5 h-5" /> },
    { id: 5, name: 'Services', icon: <Plus className="w-5 h-5" /> },
    { id: 6, name: 'Review & Export', icon: <Calculator className="w-5 h-5" /> }
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
        rooms: quoteData.rooms,
         projectName: quoteData.projectName,
        clientName: quoteData.clientName,
        clientEmail: quoteData.clientEmail,
        location: quoteData.location,
        customSpecs: quoteData.customSpecs,
        foundation_length: parseFloat(quoteData.foundation_length.toString()) || 0,
        foundation_width: parseFloat(quoteData.foundation_width.toString()) || 0,
        foundation_depth: parseFloat(quoteData.foundation_depth.toString()) || 0,
        mortar_ratio: quoteData.mortar_ratio,
        concrete_mix_ratio: quoteData.concrete_mix_ratio,
        plaster_thickness: parseFloat(quoteData.plaster_thickness.toString()) || 0.012,
        rebar_percentage: parseFloat(quoteData.rebar_percentage.toString()) || 1,
        include_wastage: quoteData.include_wastage,
        wastage_percentage: parseFloat(quoteData.wastage_percentage.toString()) || 5,
        selected_equipment: quoteData.selected_equipment,
        selected_services: quoteData.selected_services,
        distance_km: parseFloat(quoteData.distance_km.toString()) || 0,
        contract_type: quoteData.contract_type,
        region: quoteData.region,
        show_profit_to_client: quoteData.show_profit_to_client,
        house_type: quoteData.house_type,
        labor_percentage: parseFloat(quoteData.labor_percentage.toString()) || 25,
        overhead_percentage: parseFloat(quoteData.overhead_percentage.toString()) || 10,
        profit_percentage: parseFloat(quoteData.profit_percentage.toString()) || 10,
        contingency_percentage: parseFloat(quoteData.contingency_percentage.toString()) || 5,
        permit_cost: parseFloat(quoteData.permit_cost.toString()) || 0
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
    
    if (!calculation){
      console.error('calculation is empty '+ calculation)
     return;
    }
    try {
      toast({
        title: "Save clicked",
        description: "Quote has been clicked successfully"
      });
      await createQuote({
        title: quoteData.projectName,
        client_name: quoteData.clientName,
        client_email: quoteData.clientEmail || null,
        location: quoteData.location,
        region: quoteData.region,
        project_type: 'construction',
        custom_specs: quoteData.customSpecs || null,
        status: 'draft',
        materials_cost: Math.round(calculation.materials_cost),
        labor_cost: Math.round(calculation.labor_cost),
        addons_cost: Math.round(calculation.services_cost),
        total_amount: Math.round(calculation.total_amount),
        materials: calculation.detailed_breakdown.materials,
        labor: calculation.detailed_breakdown.labor,
        addons: calculation.detailed_breakdown.services,
        equipment: calculation.detailed_breakdown.equipment,
        concrete: calculation.detailed_breakdown.concrete,
        formwork: calculation.detailed_breakdown.formwork,
        rebar: calculation.detailed_breakdown.rebar,
        plaster: calculation.detailed_breakdown.plaster,
        overhead_amount: calculation.overhead_amount,
        contingency_amount: calculation.contingency_amount,
        permit_cost: calculation.permit_cost,
        profit_amount: calculation.profit_amount,
        painting: calculation.detailed_breakdown.painting,
        ceiling: calculation.detailed_breakdown.ceiling
      });

      toast({
        title: "Quote Saved",
        description: "Quote has been saved successfully"
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving quote:', error);
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
          <div className="space-y-6 ">
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
            {/* Room Editor */}
            <div className="">
              <h3 className="text-lg font-semibold mb-3">House Type</h3>
              <Select onValueChange={(value) => setQuoteData(prev => ({ ...prev, house_type: value }))}>
                <SelectTrigger>
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
              <h3 className="text-lg font-semibold mb-3 mt-6">Room Details</h3>
              {quoteData.rooms.map((room, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3 items-center">
                  <Input
                    placeholder="Name"
                    value={room.name}
                    onChange={(e) => {
                      const updatedRooms = [...quoteData.rooms];
                      updatedRooms[index].name = e.target.value;
                      setQuoteData(prev => ({ ...prev, rooms: updatedRooms }));
                    }}
                  />
                  <Input
                    placeholder="Length (m)"
                    type="number"
                    value={room.length}
                    onChange={(e) => {
                      const updatedRooms = [...quoteData.rooms];
                      updatedRooms[index].length = e.target.value;
                      setQuoteData(prev => ({ ...prev, rooms: updatedRooms }));
                    }}
                  />
                  <Input
                    placeholder="Width (m)"
                    type="number"
                    value={room.width}
                    onChange={(e) => {
                      const updatedRooms = [...quoteData.rooms];
                      updatedRooms[index].width = e.target.value;
                      setQuoteData(prev => ({ ...prev, rooms: updatedRooms }));
                    }}
                  />
                  <Input
                    placeholder="Height (m)"
                    type="number"
                    value={room.height}
                    onChange={(e) => {
                      const updatedRooms = [...quoteData.rooms];
                      updatedRooms[index].height = e.target.value;
                      setQuoteData(prev => ({ ...prev, rooms: updatedRooms }));
                    }}
                  />
                  <Input
                    placeholder="Doors"
                    type="number"
                    value={room.doors}
                    onChange={(e) => {
                      const updatedRooms = [...quoteData.rooms];
                      updatedRooms[index].doors = e.target.value;
                      setQuoteData(prev => ({ ...prev, rooms: updatedRooms }));
                    }}
                  />
                  <Input
                    placeholder="Windows"
                    type="number"
                    value={room.windows}
                    onChange={(e) => {
                      const updatedRooms = [...quoteData.rooms];
                      updatedRooms[index].windows = e.target.value;
                      setQuoteData(prev => ({ ...prev, rooms: updatedRooms }));
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setQuoteData(prev => ({
                    ...prev,
                    rooms: [
                      ...prev.rooms,
                      {
                        name: `Room ${prev.rooms.length + 1}`,
                        length: '',
                        width: '',
                        height: '',
                        doors: '1',
                        windows: '1'
                      }
                    ]
                  }))
                }
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Room
              </Button>
            </div>

            {/* Foundation Inputs */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Foundation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="foundationLength">Length (m)</Label>
                  <Input
                    id="foundationLength"
                    type="number"
                    placeholder="e.g., 20"
                    value={quoteData.foundation_length}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, foundation_length: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="foundationWidth">Width (m)</Label>
                  <Input
                    id="foundationWidth"
                    type="number"
                    placeholder="e.g., 0.6"
                    value={quoteData.foundation_width}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, foundation_width: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="foundationDepth">Depth (m)</Label>
                  <Input
                    id="foundationDepth"
                    type="number"
                    placeholder="e.g., 0.6"
                    value={quoteData.foundation_depth}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, foundation_depth: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Material Estimation Settings */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Material Estimation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="concreteMixRatio">Concrete Mix Ratio (C:S:B)</Label>
                  <Input
                    id="concreteMixRatio"
                    placeholder="e.g., 1:2:4"
                    value={quoteData.concrete_mix_ratio}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, concrete_mix_ratio: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="plasterThickness">Plaster Thickness (m)</Label>
                  <Input
                    id="plasterThickness"
                    type="number"
                    step="0.001"
                    placeholder="e.g., 0.012"
                    value={quoteData.plaster_thickness}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, plaster_thickness: parseFloat(e.target.value) || 0.012 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rebarPercentage">Rebar Percentage (%)</Label>
                  <Input
                    id="rebarPercentage"
                    type="number"
                    placeholder="e.g., 1"
                    value={quoteData.rebar_percentage}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, rebar_percentage: parseFloat(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  checked={quoteData.include_wastage}
                  onCheckedChange={(checked) =>
                    setQuoteData(prev => ({ ...prev, include_wastage: Boolean(checked) }))
                  }
                />
                <Label>Include Wastage (%)</Label>
                <Input
                  type="number"
                  placeholder="5%"
                  value={quoteData.wastage_percentage}
                  onChange={(e) =>
                    setQuoteData(prev => ({ ...prev, wastage_percentage: parseFloat(e.target.value)}))
                  }
                  className="w-20 ml-4"
                />
              </div>
            </div>

            {/* Financial Settings */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Financial Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="laborPercentage">Labor % of Materials</Label>
                  <Input
                    id="laborPercentage"
                    type="number"
                    placeholder="e.g., 25"
                    value={quoteData.labor_percentage}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, labor_percentage: parseFloat(e.target.value) || 25 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="overheadPercentage">Overhead (%)</Label>
                  <Input
                    id="overheadPercentage"
                    type="number"
                    placeholder="e.g., 10"
                    value={quoteData.overhead_percentage}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, overhead_percentage: parseFloat(e.target.value) || 10 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="profitPercentage">Profit (%)</Label>
                  <Input
                    id="profitPercentage"
                    type="number"
                    placeholder="e.g., 10"
                    value={quoteData.profit_percentage}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, profit_percentage: parseFloat(e.target.value) || 10 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contingencyPercentage">Contingency (%)</Label>
                  <Input
                    id="contingencyPercentage"
                    type="number"
                    placeholder="e.g., 5"
                    value={quoteData.contingency_percentage}
                    onChange={(e) =>
                      setQuoteData(prev => ({ ...prev, contingency_percentage: parseFloat(e.target.value) || 5 }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="permitCost">Permit Cost (KSh)</Label>
                <Input
                  id="permitCost"
                  type="number"
                  placeholder="e.g., 50000"
                  value={quoteData.permit_cost}
                  onChange={(e) =>
                    setQuoteData(prev => ({ ...prev, permit_cost: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            {/* Profit Toggle */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                checked={quoteData.show_profit_to_client}
                onCheckedChange={(checked) =>
                  setQuoteData(prev => ({ ...prev, show_profit_to_client: Boolean(checked) }))
                }
              />
              <Label>Show Profits to Client</Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Contract Type</Label>
              <Select 
                value={quoteData.contract_type} 
                onValueChange={(value: 'full_contract' | 'labor_only') => 
                  setQuoteData(prev => ({ ...prev, contract_type: value }))
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
                {quoteData.contract_type === 'full_contract' 
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
                value={quoteData.distance_km}
                onChange={(e) => setQuoteData(prev => ({ ...prev, distance_km: parseFloat(e.target.value) || 0 }))}
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
                  <Card key={equipment.id} className="p-4 gradient-card">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={quoteData.selected_equipment.includes(equipment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuoteData(prev => ({
                              ...prev,
                              selected_equipment: [...prev.selected_equipment, equipment.id]
                            }));
                          } else {
                            setQuoteData(prev => ({
                              ...prev,
                              selected_equipment: prev.selected_equipment.filter(id => id !== equipment.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{equipment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {(equipment.daily_rate).toLocaleString()}/day
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
                  <Card key={service.id} className="p-4 gradient-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={quoteData.selected_services.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setQuoteData(prev => ({
                                ...prev,
                                selected_services: [...prev.selected_services, service.id]
                              }));
                            } else {
                              setQuoteData(prev => ({
                                ...prev,
                                selected_services: prev.selected_services.filter(id => id !== service.id)
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
                          KSh {(service.default_price).toLocaleString()}
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
                rows={4}
                value={quoteData.customSpecs}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customSpecs: e.target.value }))}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {calculation? (
              <>
                {/* Summary Cards */}
                <pre className="text-blue-700 bg-blue-100 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(calculation, null, 2)}
              </pre>
                <Card  className='gradient-card'>
                  <CardHeader>
                    <CardTitle>Quote Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Wall Area:</span>
                      <span>{calculation.total_wall_area.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Concrete Volume:</span>
                      <span>{calculation.total_concrete_volume.toFixed(2)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formwork Area:</span>
                      <span>{calculation.total_formwork_area.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rebar Weight:</span>
                      <span>{calculation.total_rebar_weight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plaster Volume:</span>
                      <span>{calculation.total_plaster_volume.toFixed(2)} m³</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>KSh {calculation.total_amount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Breakdown Cards */}
                {calculation.detailed_breakdown.materials.length > 0 && (
                  <Card  className='gradient-card'>
                    <CardHeader>
                      <CardTitle>Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {calculation.detailed_breakdown.materials.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>KSh {item.total_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {calculation.detailed_breakdown.concrete.length > 0 && (
                  <Card  className='gradient-card'>
                    <CardHeader>
                      <CardTitle>Concrete</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {calculation.detailed_breakdown.concrete.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>KSh {item.total_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {calculation.detailed_breakdown.formwork.length > 0 && (
                  <Card  className='gradient-card'>
                    <CardHeader>
                      <CardTitle>Formwork</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {calculation.detailed_breakdown.formwork.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>KSh {item.total_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {calculation.detailed_breakdown.rebar.length > 0 && (
                  <Card  className='gradient-card'>
                    <CardHeader>
                      <CardTitle>Rebar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {calculation.detailed_breakdown.rebar.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>KSh {item.total_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {calculation.detailed_breakdown.plaster.length > 0 && (
                  <Card className='gradient-card'>
                    <CardHeader>
                      <CardTitle>Plastering</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {calculation.detailed_breakdown.plaster.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>KSh {item.total_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Export Button */}

                 <div className="flex space-x-4">
                  <Button
                    onClick={handleSaveQuote}
                    className="flex-1 text-white"
                    variant="default"
                  >
                    Save Quote
                  </Button>
                  <Button
                    onClick={() => alert("Export coming soon!")}
                    variant="outline"
                    className="flex-1"
                  >
                    Export BOQ
                  </Button>
                </div>
              
              </>
            ): (
            <div className="text-center py-8 text-gray-350">
              No calculation found. Please click "Calculate Quote" first.
              
            </div>
            
            )}
            <div className="flex space-x-4">
                  <Button
                    onClick={handleCalculate}
                    disabled={calculationLoading}
                    className="flex-1 text-white"
                  >
                    {calculationLoading ? 'Calculating...' : 'Calculate'}
                  </Button>
                </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Enhanced Quote Builder</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create accurate construction quotes with advanced calculations</p>
        </div>

        {/* Progress Bar */}
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
        <Card className="mb-8 gradient-card">
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
            <Button onClick={nextStep} className="text-white">
              Next
              <ArrowRight className="w-4 h-4 ml-2 text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuoteBuilder;