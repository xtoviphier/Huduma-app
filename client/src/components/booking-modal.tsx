import { useState } from "react";
import { X, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import type { ServiceCategory, ServiceProvider, User } from "@shared/schema";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingFormData) => void;
  categories: ServiceCategory[];
  selectedProvider?: ServiceProvider & { user: User; category: ServiceCategory };
  isLoading?: boolean;
}

export interface BookingFormData {
  title: string;
  description: string;
  categoryId: string;
  providerId?: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  budgetMin: number;
  budgetMax: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  selectedProvider,
  isLoading = false
}: BookingModalProps) {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState<BookingFormData>({
    title: "",
    description: "",
    categoryId: selectedProvider?.categoryId || "",
    providerId: selectedProvider?.id,
    location: "",
    preferredDate: "",
    preferredTime: "",
    budgetMin: 200,
    budgetMax: 1000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const budgetRanges = [
    { label: "KES 200 - 500", min: 200, max: 500 },
    { label: "KES 500 - 1,000", min: 500, max: 1000 },
    { label: "KES 1,000 - 2,000", min: 1000, max: 2000 },
    { label: "KES 2,000 - 5,000", min: 2000, max: 5000 },
    { label: "KES 5,000 - 10,000", min: 5000, max: 10000 },
    { label: "KES 10,000+", min: 10000, max: 50000 },
  ];

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBudgetChange = (budgetString: string) => {
    const [min, max] = budgetString.split('-').map(Number);
    setFormData(prev => ({ ...prev, budgetMin: min, budgetMax: max || min }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Service title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Service description is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a service category";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: selectedProvider?.categoryId || "",
      providerId: selectedProvider?.id,
      location: "",
      preferredDate: "",
      preferredTime: "",
      budgetMin: 200,
      budgetMax: 1000,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {selectedProvider ? 
              `Book ${selectedProvider.user.firstName} ${selectedProvider.user.lastName}` : 
              t('bookService')
            }
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {selectedProvider && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                {selectedProvider.user.profileImageUrl ? (
                  <img
                    src={selectedProvider.user.profileImageUrl}
                    alt={`${selectedProvider.user.firstName} ${selectedProvider.user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {selectedProvider.user.firstName[0]}{selectedProvider.user.lastName[0]}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold">
                  {selectedProvider.user.firstName} {selectedProvider.user.lastName}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'sw' ? selectedProvider.category.nameSwahili : selectedProvider.category.name}
                </p>
                <p className="text-sm text-kenyan-green font-semibold">
                  KES {selectedProvider.priceRangeMin} - {selectedProvider.priceRangeMax}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Category */}
          {!selectedProvider && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Service Category *
              </label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a service category" />
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
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>
          )}

          {/* Service Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Service Title *
            </label>
            <Input
              type="text"
              placeholder="e.g., Fix leaking kitchen pipe"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Service Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('serviceDescription')} *
            </label>
            <Textarea
              placeholder={t('describeNeeds')}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="resize-none h-20"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Location *
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your location or address"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Preferred Date & Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('preferredDateTime')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <div className="relative">
                <Input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('estimatedBudget')}
            </label>
            <Select 
              value={`${formData.budgetMin}-${formData.budgetMax}`}
              onValueChange={handleBudgetChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range, index) => (
                  <SelectItem key={index} value={`${range.min}-${range.max}`}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-kenyan-red hover:bg-red-700 text-white font-semibold py-3"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                t('sendRequest')
              )}
            </Button>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Service providers will see your request</p>
            <p>• You'll get notifications when they respond</p>
            <p>• Chat with providers to discuss pricing</p>
            <p>• Choose your preferred provider</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
