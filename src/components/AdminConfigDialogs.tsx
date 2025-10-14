import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMaterialPrices } from "@/hooks/useMaterialPrices";
import { Settings, Plus, Edit } from "lucide-react";
"use client";
import { supabase } from "@/integrations/supabase/client";
export const MaterialPricesDialog = () => {
    const { materials, updateMaterialPrice, createMaterial, loading } = useMaterialPrices();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [inputMode, setInputMode] = useState<"simple" | "json">("simple");
    const [formData, setFormData] = useState<any>({
        name: "",
        unit: "",
        price: "",
        category: "building_materials",
        description: "",
        type: {}
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let payload;
            if (inputMode === "simple") {
                payload = {
                    ...formData,
                    price: parseFloat(formData.price),
                    type: null
                };
            }
            else {
                payload = {
                    ...formData,
                    type: formData.type,
                    price: null
                };
            }
            if (editingMaterial) {
                await updateMaterialPrice(editingMaterial.id, payload);
                toast({ title: "Success", description: "Material updated successfully" });
            }
            else {
                await createMaterial(payload);
                toast({ title: "Success", description: "Material created successfully" });
            }
            setFormData({ name: "", unit: "", price: "", category: "building_materials", description: "", type: {} });
            setEditingMaterial(null);
            setInputMode("simple");
        }
        catch (error) {
            toast({ title: "Error", description: "Failed to save material", variant: "destructive" });
        }
    };
    const startEdit = (material: any) => {
        setEditingMaterial(material);
        setInputMode(material.type ? "json" : "simple");
        setFormData({
            ...material,
            price: material.price ? material.price.toString() : "",
            type: material.type || {}
        });
    };
    return (<Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2"/>
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Material Base Prices</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium sm:text-lg text-white">
            {editingMaterial ? "Edit Material" : "Add New Material"}
          </h3>

          
          <div>
            <Label className="text-white">Input Mode</Label>
            <Select value={inputMode} onValueChange={(val: any) => setInputMode(val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="json">Structured (JSON)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          
          {inputMode === "simple" && (<div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required/>
              </div>
              <div>
                <Label className="text-white">Unit</Label>
                <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required/>
              </div>
              <div>
                <Label className="text-white">Base Price (KSh)</Label>
                <Input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required/>
              </div>
              <div>
                <Label className="text-white">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building_materials">Building Materials</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>)}

          
          {inputMode === "json" && (<div>
              <Label className="text-white">Material JSON</Label>
              <Textarea value={JSON.stringify(formData.type, null, 2)} onChange={(e) => {
                try {
                    const parsed = JSON.parse(e.target.value || "{}");
                    setFormData({ ...formData, type: parsed });
                }
                catch {
                    setFormData({ ...formData, type: e.target.value });
                }
            }} placeholder="Paste JSON here (e.g. [{&quot;type&quot;:&quot;Flush&quot;,&quot;sizes_m&quot;:[&quot;0.9 × 2.1&quot;],&quot;frame_options&quot;:[&quot;Wood&quot;],&quot;price_kes&quot;:{&quot;0.9 × 2.1 m&quot;:6500}}])" rows={8}/>
            </div>)}

          <div className="flex gap-2">
            <Button className="text-gray-50" type="submit" disabled={loading}>
              {editingMaterial ? "Update" : "Create"} Material
            </Button>
            {editingMaterial && (<Button type="button" variant="outline" onClick={() => {
                setEditingMaterial(null);
                setFormData({ name: "", unit: "", price: "", category: "building_materials", description: "", type: {} });
                setInputMode("simple");
            }}>Cancel</Button>)}
          </div>
        </form>

        
        <div className="space-y-2">
          <h3 className="font-medium text-sm sm:text-lg text-white">Existing Materials</h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {materials.map((material) => (<div key={material.id} className="flex items-center justify-between p-3 border rounded-sm">
                <div>
                  <div className="font-medium text-white">
                    {material.name || "Structured Material"}
                  </div>
                  <div className="text-sm text-white">
                    {!material.type
                ? `KSh ${material.price} per ${material.unit} • ${material.category}`
                : `Structured JSON`}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(material)}>
                  <Edit className="w-4 h-4"/>
                </Button>
              </div>))}
          </div>
        </div>
      </DialogContent>
    </Dialog>);
};
export const RegionalPricingDialog = () => {
    const { multipliers, updateRegionalMultiplier, loading } = useMaterialPrices();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [editValues, setEditValues] = useState<{
        [key: string]: string;
    }>({});
    const handleUpdate = async (id: string, region: string) => {
        try {
            const newMultiplier = parseFloat(editValues[id] || "1.0");
            await updateRegionalMultiplier(id, newMultiplier);
            toast({ title: "Success", description: `Updated multiplier for ${region}` });
            setEditValues({ ...editValues, [id]: "" });
        }
        catch (error) {
            toast({ title: "Error", description: "Failed to update multiplier", variant: "destructive" });
        }
    };
    return (<Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2"/>
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regional Price Multipliers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4  scrollbar-hide">
          {multipliers.map((multiplier) => (<div key={multiplier.id} className="flex items-center justify-between p-3 border  border-white/20 dark:border-slate-600/20 rounded">
              <div>
                <div className="font-medium text-white">{multiplier.region}</div>
                <div className="text-sm text-white">
                  Current: {multiplier.multiplier}x
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" step="0.01" min="0.5" max="2.0" placeholder={multiplier.multiplier.toString()} value={editValues[multiplier.id] || ""} onChange={(e) => setEditValues({ ...editValues, [multiplier.id]: e.target.value })} className="w-20"/>
                <Button size="sm" className="text-white" onClick={() => handleUpdate(multiplier.id, multiplier.region)} disabled={loading || !editValues[multiplier.id]}>
                  Update
                </Button>
              </div>
            </div>))}
        </div>
      </DialogContent>
    </Dialog>);
};
export const EquipmentTypesDialog = () => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        unit: "",
        total_cost: "",
        description: ""
    });
    const fetchEquipment = async () => {
        const { data, error } = await supabase.from("equipment_types").select("*");
        if (error) {
            toast({ title: "Error", description: "Failed to load equipment types", variant: "destructive" });
        }
        else {
            setEquipmentTypes(data || []);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                total_cost: parseFloat(formData.total_cost),
            };
            if (editingEquipment) {
                const { error } = await supabase
                    .from("equipment_types")
                    .update(payload)
                    .eq("id", editingEquipment.id);
                if (!error) {
                    toast({ title: "Success", description: "Equipment updated successfully" });
                }
                else {
                    throw error;
                }
            }
            else {
                const { error } = await supabase.from("equipment_types").insert([payload]);
                if (!error) {
                    toast({ title: "Success", description: "New equipment created successfully" });
                }
                else {
                    throw error;
                }
            }
            setFormData({ name: "", unit: "", total_cost: "", description: "" });
            setEditingEquipment(null);
            fetchEquipment();
        }
        catch (err) {
            toast({ title: "Error", description: "Failed to save equipment", variant: "destructive" });
        }
        finally {
            setLoading(false);
        }
    };
    const startEdit = (equipment: any) => {
        setEditingEquipment(equipment);
        setFormData({
            name: equipment.name,
            unit: equipment.unit,
            total_cost: equipment.total_cost.toString(),
            description: equipment.description || ""
        });
    };
    return (<Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open)
                fetchEquipment();
        }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2"/>
          Configure
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Equipment Types</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-white/20 dark:border-slate-600/20 rounded-lg">
            <h3 className="font-medium text-white">{editingEquipment ? "Edit Equipment" : "Add New Equipment"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required/>
              </div>
              <div>
                <Label className="text-white">Cost (KSh)</Label>
                <Input type="number" min="0" step="0.01" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })} required/>
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="text-white" type="submit" disabled={loading}>
                {editingEquipment ? "Update" : "Create"} Equipment
              </Button>
              {editingEquipment && (<Button type="button" variant="outline" onClick={() => {
                setEditingEquipment(null);
                setFormData({ name: "", unit: "", total_cost: "", description: "" });
            }}>
                  Cancel
                </Button>)}
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="font-medium text-white">Existing Equipment</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
              {equipmentTypes.map((equipment) => (<div key={equipment.id} className="flex items-center justify-between p-3 border border-white/20 dark:border-slate-600/20 rounded-sm">
                  <div>
                    <div className="font-medium text-white">{equipment.name}</div>
                    <div className="text-sm text-white">
                      KSh {Number(equipment.total_cost).toLocaleString()} 
                    </div>
                    <div className="text-xs text-white">{equipment.description}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startEdit(equipment)}>
                    <Edit className="w-4 h-4"/>
                  </Button>
                </div>))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
};
