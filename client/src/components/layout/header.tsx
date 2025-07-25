import { Bell, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import LanguageToggle from "@/components/language-toggle";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="kenyan-gradient text-white sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-gold rounded-full flex items-center justify-center">
              <Shield className="text-kenyan-red w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('appName')}</h1>
              <p className="text-sm opacity-90">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <Button size="sm" variant="ghost" className="p-2 bg-white/20 hover:bg-white/30 rounded-full">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
