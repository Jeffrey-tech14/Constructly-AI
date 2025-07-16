
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { Settings, Plus, Edit } from 'lucide-react';

'use client';
import { supabase } from '@/integrations/supabase/client';

export const MaterialPricesDialog = () => {
  const { materials, updateMaterialPrice, createMaterial, loading } = useMaterialPrices();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    base_price: '',
    category: 'building_materials',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await updateMaterialPrice(editingMaterial.id, {
          ...formData,
          base_price: parseFloat(formData.base_price)  // Convert to cents
        });
        toast({ title: "Success", description: "Material price updated successfully" });
      } else {
        await createMaterial({
          ...formData,
          base_price: parseFloat(formData.base_price)  // Convert to cents
        });
        toast({ title: "Success", description: "Material created successfully" });
      }
      setFormData({ name: '', unit: '', base_price: '', category: 'building_materials', description: '' });
      setEditingMaterial(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save material", variant: "destructive" });
    }
  };

  const startEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      base_price: (material.base_price).toString(),
      category: material.category,
      description: material.description || ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Material Base Prices</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">{editingMaterial ? 'Edit Material' : 'Add New Material'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Base Price (KSh)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building_materials">Building Materials</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button className='text-gray-50' type="submit" disabled={loading}>
                {editingMaterial ? 'Update' : 'Create'} Material
              </Button>
              {editingMaterial && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingMaterial(null);
                  setFormData({ name: '', unit: '', base_price: '', category: 'building_materials', description: '' });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="font-medium">Existing Materials</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {materials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{material.name}</div>
                    <div className="text-sm text-muted-foreground">
                      KSh {(material.base_price).toLocaleString()} per {material.unit} • {material.category}
                    </div>
                  </div>
                  <Button className='text-white' size="sm" variant="outline" onClick={() => startEdit(material)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const RegionalPricingDialog = () => {
  const { multipliers, updateRegionalMultiplier, loading } = useMaterialPrices();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});

  const handleUpdate = async (id: string, region: string) => {
    try {
      const newMultiplier = parseFloat(editValues[id] || '1.0');
      await updateRegionalMultiplier(id, newMultiplier);
      toast({ title: "Success", description: `Updated multiplier for ${region}` });
      setEditValues({ ...editValues, [id]: '' });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update multiplier", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regional Price Multipliers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {multipliers.map((multiplier) => (
            <div key={multiplier.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{multiplier.region}</div>
                <div className="text-sm text-muted-foreground">
                  Current: {multiplier.multiplier}x
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.0"
                  placeholder={multiplier.multiplier.toString()}
                  value={editValues[multiplier.id] || ''}
                  onChange={(e) => setEditValues({ ...editValues, [multiplier.id]: e.target.value })}
                  className="w-20"
                />
                <Button 
                  size="sm" 
                  className='text-white'
                  onClick={() => handleUpdate(multiplier.id, multiplier.region)}
                  disabled={loading || !editValues[multiplier.id]}
                >
                  Update
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};


export const EquipmentTypesDialog = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    daily_rate: '',
    description: ''
  });

  // 🔥 Fetch equipment on open
  const fetchEquipment = async () => {
    const { data, error } = await supabase.from('equipment_types').select('*');
    if (error) {
      toast({ title: "Error", description: "Failed to load equipment types", variant: "destructive" });
    } else {
      setEquipmentTypes(data || []);
    }
  };

  // 🔥 Save new or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        daily_rate: parseFloat(formData.daily_rate),
      };

      if (editingEquipment) {
        // Update
        const { error } = await supabase
          .from('equipment_types')
          .update(payload)
          .eq('id', editingEquipment.id);

        if (!error) {
          toast({ title: "Success", description: "Equipment updated successfully" });
        } else {
          throw error;
        }
      } else {
        // Create
        const { error } = await supabase.from('equipment_types').insert([payload]);

        if (!error) {
          toast({ title: "Success", description: "New equipment created successfully" });
        } else {
          throw error;
        }
      }

      setFormData({ name: '', unit: '', daily_rate: '', description: '' });
      setEditingEquipment(null);
      fetchEquipment();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save equipment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (equipment: any) => {
    setEditingEquipment(equipment);
    setFormData({
      name: equipment.name,
      unit: equipment.unit,
      daily_rate: equipment.daily_rate.toString(),
      description: equipment.description || ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchEquipment();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Equipment Types</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 🔥 Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">{editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Daily Rate (KSh)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className='text-white' type="submit" disabled={loading}>
                {editingEquipment ? 'Update' : 'Create'} Equipment
              </Button>
              {editingEquipment && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingEquipment(null);
                  setFormData({ name: '', unit: '', daily_rate: '', description: '' });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* 🔥 Existing Equipment */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Equipment</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {equipmentTypes.map((equipment) => (
                <div key={equipment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{equipment.name}</div>
                    <div className="text-sm text-muted-foreground">
                      KSh {Number(equipment.daily_rate).toLocaleString()} / {equipment.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">{equipment.description}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startEdit(equipment)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

