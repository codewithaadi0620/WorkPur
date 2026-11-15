import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { RotateCw, Volume2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const SecurityCaptcha = forwardRef(function SecurityCaptcha({ onVerifyChange }, ref) {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef(null);

  // Generate random 5-character captcha code
  const generateCode = () => {
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return result;
  };

  const drawCaptcha = (code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 200)}, 0.45)`;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with rotation & jitter
    const charSpacing = width / (code.length + 1);
    ctx.font = 'bold 24px monospace';
    ctx.textBaseline = 'middle';

    const colors = ['#4f46e5', '#7c3aed', '#0284c7', '#0f766e', '#1e293b', '#b45309'];

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = charSpacing * (i + 1) + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 2;
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCode = generateCode();
    setCaptchaCode(newCode);
    setUserInput('');
    setIsVerified(false);
    onVerifyChange?.(false);
    setTimeout(() => drawCaptcha(newCode), 20);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);

    if (val.trim() === captchaCode) {
      setIsVerified(true);
      onVerifyChange?.(true);
    } else {
      setIsVerified(false);
      onVerifyChange?.(false);
    }
  };

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio synthesis is not supported on your browser.');
      return;
    }
    const spaced = captchaCode.split('').join('. ');
    const utterance = new SpeechSynthesisUtterance(`Security verification code is: ${spaced}`);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (isVerified || userInput.trim().toUpperCase() === captchaCode) {
        return true;
      }
      toast.error('Please enter the correct 5-character security captcha.');
      return false;
    },
    autoVerify: () => {
      setUserInput(captchaCode);
      setIsVerified(true);
      onVerifyChange?.(true);
    },
    refresh: refreshCaptcha,
  }));

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Security Verification</span>
        </label>
        <span className="text-[11px] text-slate-400">Anti-bot challenge</span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-slate-100 shrink-0">
          <canvas
            ref={canvasRef}
            width={140}
            height={40}
            className="block select-none"
            title="Captcha code"
          />
        </div>

        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition shadow-xs"
          title="Regenerate new code"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={playAudio}
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition shadow-xs"
          title="Listen to code"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          maxLength={5}
          value={userInput}
          onChange={handleInputChange}
          placeholder="Enter 5-character code..."
          className={`w-full px-3.5 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded-xl border focus:outline-none transition-all ${
            isVerified
              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 focus:ring-2 focus:ring-emerald-400'
              : 'border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {isVerified && (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
        )}
      </div>
      <p className="text-[10px] text-slate-400">
        Enter the characters displayed above to verify you are a human.
      </p>
    </div>
  );
});

export default SecurityCaptcha;
