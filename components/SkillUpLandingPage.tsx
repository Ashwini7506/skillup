
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { useTypewriter } from "@/hooks/useTypewriter";
import joblists from "@/utils/joblists";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FolderOpen, 
  Kanban, 
  Layout, 
  TrendingUp, 
  UserCheck, 
  BarChart3, 
  Award,
  ChevronDown,
  Menu,
  X,
  Quote,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Target,
  ReceiptPoundSterlingIcon,
  Clock,
  Star
} from 'lucide-react';

interface SkillUpLandingPageProps {
  isLoggedIn: boolean;
  user?: { id: string }; // Add user prop for pricing integration
}

const SkillUpLandingPage = ({ isLoggedIn, user }: SkillUpLandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedPlan, setSelectedPlan] = useState<string>('FREE');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const typewriterText = useTypewriter({
    words: joblists,
    typeSpeed: 100,
    deleteSpeed: 50,
    delayBetweenWords: 2000,
  });

  const quotes = [
    "Do you know a normal human reads top-left corner first? Putting the most important things in your CV will likely increase chances of hooking hiring managers quickly.",
    "Studies show recruiters spend only 6 seconds scanning a resume before deciding if it's worth reading further.",
    "90% of Fortune 500 companies use AI to screen resumes. Are you optimizing for both human and AI readers?",
    "The average job posting receives 250 applications. Standing out isn't optional—it's essential.",
    "Networking accounts for 85% of jobs filled. Your connections matter more than your perfections."
  ];

  const features = [
    {
      icon: Users,
      title: "Collaborative Networking",
      description: "Find people to collaborate with, build professional relationships",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: FolderOpen,
      title: "Project Curation",
      description: "Showcase and organize your best work intelligently",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Kanban,
      title: "Project Management",
      description: "Kanban boards, agile methodologies, task tracking",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Layout,
      title: "Portfolio Builder",
      description: "Create stunning, personalized portfolios",
      gradient: "from-rose-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Skill Tracking",
      description: "Monitor your growth and identify areas for improvement",
      gradient: "from-orange-500 to-yellow-600"
    },
    {
      icon: UserCheck,
      title: "Mentorship Matching",
      description: "Connect with industry experts and mentors",
      gradient: "from-yellow-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Job Market Insights",
      description: "Get real-time data on industry trends and opportunities",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: Award,
      title: "Personal Branding",
      description: "Build your professional online presence",
      gradient: "from-teal-500 to-blue-600"
    }
  ];

  const pricingPlans = [
    {
      id: 'FREE',
      name: 'Free',
      price: '₹0',
      period: '3-day trial',
      description: 'Perfect for trying out our platform',
      icon: Clock,
      features: [
        'Access to basic features',
        '3-day trial period',
        'Community support',
        'Basic templates',
        'Limited projects'
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: '₹50',
      period: 'month',
      description: 'Best for individual professionals',
      icon: Star,
      popular: true,
      features: [
        'All Free features',
        'Unlimited projects',
        'Advanced templates',
        'Priority support',
        'Export capabilities',
        'Analytics dashboard'
      ]
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '₹120',
      period: 'quarter',
      description: 'Ideal for teams and organizations',
      icon: Zap,
      features: [
        'All Pro features',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'Custom branding',
        'API access'
      ]
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to select a plan');
      return;
    }

    setLoading(true);
    try {
      if (planId === 'FREE') {
        // For free plan, just create the subscription via GET request
        const response = await fetch(`/api/subscription?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to create free subscription');
        }

        toast.success('Free trial started! Welcome aboard!');
      } else {
        // For paid plans, upgrade the subscription
        const response = await fetch('/api/subscription/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            plan: planId
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upgrade subscription');
        }

        toast.success(`Successfully subscribed to ${planId} plan!`);
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set up subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse"></div>
        </div>
        
        {/* Floating Gears */}
        <div className="absolute top-1/4 left-1/3 animate-spin-slow">
          <div className="w-16 h-16 border-2 border-blue-300/20 rounded-full">
            <div className="absolute inset-2 border-2 border-blue-300/20 rounded-full"></div>
            <div className="absolute inset-4 border-2 border-blue-300/20 rounded-full"></div>
          </div>
        </div>
        
        <div className="absolute bottom-1/3 right-1/3 animate-spin-slow-reverse">
          <div className="w-12 h-12 border-2 border-purple-300/20 rounded-full">
            <div className="absolute inset-1 border-2 border-purple-300/20 rounded-full"></div>
            <div className="absolute inset-3 border-2 border-purple-300/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillUp
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['Home', 'Features', 'Pricing', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    activeSection === item.toLowerCase() ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/workspace">Go to Growth space</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" className="hover:text-blue-600">
                    <LoginLink>Sign In</LoginLink>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <RegisterLink>Get Started</RegisterLink>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              {['Home', 'Features', 'Pricing', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-2">
                {isLoggedIn ? (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/workspace">Go to Growth space</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <LoginLink>Sign In</LoginLink>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <RegisterLink>Get Started</RegisterLink>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Hello Future{' '}
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6">
              Fasten your seatbelt for a crazy adventure to your future
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Your personal Growth Space for better productivity and career acceleration
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isLoggedIn ? (
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                <Link href="/workspace">
                  Go to Growth space
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                  <RegisterLink>
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </RegisterLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4 border-2 hover:bg-gray-50">
                  <LoginLink>Sign In</LoginLink>
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => scrollToSection('features')}
              className="animate-bounce text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Powerful Features for Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional Growth
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to accelerate your career and build meaningful professional relationships
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="py-20 px-4 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Insights
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Quick tips to accelerate your professional growth
            </p>
          </div>

          <div className="relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 min-h-[200px] flex items-center justify-center">
              <div className="flex items-start space-x-4">
                <Quote className="w-8 h-8 text-blue-600 flex-shrink-0 mt-2" />
                <p className="text-lg text-gray-700 leading-relaxed animate-fade-in">
                  {quotes[currentQuoteIndex]}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuoteIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentQuoteIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Growth Plan
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl scale-105'
                      : isSelected
                      ? 'bg-white/80 backdrop-blur-sm shadow-xl border-2 border-blue-500'
                      : 'bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/20'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {isSelected && !plan.popular && (
                    <div className="absolute -top-4 right-4">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Selected
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        plan.popular ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          plan.popular ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-4 ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-white' : 'text-green-600'
                        }`} />
                        <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-3 transition-all duration-300 ${
                      isSelected
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : plan.popular
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanSelection(plan.id);
                    }}
                    disabled={loading}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Setting up...
                      </div>
                    ) : isSelected ? (
                      'Get Started'
                    ) : (
                      'Select Plan'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Questions about our plans? <a href="#" className="text-blue-600 hover:underline">Contact our team</a>
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
              <span>✓ No setup fees</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold">SkillUp</h3>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md text-lg">
                🌟 Bridging the gap between academic knowledge and industry requirements through 
                personalized learning experiences and real-world projects.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><a href="/help-center" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">❓</span> Help Center
                </a></li>
                <li><a href="/subscription-policies" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2"><ReceiptPoundSterlingIcon/></span> Subscription Policies
                </a></li>
                <li><a href="/faq" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">💬</span> FAQ
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg"> 2025 SkillUp. All rights reserved. Made with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SkillUpLandingPage;
