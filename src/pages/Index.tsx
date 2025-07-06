
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Globe, Calculator, FileText, Users, Wrench, Zap } from 'lucide-react';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sw' : 'en');
  };

  const text = {
    en: {
      tagline: "Professional Construction Quotes Made Simple",
      subtitle: "Create accurate construction quotes in minutes with our Kenya-focused platform. From materials to labor costs, we've got you covered.",
      cta: "Start Building Quotes",
      features: "Why Choose Constructly?",
      pricing: "Simple, Transparent Pricing",
      testimonials: "What Our Builders Say",
      getStarted: "Get Started Today",
      signIn: "Sign In",
      language: "Kiswahili"
    },
    sw: {
      tagline: "Karatasi za Ujenzi za Kitaalamu Zimepangwa Rahisi",
      subtitle: "Unda karatasi za ujenzi sahihi katika dakika chache na jukwaa letu la Kenya. Kutoka vifaa hadi gharama za wafanyakazi, tumekufunikia.",
      cta: "Anza Kuunda Karatasi",
      features: "Kwa Nini Uchague Constructly?",
      pricing: "Bei Rahisi na Wazi",
      testimonials: "Wajenzi Wanasemaje",
      getStarted: "Anza Leo",
      signIn: "Ingia",
      language: "English"
    }
  };

  const features = [
    {
      icon: <Calculator className="w-8 h-8 text-primary" />,
      title: language === 'en' ? "Smart Quote Builder" : "Muundaji wa Karatasi Mahiri",
      description: language === 'en' ? "6-step wizard with Kenya-specific pricing" : "Hatua 6 za kuongoza na bei za Kenya"
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: language === 'en' ? "Regional Pricing" : "Bei za Kikanda",
      description: language === 'en' ? "Location-based cost adjustments for accuracy" : "Marekebisho ya gharama kulingana na eneo"
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: language === 'en' ? "Professional PDFs" : "PDF za Kitaalamu",
      description: language === 'en' ? "Export detailed quotes as polished documents" : "Hamisha karatasi za kina kama hati nzuri"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: language === 'en' ? "Team Management" : "Usimamizi wa Timu",
      description: language === 'en' ? "Collaborate with your construction team" : "Shirikiana na timu yako ya ujenzi"
    }
  ];

  const pricingTiers = [
    {
      name: language === 'en' ? "Free" : "Bure",
      price: "KSh 0",
      period: language === 'en' ? "/month" : "/mwezi",
      description: language === 'en' ? "Perfect for small projects" : "Bora kwa miradi midogo",
      features: [
        language === 'en' ? "3 quotes per month" : "Karatasi 3 kwa mwezi",
        language === 'en' ? "Basic templates" : "Vifaa vya msingi",
        language === 'en' ? "Email support" : "Msaada wa barua pepe"
      ],
      popular: false
    },
    {
      name: language === 'en' ? "Intermediate" : "Wastani",
      price: "KSh 2,500",
      period: language === 'en' ? "/month" : "/mwezi",
      description: language === 'en' ? "For growing businesses" : "Kwa biashara zinazokua",
      features: [
        language === 'en' ? "Unlimited quotes" : "Karatasi bila kikomo",
        language === 'en' ? "PDF export" : "Hamisha PDF",
        language === 'en' ? "5 blueprint uploads" : "Upakiaji wa michoro 5",
        language === 'en' ? "Priority support" : "Msaada wa haraka"
      ],
      popular: true
    },
    {
      name: language === 'en' ? "Premium" : "Bora",
      price: "KSh 5,000",
      period: language === 'en' ? "/month" : "/mwezi",
      description: language === 'en' ? "Full-featured solution" : "Suluhisho kamili",
      features: [
        language === 'en' ? "Everything in Intermediate" : "Kila kitu katika Wastani",
        language === 'en' ? "3D preview" : "Onyesho la 3D",
        language === 'en' ? "Advanced analytics" : "Uchanganuzi wa hali ya juu",
        language === 'en' ? "24/7 phone support" : "Msaada wa simu 24/7"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "James Kiprop",
      role: language === 'en' ? "Construction Manager, Nairobi" : "Meneja wa Ujenzi, Nairobi",
      content: language === 'en' ? "Constructly has transformed how we handle quotes. The Kenya-specific pricing is spot on!" : "Constructly imebadilisha jinsi tunavyoshughulikia karatasi. Bei za Kenya ni sahihi kabisa!",
      rating: 5
    },
    {
      name: "Mary Wanjiku",
      role: language === 'en' ? "Architect, Mombasa" : "Muhandisi wa Michoro, Mombasa",
      content: language === 'en' ? "The 3D preview feature helps my clients visualize projects before construction begins." : "Kipengele cha onyesho la 3D kinasaidia wateja wangu kuona miradi kabla ya ujenzi kuanza.",
      rating: 5
    },
    {
      name: "David Mutua",
      role: language === 'en' ? "Building Contractor, Kisumu" : "Mkandarasi wa Ujenzi, Kisumu",
      content: language === 'en' ? "Professional PDFs and M-Pesa integration make client interactions seamless." : "PDF za kitaalamu na muunganiko wa M-Pesa hufanya maongezi na wateja kuwa rahisi.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Wrench className="w-8 h-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">Constructly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{text[language].language}</span>
              </Button>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  {text[language].signIn}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-200">
            <Zap className="w-4 h-4 mr-1" />
            {language === 'en' ? "Built for Kenya" : "Imejengwa kwa Kenya"}
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            {text[language].tagline}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {text[language].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                {text[language].cta}
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              {language === 'en' ? "Watch Demo" : "Ona Demo"}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {text[language].features}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {text[language].pricing}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative p-6 ${tier.popular ? 'ring-2 ring-primary shadow-xl' : 'hover:shadow-lg'} transition-all duration-300`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    {language === 'en' ? "Most Popular" : "Maarufu Zaidi"}
                  </Badge>
                )}
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-primary">{tier.price}</span>
                      <span className="text-gray-600 ml-1">{tier.period}</span>
                    </div>
                    <p className="text-gray-600 mt-2">{tier.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : 'bg-gray-900 hover:bg-gray-800'} text-white`}>
                    {text[language].getStarted}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {text[language].testimonials}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Wrench className="w-8 h-8 text-primary mr-2" />
              <span className="text-2xl font-bold">Constructly</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 Constructly. All rights reserved.</p>
              <p className="text-gray-400 text-sm mt-1">
                {language === 'en' ? "Built for Kenyan Construction Professionals" : "Imejengwa kwa Wataalamu wa Ujenzi wa Kenya"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
