import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator as CalculatorIcon, X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calculator = ({ isOpen, onClose }: CalculatorProps) => {
  const [calculation, setCalculation] = useState({
    type: 'material', // material, labor, area, volume
    quantity: '',
    rate: '',
    result: 0
  });

  const [areaCalc, setAreaCalc] = useState({
    length: '',
    width: '',
    height: '',
    shape: 'rectangle' // rectangle, circle, triangle
  });

  const materials = [
    { name: 'Cement (50kg)', rate: 850, unit: 'bags' },
    { name: 'Steel Bars (12mm)', rate: 1200, unit: 'tonnes' },
    { name: 'Sand', rate: 4500, unit: 'lorries' },
    { name: 'Ballast', rate: 4000, unit: 'lorries' },
    { name: 'Bricks', rate: 12, unit: 'pieces' }
  ];

  const laborTypes = [
    { name: 'Mason', rate: 1500, unit: 'days' },
    { name: 'Carpenter', rate: 1800, unit: 'days' },
    { name: 'Plumber', rate: 2000, unit: 'days' },
    { name: 'Electrician', rate: 2200, unit: 'days' }
  ];

  const calculateMaterial = () => {
    const qty = parseFloat(calculation.quantity) || 0;
    const rate = parseFloat(calculation.rate) || 0;
    const result = qty * rate;
    setCalculation(prev => ({ ...prev, result }));
  };

  const calculateArea = () => {
    const l = parseFloat(areaCalc.length) || 0;
    const w = parseFloat(areaCalc.width) || 0;
    const h = parseFloat(areaCalc.height) || 0;
    
    let area = 0;
    let volume = 0;
    
    switch (areaCalc.shape) {
      case 'rectangle':
        area = l * w;
        volume = l * w * h;
        break;
      case 'circle':
        area = Math.PI * Math.pow(l / 2, 2); // l = diameter
        volume = area * h;
        break;
      case 'triangle':
        area = (l * w) / 2;
        volume = area * h;
        break;
    }
    
    return { area: area.toFixed(2), volume: volume.toFixed(2) };
  };

  const setMaterialRate = (materialName: string) => {
    const material = materials.find(m => m.name === materialName);
    if (material) {
      setCalculation(prev => ({ ...prev, rate: material.rate.toString() }));
    }
  };

  const setLaborRate = (laborName: string) => {
    const labor = laborTypes.find(l => l.name === laborName);
    if (labor) {
      setCalculation(prev => ({ ...prev, rate: labor.rate.toString() }));
    }
  };

  if (!isOpen) return null;

  const { area, volume } = calculateArea();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto gradient-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            Quick Calculator
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Calculation Type</Label>
            <Select 
              value={calculation.type} 
              onValueChange={(value) => setCalculation(prev => ({ ...prev, type: value, result: 0 }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material Cost</SelectItem>
                <SelectItem value="labor">Labor Cost</SelectItem>
                <SelectItem value="area">Area & Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {calculation.type === 'material' && (
            <div className="space-y-4">
              <div>
                <Label>Quick Select Material</Label>
                <Select onValueChange={setMaterialRate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.name} value={material.name}>
                        {material.name} - KSh {material.rate.toLocaleString()}/{material.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={calculation.quantity}
                    onChange={(e) => setCalculation(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate (KSh)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={calculation.rate}
                    onChange={(e) => setCalculation(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder="Enter rate"
                  />
                </div>
              </div>
              
              <Button onClick={calculateMaterial} className="w-full text-white">
                Calculate Total
              </Button>
              
              {calculation.result > 0 && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-primary">
                    KSh {calculation.result.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {calculation.type === 'labor' && (
            <div className="space-y-4">
              <div>
                <Label>Quick Select Labor</Label>
                <Select onValueChange={setLaborRate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose labor type" />
                  </SelectTrigger>
                  <SelectContent>
                    {laborTypes.map((labor) => (
                      <SelectItem key={labor.name} value={labor.name}>
                        {labor.name} - KSh {labor.rate.toLocaleString()}/{labor.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="days">Days</Label>
                  <Input
                    id="days"
                    type="number"
                    value={calculation.quantity}
                    onChange={(e) => setCalculation(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Number of days"
                  />
                </div>
                <div>
                  <Label htmlFor="dailyRate">Daily Rate (KSh)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={calculation.rate}
                    onChange={(e) => setCalculation(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder="Daily rate"
                  />
                </div>
              </div>
              
              <Button onClick={calculateMaterial} className="w-full text-white">
                Calculate Total
              </Button>
              
              {calculation.result > 0 && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Labor Cost</p>
                  <p className="text-2xl font-bold text-primary">
                    KSh {calculation.result.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {calculation.type === 'area' && (
            <div className="space-y-4">
              <div>
                <Label>Shape</Label>
                <Select 
                  value={areaCalc.shape} 
                  onValueChange={(value) => setAreaCalc(prev => ({ ...prev, shape: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="length">
                    {areaCalc.shape === 'circle' ? 'Diameter (m)' : 'Length (m)'}
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    value={areaCalc.length}
                    onChange={(e) => setAreaCalc(prev => ({ ...prev, length: e.target.value }))}
                    placeholder="Enter length"
                  />
                </div>
                {areaCalc.shape !== 'circle' && (
                  <div>
                    <Label htmlFor="width">Width (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={areaCalc.width}
                      onChange={(e) => setAreaCalc(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="Enter width"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="height">Height (m)</Label>
                <Input
                  id="height"
                  type="number"
                  value={areaCalc.height}
                  onChange={(e) => setAreaCalc(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Enter height"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-xl font-bold text-green-600">{area} m²</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Volume</p>
                  <p className="text-xl font-bold text-purple-600">{volume} m³</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator;
