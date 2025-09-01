// src/components/auth/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner large"></div>
                <p>Authentication verification ...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-required-screen">
                <div className="auth-required-content">
                    <h1>Restricted access</h1>
                    <p>You need to login </p>
                    <AuthModal isOpen={true} onClose={() => {}} />
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;