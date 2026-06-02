
    import React, { createContext, useContext, useState, useEffect } from 'react';
    import API_BASE from '../config';

    const SettingsContext = createContext();

    export const SettingsProvider = ({ children }) => {
        const [settings, setSettings] = useState(() => {
            const cached = localStorage.getItem('site_settings');
            if (cached) {
                const parsed = JSON.parse(cached);
                // Pre-inject colors from cache for instant branding
                if (parsed.theme_color) {
                    document.documentElement.style.setProperty('--brand-primary', parsed.theme_color);
                }
                if (parsed.secondary_color) {
                    document.documentElement.style.setProperty('--brand-secondary', parsed.secondary_color);
                }
                return parsed;
            }
            return {};
        });
        const [loading, setLoading] = useState(true);

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/settings?t=${Date.now()}`, { credentials: 'include' });
                const data = await res.json();
                const settingsMap = {};
                data.forEach(s => {
                    settingsMap[s.key] = s.value;
                });
                
                // Inject colors into CSS variables
                if (settingsMap.theme_color) {
                    document.documentElement.style.setProperty('--brand-primary', settingsMap.theme_color);
                }
                if (settingsMap.secondary_color) {
                    document.documentElement.style.setProperty('--brand-secondary', settingsMap.secondary_color);
                }
                
                setSettings(settingsMap);
                localStorage.setItem('site_settings', JSON.stringify(settingsMap));
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchSettings();
            
            // Listen for local window events
            window.addEventListener('settingsUpdated', fetchSettings);
            
            // Listen for cross-tab events
            const channel = new BroadcastChannel('settings_sync');
            channel.onmessage = (event) => {
                if (event.data === 'sync') {
                    console.log("Settings synchronization received from another tab.");
                    fetchSettings();
                }
            };

            return () => {
                window.removeEventListener('settingsUpdated', fetchSettings);
                channel.close();
            };
        }, []);

        const getCurrencySymbol = () => {
            const currency = settings.currency || 'USD';
            const symbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹',
                'CAD': '$',
                'AUD': '$',
                'SGD': '$',
                'AED': 'د.إ'
            };
            return symbols[currency] || '$';
        };

        const formatPrice = (price) => {
            if (!price) return '';
            // If price is already a string with a symbol, try to extract the number
            const numericPrice = typeof price === 'string' 
                ? parseFloat(price.replace(/[^\d.]/g, '')) 
                : price;
            
            if (isNaN(numericPrice)) return price;

            const symbol = getCurrencySymbol();
            return `${symbol}${numericPrice.toFixed(2)}`;
        };

        return (
            <SettingsContext.Provider value={{ settings, loading, fetchSettings, getCurrencySymbol, formatPrice }}>
                {children}
            </SettingsContext.Provider>
        );
    };

    export const useSettings = () => useContext(SettingsContext);
