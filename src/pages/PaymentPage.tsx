
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  CreditCard,
  Smartphone,
  Check,
  ArrowLeft,
  Wrench,
  Crown,
  Shield,
  Star,
  ThumbsDown,
  ThumbsUp,
  Shell,
  PiggyBank,
  ArrowUpFromDot
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Arrow } from '@radix-ui/react-tooltip';
import { Checkbox } from '@/components/ui/checkbox';

export interface tiers {
  id: string; 
  name: string; 
  price: number;
  period: string; 
  features: [];
  popular:boolean;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<tiers[]>([])
  const location = useLocation();
  const { profile, updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
        const fetchTiers = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('tiers').select('*').order('id');
          if (error) {
          } else {
            setTiers(data || []);
          }
          setLoading(false);
        };
    
        fetchTiers();
      }, [user, location.key]);

      const getTierBadge = (tier: string) => {
            switch (tier) {
              case 'Free':
                return <Badge className="bg-green-100 hover:border-green-800 text-green-800 hover:bg-green-100 hover:bg-green-900 hover:text-green-200 p-2"><Shell className='w-5 h-5 m-1'/></Badge>;
              case 'Intermediate':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 hover:bg-blue-900 hover:text-blue-200 p-2"><Crown className=" w-5 h-5 m-1" /></Badge>;
              case 'Professional':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 hover:bg-purple-900 hover:text-purple-200 p-2"><Shield className="w-5 h-5 m-1" /></Badge>;
              default:
                return <Badge>{tier}</Badge>;
            }
          };

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Pay with your mobile money'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Visa, Mastercard, or American Express'
    }
  ];

  useEffect(() => {
    if (profile) {
      switch (profile.tier) {
        case 'Free':
          setSelectedPlan('Free');
          break;
        case 'Intermediate':
          setSelectedPlan('Intermediate');
          break;
        case 'Professional':
          setSelectedPlan('Professional');
          break;
        default:
          setSelectedPlan('Free'); // stays the same or set fallback
          break;
      }
    }
  }, [profile]);

  if(!user){
    navigate('/auth')
  }

  const handlePayment = async () => {
    if (!selectedPlan || !paymentMethod) {
      toast({
        title: "Selection Required",
        description: "Please select a plan and payment method.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate payment processing
      toast({
        title: "Processing Payment",
        description: "Please wait while we process your payment...",
      });

      // Simulate payment delay
      setTimeout(async () => {
        try {
          await updateProfile({ tier: selectedPlan as 'Free' | 'Intermediate' | 'Professional' });
          toast({
            title: "Payment Successful!",
            variant: 'default',
            description: `Welcome to ${selectedPlan} plan!`,
          });
          navigate('/dashboard');
        } catch (error) {
          toast({
            title: "Update Failed",
            description: "Payment successful but failed to update profile. Please contact support.",
            variant: "destructive"
          });
        }
      }, 2000);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const selectedPlanDetails = tiers.find(plan => plan.name === selectedPlan);

  return (
    <div className="min-h-screen animate-fade-in smooth-transition">
     
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="sm:text-3xl sm:text-2xl text-lg flex items-center justify-center font-bold bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            <ArrowUpFromDot className="w-8 h-8 mr-2 text-blue-900 dark:text-blue-300" />
            Upgrade Your Plan</h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-purple-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">Choose the plan that fits your construction business needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle>Select Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiers.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer dark:hover:border-white/30 transition-all ${
                      selectedPlan === plan.name
                        ? 'dark:border-white border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${plan.name === profile?.tier ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => plan.name !== profile?.tier && setSelectedPlan(plan.name)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-4 bg-secondary text-gray-700">
                        Most Popular
                      </Badge>
                    )}
                    {plan.name === profile?.tier && (
                      <Badge className="absolute -top-2 right-4 text-white bg-green-900">
                        Current Plan
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getTierBadge(plan.name)}`}>
                          {getTierBadge(plan.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="sm:text-2xl text-lg font-bold font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                            {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                          </p>
                        </div>
                      </div>
                      {selectedPlan === plan.name && (
                        <div className={`w-5 h-5 bg-primary dark:bg-white rounded-full flex items-center justify-center`}>
                          <Check className="w-3 h-3 text-white dark:text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods & Summary */}
          <div className="space-y-6">
            <Card className='gradient-card'>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer dark:hover:border-white/30 transition-all ${
                      paymentMethod === method.id
                        ? 'dark:border-white border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="w-5 h-5 bg-primary dark:bg-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 dark:text-primary text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary */}
            {selectedPlanDetails && (
              <Card className='gradient-card'>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={`flex justify-between ${getTierBadge(selectedPlanDetails.name)}`}>
                      <span className={` ${getTierBadge(selectedPlanDetails.name)}`}>{selectedPlanDetails.name} Plan
                      </span>
                      <span className="font-medium">
                        {selectedPlanDetails.price === 0 
                          ? 'Free' 
                          : `KSh ${selectedPlanDetails.price.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>
                          {selectedPlanDetails.price === 0 
                            ? 'Free' 
                            : `KSh ${selectedPlanDetails.price.toLocaleString()}/month`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full text-white" 
              size="lg"
              onClick={handlePayment}
              disabled={!selectedPlan || (selectedPlanDetails?.price === 0 && !paymentMethod) || selectedPlan === profile?.tier}
            >
              {selectedPlan === profile?.tier 
                ? 'Current Plan' 
                : selectedPlanDetails?.price === 0 
                  ? 'Downgrade to Free' 
                  : 'Complete Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
