
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  FileText, 
  Calculator, 
  Users, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Star,
  Building,
  Clock
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 smooth-transition">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3">Constructly</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/auth?mode=signin">
                <Button variant="ghost" className="rounded-full hover:bg-primary/10">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 fade-in">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-primary border-primary/30 bg-primary/5 rounded-full px-4 py-2">
            Professional Construction Management
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 dark:from-white dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6 leading-tight">
            Build Accurate Quotes in Minutes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Streamline your construction business with professional quote generation, 
            project management, and client communication tools designed for contractors in Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth?mode=signin">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Everything You Need to Manage Construction Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From initial quotes to project completion, we've got you covered with professional tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Professional Quotes",
                description: "Generate detailed, accurate quotes with material costs, labor estimates, and project timelines.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: <Calculator className="w-8 h-8" />,
                title: "Cost Calculator",
                description: "Built-in calculator with current market rates for materials and labor in Kenya.",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Client Management",
                description: "Keep track of all your clients, projects, and communication in one place.",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Business Analytics",
                description: "Track your revenue, project success rates, and business growth over time.",
                gradient: "from-orange-500 to-orange-600"
              },
              {
                icon: <Building className="w-8 h-8" />,
                title: "Project Types",
                description: "Support for residential, commercial, and infrastructure construction projects.",
                gradient: "from-red-500 to-red-600"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Time Tracking",
                description: "Monitor project timelines and ensure deliveries are on schedule.",
                gradient: "from-indigo-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="gradient-card rounded-2xl border-0 shadow-lg card-hover slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg w-fit mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 from-slate-100/50 to-blue-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "KSh 0",
                period: "forever",
                features: ["3 quotes per month", "Basic templates", "Email support"],
                popular: false
              },
              {
                name: "Intermediate",
                price: "KSh 2,500",
                period: "per month",
                features: ["Unlimited quotes", "Advanced templates", "Priority support", "Analytics dashboard"],
                popular: true
              },
              {
                name: "Premium",
                price: "KSh 5,000",
                period: "per month",
                features: ["Everything in Intermediate", "Custom branding", "API access", "Dedicated support"],
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`gradient-card rounded-2xl border-0 shadow-lg card-hover slide-up relative ${plan.popular ? 'ring-2 ring-primary' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth?mode=signup">
                    <Button className={`w-full rounded-full transition-all duration-300 text-gray ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl' 
                        : 'variant-outline border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-white/20 dark:border-slate-700/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3">Constructly</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering construction professionals across Kenya with modern project management tools.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Sign In</Link>
            <Link to="/auth?mode=signup" className="text-muted-foreground hover:text-primary transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
