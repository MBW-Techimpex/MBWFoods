import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const verifySession = async () => {
        try {
            // Check Admin Session
            const adminRes = await fetch(`${API_BASE}/api/auth/verify`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (adminRes.ok) {
                const data = await adminRes.json();
                setAdmin(data.admin || data);
            }

            // Check Customer Session
            const customerRes = await fetch(`${API_BASE}/api/auth/customer/verify`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (customerRes.ok) {
                const data = await customerRes.json();
                setCustomer(data);
            }
        } catch (error) {
            console.error('Session verification failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifySession();
    }, []);

    const login = async (username, password) => {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            setAdmin(data.admin);
            return { success: true };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            setAdmin(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // --- Customer Methods ---
    const customerLogin = async (email, password) => {
        const response = await fetch(`${API_BASE}/api/auth/customer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            setCustomer(data.customer);
            return { success: true };
        }
        return { success: false, message: data.message || 'Login failed' };
    };

    const customerRegister = async (formData) => {
        const response = await fetch(`${API_BASE}/api/auth/customer/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            if (!data.needsVerification) {
                setCustomer(data.customer);
            }
            return { success: true, needsVerification: data.needsVerification };
        }
        return { success: false, message: data.message || 'Registration failed' };
    };

    const customerLogout = async () => {
        try {
            await fetch(`${API_BASE}/api/auth/customer/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            setCustomer(null);
        } catch (error) {
            console.error('Customer logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            admin,
            customer,
            loading,
            login,
            logout,
            customerLogin,
            customerRegister,
            customerLogout,
            verifySession
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
