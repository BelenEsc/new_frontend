// src/components/auth/AuthModal.js
import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPassword from './ForgotPassword';
import EmailVerificationForm from './EmailVerificationForm';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot-password', 'verify-email'

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const renderContent = () => {
        switch (mode) {
            case 'login':
                return (
                    <LoginForm 
                        onSwitchToRegister={() => setMode('register')}
                        onSwitchToForgotPassword={() => setMode('forgot-password')}
                        onClose={onClose}
                    />
                );
            case 'register':
                return (
                    <RegisterForm 
                        onSwitchToLogin={() => setMode('login')}
                        onClose={onClose}
                    />
                );
            case 'forgot-password':
                return (
                    <ForgotPassword 
                        onBackToLogin={() => setMode('login')}
                    />
                );
            case 'verify-email':
                return (
                    <EmailVerificationForm 
                        onBackToLogin={() => setMode('login')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal-content">
                <button 
                    className="auth-modal-close"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>
                
                {renderContent()}
            </div>
        </div>
    );
};

export default AuthModal;