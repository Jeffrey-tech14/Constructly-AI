
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { 
  Settings, 
  Truck, 
  Wrench, 
  Plus,
  DollarSign
} from 'lucide-react';

const DashboardSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    loading: settingsLoading,
    equipmentTypes,
    equipmentRates,
    transportRates,
    additionalServices,
    serviceRates,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateOverallProfitMargin
  } = useUserSettings();

  const [tempValues, setTempValues] = useState<{[key: string]: number}>({});

  const handleUpdateEquipmentRate = async (equipmentTypeId: string, rate: number) => {
    setLoading(true);
    const { error } = await updateEquipmentRate(equipmentTypeId, rate);
    
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
    const { error } = await updateTransportRate(region, costPerKm, baseCost);
    
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
    const { error } = await updateServiceRate(serviceId, price);
    
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

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Equipment Daily Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipmentTypes.map((equipmentType) => {
                const userRate = equipmentRates.find(r => r.equipment_type_id === equipmentType.id);
                const currentRate = userRate ? userRate.daily_rate / 100 : equipmentType.daily_rate / 100;
                
                return (
                  <div key={equipmentType.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{equipmentType.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: KSh {currentRate.toLocaleString()}/day
                      </p>
                      {equipmentType.description && (
                        <p className="text-xs text-muted-foreground">{equipmentType.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Daily rate"
                        className="w-32"
                        defaultValue={currentRate}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [`equipment-${equipmentType.id}`]: parseFloat(e.target.value) || 0
                        })}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateEquipmentRate(
                          equipmentType.id,
                          tempValues[`equipment-${equipmentType.id}`] || currentRate
                        )}
                        disabled={loading}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })}
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
              {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'].map((region) => {
                const rate = transportRates.find(r => r.region === region);
                const costPerKm = rate ? rate.cost_per_km / 100 : 50;
                const baseCost = rate ? rate.base_cost / 100 : 500;
                
                return (
                  <div key={region} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{region}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {costPerKm}/km + KSh {baseCost} base
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cost per KM (KSh)</Label>
                        <Input
                          type="number"
                          defaultValue={costPerKm}
                          onChange={(e) => setTempValues({
                            ...tempValues,
                            [`transport-km-${region}`]: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label>Base Cost (KSh)</Label>
                        <Input
                          type="number"
                          defaultValue={baseCost}
                          onChange={(e) => setTempValues({
                            ...tempValues,
                            [`transport-base-${region}`]: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={() => handleUpdateTransportRate(
                        region,
                        tempValues[`transport-km-${region}`] || costPerKm,
                        tempValues[`transport-base-${region}`] || baseCost
                      )}
                      disabled={loading}
                    >
                      Update Transport Rate
                    </Button>
                  </div>
                );
              })}
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
              {additionalServices.map((service) => {
                const userRate = serviceRates.find(r => r.service_id === service.id);
                const currentPrice = userRate ? userRate.price / 100 : service.default_price / 100;
                
                return (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: KSh {currentPrice.toLocaleString()}
                      </p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      )}
                      <span className="text-xs bg-secondary px-2 py-1 rounded">{service.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        className="w-32"
                        defaultValue={currentPrice}
                        onChange={(e) => setTempValues({
                          ...tempValues,
                          [`service-${service.id}`]: parseFloat(e.target.value) || 0
                        })}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateServiceRate(
                          service.id,
                          tempValues[`service-${service.id}`] || currentPrice
                        )}
                        disabled={loading}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Profit Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
