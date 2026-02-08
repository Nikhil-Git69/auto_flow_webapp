import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, FileCheck, Sparkles, Shield, CheckCircle, BookOpen, Github } from 'lucide-react';
import { login, getMockUsersHint, register, seedDemoUsers } from '../services/authService';
import { User as UserType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

const BRAND_COLOR = '#159e8a';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Refs for input fields - Login
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);

  // Refs for input fields - Signup
  const signupNameRef = useRef<HTMLInputElement>(null);
  const signupEmailRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const signupConfirmRef = useRef<HTMLInputElement>(null);
  const signupTermsRef = useRef<HTMLInputElement>(null);
  const signupSubmitRef = useRef<HTMLButtonElement>(null);

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    const levels = [
      { label: 'Very Weak', color: '#ef4444', width: '20%' },
      { label: 'Weak', color: '#f97316', width: '40%' },
      { label: 'Fair', color: '#eab308', width: '60%' },
      { label: 'Good', color: '#22c55e', width: '80%' },
      { label: 'Strong', color: BRAND_COLOR, width: '100%' },
    ];
    return levels[Math.min(strength, 4)];
  };

  const passwordStrength = getPasswordStrength(password);

  const handleFormSwitch = (toRegister: boolean) => {
    setIsRegistering(toRegister);
    setAnimationKey(prev => prev + 1);
  };

  const validateForm = () => {
    if (!email || !password) return false;
    if (isRegistering && (!name.trim() || !agreeTerms || password !== confirmPassword)) return false;
    return true;
  };

  // Handle Enter key for login form
  const handleLoginKeyDown = (e: React.KeyboardEvent, field: 'email' | 'password') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'email') {
        if (email.trim()) {
          loginPasswordRef.current?.focus();
        }
      } else if (field === 'password') {
        // Submit the form if both fields are filled
        if (email.trim() && password.trim()) {
          const form = e.currentTarget.closest('form');
          if (form) form.requestSubmit();
        } else if (!email.trim()) {
          setError('Please enter your email address.');
          loginEmailRef.current?.focus();
        }
      }
    }
  };

  // Handle Enter key for signup form
  const handleSignupKeyDown = (e: React.KeyboardEvent, field: 'name' | 'email' | 'password' | 'confirm') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name') {
        if (name.trim()) {
          signupEmailRef.current?.focus();
        }
      } else if (field === 'email') {
        if (email.trim()) {
          signupPasswordRef.current?.focus();
        }
      } else if (field === 'password') {
        if (password.trim()) {
          signupConfirmRef.current?.focus();
        }
      } else if (field === 'confirm') {
        if (confirmPassword.trim()) {
          signupTermsRef.current?.focus();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Smart focus on empty fields
    if (!isRegistering) {
      if (!email.trim()) {
        setError('Please enter your email address.');
        loginEmailRef.current?.focus();
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password.');
        loginPasswordRef.current?.focus();
        return;
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        signupNameRef.current?.focus();
        return;
      }
      if (!email.trim()) {
        setError('Please enter your email address.');
        signupEmailRef.current?.focus();
        return;
      }
      if (!password.trim()) {
        setError('Please enter a password.');
        signupPasswordRef.current?.focus();
        return;
      }
      if (!confirmPassword.trim()) {
        setError('Please confirm your password.');
        signupConfirmRef.current?.focus();
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        signupConfirmRef.current?.focus();
        return;
      }
      if (!agreeTerms) {
        setError('Please agree to the Terms of Service.');
        signupTermsRef.current?.focus();
        return;
      }
    }

    if (!validateForm()) {
      setError('Invalid Email or Password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        const result = await register({ email, password, name, collegeName, role });
        onLoginSuccess(result.user);
      } else {
        const user = await login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDemoUsers = async () => {
    setIsLoading(true);
    try {
      await seedDemoUsers();
      setShowHints(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create demo users');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demo: any) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  // Staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '8px',
  };

  const linkButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: BRAND_COLOR,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  };

  const redLinkStyle: React.CSSProperties = {
    ...linkButtonStyle,
    color: '#dc2626',
  };

  const solidButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    backgroundColor: BRAND_COLOR,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const socialButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    backgroundColor: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
  };

  const featureCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
    padding: '18px 20px',
    backgroundColor: 'white',
    borderRadius: '14px',
    border: `2px solid ${BRAND_COLOR}25`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
  };

  const iconBoxStyle = (bgColor: string): React.CSSProperties => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = BRAND_COLOR;
    e.target.style.boxShadow = `0 0 0 4px ${BRAND_COLOR}20`;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      {/* Left Side - Fixed, No Scroll */}
      <div
        style={{
          width: '55%',
          height: '100vh',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f0fdf9',
          position: 'fixed',
          left: 0,
          top: 0,
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: BRAND_COLOR, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} color="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#111827', letterSpacing: '1px' }}>AUTO_FLOW</span>
        </div>

        {/* Animated Content */}
        <motion.div
          key={animationKey}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            variants={itemVariants}
            style={{ fontFamily: "'Fraunces', serif", fontSize: '48px', fontWeight: 400, color: '#111827', marginBottom: '20px', lineHeight: 1.15 }}
          >
            {isRegistering ? 'Start Your Free Trial' : 'Professional Document Analysis'}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{ fontSize: '17px', color: '#6b7280', marginBottom: '40px', maxWidth: '440px', lineHeight: 1.7 }}
          >
            {isRegistering ? 'Join thousands of professionals who trust AUTO_FLOW' : 'AI-powered formatting, grammar, and layout checking for your documents'}
          </motion.p>

          {/* Feature Cards */}
          <motion.div
            variants={itemVariants}
            style={featureCardStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BRAND_COLOR}25`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={iconBoxStyle(`${BRAND_COLOR}15`)}><Sparkles size={22} color={BRAND_COLOR} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '16px', marginBottom: '4px' }}>AI-Powered Analysis</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Instant detection of formatting issues</div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={featureCardStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BRAND_COLOR}25`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={iconBoxStyle(`${BRAND_COLOR}15`)}><Shield size={22} color={BRAND_COLOR} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '16px', marginBottom: '4px' }}>Secure & Private</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Your documents are processed securely</div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={featureCardStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BRAND_COLOR}25`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={iconBoxStyle(`${BRAND_COLOR}15`)}><CheckCircle size={22} color={BRAND_COLOR} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '16px', marginBottom: '4px' }}>Free Plan Available</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Start with 5 documents per month</div>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={handleSeedDemoUsers}
            style={{
              marginTop: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 600,
              color: BRAND_COLOR,
              backgroundColor: 'white',
              border: `2px solid ${BRAND_COLOR}40`,
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
          >
            <BookOpen size={20} />
            Quick Start
          </motion.button>
        </motion.div>

        <div style={{ fontSize: '14px', color: '#9ca3af' }}>© 2025 AUTO_FLOW. All rights reserved.</div>
      </div>

      {/* Right Side - Scrollable */}
      <div style={{ width: '45%', marginLeft: '55%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {!isRegistering ? (
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '34px', fontWeight: 400, color: '#111827', marginBottom: '10px', textAlign: 'center' }}>Welcome back</h2>
              <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '36px', textAlign: 'center' }}>Sign in to access your document analysis dashboard</p>

              {error && (
                <div style={{ marginBottom: '24px', padding: '14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    ref={loginEmailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleLoginKeyDown(e, 'email')}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={loginPasswordRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => handleLoginKeyDown(e, 'password')}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: passwordStrength.width, backgroundColor: passwordStrength.color, transition: 'all 0.3s ease', borderRadius: '3px' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: passwordStrength.color, marginTop: '6px', fontWeight: 500 }}>{passwordStrength.label}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: BRAND_COLOR }} />
                    Remember me
                  </label>
                  <button type="button" style={redLinkStyle}>Forgot password?</button>
                </div>

                <button type="submit" disabled={isLoading} style={solidButtonStyle}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '15px', color: '#6b7280' }}>
                Don't have an account? <button onClick={() => handleFormSwitch(true)} style={linkButtonStyle}>Sign up</button>
              </div>

              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px', fontWeight: 600 }}>Or continue with</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button style={socialButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.backgroundColor = '#f0fdf9'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                  </button>
                  <button style={socialButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.backgroundColor = '#f0fdf9'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                    <Github size={20} />
                    GitHub
                  </button>
                </div>
              </div>

              {showHints && (
                <div style={{ marginTop: '36px', padding: '24px', backgroundColor: '#f0fdf9', borderRadius: '16px', border: `2px solid ${BRAND_COLOR}20`, textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: BRAND_COLOR, marginBottom: '12px', fontWeight: 700, letterSpacing: '1px' }}>✨ DEMO ACCOUNTS</div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Click to auto-fill credentials</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {getMockUsersHint().slice(0, 2).map((demo, idx) => (
                      <button
                        key={idx}
                        onClick={() => fillDemoCredentials(demo)}
                        style={{ padding: '14px 20px', backgroundColor: 'white', border: `2px solid ${BRAND_COLOR}30`, borderRadius: '12px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.3s ease', textAlign: 'center', minWidth: '140px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(21,158,138,0.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BRAND_COLOR}30`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <span style={{ fontWeight: 600, color: '#374151', display: 'block', fontSize: '12px' }}>{demo.role?.toUpperCase()}</span>
                        <span style={{ color: '#6b7280', fontSize: '11px' }}>{demo.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '34px', fontWeight: 400, color: '#111827', marginBottom: '10px', textAlign: 'center' }}>Create your account</h2>
              <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '36px', textAlign: 'center' }}>Start analyzing your documents with AI</p>

              {error && (
                <div style={{ marginBottom: '24px', padding: '14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '14px' }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    ref={signupNameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => handleSignupKeyDown(e, 'name')}
                    placeholder="John Doe"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    ref={signupEmailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleSignupKeyDown(e, 'email')}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Password</label>
                  <input
                    ref={signupPasswordRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleSignupKeyDown(e, 'password')}
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  {password && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: passwordStrength.width, backgroundColor: passwordStrength.color, transition: 'all 0.3s ease', borderRadius: '3px' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: passwordStrength.color, marginTop: '6px', fontWeight: 500 }}>{passwordStrength.label}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    ref={signupConfirmRef}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => handleSignupKeyDown(e, 'confirm')}
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '28px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
                  <input
                    ref={signupTermsRef}
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: BRAND_COLOR }}
                  />
                  <span>I agree to the <button type="button" style={linkButtonStyle}>Terms of Service</button> and <button type="button" style={linkButtonStyle}>Privacy Policy</button></span>
                </label>

                <button ref={signupSubmitRef} type="submit" disabled={isLoading} style={solidButtonStyle}>
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '15px', color: '#6b7280' }}>
                Already have an account? <button onClick={() => handleFormSwitch(false)} style={linkButtonStyle}>Sign in</button>
              </div>

              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px', fontWeight: 600 }}>Or sign up with</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button style={socialButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.backgroundColor = '#f0fdf9'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                  </button>
                  <button style={socialButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.backgroundColor = '#f0fdf9'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                    <Github size={20} />
                    GitHub
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;