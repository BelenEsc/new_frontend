// src/components/auth/AuthModal.js
import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
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
                
                {mode === 'login' ? (
                    <LoginForm 
                        onSwitchToRegister={() => setMode('register')}
                        onClose={onClose}
                    />
                ) : (
                    <RegisterForm 
                        onSwitchToLogin={() => setMode('login')}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthModal;