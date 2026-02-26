import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { verifyEmail, resendOtp } from '../services/authService';
import { User as UserType } from '../types';

interface VerifyEmailProps {
    onLoginSuccess: (user: UserType) => void;
}

const BRAND_COLOR = '#159e8a';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const OTP_EXPIRY = 10 * 60; // 10 minutes in seconds

const VerifyEmail: React.FC<VerifyEmailProps> = ({ onLoginSuccess }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY);
    const [resending, setResending] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown countdown
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    // OTP expiry countdown
    useEffect(() => {
        if (expiryTimer <= 0) return;
        const interval = setInterval(() => setExpiryTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [expiryTimer]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError('');

        // Auto-advance
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (digit && index === OTP_LENGTH - 1 && newOtp.every(d => d)) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pasted.length === OTP_LENGTH) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            inputRefs.current[OTP_LENGTH - 1]?.focus();
            handleVerify(pasted);
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code ?? otp.join('');
        if (otpCode.length !== OTP_LENGTH) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        if (!email) {
            setError('Email address is missing. Please go back and sign up again.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const { user } = await verifyEmail(email, otpCode);
            setSuccess(true);
            setTimeout(() => onLoginSuccess(user as any), 1200);
        } catch (err: any) {
            if (err.code === 'OTP_EXPIRED') {
                setError('Your OTP has expired. Please request a new one.');
            } else {
                setError(err.message || 'Verification failed. Please try again.');
            }
            // Clear OTP on error
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setResending(true);
        setError('');
        try {
            await resendOtp(email);
            setResendTimer(RESEND_COOLDOWN);
            setExpiryTimer(OTP_EXPIRY);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0fdf9',
            fontFamily: "'Inter', sans-serif",
            padding: '24px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                    width: '100%',
                    maxWidth: '460px',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    boxShadow: '0 4px 32px rgba(21,158,138,0.1)',
                    border: `1px solid ${BRAND_COLOR}20`
                }}
            >
                {success ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: `${BRAND_COLOR}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle size={40} color={BRAND_COLOR} />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Email Verified!</h2>
                        <p style={{ color: '#6b7280', fontSize: '16px' }}>Redirecting you to your dashboard...</p>
                    </motion.div>
                ) : (
                    <>
                        {/* Icon */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: `${BRAND_COLOR}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <ShieldCheck size={36} color={BRAND_COLOR} />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Verify your email</h2>
                            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6 }}>
                                We sent a 6-digit code to<br />
                                <span style={{ fontWeight: 600, color: '#374151' }}>{email || 'your email'}</span>
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '14px', textAlign: 'center' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* OTP Inputs */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }} onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    style={{
                                        width: '52px',
                                        height: '60px',
                                        textAlign: 'center',
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        border: `2px solid ${digit ? BRAND_COLOR : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        outline: 'none',
                                        backgroundColor: digit ? `${BRAND_COLOR}08` : '#f9fafb',
                                        color: '#111827',
                                        transition: 'all 0.2s ease',
                                        caretColor: BRAND_COLOR
                                    }}
                                    onFocus={e => { e.target.style.borderColor = BRAND_COLOR; e.target.style.boxShadow = `0 0 0 4px ${BRAND_COLOR}20`; }}
                                    onBlur={e => { e.target.style.borderColor = digit ? BRAND_COLOR : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                    autoFocus={i === 0}
                                    disabled={isLoading}
                                />
                            ))}
                        </div>

                        {/* Expiry timer */}
                        {expiryTimer > 0 ? (
                            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                                Code expires in <span style={{ fontWeight: 600, color: expiryTimer < 120 ? '#f59e0b' : '#374151' }}>{formatTime(expiryTimer)}</span>
                            </p>
                        ) : (
                            <p style={{ textAlign: 'center', fontSize: '13px', color: '#dc2626', marginBottom: '20px', fontWeight: 600 }}>
                                Code expired. Please request a new one.
                            </p>
                        )}

                        {/* Verify Button */}
                        <button
                            onClick={() => handleVerify()}
                            disabled={isLoading || otp.some(d => !d)}
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: 'white',
                                backgroundColor: isLoading || otp.some(d => !d) ? `${BRAND_COLOR}70` : BRAND_COLOR,
                                border: 'none',
                                borderRadius: '12px',
                                cursor: isLoading || otp.some(d => !d) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: '20px'
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        {/* Resend */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Mail size={14} /> Didn't receive the code?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={resendTimer > 0 || resending}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: resendTimer > 0 || resending ? '#9ca3af' : BRAND_COLOR,
                                    fontWeight: 600,
                                    cursor: resendTimer > 0 || resending ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 0'
                                }}
                            >
                                <RefreshCw size={14} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
                                {resending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </div>

                        {/* Back link */}
                        <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button
                                onClick={() => navigate('/login')}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                                <ArrowLeft size={14} /> Back to sign in
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
