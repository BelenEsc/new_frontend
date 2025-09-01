// src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
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
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Basic validations
        const newErrors = {};
        
        if (formData.password.length < 8) {
            newErrors.password = ['The password must be at least 8 characters long.'];
        }
        
        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = ['Passwords do not match'];
        }

        if (!formData.email.includes('@')) {
            newErrors.email = ['Invalid Email'];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        const result = await register(formData);
        
        if (result.success) {
            if (result.requiresVerification) {
                setRegistrationSuccess(true);
            } else {
                onClose(); // close modal if verification is not necessary 
            }
        } else {
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

    if (registrationSuccess) {
        return (
            <div className="auth-form">
                <div className="success-icon">
                    <CheckCircle size={48} />
                </div>
                <div className="auth-header">
                    <h2>Successful Registration!</h2>
                    <p>Your account has been created. We have sent a verification email to <strong>{formData.email}</strong></p>
                </div>
                
                <div className="verification-instructions">
                    <h3>Next steps:</h3>
                    <ol>
                        <li>Check your inbox (and spam folder)</li>
                        <li>Click the verification link</li>
                        <li>Once verified, you will be able to log in.</li>
                    </ol>
                </div>

                <div className="auth-switch">
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="auth-submit-btn"
                    >
                        Go to Login
                    </button>
                </div>

                <div className="auth-switch">
                    <span>Didn't you receive the email?</span>{' '}
                    <button
                        type="button"
                        onClick={() => setRegistrationSuccess(false)}
                        className="auth-switch-btn"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-form">
            <div className="auth-header">
                <UserPlus size={32} className="auth-icon" />
                <h2>Create account</h2>
                <p>Register to access the system</p>
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
                        <label htmlFor="first_name">First Name</label>
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                                className={`form-input ${getFieldError('first_name') ? 'error' : ''}`}
                            />
                        </div>
                        {getFieldError('first_name') && (
                            <span className="field-error">{getFieldError('first_name')}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="enter your last name "
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
                    <label htmlFor="username">User Name</label>
                    <div className="input-group">
                        <User size={20} className="input-icon" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Unique username"
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
                            placeholder="email@example.com"
                            required
                            className={`form-input ${getFieldError('email') ? 'error' : ''}`}
                        />
                    </div>
                    {getFieldError('email') && (
                        <span className="field-error">{getFieldError('email')}</span>
                    )}
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
                            placeholder="Your password must be at least 8 characters long"
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
                    <label htmlFor="password_confirm">Confirm Password</label>
                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type={showPasswordConfirm ? 'text' : 'password'}
                            id="password_confirm"
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            placeholder="Repeat your password"
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
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="auth-switch">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="auth-switch-btn"
                    >
                        Sign in here
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;