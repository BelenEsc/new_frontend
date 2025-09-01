// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../LoginForm.css'; // Importa el CSS separado

const LoginForm = ({ onSwitchToRegister, onSwitchToForgotPassword, onClose }) => {
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
            onClose(); // close modal
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
        
        // clean errors 
        if (error) {
            setError('');
        }
    };

    return (
        <div className="auth-form">
            <div className="auth-header">
                <LogIn size={32} className="auth-icon" />
                <h2>Login</h2>
                <p>Log in to your account to continue</p>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    <div>
                        {error}
                        {error.includes('Verify your email') && (
                            <div className="error-actions">
                                <button
                                    type="button"
                                    onClick={() => onSwitchToForgotPassword && onSwitchToForgotPassword('verify')}
                                    className="error-action-btn"
                                >
                                    <Mail size={14} />
                                    Resend verification
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-content">
                <div className="form-group">
                    <label htmlFor="username">User Name</label>
                    <div className="input-group">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder=""
                            required
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder=""
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
                    {loading ? 'Logging in...' : 'Log in'}
                </button>

                <div className="auth-switch">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="auth-switch-btn"
                    >
                        Register here
                    </button>
                </div>
                <div className="forgot-password-link">
                    <button
                        type="button"
                        onClick={onSwitchToForgotPassword}
                        className="forgot-password-btn"
                    >
                        Forgotten password?
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;