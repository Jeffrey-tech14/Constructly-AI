
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { 
  Settings, 
  Percent, 
  Truck, 
  Wrench, 
  Plus,
  DollarSign,
  Users
} from 'lucide-react';

const DashboardSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    loading: settingsLoading,
    materialCategories,
    profitMargins,
    equipmentTypes,
    equipmentRates,
    transportRates,
    additionalServices,
    serviceRates,
    laborSettings,
    updateProfitMargin,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateLaborSettings,
    updateOverallProfitMargin
  } = useUserSettings();

  const [tempValues, setTempValues] = useState<{[key: string]: number}>({});

  const handleUpdateProfitMargin = async (categoryId: string, percentage: number) => {
    setLoading(true);
    const { error } = await updateProfitMargin(categoryId, percentage);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profit margin",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profit margin updated successfully"
      });
    }
    setLoading(false);
  };

  const handleUpdateEquipmentRate = async (equipmentTypeId: string, rate: number) => {
    setLoading(true);
    const { error } = await updateEquipmentRate(equipmentTypeId, rate * 100); // Convert to cents
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update equipment rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Equipment rate updated successfully"
      });
    }
    setLoading(false);
  };

  const handleUpdateTransportRate = async (region: string, costPerKm: number, baseCost: number) => {
    setLoading(true);
    const { error } = await updateTransportRate(region, costPerKm * 100, baseCost * 100); // Convert to cents
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update transport rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Transport rate updated successfully"
      });
    }
    setLoading(false);
  };

  const handleUpdateServiceRate = async (serviceId: string, price: number) => {
    setLoading(true);
    const { error } = await updateServiceRate(serviceId, price * 100); // Convert to cents
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update service rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Service rate updated successfully"
      });
    }
    setLoading(false);
  };

  const handleUpdateLaborSettings = async (percentage: number) => {
    setLoading(true);
    const { error } = await updateLaborSettings(percentage);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update labor settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Labor settings updated successfully"
      });
    }
    setLoading(false);
  };

  const handleUpdateOverallProfit = async (margin: number) => {
    setLoading(true);
    const { error } = await updateOverallProfitMargin(margin);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update overall profit margin",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Overall profit margin updated successfully"
      });
    }
    setLoading(false);
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Settings & Rates</h2>
      </div>

      <Tabs defaultValue="profit-margins" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profit-margins">Profit Margins</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-margins" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Percent className="w-5 h-5 mr-2" />
                Material Profit Margins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profitMargins.map((margin) => (
                <div key={margin.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{margin.category_name}</h4>
                    <p className="text-sm text-muted-foreground">Current: {margin.profit_percentage}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Percentage"
                      className="w-24"
                      defaultValue={margin.profit_percentage}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        [`margin-${margin.category_id}`]: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateProfitMargin(
                        margin.category_id,
                        tempValues[`margin-${margin.category_id}`] || margin.profit_percentage
                      )}
                      disabled={loading}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Equipment Daily Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipmentRates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rate.equipment_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Current: KSh {(rate.daily_rate / 100).toLocaleString()}/day
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Daily rate"
                      className="w-32"
                      defaultValue={rate.daily_rate / 100}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        [`equipment-${rate.equipment_type_id}`]: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateEquipmentRate(
                        rate.equipment_type_id,
                        tempValues[`equipment-${rate.equipment_type_id}`] || (rate.daily_rate / 100)
                      )}
                      disabled={loading}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Transport Rates by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transportRates.map((rate) => (
                <div key={rate.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{rate.region}</h4>
                      <p className="text-sm text-muted-foreground">
                        KSh {(rate.cost_per_km / 100).toFixed(2)}/km + KSh {(rate.base_cost / 100).toFixed(2)} base
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cost per KM (KSh)</Label>
                      <Input
                        type="number"
                        defaultValue={rate.cost_per_km / 100}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [`transport-km-${rate.region}`]: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Base Cost (KSh)</Label>
                      <Input
                        type="number"
                        defaultValue={rate.base_cost / 100}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [`transport-base-${rate.region}`]: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => handleUpdateTransportRate(
                      rate.region,
                      tempValues[`transport-km-${rate.region}`] || (rate.cost_per_km / 100),
                      tempValues[`transport-base-${rate.region}`] || (rate.base_cost / 100)
                    )}
                    disabled={loading}
                  >
                    Update Transport Rate
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Additional Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceRates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rate.service_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Current: KSh {(rate.price / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      className="w-32"
                      defaultValue={rate.price / 100}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        [`service-${rate.service_id}`]: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateServiceRate(
                        rate.service_id,
                        tempValues[`service-${rate.service_id}`] || (rate.price / 100)
                      )}
                      disabled={loading}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Labor & Profit Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {laborSettings && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Labor Cost Percentage</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current: {laborSettings.labor_percentage_of_materials}% of material costs
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Percentage"
                      className="w-24"
                      defaultValue={laborSettings.labor_percentage_of_materials}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        'labor-percentage': parseFloat(e.target.value) || 0
                      })}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLaborSettings(
                        tempValues['labor-percentage'] || laborSettings.labor_percentage_of_materials
                      )}
                      disabled={loading}
                    >
                      Update Labor %
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Overall Profit Margin</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Additional percentage added to total project cost
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Overall profit %"
                    className="w-24"
                    onChange={(e) => setTempValues({
                      ...tempValues,
                      'overall-profit': parseFloat(e.target.value) || 0
                    })}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateOverallProfit(
                      tempValues['overall-profit'] || 0
                    )}
                    disabled={loading}
                  >
                    Update Overall Profit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardSettings;
