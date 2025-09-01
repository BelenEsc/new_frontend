// src/components/auth/EmailVerificationForm.js
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationForm = ({ onBackToLogin }) => {
    const { resendVerification } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('form'); // form, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('form');

        const result = await resendVerification(email);
        
        if (result.success) {
            setStatus('success');
            setMessage(result.message);
        } else {
            setStatus('error');
            setMessage(result.message);
        }
        
        setLoading(false);
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (status === 'error') {
            setStatus('form');
            setMessage('');
        }
    };

    return (
        <div className="auth-form">
            <div className="auth-header">
                <Mail size={32} className="auth-icon" />
                <h2>Verify Email</h2>
                <p>We will send you a new verification link to your email.</p>
            </div>

            {status === 'success' && (
                <div className="success-message">
                    <CheckCircle size={16} />
                    <div>
                        <strong>Email enviado</strong>
                        <p>{message}</p>
                        <p>Check your inbox and click the link to verify your account.</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    {message}
                </div>
            )}

            {status !== 'success' && (
                <form onSubmit={handleSubmit} className="auth-form-content">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-group">
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={handleChange}
                                placeholder="tu-email@ejemplo.com"
                                required
                                className={`form-input ${status === 'error' ? 'error' : ''}`}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? 'Sending...' : 'Resend verification'}
                    </button>
                </form>
            )}

            <div className="auth-switch">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="auth-switch-btn back-btn"
                >
                    <ArrowLeft size={16} />
                    Volver al Login
                </button>
            </div>

            {status === 'success' && (
                <div className="auth-switch">
                    <span>Didn't you receive the email?</span>{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setStatus('form');
                            setMessage('');
                        }}
                        className="auth-switch-btn"
                    >
                        Try again
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmailVerificationForm;