import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Phone, User, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ServiceCategory } from "@shared/schema";

interface PhoneAuthProps {
  categories: ServiceCategory[];
  onAuthSuccess: (user: any) => void;
}

interface RegistrationData {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  userType: 'customer' | 'provider';
  location: string;
  categoryId?: string;
  yearsExperience?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
}

export default function PhoneAuth({ categories, onAuthSuccess }: PhoneAuthProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'phone' | 'verification' | 'registration'>('phone');
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    phoneNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    userType: 'customer',
    location: "",
    categoryId: "",
    yearsExperience: 1,
    priceRangeMin: 200,
    priceRangeMax: 1000,
  });

  // Phone number validation for Kenya
  const validateKenyanPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }
    return '+254' + cleaned;
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return await apiRequest("POST", "/api/auth/login", { phoneNumber });
    },
    onSuccess: (data) => {
      onAuthSuccess(data.user);
      toast({
        title: "Success",
        description: "Login successful!",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('404')) {
        // User not found, switch to registration
        setIsLogin(false);
        setStep('verification');
        setRegistrationData(prev => ({ ...prev, phoneNumber: formatPhoneNumber(phoneNumber) }));
        toast({
          title: "New User",
          description: "Please complete registration to continue.",
        });
      } else {
        toast({
          title: "Error",
          description: "Login failed. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegistrationData) => {
      const user = await apiRequest("POST", "/api/auth/register", userData);
      
      // If provider, create provider profile
      if (userData.userType === 'provider' && userData.categoryId) {
        await apiRequest("POST", "/api/providers", {
          userId: user.user.id,
          yearsExperience: userData.yearsExperience,
          categoryId: userData.categoryId,
          priceRangeMin: userData.priceRangeMin,
          priceRangeMax: userData.priceRangeMax,
        });
      }
      
      return user;
    },
    onSuccess: (data) => {
      onAuthSuccess(data.user);
      toast({
        title: "Welcome to Huduma!",
        description: "Registration successful. Welcome aboard!",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhoneSubmit = () => {
    if (!validateKenyanPhone(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (07xx xxx xxx or +254 7xx xxx xxx)",
        variant: "destructive",
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (isLogin) {
      loginMutation.mutate(formattedPhone);
    } else {
      // For demo purposes, skip SMS verification
      setStep('verification');
      setRegistrationData(prev => ({ ...prev, phoneNumber: formattedPhone }));
    }
  };

  const handleVerificationSubmit = () => {
    // For demo purposes, accept any 4-digit code
    if (verificationCode.length === 4) {
      setStep('registration');
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter the 4-digit verification code sent to your phone.",
        variant: "destructive",
      });
    }
  };

  const handleRegistrationSubmit = () => {
    if (!registrationData.firstName || !registrationData.lastName || !registrationData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (registrationData.userType === 'provider' && !registrationData.categoryId) {
      toast({
        title: "Missing Category",
        description: "Please select your service category.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(registrationData);
  };

  const updateRegistrationData = (field: keyof RegistrationData, value: any) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
  };

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-kenyan-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-kenyan-red w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Join Huduma"}</CardTitle>
            <p className="text-gray-600">
              {isLogin ? "Enter your phone number to log in" : "Enter your phone number to get started"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="07xx xxx xxx or +254 7xx xxx xxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Kenyan mobile number
              </p>
            </div>

            <Button
              onClick={handlePhoneSubmit}
              disabled={loginMutation.isPending}
              className="w-full bg-kenyan-red hover:bg-red-700 text-white py-3"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isLogin ? "Continue" : "Get Started"
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-kenyan-red hover:underline text-sm"
              >
                {isLogin ? "New to Huduma? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('phone')}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-16 h-16 bg-kenyan-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-sms text-kenyan-green text-2xl"></i>
            </div>
            <CardTitle className="text-2xl">Verify Your Number</CardTitle>
            <p className="text-gray-600">
              Enter the 4-digit code sent to {phoneNumber}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="0000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full text-center text-2xl tracking-widest"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                For demo: enter any 4 digits
              </p>
            </div>

            <Button
              onClick={handleVerificationSubmit}
              disabled={verificationCode.length !== 4}
              className="w-full bg-kenyan-green hover:bg-green-700 text-white py-3"
            >
              Verify & Continue
            </Button>

            <div className="text-center">
              <button className="text-kenyan-red hover:underline text-sm">
                Didn't receive code? Resend
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('verification')}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-yellow-600 w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-gray-600">Tell us a bit about yourself</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">I am a *</label>
            <Select value={registrationData.userType} onValueChange={(value: 'customer' | 'provider') => updateRegistrationData('userType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer (Looking for services)</SelectItem>
                <SelectItem value="provider">Service Provider (Offering services)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2">First Name *</label>
              <Input
                value={registrationData.firstName}
                onChange={(e) => updateRegistrationData('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Last Name *</label>
              <Input
                value={registrationData.lastName}
                onChange={(e) => updateRegistrationData('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email (Optional)</label>
            <Input
              type="email"
              value={registrationData.email}
              onChange={(e) => updateRegistrationData('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">Location *</label>
            <div className="relative">
              <Input
                value={registrationData.location}
                onChange={(e) => updateRegistrationData('location', e.target.value)}
                placeholder="e.g., Nyali, Mombasa"
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Provider-specific fields */}
          {registrationData.userType === 'provider' && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2">Service Category *</label>
                <Select value={registrationData.categoryId} onValueChange={(value) => updateRegistrationData('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <i className={`${category.icon} text-kenyan-red`}></i>
                          <span>{language === 'sw' ? category.nameSwahili : category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Years of Experience *</label>
                <Select value={registrationData.yearsExperience?.toString()} onValueChange={(value) => updateRegistrationData('yearsExperience', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((years) => (
                      <SelectItem key={years} value={years.toString()}>
                        {years}+ {years === 1 ? 'year' : 'years'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Price Range (KES) *</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={registrationData.priceRangeMin}
                    onChange={(e) => updateRegistrationData('priceRangeMin', parseInt(e.target.value))}
                    min="200"
                  />
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={registrationData.priceRangeMax}
                    onChange={(e) => updateRegistrationData('priceRangeMax', parseInt(e.target.value))}
                    min="200"
                  />
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleRegistrationSubmit}
            disabled={registerMutation.isPending}
            className="w-full bg-kenyan-red hover:bg-red-700 text-white py-3 mt-6"
          >
            {registerMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}