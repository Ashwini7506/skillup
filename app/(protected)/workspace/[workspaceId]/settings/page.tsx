'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, CreditCard, Plus, X, Upload, Crown, Github, Linkedin, FileText, Link, Save, Loader2 } from 'lucide-react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface UserSettings {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string;
  job: string;
  role: string;
  about: string;
  experience: string;
  positionOfResponsibility: string[];
  hardSkills: string[];
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
}

interface Subscription {
  id: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export default function SettingsPage() {

  const { user } = useKindeBrowserClient();

  const [settings, setSettings] = useState<UserSettings>({
    id: '',
    name: '',
    email: '',
    image: null,
    username: '',
    job: '',
    role: '',
    about: '',
    experience: '',
    positionOfResponsibility: [],
    hardSkills: [],
    linkedinUrl: '',
    githubUrl: '',
    resumeUrl: ''
  });

  const [subscription, setSubscription] = useState<Subscription>({
    id: '1',
    plan: 'FREE',
    status: 'ACTIVE',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newPosition, setNewPosition] = useState('');

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        id: user?.id || '',
        name: user?.given_name || '',
        email: user?.email || ''
      }));
    }
  }, [user]);

const updateSettings = async (updates: Partial<UserSettings>) => {
  if (!settings.id) return;

  setIsLoading(true);
  console.log('[UPDATE SETTINGS] Sending:', { userId: settings.id, updates });

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: settings.id,
        updates
      })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log('✅ Settings updated successfully:', data);

    setSettings(prev => ({ ...prev, ...updates }));
  } catch (error) {
    console.error('❌ Update error:', error);
  } finally {
    setIsLoading(false);
  }
};

  const addSkill = () => {
    if (newSkill.trim() && !settings.hardSkills.includes(newSkill.trim())) {
      updateSettings({
        hardSkills: [...settings.hardSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateSettings({
      hardSkills: settings.hardSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const addPosition = () => {
    if (newPosition.trim() && !settings.positionOfResponsibility.includes(newPosition.trim())) {
      updateSettings({
        positionOfResponsibility: [...settings.positionOfResponsibility, newPosition.trim()]
      });
      setNewPosition('');
    }
  };

  const removePosition = (positionToRemove: string) => {
    updateSettings({
      positionOfResponsibility: settings.positionOfResponsibility.filter(pos => pos !== positionToRemove)
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSettings({ image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubscriptionAction = async (action: 'upgrade' | 'cancel' | 'reactivate') => {
    console.log('[SUBSCRIPTION ACTION]', action);
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      switch (action) {
        case 'upgrade':
          console.log('[SUBSCRIPTION] Redirecting to checkout');
          window.open('https://checkout.lemonsqueezy.com/your-product-id', '_blank');
          break;
        case 'cancel':
          setSubscription(prev => {
            const updated = { ...prev, cancelAtPeriodEnd: true };
            console.log('[SUBSCRIPTION] Cancelled:', updated);
            return updated;
          });
          console.log('Subscription will be cancelled at the end of the current period');
          break;
        case 'reactivate':
          setSubscription(prev => {
            const updated = { ...prev, cancelAtPeriodEnd: false };
            console.log('[SUBSCRIPTION] Reactivated:', updated);
            return updated;
          });
          console.log('Subscription reactivated successfully');
          break;
      }
    } catch (error) {
      console.error('[ERROR] Subscription action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800';
      case 'PRO': return 'bg-blue-100 text-blue-800';
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanFeatures = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return ['Basic portfolio', 'Limited projects', 'Basic collaboration'];
      case 'PRO':
        return ['Advanced portfolio', 'Unlimited projects', 'Advanced collaboration', 'Analytics'];
      case 'ENTERPRISE':
        return ['Everything in Pro', 'Team management', 'Custom branding', 'Priority support'];
      default:
        return [];
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

const saveProfile = () => {
  if (!validateUrl(settings.linkedinUrl)) {
    console.error('Invalid LinkedIn URL');
    return;
  }
  if (!validateUrl(settings.githubUrl)) {
    console.error('Invalid GitHub URL');
    return;
  }
  if (!validateUrl(settings.resumeUrl)) {
    console.error('Invalid Resume URL');
    return;
  }

  updateSettings({
    name: settings.name,
    username: settings.username,
    job: settings.job,
    role: settings.role,
    about: settings.about,
    experience: settings.experience,
    linkedinUrl: settings.linkedinUrl,
    githubUrl: settings.githubUrl,
    resumeUrl: settings.resumeUrl,
    image: settings.image,
    hardSkills: settings.hardSkills,
    positionOfResponsibility: settings.positionOfResponsibility
  });
};


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Basic Profile */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Basic Profile</CardTitle>
                  <CardDescription className="text-gray-600">Update your basic profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-2 border-gray-200">
                      <AvatarImage src={settings.image || undefined} alt={settings.name} />
                      <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                        {settings.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild className="border-gray-300">
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Change Photo
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-gray-700">Username</Label>
                      <Input
                        id="username"
                        value={settings.username}
                        onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your username"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job" className="text-gray-700">Job Intention</Label>
                      <Input
                        id="job"
                        value={settings.job}
                        onChange={(e) => setSettings(prev => ({ ...prev, job: e.target.value }))}
                        placeholder="e.g., Product Manager"
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-gray-700">Current Role</Label>
                      <Input
                        id="role"
                        value={settings.role}
                        onChange={(e) => setSettings(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g., Senior Product Manager"
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="about" className="text-gray-700">Bio</Label>
                    <Textarea
                      id="about"
                      value={settings.about}
                      onChange={(e) => setSettings(prev => ({ ...prev, about: e.target.value }))}
                      placeholder="Tell us about yourself and your passion for your field..."
                      rows={4}
                      className="border-gray-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-gray-700">Experience</Label>
                    <Textarea
                      id="experience"
                      value={settings.experience}
                      onChange={(e) => setSettings(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Describe your professional experience..."
                      rows={4}
                      className="border-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Social Links</CardTitle>
                  <CardDescription className="text-gray-600">Add your professional social media links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="linkedin" className="text-gray-700 flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin"
                      value={settings.linkedinUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-gray-700 flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub URL
                    </Label>
                    <Input
                      id="github"
                      value={settings.githubUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/yourusername"
                      className="border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resume" className="text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resume URL
                    </Label>
                    <Input
                      id="resume"
                      value={settings.resumeUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, resumeUrl: e.target.value }))}
                      placeholder="https://yourresume.com/resume.pdf"
                      className="border-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Hard Skills</CardTitle>
                  <CardDescription className="text-gray-600">Add your technical skills and expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter a skill"
                      className="border-gray-300"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline" size="sm" className="border-gray-300">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.hardSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Positions of Responsibility */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Positions of Responsibility</CardTitle>
                  <CardDescription className="text-gray-600">Add leadership roles and responsibilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      placeholder="Enter a position"
                      className="border-gray-300"
                      onKeyPress={(e) => e.key === 'Enter' && addPosition()}
                    />
                    <Button onClick={addPosition} variant="outline" size="sm" className="border-gray-300">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.positionOfResponsibility.map((position, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                        {position}
                        <button
                          onClick={() => removePosition(position)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              {/* Current Plan */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Current Plan</CardTitle>
                  <CardDescription className="text-gray-600">Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getPlanColor(subscription.plan)}>
                        {subscription.plan === 'ENTERPRISE' && <Crown className="w-3 h-3 mr-1" />}
                        {subscription.plan}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Status: {subscription.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {subscription.plan === 'FREE' ? '$0' : subscription.plan === 'PRO' ? '$9.99' : '$29.99'}
                      </div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        Your subscription will be cancelled at the end of the current billing period.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-6">
                    <h4 className="font-medium text-gray-900">Plan Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {getPlanFeatures(subscription.plan).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    {subscription.plan === 'FREE' && (
                      <Button 
                        onClick={() => handleSubscriptionAction('upgrade')}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4 mr-2" />
                        )}
                        Upgrade to Pro
                      </Button>
                    )}
                    {subscription.plan !== 'FREE' && !subscription.cancelAtPeriodEnd && (
                      <Button 
                        onClick={() => handleSubscriptionAction('cancel')}
                        variant="outline"
                        disabled={isLoading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Cancel Subscription
                      </Button>
                    )}
                    {subscription.cancelAtPeriodEnd && (
                      <Button 
                        onClick={() => handleSubscriptionAction('reactivate')}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Reactivate Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plan Comparison */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Plan Comparison</CardTitle>
                  <CardDescription className="text-gray-600">Compare features across different plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['FREE', 'PRO', 'ENTERPRISE'].map((plan) => (
                      <div key={plan} className="border border-gray-200 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <Badge className={getPlanColor(plan)} variant="secondary">
                            {plan === 'ENTERPRISE' && <Crown className="w-3 h-3 mr-1" />}
                            {plan}
                          </Badge>
                          <div className="text-2xl font-bold text-gray-900 mt-2">
                            {plan === 'FREE' ? '$0' : plan === 'PRO' ? '$9.99' : '$29.99'}
                          </div>
                          <div className="text-sm text-gray-600">per month</div>
                        </div>
                        <ul className="space-y-2 text-sm">
                          {getPlanFeatures(plan).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {subscription.plan !== plan && (
                          <Button 
                            onClick={() => handleSubscriptionAction('upgrade')}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            {plan === 'FREE' ? 'Downgrade' : 'Upgrade'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}