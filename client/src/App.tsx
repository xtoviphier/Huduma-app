import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import PhoneAuth from "@/components/auth/phone-auth";
import type { ServiceCategory } from "@shared/schema";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Providers from "@/pages/providers";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import Booking from "@/pages/booking";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20 md:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/providers" component={Providers} />
          <Route path="/chat/:jobId" component={Chat} />
          <Route path="/profile" component={Profile} />
          <Route path="/booking" component={Booking} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNav />
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  
  // Fetch service categories for registration
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories'],
    enabled: !isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kenyan-red"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PhoneAuth categories={categories} onAuthSuccess={login} />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
