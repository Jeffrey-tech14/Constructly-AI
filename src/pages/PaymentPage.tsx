
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Star
} from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const plans = [
    {
      id: 'Free',
      name: 'Free',
      price: 0,
      icon: <Star className="w-5 h-5" />,
      features: ['3 quotes/month', 'Basic templates', 'Email support'],
      color: 'bg-gray-100 text-gray-800',
      popular: false
    },
    {
      id: 'Intermediate',
      name: 'Intermediate',
      price: 2500,
      icon: <Crown className="w-5 h-5" />,
      features: ['Unlimited quotes', 'PDF export', '5 blueprint uploads', 'Priority support'],
      color: 'bg-blue-100 text-blue-800',
      popular: true
    },
    {
      id: 'Premium',
      name: 'Premium',
      price: 5000,
      icon: <Shield className="w-5 h-5" />,
      features: ['All Intermediate features', '3D preview', 'Advanced analytics', 'White-label reports', '24/7 support'],
      color: 'bg-purple-100 text-purple-800',
      popular: false
    }
  ];

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
      setSelectedPlan(profile.tier === 'Free' ? 'Intermediate' : 'Premium');
    }
  }, [profile]);

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
          await updateProfile({ tier: selectedPlan as 'Free' | 'Intermediate' | 'Premium' });
          toast({
            title: "Payment Successful!",
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

  const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Wrench className="w-8 h-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Constructly</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Upgrade Your Plan</h1>
          <p className="text-muted-foreground mt-2">Choose the plan that fits your construction business needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${plan.id === profile?.tier ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => plan.id !== profile?.tier && setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-4 bg-primary">
                        Most Popular
                      </Badge>
                    )}
                    {plan.id === profile?.tier && (
                      <Badge className="absolute -top-2 right-4 bg-green-500">
                        Current Plan
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${plan.color}`}>
                          {plan.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-2xl font-bold text-primary">
                            {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                            {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                          </p>
                        </div>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
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
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary bg-primary/5'
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
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary */}
            {selectedPlanDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{selectedPlanDetails.name} Plan</span>
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
              className="w-full" 
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
