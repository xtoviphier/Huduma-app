import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import ServiceCard from "@/components/service-card";
import ProviderCard from "@/components/provider-card";
import { Link } from "wouter";

export default function Home() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["/api/providers"],
  });

  const handleSearch = () => {
    // Navigate to search results
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="kenyan-gradient text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t('heroTitle')}
            </h2>
            <p className="text-lg opacity-90 mb-6">
              {t('heroSubtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 px-6 rounded-full text-gray-800 text-lg pl-12 pr-16 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-kenyan-red text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t('popularServices')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
                providerCount={Math.floor(Math.random() * 100) + 50}
                onClick={() => console.log("Navigate to category:", category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Providers */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {t('nearbyProviders')}
            </h3>
            <Link href="/providers">
              <Button variant="ghost" className="text-kenyan-red font-semibold flex items-center space-x-1">
                <span>{t('viewAll')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 3).map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onContact={() => console.log("Contact provider:", provider.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            {t('howItWorks')}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-kenyan-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-kenyan-red w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-2">{t('step1Title')}</h4>
              <p className="text-gray-600">{t('step1Description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-kenyan-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-kenyan-green text-2xl"></i>
              </div>
              <h4 className="font-bold text-lg mb-2">{t('step2Title')}</h4>
              <p className="text-gray-600">{t('step2Description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-credit-card text-yellow-600 text-2xl"></i>
              </div>
              <h4 className="font-bold text-lg mb-2">{t('step3Title')}</h4>
              <p className="text-gray-600">{t('step3Description')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
