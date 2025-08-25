// src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = ({ onSwitchToLogin, onClose }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validaciones básicas
        const newErrors = {};
        
        if (formData.password.length < 8) {
            newErrors.password = ['La contraseña debe tener al menos 8 caracteres'];
        }
        
        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = ['Las contraseñas no coinciden'];
        }

        if (!formData.email.includes('@')) {
            newErrors.email = ['Email inválido'];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        const result = await register(formData);
        
        if (result.success) {
            onClose(); // Cerrar modal
        } else {
            // El error puede venir como string o como objeto con detalles de campo
            if (typeof result.message === 'object') {
                setErrors(result.message);
            } else {
                setErrors({ general: [result.message] });
            }
        }
        
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: undefined
            });
        }
    };

    const getFieldError = (fieldName) => {
        return errors[fieldName] && errors[fieldName][0];
    };

    return (
        <div className="auth-form">
            <div className="auth-header">
                <UserPlus size={32} className="auth-icon" />
                <h2>Crear Cuenta</h2>
                <p>Regístrate para acceder al sistema</p>
            </div>

            {errors.general && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    {errors.general[0]}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-content">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="first_name">Nombre</label>
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                required
                                className={`form-input ${getFieldError('first_name') ? 'error' : ''}`}
                            />
                        </div>
                        {getFieldError('first_name') && (
                            <span className="field-error">{getFieldError('first_name')}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Apellido</label>
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Tu apellido"
                                required
                                className={`form-input ${getFieldError('last_name') ? 'error' : ''}`}
                            />
                        </div>
                        {getFieldError('last_name') && (
                            <span className="field-error">{getFieldError('last_name')}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="username">Nombre de Usuario</label>
                    <div className="input-group">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nombre de usuario único"
                            required
                            className={`form-input ${getFieldError('username') ? 'error' : ''}`}
                        />
                    </div>
                    {getFieldError('username') && (
                        <span className="field-error">{getFieldError('username')}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-group">
                        <Mail size={20} className="input-icon" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu-email@ejemplo.com"
                            required
                            className={`form-input ${getFieldError('email') ? 'error' : ''}`}
                        />
                    </div>
                    {getFieldError('email') && (
                        <span className="field-error">{getFieldError('email')}</span>
                    )}
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
                            placeholder="Mínimo 8 caracteres"
                            required
                            className={`form-input ${getFieldError('password') ? 'error' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {getFieldError('password') && (
                        <span className="field-error">{getFieldError('password')}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password_confirm">Confirmar Contraseña</label>
                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type={showPasswordConfirm ? 'text' : 'password'}
                            id="password_confirm"
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            required
                            className={`form-input ${getFieldError('password_confirm') ? 'error' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                            {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {getFieldError('password_confirm') && (
                        <span className="field-error">{getFieldError('password_confirm')}</span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit-btn"
                >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>

                <div className="auth-switch">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="auth-switch-btn"
                    >
                        Inicia sesión aquí
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;