import { Home, Search, Bookmark, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function MobileNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Home, label: t('home') },
    { path: "/services", icon: Search, label: t('search') },
    { path: "/favorites", icon: Bookmark, label: t('saved') },
    { path: "/chat", icon: MessageCircle, label: t('messages') },
    { path: "/profile", icon: User, label: t('profile') },
  ];

  return (
    <nav className="mobile-bottom-nav bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <button className={`flex flex-col items-center py-2 px-4 ${
                isActive ? 'text-kenyan-red' : 'text-gray-500'
              }`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
