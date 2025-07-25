import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Booking() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    preferredDate: "",
    preferredTime: "",
    budgetMin: "",
    budgetMax: "",
    location: "",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return await apiRequest("POST", "/api/jobs", jobData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job request sent successfully!",
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        preferredDate: "",
        preferredTime: "",
        budgetMin: "",
        budgetMax: "",
        location: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send job request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      ...formData,
      customerId: "current-user-id", // This should come from auth context
      budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
      budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
      preferredDate: formData.preferredDate ? new Date(formData.preferredDate) : null,
    });
  };

  const budgetRanges = [
    { label: "KES 200 - 500", min: "200", max: "500" },
    { label: "KES 500 - 1,000", min: "500", max: "1000" },
    { label: "KES 1,000 - 2,000", min: "1000", max: "2000" },
    { label: "KES 2,000 - 5,000", min: "2000", max: "5000" },
    { label: "KES 5,000+", min: "5000", max: "" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('bookService')}
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Category */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Service Category *
                </label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  required
                />
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
                  className="resize-none h-24"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location *
                </label>
                <Input
                  type="text"
                  placeholder="Enter your location or address"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
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
                  onValueChange={(value) => {
                    const [min, max] = value.split('-');
                    handleInputChange('budgetMin', min);
                    handleInputChange('budgetMax', max);
                  }}
                >
                  <SelectTrigger>
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
              <Button
                type="submit"
                disabled={createJobMutation.isPending}
                className="w-full bg-kenyan-red hover:bg-red-700 text-white font-semibold py-3"
              >
                {createJobMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  t('sendRequest')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* How it works info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Service providers near your location will see your request</p>
              <p>• You'll receive notifications when providers express interest</p>
              <p>• You can chat with providers to discuss details and pricing</p>
              <p>• Choose your preferred provider and confirm the booking</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
