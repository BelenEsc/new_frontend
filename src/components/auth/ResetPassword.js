// src/components/auth/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { confirmPasswordReset } = useAuth();
    
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('form'); // form, success, error
    const [error, setError] = useState('');
    const [uid, setUid] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const uidParam = searchParams.get('uid');
        const tokenParam = searchParams.get('token');
        
        if (!uidParam || !tokenParam) {
            setStatus('error');
            setError('Einvalid recovery link');
            return;
        }
        
        setUid(uidParam);
        setToken(tokenParam);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones locales
        if (formData.newPassword.length < 8) {
            setError('The password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await confirmPasswordReset(
            uid, 
            token, 
            formData.newPassword, 
            formData.confirmPassword
        );
        
        if (result.success) {
            setStatus('success');
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setStatus('error');
            setError(result.message);
        }
        
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) {
            setError('');
        }
    };

    if (status === 'success') {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="success-icon">
                        <CheckCircle size={48} />
                    </div>
                    <h2>Password updated!</h2>
                    <p>Your password has been successfully changed.</p>
                    <p>You will be redirected to login in a few seconds...</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'error' && !uid && !token) {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <div className="error-icon">
                        <AlertCircle size={48} />
                    </div>
                    <h2>Invalid Link</h2>
                    <p>The recovery link is invalid or has expired.</p>
                    <button 
                        onClick={() => navigate('/forgot-password')}
                        className="btn btn-primary"
                    >
                        Request new link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-header">
                    <Lock size={32} className="auth-icon" />
                    <h2>New Password</h2>
                    <p>Enter your new password</p>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form-content">
                    <div className="form-group">
                        <label htmlFor="newPassword">New password</label>
                        <div className="input-group">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Minimum 8 characters"
                                required
                                className={`form-input ${error ? 'error' : ''}`}
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-group">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your new password"
                                required
                                className={`form-input ${error ? 'error' : ''}`}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;