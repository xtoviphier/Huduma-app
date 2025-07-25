import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import type { ServiceCategory } from "@shared/schema";

interface ServiceCardProps {
  category: ServiceCategory;
  providerCount?: number;
  onClick?: () => void;
}

export default function ServiceCard({ category, providerCount, onClick }: ServiceCardProps) {
  const { language } = useLanguage();

  const name = language === 'sw' ? category.nameSwahili : category.name;
  const description = language === 'sw' ? category.descriptionSwahili : category.description;

  return (
    <Card className="service-card cursor-pointer hover:shadow-lg transition-all" onClick={onClick}>
      <CardContent className="p-4 text-center">
        <div className="w-12 h-12 bg-kenyan-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className={`${category.icon} text-kenyan-red text-xl`}></i>
        </div>
        <h4 className="font-semibold text-sm">{name}</h4>
        {providerCount && (
          <p className="text-xs text-gray-500 mt-1">{providerCount}+ providers</p>
        )}
      </CardContent>
    </Card>
  );
}
