// Service Worker registration and PWA utilities
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification();
              }
            });
          }
        });
      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError);
      }
    });
  }
}

function showUpdateNotification() {
  // Show a notification to user that an update is available
  if (Notification.permission === 'granted') {
    new Notification('Huduma App Updated', {
      body: 'A new version is available. Refresh to get the latest features.',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
}

export function showNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });
  }
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function isIOSStandalone(): boolean {
  return (window.navigator as any).standalone === true;
}

export function isPWA(): boolean {
  return isStandalone() || isIOSStandalone();
}

// Add to home screen detection
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function canAddToHomeScreen(): boolean {
  // For iOS devices, we can't detect if PWA can be installed
  // For Android, we rely on the beforeinstallprompt event
  return isIOSDevice() && !isIOSStandalone();
}

// Network status utilities
export function isOnline(): boolean {
  return navigator.onLine;
}

export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
