// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para hacer peticiones autenticadas
    const apiRequest = async (endpoint, options = {}) => {
        const url = `http://localhost:8000/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        // Añadir token si existe
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }

        console.log('Making request to:', url);
        console.log('Config:', config);

        const response = await fetch(url, config);
        
        if (response.status === 401) {
            // Token inválido, logout
            logout();
            throw new Error('Sesión expirada');
        }

        if (!response.ok) {
            let errorMessage = 'Error en la petición';
            try {
                const error = await response.json();
                errorMessage = error.detail || error.message || JSON.stringify(error);
            } catch (e) {
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    };

    // Login
    const login = async (username, password) => {
        try {
            console.log('Attempting login with:', { username });
            
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Error de autenticación';
                try {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || JSON.stringify(error);
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                return { success: false, message: errorMessage };
            }

            const data = await response.json();
            console.log('Login successful:', data);

            setUser(data.user);
            setToken(data.token);
            
            // Guardar en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    };

    // Registro
    const register = async (userData) => {
        try {
            console.log('Attempting register with:', userData);
            
            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('Register response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Error en el registro';
                try {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || JSON.stringify(error);
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                return { success: false, message: errorMessage };
            }

            const data = await response.json();
            console.log('Register successful:', data);

            // No establecer usuario/token automáticamente ya que necesita verificar email
            return { 
                success: true, 
                message: data.message,
                requiresVerification: data.requires_verification 
            };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: error.message };
        }
    };

    // Verificar email
    const verifyEmail = async (token) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/verify-email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                let errorMessage = 'Error verificando email';
                try {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || JSON.stringify(error);
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                return { success: false, message: errorMessage };
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Reenviar verificación
    const resendVerification = async (email) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/resend-verification/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                let errorMessage = 'Error reenviando verificación';
                try {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || JSON.stringify(error);
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                return { success: false, message: errorMessage };
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Solicitar reset de contraseña
    const requestPasswordReset = async (email) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/password-reset/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                let errorMessage = 'Error solicitando reset';
                try {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || JSON.stringify(error);
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                return { success: false, message: errorMessage };
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Confirmar reset de contraseña
    const confirmPasswordReset = async (uid, token, newPassword, confirmPassword) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/password-reset-confirm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    uid, 
                    token, 
                    new_password: newPassword,
                    confirm_password: confirmPassword
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Error cambiando contraseña';
                try {
                    const error = await response.json();
                    errorMessage = error.detail || error.message || JSON.stringify(error);
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                return { success: false, message: errorMessage };
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            if (token) {
                await fetch('http://localhost:8000/api/auth/logout/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Error durante logout:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    // Verificar token al cargar
    const verifyToken = async (savedToken) => {
        try {
            console.log('Verifying token:', savedToken);
            
            const response = await fetch('http://localhost:8000/api/auth/verify-token/', {
                headers: {
                    'Authorization': `Token ${savedToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Token verification successful:', data);
                setUser(data.user);
                setToken(savedToken);
                return true;
            } else {
                console.log('Token verification failed');
                // Token inválido
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return false;
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
    };

    // Efecto para cargar usuario desde localStorage
    useEffect(() => {
        const loadUserFromStorage = async () => {
            console.log('Loading user from storage...');
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                const isValid = await verifyToken(savedToken);
                if (!isValid) {
                    setUser(null);
                    setToken(null);
                }
            }
            
            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        apiRequest,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        confirmPasswordReset,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};