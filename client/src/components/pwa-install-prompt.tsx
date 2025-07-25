import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePWA } from "@/hooks/use-pwa";

export default function PWAInstallPrompt() {
  const { canInstall, install, dismiss } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show install prompt after 30 seconds if PWA is not already installed
    const timer = setTimeout(() => {
      if (canInstall && !window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [canInstall]);

  useEffect(() => {
    setIsVisible(canInstall);
  }, [canInstall]);

  const handleInstall = async () => {
    const result = await install();
    if (result) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismiss();
  };

  if (!isVisible) return null;

  return (
    <Card className="pwa-install-prompt animate-in slide-in-from-bottom duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-kenyan-red/10 rounded-full flex items-center justify-center">
              <Smartphone className="text-kenyan-red w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold">Install Huduma App</h4>
              <p className="text-sm text-gray-600">Get the full app experience on your device</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-500"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-kenyan-red hover:bg-red-700 text-white flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Install</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
