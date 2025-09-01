// src/components/auth/EmailVerification.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmail, resendVerification } = useAuth();
    
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            handleVerification(token);
        } else {
            setStatus('error');
            setMessage('Token de verificación no válido');
        }
    }, [searchParams]);

    const handleVerification = async (token) => {
        const result = await verifyEmail(token);
        
        if (result.success) {
            setStatus('success');
            setMessage(result.message);
            // redirect to login 
            setTimeout(() => {
                navigate('/login');
            }, 3000); //3 seconds
        } else {
            setStatus('error');
            setMessage(result.message);
        }
    };

    const handleResendVerification = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage('Enter your email address');
            return;
        }

        setResending(true);
        const result = await resendVerification(email);
        
        if (result.success) {
            setMessage('Verification email sent. Check your inbox.');
        } else {
            setMessage(result.message);
        }
        setResending(false);
    };

    return (
        <div className="email-verification-container">
            <div className="email-verification-content">
                {status === 'loading' && (
                    <>
                        <div className="verification-icon loading">
                            <RefreshCw size={48} className="spin" />
                        </div>
                        <h2>Verifying your email...</h2>
                        <p>Please wait while we process your verification.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="verification-icon success">
                            <CheckCircle size={48} />
                        </div>
                        <h2>Email verified successfully!</h2>
                        <p>{message}</p>
                        <p>You'll be redirected to login in a few seconds...</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                        >
                            Go to Login
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="verification-icon error">
                            <AlertCircle size={48} />
                        </div>
                        <h2>Verification error</h2>
                        <p>{message}</p>
                        
                        <div className="resend-section">
                            <h3>Do you need a new verification link?</h3>
                            <form onSubmit={handleResendVerification}>
                                <div className="form-group">
                                    <label htmlFor="email">Email:</label>
                                    <div className="input-group">
                                        <Mail size={20} className="input-icon" />
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu-email@ejemplo.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={resending}
                                    className="btn btn-secondary"
                                >
                                    {resending ? 'Reenviando...' : 'Reenviar Verificación'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;