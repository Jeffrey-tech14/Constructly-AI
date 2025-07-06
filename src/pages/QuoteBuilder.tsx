
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
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Home, 
  Package, 
  Users, 
  Plus, 
  FileText,
  Wrench
} from 'lucide-react';

const QuoteBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState({
    // Step 1: Location
    location: '',
    region: '',
    
    // Step 2: Design
    projectType: '',
    template: '',
    customSpecs: '',
    
    // Step 3: Materials
    materials: [],
    
    // Step 4: Labor
    laborCosts: [],
    
    // Step 5: Add-ons
    addOns: [],
    
    // Step 6: Review
    clientName: '',
    clientEmail: '',
    projectName: ''
  });

  const steps = [
    { id: 1, name: 'Location', icon: <MapPin className="w-5 h-5" /> },
    { id: 2, name: 'Design', icon: <Home className="w-5 h-5" /> },
    { id: 3, name: 'Materials', icon: <Package className="w-5 h-5" /> },
    { id: 4, name: 'Labor', icon: <Users className="w-5 h-5" /> },
    { id: 5, name: 'Add-ons', icon: <Plus className="w-5 h-5" /> },
    { id: 6, name: 'Review', icon: <FileText className="w-5 h-5" /> }
  ];

  const regions = [
    { value: 'nairobi', label: 'Nairobi', multiplier: 1.2 },
    { value: 'mombasa', label: 'Mombasa', multiplier: 1.15 },
    { value: 'kisumu', label: 'Kisumu', multiplier: 1.05 },
    { value: 'nakuru', label: 'Nakuru', multiplier: 1.0 },
    { value: 'eldoret', label: 'Eldoret', multiplier: 0.95 }
  ];

  const projectTypes = [
    { value: 'residential', label: 'Residential House' },
    { value: 'commercial', label: 'Commercial Building' },
    { value: 'renovation', label: 'Renovation Project' },
    { value: 'infrastructure', label: 'Infrastructure' }
  ];

  const materials = [
    { id: 1, name: 'Cement (50kg bag)', basePrice: 850, unit: 'bags' },
    { id: 2, name: 'Steel Bars (12mm)', basePrice: 1200, unit: 'tonnes' },
    { id: 3, name: 'Sand (Lorry)', basePrice: 4500, unit: 'lorries' },
    { id: 4, name: 'Ballast (Lorry)', basePrice: 4000, unit: 'lorries' },
    { id: 5, name: 'Bricks', basePrice: 12, unit: 'pieces' },
    { id: 6, name: 'Roofing Sheets', basePrice: 1800, unit: 'sheets' }
  ];

  const laborTypes = [
    { id: 1, name: 'Mason', dailyRate: 1500, unit: 'days' },
    { id: 2, name: 'Carpenter', dailyRate: 1800, unit: 'days' },
    { id: 3, name: 'Plumber', dailyRate: 2000, unit: 'days' },
    { id: 4, name: 'Electrician', dailyRate: 2200, unit: 'days' },
    { id: 5, name: 'General Laborer', dailyRate: 800, unit: 'days' }
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

  const handleFinish = () => {
    // In real app, this would save the quote and generate PDF
    navigate('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
                      {region.label} ({region.multiplier > 1 ? '+' : ''}{((region.multiplier - 1) * 100).toFixed(0)}%)
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
            <div>
              <Label htmlFor="projectType">Project Type</Label>
              <Select onValueChange={(value) => setQuoteData(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customSpecs">Custom Specifications</Label>
              <Textarea
                id="customSpecs"
                placeholder="Describe any specific requirements, dimensions, or features..."
                value={quoteData.customSpecs}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customSpecs: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material) => (
                  <Card key={material.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{material.name}</h4>
                      <Badge variant="secondary">KSh {material.basePrice.toLocaleString()}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">{material.unit}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Labor Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {laborTypes.map((labor) => (
                  <Card key={labor.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{labor.name}</h4>
                      <Badge variant="secondary">KSh {labor.dailyRate.toLocaleString()}/day</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Days needed"
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">{labor.unit}</span>
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
                {[
                  { name: 'Site Survey', price: 15000 },
                  { name: 'Architectural Plans', price: 50000 },
                  { name: 'Project Management', price: 100000 },
                  { name: 'Quality Assurance', price: 75000 },
                  { name: 'Cleanup Service', price: 25000 }
                ].map((addon, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{addon.name}</h4>
                        <p className="text-sm text-gray-600">KSh {addon.price.toLocaleString()}</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="clientEmail">Client Email</Label>
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
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Give this project a name"
                value={quoteData.projectName}
                onChange={(e) => setQuoteData(prev => ({ ...prev, projectName: e.target.value }))}
              />
            </div>
            
            {/* Quote Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span className="font-semibold">KSh 850,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span className="font-semibold">KSh 420,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add-ons:</span>
                    <span className="font-semibold">KSh 90,000</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Regional Adjustment ({quoteData.region}):</span>
                    <span>+15%</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total:</span>
                    <span>KSh 1,564,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
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
          <h1 className="text-3xl font-bold text-gray-900">Quote Builder</h1>
          <p className="text-gray-600 mt-2">Create a professional construction quote in 6 easy steps</p>
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
                <div className="ml-3">
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
          
          {currentStep === 6 ? (
            <Button onClick={handleFinish} className="bg-primary hover:bg-primary/90">
              Generate Quote
              <FileText className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;
