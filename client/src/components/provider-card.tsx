import { Star, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import type { ServiceProvider, User, ServiceCategory } from "@shared/schema";

interface ProviderCardProps {
  provider: ServiceProvider & { user: User; category: ServiceCategory };
  onContact?: () => void;
}

export default function ProviderCard({ provider, onContact }: ProviderCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            {provider.user.profileImageUrl ? (
              <img
                src={provider.user.profileImageUrl}
                alt={`${provider.user.firstName} ${provider.user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-semibold">
                  {provider.user.firstName[0]}{provider.user.lastName[0]}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-lg">
                {provider.user.firstName} {provider.user.lastName}
              </h4>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{provider.rating}</span>
                <span className="text-gray-500 text-sm">({provider.totalReviews})</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">{provider.category.name}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{provider.user.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{provider.yearsExperience}+ {t('yearsExperience')}</span>
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-kenyan-green font-bold">
                KES {provider.priceRangeMin}-{provider.priceRangeMax}
              </span>
              <Button 
                onClick={onContact}
                size="sm"
                className="bg-kenyan-red hover:bg-red-700 text-white"
              >
                {t('contact')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
