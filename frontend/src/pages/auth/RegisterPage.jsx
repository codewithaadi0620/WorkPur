import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import SecurityCaptcha from '../../components/SecurityCaptcha';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';
import { 
  Lock, 
  Mail, 
  User, 
  Building, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound,
  Sparkles,
  Edit3
} from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [role, setRole] = useState('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState(65);
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [previewOtp, setPreviewOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef([]);

  const captchaRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Resend countdown timer effect
  useEffect(() => {
    let timer;
    if (step === 'OTP' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpCountdown]);

  // Step 1: Submit Details & Request Email OTP
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();

    if (!captchaRef.current?.validate()) {
      return;
    }

    try {
      setLoading(true);
      setOtpError('');

      // Send OTP to user's email via backend API
      const res = await authApi.sendOtp({ email });

      if (res.previewOtp) {
        setPreviewOtp(res.previewOtp);
      }

      toast.success(`Verification code dispatched to ${email}`);
      setStep('OTP');
      setOtpCountdown(60);

      // Focus first digit box after transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch verification code. Please try again.');
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle individual digit input
  const handleDigitChange = (index, value) => {
    const char = value.slice(-1); // Take only latest char
    if (char && !/^\d$/.test(char)) return; // Only allow digits

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setOtpError('');

    // Advance focus to next input if digit was entered
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Step 2: Handle backspace navigation
  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Handle pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const splitDigits = pastedData.split('');
      setOtpDigits(splitDigits);
      setOtpError('');
      otpInputRefs.current[5]?.focus();
    }
  };

  // Quick 1-click test auto-fill
  const handleAutoFillOtp = () => {
    const code = previewOtp || '123456';
    const split = code.padEnd(6, '0').slice(0, 6).split('');
    setOtpDigits(split);
    setOtpError('');
    otpInputRefs.current[5]?.focus();
    toast.success('Verification code auto-filled!');
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0 || loading) return;
    try {
      setLoading(true);
      setOtpError('');
      const res = await authApi.sendOtp({ email });
      if (res.previewOtp) {
        setPreviewOtp(res.previewOtp);
      }
      setOtpCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
      toast.success(`Fresh verification code sent to ${email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Final Step: Complete Registration with OTP
  const handleFinalSubmit = async (e) => {
    e?.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    try {
      setLoading(true);
      setOtpError('');

      const user = await register({
        name,
        email,
        password,
        role,
        companyName: role === 'CLIENT' ? companyName : undefined,
        title: role === 'FREELANCER' ? title : undefined,
        hourlyRate: role === 'FREELANCER' ? parseFloat(hourlyRate) : undefined,
        otp: fullOtp,
      });

      if (user.role === 'CLIENT') {
        navigate('/client', { replace: true });
      } else {
        navigate('/freelancer', { replace: true });
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired verification code.');
      // Focus first input for easy re-entry
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-slate-50 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <Logo size="lg" className="mb-2" />
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {step === 'FORM' ? 'Create your WorkPur Account' : 'Verify Your Email Address'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {step === 'FORM'
              ? 'Join premier companies and verified global talent'
              : 'Enter the 6-digit one-time password (OTP) sent to your inbox'}
          </p>

          {/* Stepper Progress Pill */}
          <div className="mt-4 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              step === 'FORM'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}>
              {step === 'OTP' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>1</span>}
              <span>Account Info</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              step === 'OTP'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <span>2</span>
              <span>Email OTP</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="mt-6 bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10 transition-all">
          
          {step === 'FORM' ? (
            /* STEP 1: REGISTRATION FORM */
            <>
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'CLIENT'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>I'm a Client Hiring</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('FREELANCER')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'FREELANCER'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>I'm a Freelancer</span>
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleInitiateRegistration}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Bhardwaj"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate / Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role specific inputs */}
                {role === 'CLIENT' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Organization Name (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Acme Innovations Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Full-Stack Eng."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Hourly Rate ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          required
                          min="5"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Anti-Bot Security Captcha */}
                <SecurityCaptcha ref={captchaRef} />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{loading ? 'Sending Verification Code...' : 'Continue to Email Verification'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Already registered with WorkPur?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign in to portal
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: EMAIL OTP VERIFICATION */
            <div className="space-y-6">
              
              {/* Recipient Email Info Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Sent to email:</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Simulated Live Inbox / Demo Card */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Live Verification Dispatch (Demo Mode)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Fill Code</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Your secure 6-digit OTP is: <span className="font-mono font-black text-sm tracking-widest text-emerald-900 dark:text-emerald-200 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 ml-1">{previewOtp || '123456'}</span>
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Enter 6-Digit Security Code
                </label>
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl rounded-xl border transition-all focus:outline-none ${
                        otpError
                          ? 'border-red-400 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-400'
                          : digit
                            ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500'
                      }`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="mt-2 text-center text-xs font-semibold text-red-500 animate-pulse">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Resend Action */}
              <div className="text-center">
                {otpCountdown > 0 ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Resend code in <strong className="text-slate-700 dark:text-slate-200 font-mono">{otpCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Didn't receive the email? Resend code</span>
                  </button>
                )}
              </div>

              {/* Confirm Registration Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full py-3 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying & Creating Account...' : 'Verify & Complete Registration'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Account Information</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
