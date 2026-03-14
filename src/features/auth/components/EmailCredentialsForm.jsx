import { useState, useEffect } from 'react';
import { sendOtp, sendSignupOtp } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_COOLDOWN_SECONDS = 30;

/**
 * variant='signup'  → calls sendSignupOtp (shouldCreateUser: true)
 * variant='forgot'  → calls sendOtp       (shouldCreateUser: false)
 */
export default function EmailCredentialsForm({
  onSubmit,
  defaultEmail = '',
  isLoading = false,
  variant = 'signup',
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEmailError('');

    if (!email) { setEmailError('Email is required.'); return; }
    if (!EMAIL_REGEX.test(email.trim())) { setEmailError('Please enter a valid email address.'); return; }

    setIsSendingOtp(true);
    try {
      // Use the correct OTP function depending on the flow
      if (variant === 'signup') {
        await sendSignupOtp(email.trim());
      } else {
        await sendOtp(email.trim());
      }
      toast.success(`Verification code sent to ${email}`);
      setOtpCooldown(OTP_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.message ?? 'Failed to send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ email: email.trim(), otp });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="signup-email" className="block text-[#005F02] font-bold mb-2 text-base">
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
          placeholder="Enter your email address"
          className={`${inputClass} ${emailError ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}`}
          autoComplete="email"
          required
          disabled={isLoading}
        />
        {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp || otpCooldown > 0 || isLoading}
            className="text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline transition-colors text-sm"
          >
            {isSendingOtp ? 'Sending...' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send OTP'}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="signup-otp" className="block text-[#005F02] font-bold mb-2 text-base">
          Verification Code
        </label>
        <input
          id="signup-otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter OTP"
          className={inputClass}
          maxLength={6}
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-lg bg-[#005F02] text-white text-base font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Verifying...' : 'Continue'}
      </button>
    </form>
  );
}