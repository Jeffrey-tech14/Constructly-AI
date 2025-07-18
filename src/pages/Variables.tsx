
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useDynamicPricing } from '@/hooks/useDynamicPricing';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  DollarSign, 
  Wrench, 
  Truck, 
  Users, 
  Building,
  Plus,
  Edit,
  Save
} from 'lucide-react';

const Variables = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const {
    equipmentTypes,
    additionalServices,
    equipmentRates,
    transportRates,
    serviceRates,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateOverallProfitMargin,
    updateLabourPercent,
    updateSubcontractorRate
  } = useUserSettings();
  
  const {
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    updateMaterialPrice,
    getEffectiveMaterialPrice
  } = useDynamicPricing();

  
    useEffect(() => {
      if (!sessionStorage.getItem('variables_reloaded')) {
        sessionStorage.setItem('variables_reloaded', 'true');
        window.location.reload();
      }
    }, [profile.id]);
    const [tempValues, setTempValues] = useState<{ [key: string]: number }>({});
      
    const fetchRates = async () => {
      setLoading(true);
      const { data: baseServices, error: baseError } = await supabase
        .from('subcontractor_prices')
        .select('*');

      const { data: overrides, error: overrideError } = await supabase
        .from('user_subcontractor_rates')
        .select('service_id, price')
        .eq('user_id', profile.id);

      if (baseError) console.error('Base rates error:', baseError);
      if (overrideError) console.error('Overrides error:', overrideError);

      const merged = baseServices.map((service) => {
      const userRate = overrides?.find(o => o.service_id === service.id);
      const rate = userRate
        ? Number(userRate.price) 
        : (service.price != null ? Number(service.price) : 0); 

        return {
          ...service,
          price: rate,
          unit: service.unit ?? "unit",
          source: userRate ? 'user' : (service.price != null ? 'base' : 'none')
        };
      });

      setServices(merged);
      setLoading(false);
    };

  useEffect(() => {
    fetchRates();
  }, [profile.id]);

const [overallProfitMargin, setOverallProfitMargin] = useState<number | null>(null);
const [labourPercent, setLabourPercent] = useState<number | null>(null);

const fetchOverallProfitMargin = async () => {
  const { data, error } = await supabase
    .from('profiles') 
    .select('overall_profit_margin')
    .eq('id', profile.id) 
    .single();

  if (error) {
    console.error('Error fetching overall profit margin:', error);
  } else {
    setOverallProfitMargin(data?.overall_profit_margin || 0);
  }
};

useEffect(() => {
  fetchOverallProfitMargin();
}, [profile.id]);

const fetchLabourPercent = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('labour_percent')
    .eq('id', profile.id)
    .single();

  if (error) {
    console.error('Error fetching overall profit margin:', error);
  } else {
    setLabourPercent(data?.labour_percent || 0);
  }
};

