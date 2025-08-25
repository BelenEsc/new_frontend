import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, Mail, UserPlus, CheckCircle } from 'lucide-react';
import './login.css';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '', // Cambio para coincidir con Django
    first_name: '',       // Cambio para coincidir con Django
    last_name: ''         // Cambio para coincidir con Django
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:8000/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (isRegistering) {
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      
      if (formData.password !== formData.password_confirm) {
        setError('Passwords do not match');
        return false;
      }
      
      if (!formData.first_name.trim()) {
        setError('First name is required');
        return false;
      }
      
      if (!formData.last_name.trim()) {
        setError('Last name is required');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        }
        
        throw new Error(errorData.detail || errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      
      const authData = {
        token: data.token,
        user: data.user,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem('auth', JSON.stringify(authData));
      onLogin(authData);

    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password_confirm: formData.password_confirm,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific validation errors
        if (errorData.username) {
          throw new Error(`Username: ${errorData.username[0]}`);
        }
        if (errorData.email) {
          throw new Error(`Email: ${errorData.email[0]}`);
        }
        if (errorData.password) {
          throw new Error(`Password: ${errorData.password[0]}`);
        }
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        }
        
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      setSuccess('Account created successfully! You can now login.');
      setIsRegistering(false);
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: ''
      });

    } catch (err) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegistering) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setFormData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: ''
    });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              {isRegistering ? <UserPlus size={32} /> : <User size={32} />}
            </div>
            <h1 className="login-title">Biological Sample Management</h1>
            <p className="login-subtitle">
              {isRegistering ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="login-success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            {/* Registration fields */}
            {isRegistering && (
              <>
                <div className="name-fields">
                  <div className="form-group">
                    <label htmlFor="first_name" className="form-label">
                      First Name
                    </label>
                    <div className="input-container">
                      <User className="input-icon" size={20} />
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        required={isRegistering}
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="First name"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name" className="form-label">
                      Last Name
                    </label>
                    <div className="input-container">
                      <User className="input-icon" size={20} />
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        required={isRegistering}
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Last name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="input-container">
                    <Mail className="input-icon" size={20} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required={isRegistering}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Username field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-container">
                <User className="input-icon" size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input password-input"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20