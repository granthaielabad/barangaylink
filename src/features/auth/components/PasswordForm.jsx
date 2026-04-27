import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import CheckList from '../../../assets/icons/check-list.svg';
import AgreementModal from './AgreementModal';

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-shadow';

export default function PasswordForm({ onSubmit, variant = 'signup' }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const isForgotPassword = variant === 'forgotPassword';
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passwordMatch = password !== '' && password === confirmPassword;

  const allRequirementsMet = hasMinLength && hasNumber && hasUppercase && passwordMatch;
  const canSubmit = isForgotPassword ? allRequirementsMet : allRequirementsMet && agreedToTerms;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({ password });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-[#8C0B1A] font-bold mb-2 text-base">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${inputClass} pr-12`}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#8C0B1A] focus:outline-none focus:ring-0 shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm-password" className="block text-[#8C0B1A] font-bold mb-2 text-base">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`${inputClass} pr-12`}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#8C0B1A] focus:outline-none focus:ring-0 shrink-0"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements Checklist */}
        <ul className="space-y-2 mb-3 list-none p-0 m-0">
          <li className="flex items-center gap-3">
            <img
              src={CheckList}
              alt=""
              className={`w-5 h-5 shrink-0 ${hasMinLength ? 'opacity-100' : 'opacity-40'}`}
              aria-hidden
            />
            <span className="text-black">8 characters minimum</span>
          </li>
          <li className="flex items-center gap-3">
            <img
              src={CheckList}
              alt=""
              className={`w-5 h-5 shrink-0 ${hasNumber ? 'opacity-100' : 'opacity-40'}`}
              aria-hidden
            />
            <span className="text-black">Contains a number</span>
          </li>
          <li className="flex items-center gap-3">
            <img
              src={CheckList}
              alt=""
              className={`w-5 h-5 shrink-0 ${hasUppercase ? 'opacity-100' : 'opacity-40'}`}
              aria-hidden
            />
            <span className="text-black">Contains an uppercase</span>
          </li>
          <li className="flex items-center gap-3">
            <img
              src={CheckList}
              alt=""
              className={`w-5 h-5 shrink-0 ${passwordMatch ? 'opacity-100' : 'opacity-40'}`}
              aria-hidden
            />
            <span className="text-black">Password match</span>
          </li>
        </ul>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-lg bg-[#8C0B1A] text-white text-base font-bold uppercase tracking-wide hover:bg-[#7A0915] transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#8C0B1A]"
        >
          {isForgotPassword ? 'Update Password' : 'Register'}
        </button>

        {/* Terms and Conditions (signup only) */}
        {!isForgotPassword && (
          <>
            <div className="flex justify-center gap-2">
              <input
                id="signup-agree-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5   h-4 w-4 rounded border-gray-300 text-[#8C0B1A] focus:ring-[#8C0B1A] accent-[#0096FF]"
              />
              <label htmlFor="signup-agree-terms" className="text-sm text-black">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-700 underline inline"
                >
                  Terms and Conditions.
                </button>
              </label>
            </div>
          </>
        )}
      </form>

      {!isForgotPassword && (
        <AgreementModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAgree={() => {
            setAgreedToTerms(true);
            setShowTermsModal(false);
          }}
          initialAgreed={agreedToTerms}
        />
      )}
    </>
  );
}