useEffect(() => {
  fetchLabourPercent();
}, [profile.id]); 

  const handleSave = async (type: string, id: string, value: number) => {
    setLoading(true);
    try {
      const userRegion = profile?.location || 'Nairobi';
      
      switch (type) {
        case 'material':
          await updateMaterialPrice(id, value, userRegion);
          break;
        case 'equipment':
          await updateEquipmentRate(id, value);
          break;
        case 'service':
          await updateServiceRate(id, value);
          break;
        case 'subcontractor':
          await updateSubcontractorRate(id, value);
          await fetchRates();
          break;
        case 'transport':
          const [region, field] = id.split('-');
          const currentRate = transportRates.find(r => r.region === region);
          if (field === 'km') {
            await updateTransportRate(region, value, currentRate?.base_cost || 500);
          } else {
            await updateTransportRate(region, currentRate?.cost_per_km || 50, value);
          }
          break;
      }
      toast({
        title: "Success",
        description: "Variable updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update variable",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Settings className="w-8 h-8 mr-3 text-primary" />
            Variables & Pricing
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure all pricing variables and settings for your construction projects
          </p>
        </div>

        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="materials" className="flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center">
              <Wrench className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="subcontractors" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Subcontractors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-4">
            <Card className="gradient-card animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Material Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Region:</strong> {profile?.location || 'Nairobi'} - 
                    Prices shown include regional multipliers. Custom prices will override defaults.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materialBasePrices.map((material) => {
                    const userRegion = profile?.location || 'Nairobi';
                    const userOverride = userMaterialPrices.find(
                      p => p.material_id === material.id && p.region === userRegion
                    );
                    const effectivePrice = getEffectiveMaterialPrice(material.id, userRegion);
                    const isCustomPrice = !!userOverride;
                    
                    return (
                      <Card key={material.id} className="gradient-card card-hover">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h4 className="font-medium">{material.name}</h4>
                              {material.description && (
                                <p className="text-xs text-muted-foreground">{material.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className='text-black' variant="secondary">{material.unit}</Badge>
                              {isCustomPrice && (
                                <Badge variant="outline" className="ml-1 text-xs">Custom</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Base: KSh {(material.base_price).toLocaleString()}
                              {!isCustomPrice && (
                                <span className="text-xs ml-1">
                                  ({regionalMultipliers.find(r => r.region === userRegion)?.multiplier || 1})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                placeholder={effectivePrice.toString()}
                                onChange={(e) => setTempValues({
                                  ...tempValues,
                                  [`material-${material.id}`]: parseFloat(e.target.value) || 0
                                })}
                                className="flex-1"
                              />
                              <Button 
                                size="sm"
                                onClick={() => handleSave('material', material.id, tempValues[`material-${material.id}`] || effectivePrice)}
                                disabled={loading}
                              >
                                <Save className="w-4 h-4 text-white" />
                              </Button>
                            </div>
                            <div className="text-xs text-emerald-600 font-medium">
                              Current: KSh {effectivePrice.toLocaleString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card className="gradient-card animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Equipment Daily Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipmentTypes.map((equipment) => {
                    const userRate = equipmentRates.find(r => r.equipment_type_id === equipment.id);
                    const currentRate = userRate ? userRate.daily_rate: equipment.daily_rate ;
                    
                    return (
                      <Card key={equipment.id} className="gradient-card card-hover">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{equipment.name}</h4>
                            <Badge className='text-white'>KSh {currentRate.toLocaleString()}/day</Badge>
                          </div>
                          {equipment.description && (
                            <p className="text-sm text-muted-foreground mb-3">{equipment.description}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              defaultValue={currentRate}
                              onChange={(e) => setTempValues({
                                ...tempValues,
                                [`equipment-${equipment.id}`]: parseFloat(e.target.value) || 0
                              })}
                              className="flex-1"
                            />
                            <Button 
                              size="sm"
                              onClick={() => handleSave('equipment', equipment.id, tempValues[`equipment-${equipment.id}`] || currentRate)}
                              disabled={loading}
                            >
                              <Save className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport" className="space-y-4">
            <Card className="gradient-card animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Transport Rates by Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[profile.location].map((region) => {
                    const rate = transportRates.find(r => r.region === region);
                    const costPerKm = rate ? rate.cost_per_km : 50;
                    const baseCost = rate ? rate.base_cost : 500;
                    
                    return (
                      <Card key={region} className="gradient-card card-hover">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3">{region}</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">Cost per KM (KSh)</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  defaultValue={costPerKm}
                                  onChange={(e) => setTempValues({
                                    ...tempValues,
                                    [`transport-${region}-km`]: parseFloat(e.target.value) || 0
                                  })}
                                  className="flex-1"
                                />
                                <Button 
                                  size="sm"
                                  onClick={() => handleSave('transport', `${region}-km`, tempValues[`transport-${region}-km`] || costPerKm)}
                                  disabled={loading}
                                >
                                  <Save className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">Base Cost (KSh)</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  defaultValue={baseCost}
                                  onChange={(e) => setTempValues({
                                    ...tempValues,
                                    [`transport-${region}-base`]: parseFloat(e.target.value) || 0
                                  })}
                                  className="flex-1"
                                />
                                <Button 
                                  size="sm"
                                  onClick={() => handleSave('transport', `${region}-base`, tempValues[`transport-${region}-base`] || baseCost)}
                                  disabled={loading}
                                >
                                  <Save className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card className="gradient-card animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Additional Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalServices.map((service) => {
                    const userRate = serviceRates.find(r => r.service_id === service.id);
                    const currentPrice = userRate ? userRate.price : service.default_price;
                    
                    return (
                      <Card key={service.id} className="gradient-card card-hover">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge className='text-black' variant="secondary">{service.category}</Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              defaultValue={currentPrice}
                              onChange={(e) => setTempValues({
                                ...tempValues,
                                [`service-${service.id}`]: parseFloat(e.target.value) || 0
                              })}
                              className="flex-1"
                            />
                            <Button 
                              size="sm"
                              onClick={() => handleSave('service', service.id, tempValues[`service-${service.id}`] || currentPrice)}
                              disabled={loading}
                            >
                              <Save className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="subcontractors" className="space-y-4">
      <Card className="gradient-card animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Subcontractor Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((sub) => (
              <Card key={sub.id} className="gradient-card card-hover">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{sub.name}</h4>
                    <Badge className="text-white">
                      KSh {Number(sub.price || 0).toLocaleString()}/{sub.unit ?? "unit"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      defaultValue={Number(sub.price || 0)}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          [sub.id]: parseFloat(e.target.value) || 0
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSave('subcontractor', sub.id, tempValues[sub.id] || sub.rate)
                      }
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Variables;
