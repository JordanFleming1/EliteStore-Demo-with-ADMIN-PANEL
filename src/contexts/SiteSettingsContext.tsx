import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSettingsContextType {
  siteName: string;
  storeLogo: string;
  navbarTheme: string;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Listen for localStorage changes (e.g., theme change from admin panel)
    useEffect(() => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === 'siteSettings' && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (parsed.navbarTheme) setNavbarTheme(parsed.navbarTheme);
            if (parsed.siteName) setSiteName(parsed.siteName);
            if (parsed.storeLogo) setStoreLogo(parsed.storeLogo);
          } catch {}
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }, []);
  // Try to load from localStorage first
  const local = typeof window !== 'undefined' ? localStorage.getItem('siteSettings') : null;
  let initial = { siteName: 'EliteStore', storeLogo: '', navbarTheme: 'light' };
  if (local) {
    try {
      const parsed = JSON.parse(local);
      initial = { ...initial, ...parsed };
    } catch {}
  }
  const [siteName, setSiteName] = useState(initial.siteName);
  const [storeLogo, setStoreLogo] = useState(initial.storeLogo);
  const [navbarTheme, setNavbarTheme] = useState(initial.navbarTheme);
  const [loading, setLoading] = useState(true);

  // Update localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('siteSettings', JSON.stringify({ siteName, storeLogo, navbarTheme }));
  }, [siteName, storeLogo, navbarTheme]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { db } = await import('../firebase/firebase.config');
        const { doc, getDoc } = await import('firebase/firestore');
        const siteDoc = await getDoc(doc(db, 'settings', 'site'));
        if (siteDoc.exists()) {
          const data = siteDoc.data();
          setSiteName(data.siteName || 'EliteStore');
          setStoreLogo(data.storeLogo || '');
        }
        const navbarDoc = await getDoc(doc(db, 'settings', 'navbar'));
        if (navbarDoc.exists()) {
          const navbarData = navbarDoc.data();
          if (navbarData && navbarData.theme) {
            setNavbarTheme(navbarData.theme);
          } else {
            setNavbarTheme('light');
          }
        } else {
          setNavbarTheme('light');
        }
      } catch (error) {
        setNavbarTheme('light');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteName, storeLogo, navbarTheme, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
};
