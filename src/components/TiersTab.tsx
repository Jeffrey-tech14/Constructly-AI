import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TiersTab = ({ refreshKey }: { refreshKey: number }) => {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<{ id: number; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedPrices, setEditedPrices] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchTiers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tiers').select('*').order('id');
      if (error) {
        toast({ title: 'Error', description: 'Failed to fetch tiers', variant: 'destructive' });
      } else {
        setTiers(data || []);
      }
      setLoading(false);
    };

    fetchTiers();
  }, [refreshKey]);

  const savePrice = async (tierId: number) => {
    const newPrice = editedPrices[tierId];
    if (newPrice === undefined) return;

    const { error } = await supabase
      .from('tiers')
      .update({ price: newPrice })
      .eq('id', tierId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update price', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Tier price updated successfully' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className='gradient-card'>
      <CardHeader>
        <CardTitle>Subscription Tiers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tiers.map((tier) => (
          <div key={tier.id} className="flex items-center space-x-3">
            <div className="flex-1 font-medium">{tier.name}</div>
            <Input
              type="number"
              value={editedPrices[tier.id] ?? tier.price}
              onChange={(e) =>
                setEditedPrices({
                  ...editedPrices,
                  [tier.id]: parseInt(e.target.value) || 0
                })
              }
              className="w-32"
            />
            <Button className='text-white' size="sm" onClick={() => savePrice(tier.id)}>
              <Save className="w-4 h-4 mr-1 text-white" /> Save
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TiersTab;
