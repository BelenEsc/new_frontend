// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ onSwitchToRegister, onClose }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.username, formData.password);
        
        if (result.success) {
            onClose(); // Cerrar modal
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-form">
            <div className="auth-header">
                <LogIn size={32} className="auth-icon" />
                <h2>Iniciar Sesión</h2>
                <p>Accede a tu cuenta para continuar</p>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-content">
                <div className="form-group">
                    <label htmlFor="username">Usuario</label>
                    <div className="input-group">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nombre de usuario"
                            required
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Tu contraseña"
                            required
                            className="form-input"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit-btn"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                <div className="auth-switch">
                    ¿No tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="auth-switch-btn"
                    >
                        Regístrate aquí
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;