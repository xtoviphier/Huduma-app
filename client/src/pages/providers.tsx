import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import ProviderCard from "@/components/provider-card";

export default function Providers() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [location, setLocation] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers", selectedCategory, location],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('nearbyProviders')}</h1>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onContact={() => console.log("Contact provider:", provider.id)}
          />
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No providers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
