// src/components/auth/UserMenu.js
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <button 
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="user-avatar">
                    <User size={20} />
                </div>
                <div className="user-info">
                    <span className="user-name">
                        {user?.username}
                    </span>
                </div>
                <ChevronDown size={16} className={`dropdown-icon ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                        <div className="user-avatar large">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="user-name">
                                {user?.username}
                            </div>
                        </div>
                    </div>

                    <div className="user-menu-divider"></div>

                    <div className="user-menu-items">
                        <button className="user-menu-item">
                            <Settings size={16} />
                            <span>Configuración</span>
                        </button>
                        
                        <button 
                            className="user-menu-item logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;