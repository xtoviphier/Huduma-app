import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import ServiceCard from "@/components/service-card";

export default function Services() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.nameSwahili.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Service Categories</h1>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCategories.map((category) => (
          <ServiceCard
            key={category.id}
            category={category}
            providerCount={Math.floor(Math.random() * 100) + 20}
            onClick={() => console.log("Navigate to providers for:", category.id)}
          />
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No services found matching your search.</p>
        </div>
      )}
    </div>
  );
}
